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
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
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

  // Generate OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Save OTP to database
  await query(
    `INSERT INTO otp_codes (phone_number, code, expires_at)
     VALUES ($1, $2, $3)`,
    [normalizedPhone, code, expiresAt]
  );

  // Send OTP via SMS
  if (process.env.NODE_ENV === 'production') {
    await sendSMS(normalizedPhone, `קוד האימות שלך: ${code}`);
  } else {
    // In development, just log the OTP
    console.log(`📱 OTP for ${normalizedPhone}: ${code}`);
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

    // Create new user (basic profile - they'll complete it later)
    userResult = await query(
      `INSERT INTO residents (building_id, phone_number, phone_verified, full_name)
       VALUES ($1, $2, true, 'New Resident')
       RETURNING *`,
      [buildingId, normalizedPhone]
    );

    user = userResult.rows[0];
    isNewUser = true;
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
