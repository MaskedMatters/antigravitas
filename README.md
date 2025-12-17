# Antigravitas

A modern, interactive train scheduling and simulation system with real-time visualization.

## Quick Start

```bash
# Install dependencies
npm install

# Run both frontend and backend servers
npm run dev:all
```

Visit http://localhost:5173 to view the application.

## Features

- 🗺️ Interactive 20x20 grid map with terrain painting
- 🚄 Real-time train simulation with smooth animation
- 📅 Flexible flowchart-based scheduling system
- 💾 JSON file database with automatic backups
- 🎨 Custom color-coded lines and stops
- 📊 Complete admin dashboard for data management

## Running the Application

The app requires both servers:
- **Frontend** (Vite): http://localhost:5173
- **Backend** (Express): http://localhost:3001

```bash
npm run dev:all    # Run both servers
npm run dev        # Frontend only
npm run server     # Backend only
```

## Data Storage

All data is stored in `data/trainApp.json`:
- Brands, Stops, Lines, Schedules
- Map grid configuration
- Automatically created on first run with seed data

## Admin Access

Login with:
- Username: `admin`
- Password: `admin`

## Technologies

- React 19 + Vite
- Express.js
- CSS Variables
- JSON File Database

## License

MIT
