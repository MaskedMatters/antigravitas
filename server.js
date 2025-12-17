import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'trainApp.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Initialize with seed data if file doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const seedData = {
            brands: [
                { id: 'b1', name: 'SwiftRail', logo: '🚄' },
                { id: 'b2', name: 'MetroCity', logo: '🚇' }
            ],
            stops: [
                { id: 's1', name: 'Central Station', location: 'Downtown', x: 10, y: 10, color: '#ef4444' },
                { id: 's2', name: 'North Hills', location: 'Suburbs', x: 10, y: 2, color: '#3b82f6' },
                { id: 's3', name: 'Tech Park', location: 'Business District', x: 16, y: 10, color: '#10b981' },
                { id: 's4', name: 'Airport', location: 'Transit Hub', x: 18, y: 18, color: '#f59e0b' },
                { id: 's5', name: 'Westside Plaza', location: 'Shopping District', x: 2, y: 10, color: '#8b5cf6' }
            ],
            lines: [
                {
                    id: 'l1', brandId: 'b1', name: 'Red Express', color: '#ef4444',
                    stopIds: ['s1', 's3', 's4'],
                    type: 'point-to-point',
                    path: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 14 }, { x: 18, y: 18 }]
                },
                {
                    id: 'l2', brandId: 'b2', name: 'Blue Line', color: '#3b82f6',
                    stopIds: ['s2', 's1', 's5'],
                    type: 'point-to-point',
                    path: [{ x: 10, y: 2 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 }, { x: 10, y: 9 }, { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }, { x: 2, y: 10 }]
                }
            ],
            schedules: [
                {
                    id: 'sch1', lineId: 'l1',
                    trip: [
                        { stopId: 's1', arrival: '08:00', departure: '08:05', stopIndex: 0, direction: 1 },
                        { stopId: 's3', arrival: '08:20', departure: '08:25', stopIndex: 1, direction: 1 },
                        { stopId: 's4', arrival: '08:45', departure: '08:55', stopIndex: 2, direction: 1 },
                        { stopId: 's3', arrival: '09:15', departure: '09:20', stopIndex: 1, direction: -1 },
                        { stopId: 's1', arrival: '09:35', departure: '09:40', stopIndex: 0, direction: -1 },
                        { stopId: 's1', arrival: '14:00', departure: '14:05', stopIndex: 0, direction: 1 },
                        { stopId: 's3', arrival: '14:20', departure: '14:25', stopIndex: 1, direction: 1 },
                        { stopId: 's4', arrival: '14:45', departure: '14:55', stopIndex: 2, direction: 1 },
                        { stopId: 's3', arrival: '15:15', departure: '15:20', stopIndex: 1, direction: -1 },
                        { stopId: 's1', arrival: '15:35', departure: '15:40', stopIndex: 0, direction: -1 },
                        { stopId: 's1', arrival: '16:00', departure: '16:05', stopIndex: 0, direction: 1 },
                        { stopId: 's3', arrival: '16:20', departure: '16:25', stopIndex: 1, direction: 1 },
                        { stopId: 's4', arrival: '16:45', departure: '16:55', stopIndex: 2, direction: 1 },
                        { stopId: 's3', arrival: '17:15', departure: '17:20', stopIndex: 1, direction: -1 },
                        { stopId: 's1', arrival: '17:35', departure: '17:40', stopIndex: 0, direction: -1 }
                    ]
                },
                {
                    id: 'sch2', lineId: 'l2',
                    trip: [
                        { stopId: 's2', arrival: '08:15', departure: '08:20', stopIndex: 0, direction: 1 },
                        { stopId: 's1', arrival: '08:40', departure: '08:45', stopIndex: 1, direction: 1 },
                        { stopId: 's5', arrival: '09:00', departure: '09:10', stopIndex: 2, direction: 1 },
                        { stopId: 's1', arrival: '09:25', departure: '09:30', stopIndex: 1, direction: -1 },
                        { stopId: 's2', arrival: '09:50', departure: '10:00', stopIndex: 0, direction: -1 },
                        { stopId: 's2', arrival: '14:15', departure: '14:20', stopIndex: 0, direction: 1 },
                        { stopId: 's1', arrival: '14:40', departure: '14:45', stopIndex: 1, direction: 1 },
                        { stopId: 's5', arrival: '15:00', departure: '15:10', stopIndex: 2, direction: 1 },
                        { stopId: 's1', arrival: '15:25', departure: '15:30', stopIndex: 1, direction: -1 },
                        { stopId: 's2', arrival: '15:50', departure: '16:00', stopIndex: 0, direction: -1 },
                        { stopId: 's2', arrival: '16:15', departure: '16:20', stopIndex: 0, direction: 1 },
                        { stopId: 's1', arrival: '16:40', departure: '16:45', stopIndex: 1, direction: 1 },
                        { stopId: 's5', arrival: '17:00', departure: '17:10', stopIndex: 2, direction: 1 },
                        { stopId: 's1', arrival: '17:25', departure: '17:30', stopIndex: 1, direction: -1 },
                        { stopId: 's2', arrival: '17:50', departure: '18:00', stopIndex: 0, direction: -1 }
                    ]
                }
            ],
            mapGrid: Array(20).fill(null).map(() => Array(20).fill(null)),
            metadata: {
                version: '1.0',
                lastModified: new Date().toISOString()
            }
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(seedData, null, 2));
        console.log('✅ Initialized data file with seed data');
    }
}

// GET /api/data - Read entire database
app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// POST /api/data - Write entire database
app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;
        data.metadata = {
            ...data.metadata,
            lastModified: new Date().toISOString()
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error writing data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// GET /api/data/backup - Create backup
app.get('/api/data/backup', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupFile = path.join(__dirname, 'data', `trainApp-backup-${timestamp}.json`);
        await fs.writeFile(backupFile, data);
        res.json({ success: true, message: 'Backup created', file: backupFile });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Initialize and start server
async function start() {
    await ensureDataDir();
    await initializeDataFile();
    app.listen(PORT, () => {
        console.log(`🚄 Antigravitas API Server running on http://localhost:${PORT}`);
        console.log(`📁 Data file: ${DATA_FILE}`);
    });
}

start().catch(console.error);
