require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ensure, createUser, findUserByEmail, findUserById, getUserData, setUserData, deleteUser, DB_FILE, mode } = require('./db');

const app = express();
app.use(express.json({ limit: '4mb' }));
const SECRET = process.env.JWT_SECRET || 'equilibrio-dev-secret-change-me';

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Não autenticado' });
  try { req.user = jwt.verify(h.slice(7), SECRET); next(); }
  catch { res.status(401).json({ error: 'Sessão inválida' }); }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, database: mode }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, birth, city } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Preencha nome, e-mail e senha' });
    const hash = await bcrypt.hash(password, 10);
    const u = createUser({ name: String(name).trim(), email, password_hash: hash });
    setUserData(u.id, 'profile', { name: u.name, email: u.email, birth: birth || '', city: city || '' });
    const token = jwt.sign({ id: u.id, name: u.name, email: u.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u.id, name: u.name, email: u.email } });
  } catch (e) { res.status(400).json({ error: e.code === '23505' ? 'Este e-mail já está cadastrado' : e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const u = findUserByEmail(req.body?.email || '');
    if (!u || !(await bcrypt.compare(req.body?.password || '', u.password_hash))) return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    const token = jwt.sign({ id: u.id, name: u.name, email: u.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u.id, name: u.name, email: u.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/me', auth, (req, res) => {
  const u = findUserById(req.user.id);
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ user: { id: u.id, name: u.name, email: u.email, created_at: u.created_at }, data: getUserData(u.id) });
});

app.get('/api/data/:key', auth, (req, res) => res.json(getUserData(req.user.id)[req.params.key] ?? []));
app.put('/api/data/:key', auth, (req, res) => { setUserData(req.user.id, req.params.key, req.body); res.json({ ok: true }); });
app.delete('/api/account', auth, (req, res) => { deleteUser(req.user.id); res.json({ ok: true }); });

app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

Promise.resolve(ensure()).then(() => {
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Equilíbrio online/local na porta ${port}`));
console.log(`Banco: ${mode}`);
});
