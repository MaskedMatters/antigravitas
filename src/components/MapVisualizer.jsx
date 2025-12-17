import React, { useState } from 'react';
import { useMap } from '../context/MapContext';

// Helper to darken hex color
const darkenColor = (hex, percent) => {
    if (!hex) return '#000000';
    let num = parseInt(hex.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) - amt;
    let G = (num >> 8 & 0x00FF) - amt;
    let B = (num & 0x0000FF) - amt;
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
};

const MapVisualizer = ({
    lines = [],
    stops = [],
    interactive = false,
    onCellClick,
    showLines = true,
    children
}) => {
    const { grid, gridSize } = useMap();
    const [hoveredCell, setHoveredCell] = useState(null);

    const CELL_SIZE = 40; // px
    // Adjust width/height based on grid size
    const WIDTH = gridSize * CELL_SIZE;
    const HEIGHT = gridSize * CELL_SIZE;

    const [isMouseDown, setIsMouseDown] = useState(false);

    // Render Grid Cells
    const renderGrid = () => {
        return grid.map((row, y) =>
            row.map((cell, x) => (
                <div
                    key={`${x}-${y}`}
                    onMouseDown={() => {
                        setIsMouseDown(true);
                        if (interactive && onCellClick) onCellClick(x, y, cell);
                    }}
                    onMouseUp={() => setIsMouseDown(false)}
                    onMouseEnter={() => {
                        setHoveredCell({ x, y, ...cell });
                        // Drag to paint
                        if (interactive && isMouseDown && onCellClick) {
                            onCellClick(x, y, cell);
                        }
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                        position: 'absolute',
                        left: x * CELL_SIZE,
                        top: y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: cell.color,
                        border: interactive ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        cursor: interactive ? 'pointer' : 'default',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* Attraction Tooltip equivalent */}
                    {cell.type === 'attraction' && hoveredCell?.x === x && hoveredCell?.y === y && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}>
                            {cell.meta?.name || 'Attraction'}
                        </div>
                    )}
                </div>
            ))
        );
    };

    return (
        <div
            style={{
                position: 'relative',
                width: WIDTH,
                height: HEIGHT,
                backgroundColor: '#eee',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                userSelect: 'none' // Prevent text selection while dragging
            }}
            onMouseLeave={() => setIsMouseDown(false)}
        >
            {renderGrid()}

            {/* Lines Layer (SVG) */}
            {showLines && lines.length > 0 && (
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {lines.map(line => {
                        if (!line.path || line.path.length < 2) return null;
                        const points = line.path.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ');
                        return (
                            <polyline
                                key={line.id}
                                points={points}
                                fill="none"
                                stroke={line.color}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.8"
                            />
                        );
                    })}
                </svg>
            )}

            {/* Stops Layer */}
            {showLines && stops.length > 0 && stops.map((stop, idx) => {
                if (stop.x === undefined || stop.y === undefined) return null;
                const SIZE = 20;
                const pinColor = stop.color || '#ffffff';
                return (
                    <div
                        key={stop.id || idx}
                        title={stop.name}
                        style={{
                            position: 'absolute',
                            left: stop.x * CELL_SIZE + (CELL_SIZE - SIZE) / 2, // Center precisely
                            top: stop.y * CELL_SIZE + (CELL_SIZE - SIZE) / 2,
                            width: `${SIZE}px`,
                            height: `${SIZE}px`,
                            backgroundColor: pinColor,
                            border: `3px solid ${darkenColor(pinColor, 40)}`,
                            borderRadius: '50%',
                            zIndex: 5,
                            pointerEvents: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                );
            })}

            {/* Custom Children (Train Simulator, etc) */}
            {children}
        </div>
    );
};

export default MapVisualizer;
