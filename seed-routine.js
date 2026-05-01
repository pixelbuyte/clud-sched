#!/usr/bin/env node
// Run: node seed-routine.js [--force] [--days 7]
// Seeds DayFlow DB with your recurring daily routine.
// Uses recurrence so blocks appear on every matching day automatically.

const Database = require('better-sqlite3');
const path = require('path');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'db.sqlite');
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

// Today's date as the recurrence anchor
function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Your actual recurring routine
// recurrence: 'daily' | 'weekdays' | 'weekly' | 'none'
const ROUTINE = [
  // ── School days: Tue / Wed / Thu ──────────────────────────────────────────
  // These run as 'weekdays' (Mon–Fri). If you only want Tue–Thu, set to
  // 'weekly' with three separate entries using different anchor dates.
  {
    title: '🍽️ Eat',
    start: '08:00', end: '08:20',
    category: 'Nutrition', color_bg: '#22c55e', color_text: '#0a2818',
    notes: 'Fast',
    recurrence: 'weekdays'
  },
  {
    title: '💼 Work Block',
    start: '08:20', end: '09:00',
    category: 'Work', color_bg: '#eab308', color_text: '#3d2c00',
    notes: 'Your existing work',
    recurrence: 'weekdays'
  },
  {
    title: '💻 BUILD',
    start: '09:00', end: '10:30',
    category: 'Build', color_bg: '#3b82f6', color_text: '#ffffff',
    notes: 'One focused session — ship something',
    recurrence: 'weekdays'
  },
  {
    title: '📧 OUTREACH',
    start: '10:30', end: '11:00',
    category: 'Outreach', color_bg: '#f97316', color_text: '#ffffff',
    notes: 'Send emails, follow up leads',
    recurrence: 'weekdays'
  },
  {
    title: '💪 WORKOUT',
    start: '11:00', end: '11:30',
    category: 'Fitness', color_bg: '#ef4444', color_text: '#ffffff',
    notes: 'Quick dumbbells',
    recurrence: 'weekdays'
  },
  {
    title: '🛌 SLEEP',
    start: '23:30', end: '23:59',
    category: 'Sleep', color_bg: '#64748b', color_text: '#ffffff',
    notes: 'Hard stop',
    recurrence: 'weekdays'
  },

  // ── Home days: Mon / Fri / Weekend ────────────────────────────────────────
  {
    title: '🍽️ EAT',
    start: '16:00', end: '16:20',
    category: 'Nutrition', color_bg: '#22c55e', color_text: '#0a2818',
    notes: 'No phone, just eat',
    recurrence: 'daily'
  },
  {
    title: '💻 BUILD',
    start: '16:20', end: '17:30',
    category: 'Build', color_bg: '#3b82f6', color_text: '#ffffff',
    notes: 'Cursor/Claude Code — build sellable web app',
    recurrence: 'daily'
  },
  {
    title: '📧 OUTREACH',
    start: '17:30', end: '18:00',
    category: 'Outreach', color_bg: '#f97316', color_text: '#ffffff',
    notes: 'Cold emails, DMs, find leads',
    recurrence: 'daily'
  },
  {
    title: '💪 WORKOUT',
    start: '18:00', end: '18:30',
    category: 'Fitness', color_bg: '#ef4444', color_text: '#ffffff',
    notes: 'Dumbbells — build that muscle',
    recurrence: 'daily'
  },
  {
    title: '💻 BUILD or LEARN',
    start: '18:30', end: '19:30',
    category: 'Build', color_bg: '#3b82f6', color_text: '#ffffff',
    notes: 'Continue building OR learn one AI tool/skill',
    recurrence: 'daily'
  },
  {
    title: '🕌 PERSONAL',
    start: '19:30', end: '20:00',
    category: 'Personal', color_bg: '#a855f7', color_text: '#ffffff',
    notes: 'Personal/prayer time',
    recurrence: 'daily'
  },
  {
    title: '💼 WORK BLOCK',
    start: '20:00', end: '20:30',
    category: 'Work', color_bg: '#eab308', color_text: '#3d2c00',
    notes: 'Your existing work till ~8:30',
    recurrence: 'daily'
  },
  {
    title: '🧠 LEARN AI',
    start: '21:00', end: '23:30',
    category: 'Learning', color_bg: '#4f46e5', color_text: '#ffffff',
    notes: 'YouTube, docs, build small experiments — NO scrolling',
    recurrence: 'daily'
  },
  {
    title: '🛌 WIND DOWN & SLEEP',
    start: '23:30', end: '23:59',
    category: 'Sleep', color_bg: '#64748b', color_text: '#ffffff',
    notes: 'No screens. Sleep.',
    recurrence: 'daily'
  },
];

const dateStr = today();
const existing = db.prepare("SELECT COUNT(*) as n FROM blocks WHERE date = ? AND recurrence != 'none'").get(dateStr);

if (existing.n > 0 && !FORCE) {
  console.log(`Routine already seeded (${existing.n} recurring blocks on ${dateStr}).`);
  console.log('Use --force to re-seed.');
  db.close();
  process.exit(0);
}

if (FORCE) {
  const del = db.prepare("DELETE FROM blocks WHERE recurrence != 'none'");
  const { changes } = del.run();
  console.log(`Cleared ${changes} existing recurring blocks.`);
}

const insert = db.prepare(`
  INSERT INTO blocks (id, date, title, start, end, category, color_bg, color_text, notes, done, recurrence, recurrence_end)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL)
`);

const seed = db.transaction(() => {
  for (const b of ROUTINE) {
    insert.run(
      crypto.randomUUID(), dateStr,
      b.title, b.start, b.end, b.category,
      b.color_bg, b.color_text, b.notes, b.recurrence
    );
  }
});

seed();
console.log(`\nSeeded ${ROUTINE.length} recurring blocks anchored to ${dateStr}.`);
console.log('They will appear on every matching day going forward — refresh DayFlow!');
db.close();
