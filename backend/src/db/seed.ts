import { query } from '../config/database';

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create a test building
    const buildingResult = await query(
      `INSERT INTO buildings (name, address, city, total_apartments, invite_code, bank_name, bank_account_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        'בניין הדקלים',
        'רחוב הרצל 15',
        'תל אביב',
        50,
        'DEKEL2024',
        'בנק הפועלים',
        '12-345-678901'
      ]
    );

    const buildingId = buildingResult.rows[0].id;
    console.log('✅ Created test building:', buildingId);

    // Create Va'ad admin
    await query(
      `INSERT INTO residents (building_id, phone_number, phone_verified, full_name, apartment_number, role)
       VALUES ($1, $2, true, $3, $4, $5)`,
      [buildingId, '+972501234567', 'דוד כהן', '1', 'vaad_admin']
    );
    console.log("✅ Created Va'ad admin (phone: +972501234567)");

    // Create Va'ad member
    await query(
      `INSERT INTO residents (building_id, phone_number, phone_verified, full_name, apartment_number, role)
       VALUES ($1, $2, true, $3, $4, $5)`,
      [buildingId, '+972502345678', 'שרה לוי', '5', 'vaad_member']
    );
    console.log("✅ Created Va'ad member (phone: +972502345678)");

    // Create regular residents
    const residents = [
      { phone: '+972503456789', name: 'משה אברהם', apt: '10' },
      { phone: '+972504567890', name: 'רחל ישראלי', apt: '15' },
      { phone: '+972505678901', name: 'יוסף דוידוב', apt: '20' },
    ];

    for (const resident of residents) {
      await query(
        `INSERT INTO residents (building_id, phone_number, phone_verified, full_name, apartment_number)
         VALUES ($1, $2, true, $3, $4)`,
        [buildingId, resident.phone, resident.name, resident.apt]
      );
    }
    console.log('✅ Created 3 regular residents');

    // Create some test payments
    const residentIds = await query(
      `SELECT id FROM residents WHERE building_id = $1 AND role = 'resident'`,
      [buildingId]
    );

    for (const resident of residentIds.rows) {
      // Create current month payment
      await query(
        `INSERT INTO payments (building_id, resident_id, payment_type, description, amount, due_date, status)
         VALUES ($1, $2, 'monthly_fee', 'דמי ניהול חודש אפריל 2026', 450.00, '2026-04-01', 'pending')`,
        [buildingId, resident.id]
      );
    }
    console.log('✅ Created test payments for all residents');

    // Create a test ticket
    const firstResidentId = residentIds.rows[0].id;
    await query(
      `INSERT INTO tickets (building_id, created_by_resident_id, title, description, category, priority, status)
       VALUES ($1, $2, 'המעלית תקועה', 'המעלית תקועה בקומה 3 כבר 2 שעות', 'elevator', 'high', 'open')`,
      [buildingId, firstResidentId]
    );
    console.log('✅ Created test ticket');

    // Create a test announcement
    const vaadAdminId = await query(
      `SELECT id FROM residents WHERE building_id = $1 AND role = 'vaad_admin' LIMIT 1`,
      [buildingId]
    );

    await query(
      `INSERT INTO announcements (building_id, created_by_id, title, content, category, published_at)
       VALUES ($1, $2, 'הודעה חשובה - הפסקת מים', 'ביום שישי 12.4 תהיה הפסקת מים בין השעות 9:00-14:00', 'maintenance', NOW())`,
      [buildingId, vaadAdminId.rows[0].id]
    );
    console.log('✅ Created test announcement');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Building Invite Code: DEKEL2024');
    console.log('Va\'ad Admin Phone: +972501234567');
    console.log('Va\'ad Member Phone: +972502345678');
    console.log('Resident Phone: +972503456789');
    console.log('\nUse these phone numbers to test OTP login (in development, OTP will be printed to console)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
