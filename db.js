const fs = require('fs');
const path = require('path');

// Em produção, use PostgreSQL definindo DATABASE_URL.
// Sem DATABASE_URL, o projeto continua funcionando localmente com JSON.
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  async function ensure() {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`);
    await pool.query(`CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    );`);
  }
  async function createUser({ name, email, password_hash }) {
    const r = await pool.query('INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING *', [name, String(email).toLowerCase(), password_hash]);
    const u = r.rows[0];
    await pool.query('INSERT INTO user_data (user_id,data) VALUES ($1,$2)', [u.id, '{}']);
    return u;
  }
  async function findUserByEmail(email) {
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase()]);
    return r.rows[0] || null;
  }
  async function findUserById(id) {
    const r = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return r.rows[0] || null;
  }
  async function getUserData(id) {
    const r = await pool.query('SELECT data FROM user_data WHERE user_id=$1', [id]);
    return r.rows[0]?.data || {};
  }
  async function setUserData(id, key, value) {
    await pool.query(`INSERT INTO user_data (user_id,data) VALUES ($1, jsonb_build_object($2::text,$3::jsonb))
      ON CONFLICT (user_id) DO UPDATE SET data = user_data.data || jsonb_build_object($2::text,$3::jsonb)`, [id, key, JSON.stringify(value)]);
  }
  async function deleteUser(id) { await pool.query('DELETE FROM users WHERE id=$1', [id]); }
  module.exports = { DB_FILE: null, ensure, createUser, findUserByEmail, findUserById, getUserData, setUserData, deleteUser, mode: 'postgres' };
} else {
  const DB_DIR = path.join(__dirname, '../database');
  const DB_FILE = path.join(DB_DIR, 'equilibrio-db.json');
  const EMPTY = { version: 1, nextUserId: 1, users: [], userData: {} };
  function ensure() { fs.mkdirSync(DB_DIR, { recursive: true }); if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY, null, 2), 'utf8'); }
  function load() { ensure(); try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY, null, 2), 'utf8'); return structuredClone(EMPTY); } }
  function save(db) { ensure(); const tmp = DB_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8'); fs.renameSync(tmp, DB_FILE); }
  function createUser({ name, email, password_hash }) { const db = load(); const normalized = String(email).toLowerCase(); if (db.users.some(u => u.email === normalized)) { const e = new Error('duplicate'); e.code = '23505'; throw e; } const user = { id: db.nextUserId++, name, email: normalized, password_hash, created_at: new Date().toISOString() }; db.users.push(user); db.userData[user.id] = {}; save(db); return user; }
  function findUserByEmail(email) { return load().users.find(u => u.email === String(email).toLowerCase()) || null; }
  function findUserById(id) { return load().users.find(u => Number(u.id) === Number(id)) || null; }
  function getUserData(id) { const db = load(); return db.userData[id] || {}; }
  function setUserData(id, key, value) { const db = load(); if (!db.userData[id]) db.userData[id] = {}; db.userData[id][key] = value; save(db); }
  function deleteUser(id) { const db = load(); db.users = db.users.filter(u => Number(u.id) !== Number(id)); delete db.userData[id]; save(db); }
  module.exports = { DB_FILE, ensure, createUser, findUserByEmail, findUserById, getUserData, setUserData, deleteUser, mode: 'json' };
}
