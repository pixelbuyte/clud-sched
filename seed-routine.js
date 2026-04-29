const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, './db.sqlite'));

const blocks = [
  // TUE / WED / THU (School days - 8am to 12am)
  {
    title: '🍽️ Eat',
    startTime: '08:00',
    endTime: '08:20',
    category: 'Nutrition',
    color: '#22c55e',
    notes: 'Fast',
    recurring: true,
    recurringType: 'weekdays',
  },
  {
    title: '💼 Work Block',
    startTime: '08:20',
    endTime: '09:00',
    category: 'Work',
    color: '#eab308',
    notes: 'Your existing work',
    recurring: true,
    recurringType: 'weekdays',
  },
  {
    title: '💻 BUILD',
    startTime: '09:00',
    endTime: '10:30',
    category: 'Build',
    color: '#3b82f6',
    notes: 'One focused session — ship something',
    recurring: true,
    recurringType: 'weekdays',
  },
  {
    title: '📧 OUTREACH',
    startTime: '10:30',
    endTime: '11:00',
    category: 'Outreach',
    color: '#f97316',
    notes: 'Send emails, follow up leads',
    recurring: true,
    recurringType: 'weekdays',
  },
  {
    title: '💪 WORKOUT',
    startTime: '11:00',
    endTime: '11:30',
    category: 'Fitness',
    color: '#ef4444',
    notes: 'Quick dumbbells',
    recurring: true,
    recurringType: 'weekdays',
  },
  {
    title: '🛌 SLEEP',
    startTime: '23:30',
    endTime: '23:59',
    category: 'Sleep',
    color: '#64748b',
    notes: 'Hard stop',
    recurring: true,
    recurringType: 'weekdays',
  },

  // MON / FRI / WEEKEND (Home days - 4pm to 12am)
  {
    title: '🍽️ EAT',
    startTime: '16:00',
    endTime: '16:20',
    category: 'Nutrition',
    color: '#22c55e',
    notes: 'No phone, just eat',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '💻 BUILD',
    startTime: '16:20',
    endTime: '17:30',
    category: 'Build',
    color: '#3b82f6',
    notes: 'Cursor/Claude Code — build sellable web app',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '📧 OUTREACH',
    startTime: '17:30',
    endTime: '18:00',
    category: 'Outreach',
    color: '#f97316',
    notes: 'Cold emails, DMs, find leads',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '💪 WORKOUT',
    startTime: '18:00',
    endTime: '18:30',
    category: 'Fitness',
    color: '#ef4444',
    notes: 'Dumbbells — build that muscle',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '💻 BUILD or LEARN',
    startTime: '18:30',
    endTime: '19:30',
    category: 'Build',
    color: '#3b82f6',
    notes: 'Continue building OR learn one AI tool/skill',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '🕌 PERSONAL',
    startTime: '19:30',
    endTime: '20:00',
    category: 'Personal',
    color: '#a855f7',
    notes: 'Personal/prayer time',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '💼 WORK BLOCK',
    startTime: '20:00',
    endTime: '20:30',
    category: 'Work',
    color: '#eab308',
    notes: 'Your existing work till ~8:30',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '🧠 LEARN AI',
    startTime: '21:00',
    endTime: '23:30',
    category: 'Learning',
    color: '#4f46e5',
    notes: 'YouTube, docs, build small experiments — NO scrolling',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
  {
    title: '🛌 WIND DOWN & SLEEP',
    startTime: '23:30',
    endTime: '23:59',
    category: 'Sleep',
    color: '#64748b',
    notes: 'No screens. Sleep.',
    recurring: true,
    recurringType: 'mon-fri-weekend',
  },
];

db.serialize(() => {
  console.log('🚀 Seeding Zen\'s routine into DayFlow...\n');

  let count = 0;
  blocks.forEach((block) => {
    db.run(
      `INSERT INTO blocks (title, startTime, endTime, category, color, notes, recurring, recurringType) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        block.title,
        block.startTime,
        block.endTime,
        block.category,
        block.color,
        block.notes,
        block.recurring ? 1 : 0,
        block.recurringType,
      ],
      function (err) {
        if (err) {
          console.error('❌ Error inserting block:', block.title, err);
        } else {
          count++;
          console.log(`✅ Added: ${block.title}`);
        }
      }
    );
  });

  setTimeout(() => {
    db.close(() => {
      console.log(`\n✅ Routine seeded! Added ${blocks.length} blocks to DayFlow.`);
      console.log('🎯 Your schedule is now loaded. Refresh the app!');
      process.exit(0);
    });
  }, 1000);
});