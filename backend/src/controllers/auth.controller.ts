import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendSMS } from '../services/sms.service';

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any,
  } as jwt.SignOptions);
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '30d') as any,
  } as jwt.SignOptions);
};

// Self-serve building creation: a brand-new super-admin fills the form
// on the login screen. We create the building + the admin resident in one
// shot, immediately approved, then fall through to the regular OTP flow.
export const selfServeCreateBuilding = async (req: Request, res: Response) => {
  const { building, admin } = req.body || {};
  if (!building || !admin) throw new AppError('building and admin required', 400);
  const name = String(building.name || '').trim();
  const address = String(building.address || '').trim();
  const city = String(building.city || '').trim();
  const totalApts = Number(building.total_apartments) || 0;
  const totalFloors = Number(building.total_floors) || 1;
  const adminName = String(admin.full_name || admin.name || '').trim();
  let adminPhone = String(admin.phone_number || admin.phone || '').replace(/\D/g, '');
  const adminApt = String(admin.apartment_number || admin.apt || '').trim() || '1';

  if (!name || !address || !city || !totalApts || !adminName || !adminPhone) {
    throw new AppError('All fields are required', 400);
  }
  if (adminPhone.startsWith('0')) adminPhone = '+972' + adminPhone.slice(1);
  else if (!adminPhone.startsWith('+')) adminPhone = '+972' + adminPhone;

  // Refuse if this phone already has a resident record somewhere.
  const existing = await query(
    `SELECT id FROM residents WHERE phone_number = $1`,
    [adminPhone]
  );
  if (existing.rows.length > 0) {
    throw new AppError('מספר הטלפון כבר רשום. היכנסו ברגיל עם הטלפון שלכם.', 409);
  }

  // Generate a unique invite code.
  let inviteCode = '';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 12 && !inviteCode; attempt++) {
    let code = '';
    while (code.length < 7) code += chars[Math.floor(Math.random() * chars.length)];
    const clash = await query(`SELECT 1 FROM buildings WHERE invite_code = $1`, [code]);
    if (clash.rows.length === 0) inviteCode = code;
  }
  if (!inviteCode) throw new AppError('Could not generate invite code, try again', 500);

  const bldInsert = await query(
    `INSERT INTO buildings (name, address, city, total_apartments, total_floors, invite_code)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [name, address, city, totalApts, totalFloors, inviteCode]
  );
  const buildingId = bldInsert.rows[0].id;

  await query(
    `INSERT INTO residents
       (building_id, phone_number, phone_verified, full_name, apartment_number, role,
        approval_status, approved_at, is_active)
     VALUES ($1, $2, true, $3, $4, 'vaad_admin', 'approved', NOW(), true)`,
    [buildingId, adminPhone, adminName, adminApt]
  );

  // Welcome notification
  try {
    const newId = (await query(
      `SELECT id FROM residents WHERE phone_number = $1 LIMIT 1`,
      [adminPhone]
    )).rows[0]?.id;
    if (newId) {
      await query(
        `INSERT INTO notifications (building_id, resident_id, kind, title, body, ref_id, dedup_key)
         VALUES ($1, $2, 'welcome_admin', $3, $4, $1, $5)
         ON CONFLICT (resident_id, dedup_key) DO NOTHING`,
        [
          buildingId,
          newId,
          `ברוכים הבאים ל-Lobbix 👋`,
          `הבניין "${name}" מוכן לשימוש. קוד ההזמנה שלכם: ${inviteCode}`,
          `welcome:${buildingId}`,
        ]
      );
    }
  } catch (_) {}

  res.status(201).json({
    building: { id: buildingId, name, invite_code: inviteCode },
    admin_phone: adminPhone,
    message: 'Building created. Send an OTP to this phone to log in.',
  });
};

export const sendOTP = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new AppError('Phone number is required', 400);
  }

  // Normalize phone number (add +972 if needed)
  let normalizedPhone = phoneNumber.replace(/\s/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '+972' + normalizedPhone.substring(1);
  } else if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+972' + normalizedPhone;
  }

  // Generate OTP. In DEMO_MODE the code is fixed to 123456 so the docs
  // and the seeded-user hint panel are honest — any seeded phone can log
  // in with 123456 without touching SMS.
  const isDemo = process.env.DEMO_MODE === 'true';
  const code = isDemo ? '123456' : generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Save OTP to database
  await query(
    `INSERT INTO otp_codes (phone_number, code, expires_at)
     VALUES ($1, $2, $3)`,
    [normalizedPhone, code, expiresAt]
  );

  // Send OTP via SMS
  if (process.env.NODE_ENV === 'production' && !isDemo) {
    await sendSMS(normalizedPhone, `קוד האימות שלך: ${code}`);
  } else {
    // In development / demo, just log the OTP
    console.log(`📱 OTP for ${normalizedPhone}: ${code}${isDemo ? ' (demo)' : ''}`);
  }

  res.status(200).json({
    message: 'OTP sent successfully',
    phoneNumber: normalizedPhone,
  });
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phoneNumber, code, inviteCode } = req.body;

  if (!phoneNumber || !code) {
    throw new AppError('Phone number and code are required', 400);
  }

  // Normalize phone number
  let normalizedPhone = phoneNumber.replace(/\s/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '+972' + normalizedPhone.substring(1);
  } else if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = '+972' + normalizedPhone;
  }

  // Demo mode: 123456 is always accepted for any seeded phone, no DB check.
  // This keeps local testing frictionless even if a previous verify already
  // marked the OTP row as verified, or the row was cleaned up.
  const isDemo = process.env.DEMO_MODE === 'true';
  const demoBypass = isDemo && code === '123456';

  if (!demoBypass) {
    // Find valid OTP
    const otpResult = await query(
      `SELECT * FROM otp_codes
       WHERE phone_number = $1
       AND code = $2
       AND expires_at > NOW()
       AND verified = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedPhone, code]
    );

    if (otpResult.rows.length === 0) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Mark OTP as verified
    await query(
      `UPDATE otp_codes SET verified = true WHERE id = $1`,
      [otpResult.rows[0].id]
    );
  }

  // Check if user exists
  let userResult = await query(
    `SELECT * FROM residents WHERE phone_number = $1`,
    [normalizedPhone]
  );

  let user;
  let isNewUser = false;

  if (userResult.rows.length === 0) {
    // New user - need invite code
    if (!inviteCode) {
      throw new AppError('Invite code required for new users', 400);
    }

    // Verify invite code and get building
    const buildingResult = await query(
      `SELECT id FROM buildings WHERE invite_code = $1`,
      [inviteCode]
    );

    if (buildingResult.rows.length === 0) {
      throw new AppError('Invalid invite code', 400);
    }

    const buildingId = buildingResult.rows[0].id;

    // Create new user — waiting for vaad approval before they can access
    // the building. Committee members see a pending list and approve/reject.
    const fullName =
      (typeof req.body.fullName === 'string' && req.body.fullName.trim()) ||
      'דייר חדש';
    const apartmentNumber =
      (typeof req.body.apartmentNumber === 'string' && req.body.apartmentNumber.trim()) ||
      null;
    const floorRaw = req.body.floor;
    const floor =
      floorRaw != null && String(floorRaw).trim() !== '' && !isNaN(Number(floorRaw))
        ? Number(floorRaw)
        : null;

    try {
      userResult = await query(
        `INSERT INTO residents
           (building_id, phone_number, phone_verified, full_name, apartment_number, floor,
            approval_status, approval_requested_at)
         VALUES ($1, $2, true, $3, $4, $5, 'pending', NOW())
         RETURNING *`,
        [buildingId, normalizedPhone, fullName, apartmentNumber, floor]
      );
    } catch (err: any) {
      if (String(err?.code) === '23505') {
        throw new AppError('מספר הדירה שהזנת כבר תפוס בבניין. נסה מספר אחר או פנה לוועד.', 409);
      }
      throw err;
    }

    user = userResult.rows[0];
    isNewUser = true;

    // Notify every vaad member of this building about the new request.
    // Non-blocking — an error here must not break the signup.
    try {
      const vaadRows = await query(
        `SELECT id FROM residents
          WHERE building_id = $1
            AND role IN ('vaad_admin', 'vaad_member', 'treasurer')
            AND is_active = true`,
        [buildingId]
      );
      for (const v of vaadRows.rows) {
        await query(
          `INSERT INTO notifications (building_id, resident_id, kind, title, body, ref_id, dedup_key)
           VALUES ($1, $2, 'approval_pending', $3, $4, $5, $6)
           ON CONFLICT (resident_id, dedup_key) DO NOTHING`,
          [
            buildingId,
            v.id,
            'בקשת הצטרפות חדשה',
            `${fullName}${apartmentNumber ? ' · דירה ' + apartmentNumber : ''} · ${normalizedPhone}`,
            user.id,
            `approval_pending:${user.id}:${v.id}`,
          ]
        );
      }
    } catch (_) { /* swallow — signup already succeeded */ }
  } else {
    user = userResult.rows[0];

    // Update phone_verified if not already
    if (!user.phone_verified) {
      await query(
        `UPDATE residents SET phone_verified = true WHERE id = $1`,
        [user.id]
      );
    }

    // Update last_login_at
    await query(
      `UPDATE residents SET last_login_at = NOW() WHERE id = $1`,
      [user.id]
    );
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token
  await query(
    `INSERT INTO refresh_tokens (resident_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
    [user.id, refreshToken]
  );

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phoneNumber: user.phone_number,
      fullName: user.full_name,
      apartmentNumber: user.apartment_number,
      role: user.role,
      buildingId: user.building_id,
      isSuperAdmin: !!user.is_super_admin,
      approvalStatus: user.approval_status || 'approved',
    },
    isNewUser,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  ) as any;

  // Check if token exists in database
  const tokenResult = await query(
    `SELECT * FROM refresh_tokens 
     WHERE token = $1 AND expires_at > NOW()`,
    [refreshToken]
  );

  if (tokenResult.rows.length === 0) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new access token
  const accessToken = generateToken(decoded.userId);

  res.status(200).json({ accessToken });
};

// Demo Google sign-in: accepts {email, name, inviteCode?}, finds or creates
// a resident using the email, and returns an access token. This is for
// development/testing only — no actual Google verification is performed.
// Disabled when DEMO_MODE is not explicitly enabled.
export const googleDemo = async (req: Request, res: Response) => {
  if (process.env.DEMO_MODE !== 'true') {
    throw new AppError('Demo sign-in is disabled in this environment', 404);
  }
  const { email, name, inviteCode } = req.body;
  if (!email) throw new AppError('email required', 400);

  // Normalize: Google users have no phone; use email as phone-equivalent key.
  const pseudoPhone = 'email:' + String(email).toLowerCase();

  let userResult = await query(
    `SELECT * FROM residents WHERE phone_number = $1 OR email = $2`,
    [pseudoPhone, email]
  );

  let user;
  if (userResult.rows.length === 0) {
    if (!inviteCode) throw new AppError('Invite code required for new users', 400);
    const buildingResult = await query(
      `SELECT id FROM buildings WHERE invite_code = $1`,
      [inviteCode]
    );
    if (buildingResult.rows.length === 0) throw new AppError('Invalid invite code', 400);
    const buildingId = buildingResult.rows[0].id;

    await query(
      `INSERT INTO residents (building_id, phone_number, phone_verified, email, email_verified, full_name, role)
       VALUES ($1, $2, true, $3, true, $4, 'resident')`,
      [buildingId, pseudoPhone, email, name || 'Google User']
    );
    userResult = await query(
      `SELECT * FROM residents WHERE phone_number = $1`,
      [pseudoPhone]
    );
    user = userResult.rows[0];
  } else {
    user = userResult.rows[0];
  }

  const accessToken = generateToken(user.id);
  const refreshTkn = generateRefreshToken(user.id);

  res.status(200).json({
    accessToken,
    refreshToken: refreshTkn,
    user: {
      id: user.id,
      phoneNumber: user.phone_number,
      fullName: user.full_name,
      apartmentNumber: user.apartment_number,
      role: user.role,
      buildingId: user.building_id,
      isSuperAdmin: !!user.is_super_admin,
      email: user.email,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Delete refresh token from database
    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);
  }

  res.status(200).json({ message: 'Logged out successfully' });
};
