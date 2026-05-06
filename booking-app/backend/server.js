import express from 'express'
import cors from 'cors'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bookinguser:bookingpass@client-menu-postgres:5432/bookingdb'
})

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const allowed = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)
    if (allowed) return callback(null, true)
    if (origin.includes('rodafpv.com')) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
    allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only video files are allowed'))
  },
  limits: { fileSize: 500 * 1024 * 1024 }
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SALT_ROUNDS = 10

const generateToken = (userId, isAdmin = false) => jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '7d' })

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' })
    next()
  })
}

const initDb = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, tier VARCHAR(50) DEFAULT 'starter', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    await pool.query(`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    await pool.query(`CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, date DATE, time TIME, service VARCHAR(255), location VARCHAR(500), status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    await pool.query(`CREATE TABLE IF NOT EXISTS customer_files (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, filename VARCHAR(255), original_filename VARCHAR(255), file_path VARCHAR(255), file_size INT, uploaded_by INT REFERENCES admins(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    await pool.query(`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, message TEXT NOT NULL, reply TEXT, reply_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    await pool.query(`CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, stripe_id VARCHAR(255), amount NUMERIC(10,2), type VARCHAR(50) DEFAULT 'deposit', status VARCHAR(50) DEFAULT 'paid', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    await pool.query(`CREATE TABLE IF NOT EXISTS contracts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE, unsigned_path VARCHAR(255), signed_path VARCHAR(255), signed_at TIMESTAMP, ip_address VARCHAR(100), typed_name VARCHAR(255), pdf_hash VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)

    const adminCheck = await pool.query('SELECT id FROM admins LIMIT 1')
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcryptjs.hash('admin123', SALT_ROUNDS)
      await pool.query('INSERT INTO admins (email, name, password) VALUES ($1, $2, $3)', ['admin@rodafpv.com', 'RodaFPV Admin', hashedPassword])
      console.log('Default admin created: admin@rodafpv.com / admin123')
    }

    // Add tier column if it doesn't exist (migration)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'starter'`)

    console.log('Database initialized')
  } catch (err) {
    console.error('DB init error:', err.message)
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body
    if (!email || !name || !password || !confirmPassword) return res.status(400).json({ error: 'All fields required' })
    if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' })
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS)
    const result = await pool.query('INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name, tier', [email, name, hashedPassword])
    const user = result.rows[0]
    res.status(201).json({ token: generateToken(user.id, false), user })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' })
    const user = result.rows[0]
    if (!await bcryptjs.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ token: generateToken(user.id, false), user: { id: user.id, email: user.email, name: user.name, tier: user.tier } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, email, name, tier FROM users WHERE id = $1', [req.user.userId])
    res.json(user.rows[0] || {})
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body
    if (!newPassword || !confirmPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [await bcryptjs.hash(newPassword, SALT_ROUNDS), req.user.userId])
    res.json({ message: 'Password changed successfully' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ADMIN AUTH ────────────────────────────────────────────────────────────────
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' })
    const admin = result.rows[0]
    if (!await bcryptjs.compare(password, admin.password)) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ token: generateToken(admin.id, true), admin: { id: admin.id, email: admin.email, name: admin.name } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/admin/me', verifyAdmin, async (req, res) => {
  try {
    const admin = await pool.query('SELECT id, email, name FROM admins WHERE id = $1', [req.user.userId])
    res.json(admin.rows[0] || {})
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ADMIN: USERS ──────────────────────────────────────────────────────────────
app.get('/admin/users', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, tier, created_at FROM users ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ message: 'User deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.patch('/admin/users/:id/tier', verifyAdmin, async (req, res) => {
  try {
    const { tier } = req.body
    if (!['starter','pro','elite'].includes(tier)) return res.status(400).json({ error: 'Invalid tier' })
    const result = await pool.query('UPDATE users SET tier = $1 WHERE id = $2 RETURNING id, email, name, tier', [tier, req.params.id])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/admin/users/:id/reset-password', verifyAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [req.params.id])
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [await bcryptjs.hash(newPassword, SALT_ROUNDS), req.params.id])
    res.json({ message: 'Password reset successfully' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ADMIN: APPOINTMENTS ───────────────────────────────────────────────────────
app.get('/admin/appointments', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT a.id, a.date, a.time, a.service, a.location, a.status, u.name as user_name, u.email FROM appointments a JOIN users u ON a.user_id = u.id ORDER BY a.date DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.patch('/admin/appointments/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [req.body.status, req.params.id])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/admin/appointments/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id])
    res.json({ message: 'Appointment deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ADMIN: FILES ──────────────────────────────────────────────────────────────
app.get('/admin/files', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT cf.id, cf.original_filename, cf.file_size, cf.created_at, u.id as user_id, u.name as user_name, u.email FROM customer_files cf JOIN users u ON cf.user_id = u.id ORDER BY cf.created_at DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/admin/upload', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' })
    const { user_id, original_filename } = req.body
    if (!user_id) { fs.unlinkSync(req.file.path); return res.status(400).json({ error: 'Customer must be selected' }) }
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id])
    if (userCheck.rows.length === 0) { fs.unlinkSync(req.file.path); return res.status(404).json({ error: 'Customer not found' }) }
    const result = await pool.query('INSERT INTO customer_files (user_id, filename, original_filename, file_path, file_size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user_id, req.file.filename, original_filename || req.file.originalname, req.file.path, req.file.size, req.user.userId])
    res.json({ message: 'File uploaded successfully', file: result.rows[0] })
  } catch (err) { if (req.file) fs.unlinkSync(req.file.path); res.status(500).json({ error: err.message }) }
})

app.delete('/admin/files/:id', verifyAdmin, async (req, res) => {
  try {
    const fileResult = await pool.query('SELECT file_path FROM customer_files WHERE id = $1', [req.params.id])
    if (fileResult.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    if (fs.existsSync(fileResult.rows[0].file_path)) fs.unlinkSync(fileResult.rows[0].file_path)
    await pool.query('DELETE FROM customer_files WHERE id = $1', [req.params.id])
    res.json({ message: 'File deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ADMIN: COMMENTS ───────────────────────────────────────────────────────────
app.get('/admin/comments', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT c.id, c.message, c.reply, c.reply_at, c.created_at, u.name as user_name, u.email FROM comments c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.patch('/admin/comments/:id/reply', verifyAdmin, async (req, res) => {
  try {
    const { reply } = req.body
    const result = await pool.query('UPDATE comments SET reply = $1, reply_at = NOW() WHERE id = $2 RETURNING *', [reply, req.params.id])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/admin/comments/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id])
    res.json({ message: 'Comment deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ADMIN: PAYMENTS ───────────────────────────────────────────────────────────
app.get('/admin/payments', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT p.id, p.amount, p.type, p.status, p.created_at, u.name as user_name, u.email FROM payments p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── CLIENT: CONTENT ───────────────────────────────────────────────────────────
app.get('/content', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, original_filename as title, file_size FROM customer_files WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId])
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/content/:id/download', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT file_path, original_filename FROM customer_files WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId])
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    res.download(result.rows[0].file_path, result.rows[0].original_filename)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── CLIENT: APPOINTMENTS ──────────────────────────────────────────────────────
app.get('/appointments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, date, time, service, location, status FROM appointments WHERE user_id = $1 ORDER BY date DESC', [req.user.userId])
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/appointments', verifyToken, async (req, res) => {
  try {
    const { date, time, service, location } = req.body
    const result = await pool.query('INSERT INTO appointments (user_id, date, time, service, location) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.user.userId, date, time, service, location])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/appointments/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId])
    res.json({ message: 'Cancelled' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── CLIENT: COMMENTS ──────────────────────────────────────────────────────────
app.get('/comments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, message, reply, reply_at, created_at FROM comments WHERE user_id = $1 ORDER BY created_at ASC', [req.user.userId])
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/comments', verifyToken, async (req, res) => {
  try {
    const { message } = req.body
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' })
    const result = await pool.query('INSERT INTO comments (user_id, message) VALUES ($1, $2) RETURNING *', [req.user.userId, message.trim()])
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── CLIENT: PAYMENTS ──────────────────────────────────────────────────────────
app.get('/payments', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, amount, type, status, created_at FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId])
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/payments/deposit', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || isNaN(amount) || Number(amount) < 1) return res.status(400).json({ error: 'Invalid amount' })
    // For now record the payment directly (Stripe integration to be added)
    // When Stripe is ready, replace this with a Stripe checkout session
    const result = await pool.query('INSERT INTO payments (user_id, amount, type, status) VALUES ($1, $2, $3, $4) RETURNING *', [req.user.userId, Number(amount), 'deposit', 'paid'])
    res.json({ message: 'Payment recorded', payment: result.rows[0], url: null })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── CLIENT: CONTRACTS ─────────────────────────────────────────────────────────
app.get('/contracts/my', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, signed_at, typed_name, pdf_hash FROM contracts WHERE user_id = $1', [req.user.userId])
    if (result.rows.length === 0) return res.json(null)
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/contracts/sign', verifyToken, async (req, res) => {
  try {
    const { typedName } = req.body
    if (!typedName || !typedName.trim()) return res.status(400).json({ error: 'Typed name required' })
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const existing = await pool.query('SELECT id FROM contracts WHERE user_id = $1', [req.user.userId])
    let result
    if (existing.rows.length > 0) {
      result = await pool.query('UPDATE contracts SET signed_at = NOW(), typed_name = $1, ip_address = $2 WHERE user_id = $3 RETURNING *', [typedName.trim(), ip, req.user.userId])
    } else {
      result = await pool.query('INSERT INTO contracts (user_id, signed_at, typed_name, ip_address) VALUES ($1, NOW(), $2, $3) RETURNING *', [req.user.userId, typedName.trim(), ip])
    }
    res.json(result.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})


// ── ADMIN: CONTRACTS ─────────────────────────────────────────────────────────
app.get('/admin/contracts', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT c.id, c.signed_at, c.typed_name, c.ip_address, c.created_at, u.name as user_name, u.email, u.tier FROM contracts c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC')
    res.json(result.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/admin/contracts/create', verifyAdmin, async (req, res) => {
  try {
    const { user_id } = req.body
    if (!user_id) return res.status(400).json({ error: 'user_id required' })
    const userCheck = await pool.query('SELECT id, name, email, tier FROM users WHERE id = $1', [user_id])
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const existing = await pool.query('SELECT id FROM contracts WHERE user_id = $1', [user_id])
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Contract already exists for this user' })
    const result = await pool.query('INSERT INTO contracts (user_id) VALUES ($1) RETURNING *', [user_id])
    res.json({ message: 'Contract created', contract: result.rows[0] })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.delete('/admin/contracts/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM contracts WHERE id = $1', [req.params.id])
    res.json({ message: 'Contract deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5001
app.listen(PORT, async () => {
  await initDb()
  console.log(`Server running on port ${PORT}`)
})
