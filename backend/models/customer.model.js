const db = require("../config/db");

exports.findByEmail = async (email) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customers
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};


exports.findById = async (id) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        name,
        email,
        phone,
        status,
        email_verified_at,
        last_login_at,
        created_at
      FROM customers
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};


exports.createPending = async ({
  name,
  email,
  phone,
  tokenHash,
  expiresAt,
}) => {
  const [result] = await db.query(
    `
      INSERT INTO customers
      (
        name,
        email,
        phone,
        password,
        status,
        activation_token_hash,
        activation_token_expires_at
      )
      VALUES (?, ?, ?, NULL, 'pending', ?, ?)
    `,
    [
      name,
      email,
      phone,
      tokenHash,
      expiresAt,
    ]
  );

  return result.insertId;
};


exports.refreshActivation = async ({
  id,
  name,
  phone,
  tokenHash,
  expiresAt,
}) => {
  await db.query(
    `
      UPDATE customers
      SET
        name = ?,
        phone = ?,
        activation_token_hash = ?,
        activation_token_expires_at = ?
      WHERE id = ?
    `,
    [
      name,
      phone,
      tokenHash,
      expiresAt,
      id,
    ]
  );
};


exports.findByActivationToken = async (
  tokenHash
) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customers
      WHERE activation_token_hash = ?
        AND activation_token_expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};


exports.activate = async ({
  id,
  password,
}) => {
  await db.query(
    `
      UPDATE customers
      SET
        password = ?,
        status = 'active',
        email_verified_at = NOW(),
        activation_token_hash = NULL,
        activation_token_expires_at = NULL
      WHERE id = ?
    `,
    [password, id]
  );
};


exports.saveResetToken = async ({
  id,
  tokenHash,
  expiresAt,
}) => {
  await db.query(
    `
      UPDATE customers
      SET
        reset_token_hash = ?,
        reset_token_expires_at = ?
      WHERE id = ?
    `,
    [
      tokenHash,
      expiresAt,
      id,
    ]
  );
};


exports.findByResetToken = async (
  tokenHash
) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customers
      WHERE reset_token_hash = ?
        AND reset_token_expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};


exports.resetPassword = async ({
  id,
  password,
}) => {
  await db.query(
    `
      UPDATE customers
      SET
        password = ?,
        reset_token_hash = NULL,
        reset_token_expires_at = NULL
      WHERE id = ?
    `,
    [password, id]
  );
};


exports.updateLastLogin = async (id) => {
  await db.query(
    `
      UPDATE customers
      SET last_login_at = NOW()
      WHERE id = ?
    `,
    [id]
  );
};