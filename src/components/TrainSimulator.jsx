import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';

const TrainSimulator = () => {
    const { lines, schedules, stops } = useData();
    const [trains, setTrains] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Helper: Parse time string to Date object
    const parseTime = (timeStr, baseDate = new Date()) => {
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date(baseDate);
        d.setHours(h, m, 0, 0);
        return d;
    };

    // Helper: Get minimum of two numbers
    const min = (a, b) => (a < b ? a : b);

    // Calculate active trains based on current time and schedules
    useEffect(() => {
        const activeTrains = [];
        const CELL_SIZE = 40;

        lines.forEach(line => {
            if (!line.path || line.path.length < 2) return;
            const schedule = schedules.find(s => s.lineId === line.id);
            if (!schedule) return;

            const now = currentTime;
            const nowMs = now.getTime();

            // Process trip-based schedules (flowchart format)
            if (schedule.trip && schedule.trip.length > 1) {
                // Trip is a sequence of nodes: [{ stopId, arrival, departure }]
                // We assume the train cycles daily? 
                // Or just runs this specific trip once per day?
                // User said "00:00 every new day".

                // We check each SEGMENT (Node i -> Node i+1)
                for (let i = 0; i < schedule.trip.length - 1; i++) {
                    const startNode = schedule.trip[i];
                    const endNode = schedule.trip[i + 1];

                    if (!startNode || !endNode || !startNode.departure || !endNode.arrival) continue;

                    // Parse times
                    let dep, arr;
                    try {
                        dep = parseTime(startNode.departure, now);
                        arr = parseTime(endNode.arrival, now);
                    } catch (e) {
                        console.error("Time parse error", e);
                        continue;
                    }

                    // Handle midnight crossing
                    // If arr is physically "before" dep in HH:MM, it must be tomorrow
                    if (arr < dep) {
                        arr.setDate(arr.getDate() + 1);
                    }

                    // Check if NOW is in this window
                    // This creates a train for "Today's" schedule instance
                    if (nowMs >= dep.getTime() && nowMs <= arr.getTime()) {
                        // Interpolate!
                        const total = arr.getTime() - dep.getTime();
                        const elapsed = nowMs - dep.getTime();
                        const progress = elapsed / total;

                        // Find Subpath
                        const startStop = stops.find(s => s.id === startNode.stopId);
                        const endStop = stops.find(s => s.id === endNode.stopId);

                        if (startStop && endStop) {
                            // Find indices on path
                            // Loose matching: Find closest path point
                            let startIndex = line.path.findIndex(p => p.x === startStop.x && p.y === startStop.y);
                            let endIndex = line.path.findIndex(p => p.x === endStop.x && p.y === endStop.y);

                            if (startIndex !== -1 && endIndex !== -1) {
                                let subPath = [];

                                if (line.type === 'loop') {
                                    // Handle loop wrapping
                                    // If we are moving logically forward (startNode.direction == 1)
                                    // We expect index to increase.
                                    // If endIndex < startIndex, we wrapped.
                                    if (endIndex < startIndex) {
                                        // start...endOfPath...0...end
                                        subPath = [...line.path.slice(startIndex), ...line.path.slice(0, endIndex + 1)];
                                    } else {
                                        subPath = line.path.slice(startIndex, endIndex + 1);
                                    }
                                } else {
                                    // Point-to-Point
                                    if (startIndex <= endIndex) {
                                        subPath = line.path.slice(startIndex, endIndex + 1);
                                    } else {
                                        // Moving backwards
                                        subPath = line.path.slice(endIndex, startIndex + 1).reverse();
                                    }
                                }

                                // Final Interp on subPath
                                if (subPath.length > 1) {
                                    const totalSegments = subPath.length - 1;
                                    const segmentFloat = progress * totalSegments;
                                    const segIdx = Math.floor(segmentFloat);
                                    const segProg = segmentFloat - segIdx;

                                    const p1 = subPath[min(segIdx, totalSegments - 1)];
                                    const p2 = subPath[min(segIdx + 1, totalSegments)];

                                    if (p1 && p2) { // Safety
                                        const gridX = p1.x + (p2.x - p1.x) * segProg;
                                        const gridY = p1.y + (p2.y - p1.y) * segProg;
                                        const pixelX = gridX * CELL_SIZE + CELL_SIZE / 2 - 12;
                                        const pixelY = gridY * CELL_SIZE + CELL_SIZE / 2 - 12;

                                        activeTrains.push({
                                            id: `${line.id}-trip-${i}`,
                                            x: gridX,
                                            y: gridY,
                                            color: line.color,
                                            rawX: pixelX,
                                            rawY: pixelY
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (schedule.departures && Array.isArray(schedule.departures)) {
                // --- LEGACY FALLBACK ---
                const SEGMENT_DURATION_MS = 30 * 1000;
                schedule.departures.forEach(depTime => {
                    if (!depTime || typeof depTime !== 'string') return;

                    try {
                        const [h, m] = depTime.split(':').map(Number);
                        const depDate = new Date(now);
                        depDate.setHours(h, m, 0, 0);
                        const start = depDate.getTime();
                        const totalDuration = (line.path.length - 1) * SEGMENT_DURATION_MS;
                        const end = start + totalDuration;

                        if (nowMs >= start && nowMs <= end) {
                            const elapsed = nowMs - start;
                            const progress = elapsed / totalDuration;

                            const totalSegments = line.path.length - 1;
                            const segmentFloat = progress * totalSegments;
                            // Clamp index to avoid overflow
                            const segIdx = Math.min(Math.floor(segmentFloat), totalSegments - 1);
                            const segProg = segmentFloat - segIdx;

                            const p1 = line.path[segIdx];
                            const p2 = line.path[segIdx + 1];

                            if (p1 && p2) {
                                activeTrains.push({
                                    id: `${line.id}-${depTime}`,
                                    x: p1.x + (p2.x - p1.x) * segProg,
                                    y: p1.y + (p2.y - p1.y) * segProg,
                                    color: line.color,
                                    rawX: (p1.x + (p2.x - p1.x) * segProg) * CELL_SIZE + CELL_SIZE / 2 - 12,
                                    rawY: (p1.y + (p2.y - p1.y) * segProg) * CELL_SIZE + CELL_SIZE / 2 - 12
                                });
                            }
                        }
                    } catch (e) {
                        console.warn("Legacy sim error", e);
                    }
                });
            }
        });

        // Transform internal 'x' to pixel space if not already
        const finalTrains = activeTrains.map(t => ({
            ...t,
            x: t.rawX !== undefined ? t.rawX : (t.x * CELL_SIZE + CELL_SIZE / 2 - 12),
            y: t.rawY !== undefined ? t.rawY : (t.y * CELL_SIZE + CELL_SIZE / 2 - 12)
        }));

        setTrains(finalTrains);
    }, [currentTime, lines, schedules, stops]);



    return (
        <>
            {trains.map(t => (
                <div
                    key={t.id}
                    style={{
                        position: 'absolute',
                        left: t.x,
                        top: t.y,
                        fontSize: '24px',
                        zIndex: 20,
                        transition: 'left 1s linear, top 1s linear', // Smooth movement between updates
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                >
                    🚄
                </div>
            ))}

            {/* Debug Time */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'white', padding: '4px', fontSize: '12px', opacity: 0.7 }}>
                Sim Time: {currentTime.toLocaleTimeString()}
            </div>
        </>
    );
};

export default TrainSimulator;
