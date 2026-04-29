# DayFlow

Personal daily time-block scheduler — Node.js + Express + SQLite + vanilla JS.

## Features

- 24-hour vertical timeline with colored, draggable time blocks
- Day view + Week view toggle
- Drag-to-resize blocks (15-minute snap)
- Recurring blocks (Daily / Weekdays / Weekly)
- Check off blocks as done; live progress sidebar
- Keyboard shortcuts (`N`, `← →`, `Esc`)
- SQLite-backed REST API

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## API

| Method | Path                       | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/api/blocks?date=YYYY-MM-DD` | List blocks for date (incl. recurring) |
| POST   | `/api/blocks`              | Create a block               |
| PUT    | `/api/blocks/:id`          | Update a block               |
| DELETE | `/api/blocks/:id`          | Delete a block               |
| PATCH  | `/api/blocks/:id/done`     | Toggle done                  |

## Deploy to Vercel

```bash
vercel
```

The included `vercel.json` routes all requests through `server.js`. SQLite writes to `/tmp/db.sqlite` on Vercel (ephemeral) and `./db.sqlite` locally.
