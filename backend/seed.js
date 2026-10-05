const bcrypt = require('bcryptjs');
const slugify = require('slugify');
require('dotenv').config();
const db = require('./config/db');

function slug(value) {
  return slugify(value, { lower: true, strict: true });
}

async function seed() {
  const name = process.env.ADMIN_NAME || 'Super Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@hospital.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(password, 10);

  const [admins] = await db.query('SELECT id FROM admins WHERE email = ? LIMIT 1', [email]);
  if (!admins.length) {
    await db.query(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'superadmin']
    );
    console.log(`Created superadmin: ${email} / ${password}`);
  } else {
    console.log(`Superadmin already exists: ${email}`);
  }

  const hospitals = [
    ['Medanta Gurugram', 'Gurugram', 'CH Baktawar Singh Road, Sector 38, Gurugram'],
    ['Medanta Lucknow', 'Lucknow', 'Sector A, Pocket 1, Sushant Golf City, Lucknow'],
    ['Medanta Patna', 'Patna', 'Kankarbagh Main Road, Patna'],
    ['Medanta Indore', 'Indore', 'Scheme No. 94, Sector D, Indore'],
    ['Medanta Ranchi', 'Ranchi', 'P.O. Irba, Ranchi'],
    ['Medanta Noida', 'Noida', 'Sector 50, Noida'],
  ];

  for (const [hName, city, address] of hospitals) {
    const [rows] = await db.query('SELECT id FROM hospitals WHERE slug = ? LIMIT 1', [slug(hName)]);
    if (!rows.length) {
      await db.query(
        'INSERT INTO hospitals (name, slug, city, address, is_active) VALUES (?, ?, ?, ?, 1)',
        [hName, slug(hName), city, address]
      );
    }
  }

  const specialities = [
    ['Cardiac Sciences', 'Heart care, cardiology and cardiac surgery'],
    ['Neurosciences', 'Brain, spine and nerve care'],
    ['Orthopaedics', 'Bone, joint and sports medicine'],
    ['Oncology', 'Cancer diagnosis and treatment'],
    ['Gastroenterology', 'Digestive and liver care'],
    ['Renal Care', 'Kidney and urology care'],
  ];

  for (let i = 0; i < specialities.length; i += 1) {
    const [sName, desc] = specialities[i];
    const [rows] = await db.query('SELECT id FROM specialities WHERE slug = ? LIMIT 1', [slug(sName)]);
    if (!rows.length) {
      await db.query(
        'INSERT INTO specialities (name, slug, short_description, is_active, sort_order) VALUES (?, ?, ?, 1, ?)',
        [sName, slug(sName), desc, i]
      );
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
