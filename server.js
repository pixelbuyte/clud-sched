const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = process.env.VERCEL ? '/tmp/db.sqlite' : path.join(__dirname, 'db.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY,
    date TEXT,
    title TEXT,
    start TEXT,
    end TEXT,
    category TEXT,
    color_bg TEXT,
    color_text TEXT,
    notes TEXT,
    done INTEGER DEFAULT 0,
    recurrence TEXT DEFAULT 'none',
    recurrence_end TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_blocks_date ON blocks(date);
  CREATE INDEX IF NOT EXISTS idx_blocks_recurrence ON blocks(recurrence);
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function dayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay();
}

function appliesOnDate(block, dateStr) {
  if (block.date === dateStr) return true;
  if (!block.recurrence || block.recurrence === 'none') return false;
  if (block.date > dateStr) return false;
  if (block.recurrence_end && block.recurrence_end < dateStr) return false;
  const dow = dayOfWeek(dateStr);
  if (block.recurrence === 'daily') return true;
  if (block.recurrence === 'weekdays') return dow >= 1 && dow <= 5;
  if (block.recurrence === 'weekly') return dayOfWeek(block.date) === dow;
  return false;
}

app.get('/api/blocks', (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'date required' });
  const all = db.prepare('SELECT * FROM blocks').all();
  const matches = all.filter(b => appliesOnDate(b, date)).map(b => ({
    ...b,
    done: !!b.done,
    isRecurringInstance: b.date !== date && b.recurrence !== 'none'
  }));
  res.json(matches);
});

app.post('/api/blocks', (req, res) => {
  const { title, start, end, category, color_bg, color_text, notes, date, recurrence, recurrence_end } = req.body;
  if (!title || !start || !end || !date) return res.status(400).json({ error: 'missing fields' });
  const id = uuidv4();
  db.prepare(`INSERT INTO blocks (id, date, title, start, end, category, color_bg, color_text, notes, done, recurrence, recurrence_end)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`).run(
    id, date, title, start, end, category || '', color_bg || '#6c63ff', color_text || '#ffffff',
    notes || '', recurrence || 'none', recurrence_end || null
  );
  res.json(db.prepare('SELECT * FROM blocks WHERE id = ?').get(id));
});

app.put('/api/blocks/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM blocks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'not found' });
  const merged = { ...existing, ...req.body };
  db.prepare(`UPDATE blocks SET title=?, start=?, end=?, category=?, color_bg=?, color_text=?, notes=?, recurrence=?, recurrence_end=?, date=? WHERE id=?`).run(
    merged.title, merged.start, merged.end, merged.category, merged.color_bg, merged.color_text,
    merged.notes, merged.recurrence, merged.recurrence_end, merged.date, id
  );
  res.json(db.prepare('SELECT * FROM blocks WHERE id = ?').get(id));
});

app.delete('/api/blocks/:id', (req, res) => {
  db.prepare('DELETE FROM blocks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.patch('/api/blocks/:id/done', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM blocks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'not found' });
  const next = existing.done ? 0 : 1;
  db.prepare('UPDATE blocks SET done = ? WHERE id = ?').run(next, id);
  res.json({ id, done: !!next });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`DayFlow running on http://localhost:${PORT}`));
}

module.exports = app;
