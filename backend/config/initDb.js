const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addColumnIfMissing(conn, database, table, column, definition) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [database, table, column]
  );
  if (!Number(rows[0].c)) {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`Added ${table}.${column}`);
  }
}

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'hospital_cms';
  const port = Number(process.env.DB_PORT || 3306);

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    port,
    multipleStatements: true,
  });

  const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await conn.query(sql);

  await addColumnIfMissing(conn, database, 'specialities', 'banner_image', 'VARCHAR(255) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'about_content', 'LONGTEXT');
  await addColumnIfMissing(conn, database, 'specialities', 'about_image', 'VARCHAR(255) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'team_section_title', 'VARCHAR(180) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'team_section_subtitle', 'VARCHAR(255) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'chairman_name', 'VARCHAR(160) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'chairman_designation', 'VARCHAR(160) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'chairman_photo', 'VARCHAR(255) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'chairman_message', 'LONGTEXT');
  await addColumnIfMissing(conn, database, 'specialities', 'meta_title', 'VARCHAR(180) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'specialities', 'meta_description', 'VARCHAR(255) DEFAULT NULL');

  await addColumnIfMissing(conn, database, 'doctors', 'license_number', 'VARCHAR(80) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'doctors', 'hospital_location', 'VARCHAR(255) DEFAULT NULL');

  await addColumnIfMissing(conn, database, 'health_library', 'patient_name', 'VARCHAR(160) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'phone', 'VARCHAR(40) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'email', 'VARCHAR(150) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'country', 'VARCHAR(120) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'disease', 'VARCHAR(220) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'previous_reports', 'VARCHAR(255) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'treatment_start_date', 'DATE DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'treatment_end_date', 'DATE DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'amount', 'DECIMAL(12,2) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'hospital_name', 'VARCHAR(160) DEFAULT NULL');
  await addColumnIfMissing(conn, database, 'health_library', 'post_op_details', 'LONGTEXT');

  await addColumnIfMissing(conn, database, 'our_stories', 'video_url', 'VARCHAR(255) DEFAULT NULL');

  const [tables] = await conn.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name`,
    [database]
  );
  await conn.end();
  console.log(
    `Database ready (${database}). Tables: ${tables.map((t) => t.TABLE_NAME || t.table_name).join(', ')}`
  );
}

module.exports = initDatabase;
