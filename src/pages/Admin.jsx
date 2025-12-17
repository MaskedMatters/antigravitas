import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useMap } from '../context/MapContext';
import { Plus, Trash, Settings, Map as MapIcon, Edit3 } from 'lucide-react';
import MapVisualizer from '../components/MapVisualizer';

const Admin = () => {
    const { brands, stops, lines, schedules, addBrand, addStop, addLine, addSchedule, deleteBrand, deleteStop, deleteLine, deleteSchedule, getLineSchedule } = useData();
    const { updateCell } = useMap();
    const [activeTab, setActiveTab] = useState('brand');

    // Map Editor State
    const [paintTool, setPaintTool] = useState('land'); // land, water, attraction
    const [isPainting, setIsPainting] = useState(false);

    // Line Drawing State
    const [drawingPath, setDrawingPath] = useState([]);

    // Form States
    const [brandForm, setBrandForm] = useState({ name: '', logo: '' });
    const [stopForm, setStopForm] = useState({ name: '', location: '', x: 0, y: 0 });
    const [lineForm, setLineForm] = useState({ name: '', color: '#000000', brandId: '', stopIds: [], path: [] });
    const [scheduleForm, setScheduleForm] = useState({ lineId: '', departures: '' });

    // Auto-detect stops on path
    React.useEffect(() => {
        if (drawingPath.length > 0) {
            // Find logic stops on path
            // We consider a stop "on path" if its coordination matches any point in drawingPath
            const detectedStopIds = stops
                .filter(s => drawingPath.some(p => p.x === s.x && p.y === s.y))
                .map(s => s.id);

            // Avoid infinite loop by checking if different
            // Simple robust check: length or set comparison
            const currentIds = lineForm.stopIds;
            const isDifferent = detectedStopIds.length !== currentIds.length ||
                detectedStopIds.some(id => !currentIds.includes(id));

            if (isDifferent) {
                setLineForm(prev => ({ ...prev, stopIds: detectedStopIds }));
            }
        }
    }, [drawingPath, stops]);

    // Map Paint Handler
    const handleCellClick = (x, y) => {
        if (activeTab === 'map') {
            let meta = null;
            if (paintTool === 'attraction') {
                const name = prompt("Enter Attraction Name:");
                if (!name) return;
                meta = { name };
            }

            const colorMap = {
                land: '#86efac', // green-300
                alt_land: '#fde047', // yellow-300
                water: '#93c5fd', // blue-300
                attraction: '#a855f7' // purple-500
            };

            updateCell(x, y, paintTool, colorMap[paintTool], meta);
        }
        else if (activeTab === 'line') {
            // Add point to path
            setDrawingPath([...drawingPath, { x, y }]);
        } else if (activeTab === 'stop') {
            setStopForm({ ...stopForm, x, y });
        }
    };

    const handleCreateBrand = (e) => {
        e.preventDefault();
        addBrand(brandForm);
        setBrandForm({ name: '', logo: '' });
        alert('Brand created!');
    };

    const handleCreateStop = (e) => {
        e.preventDefault();
        addStop(stopForm);
        setStopForm({ name: '', location: '', x: 0, y: 0 });
        alert('Stop created!');
    };

    const handleCreateLine = (e) => {
        e.preventDefault();
        if (lineForm.stopIds.length < 2) return alert('Select at least 2 stops');
        if (drawingPath.length < 2) return alert('Please draw the path on the map!');

        // 1. Detect Type
        const start = drawingPath[0];
        const end = drawingPath[drawingPath.length - 1];
        const isLoop = (Math.abs(start.x - end.x) + Math.abs(start.y - end.y)) <= 1;
        const type = isLoop ? 'loop' : 'point-to-point';

        // 2. Sort Stops by Order on Path
        // We need to find the index of the path coordinate closest to each stop
        const selectedStops = stops.filter(s => lineForm.stopIds.includes(s.id));
        const orderedStops = selectedStops.sort((a, b) => {
            const indexA = drawingPath.findIndex(p => p.x === a.x && p.y === a.y);
            const indexB = drawingPath.findIndex(p => p.x === b.x && p.y === b.y);
            // If stop not exactly on path, find closest (simple manhattan check)
            // But for now assume stops are ON the path as per previous tasks
            // If not found, default to -1 (start)
            return indexA - indexB;
        });

        if (orderedStops.some(s => drawingPath.findIndex(p => p.x === s.x && p.y === s.y) === -1)) {
            // Optional warning or loose matching
            console.warn("Some stops are not exactly on the path lines.");
        }

        addLine({
            ...lineForm,
            path: drawingPath,
            type,
            stopIds: orderedStops.map(s => s.id) // Save ordered IDs
        });
        setLineForm({ name: '', color: '#000000', brandId: '', stopIds: [], path: [] });
        setDrawingPath([]);
        alert(`Line created! Detected type: ${type}`);
    };

    const handleCreateSchedule = (e) => {
        e.preventDefault();
        if (scheduleForm.trip && scheduleForm.trip.length > 0) {
            addSchedule({ lineId: scheduleForm.lineId, trip: scheduleForm.trip });
            setScheduleForm({ lineId: '', departures: '', trip: [] });
        } else {
            const departures = scheduleForm.departures.split(',').map(d => d.trim()).filter(Boolean);
            addSchedule({ lineId: scheduleForm.lineId, departures });
            setScheduleForm({ lineId: '', departures: '' });
        }
        alert('Schedule updated/created!');
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <h1 className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <Settings size={32} color="var(--primary)" />
                Admin Dashboard
            </h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
                {['brand', 'map', 'stop', 'line', 'schedule'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab === 'map' ? 'Map Designer' : `Create ${tab}`}
                    </button>
                ))}
            </div>

            <div className="card">
                {activeTab === 'brand' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <form onSubmit={handleCreateBrand}>
                            <h3>Create New Train Brand</h3>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Brand Name</label>
                                <input className="input" value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} required placeholder="e.g. SuperRail" />
                            </div>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Logo (Emoji)</label>
                                <input className="input" value={brandForm.logo} onChange={e => setBrandForm({ ...brandForm, logo: e.target.value })} required placeholder="e.g. 🚅" />
                            </div>
                            <button className="btn btn-primary" type="submit"><Plus size={16} /> Create Brand</button>
                        </form>

                        <div>
                            <h3>Existing Brands</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {brands.map(b => (
                                    <div key={b.id} className="card" style={{ padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{b.logo} {b.name}</span>
                                        <button className="btn btn-outline" style={{ color: 'var(--danger)', padding: '0.25rem' }} onClick={() => deleteBrand(b.id)}>
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div>
                        <h3>Map Designer</h3>
                        <p className="text-muted">Select a tool and click on the grid to paint.</p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[
                                { id: 'land', label: 'Land (Green)', color: '#86efac' },
                                { id: 'alt_land', label: 'Alt Land', color: '#fde047' },
                                { id: 'water', label: 'Water', color: '#93c5fd' },
                                { id: 'attraction', label: 'Attraction', color: '#a855f7' }
                            ].map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => setPaintTool(tool.id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: tool.color,
                                        border: paintTool === tool.id ? '2px solid black' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {tool.label}
                                </button>
                            ))}
                        </div>

                        <MapVisualizer
                            interactive={true}
                            onCellClick={handleCellClick}
                            lines={lines} // Show existing lines for context
                            stops={stops}
                        >
                            <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '4px', fontSize: '12px' }}>
                                Mode: Paint ({paintTool})
                            </div>
                        </MapVisualizer>
                    </div>
                )}

                {activeTab === 'stop' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <form onSubmit={handleCreateStop}>
                            <h3>Create New Stop</h3>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Stop Name</label>
                                <input className="input" value={stopForm.name} onChange={e => setStopForm({ ...stopForm, name: e.target.value })} required placeholder="e.g. Central Station" />
                            </div>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Location Area</label>
                                <input className="input" value={stopForm.location} onChange={e => setStopForm({ ...stopForm, location: e.target.value })} required placeholder="e.g. Downtown" />
                            </div>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Coordinates</label>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                                    <input className="input" style={{ width: '80px' }} value={stopForm.x} readOnly placeholder="X" />
                                    <input className="input" style={{ width: '80px' }} value={stopForm.y} readOnly placeholder="Y" />
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Click map to set</span>
                                </div>
                            </div>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Stop Color</label>
                                <input type="color" className="input" style={{ height: '50px' }} value={stopForm.color || '#ff0000'} onChange={e => setStopForm({ ...stopForm, color: e.target.value })} />
                            </div>
                            <button className="btn btn-primary" type="submit"><Plus size={16} /> Create Stop</button>

                            <h3 style={{ marginTop: '2rem' }}>Existing Stops</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {stops.map(s => (
                                    <div key={s.id} className="card" style={{ padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{s.name}</strong>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.location} {(s.x !== undefined) ? `(${s.x},${s.y})` : '(No Map Location)'}</div>
                                        </div>
                                        <button className="btn btn-outline" style={{ color: 'var(--danger)', padding: '0.25rem' }} onClick={() => deleteStop(s.id)}>
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </form>

                        <div>
                            <h4>Place Stop on Map</h4>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Click a grid cell to set the stop location.</p>
                            <MapVisualizer
                                interactive={true}
                                onCellClick={handleCellClick}
                                lines={lines}
                                stops={[...stops, { ...stopForm, id: 'preview', color: stopForm.color || '#ff0000' }]}
                            />
                        </div>
                    </div>
                )}

                {/* Improved Line Creator with Path Drawing */}
                {activeTab === 'line' && (
                    <>
                        <div>
                            <h3>Create New Line</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <form onSubmit={handleCreateLine}>
                                    <div style={{ margin: '1rem 0' }}>
                                        <label>Line Name</label>
                                        <input className="input" value={lineForm.name} onChange={e => setLineForm({ ...lineForm, name: e.target.value })} required placeholder="e.g. Blue Line" />
                                    </div>
                                    <div style={{ margin: '1rem 0' }}>
                                        <label>Color</label>
                                        <input type="color" className="input" style={{ height: '50px' }} value={lineForm.color} onChange={e => setLineForm({ ...lineForm, color: e.target.value })} required />
                                    </div>
                                    <div style={{ margin: '1rem 0' }}>
                                        <label>Operated By</label>
                                        <select className="input" value={lineForm.brandId} onChange={e => setLineForm({ ...lineForm, brandId: e.target.value })} required>
                                            <option value="">Select Brand</option>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.logo} {b.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ margin: '1rem 0' }}>
                                        <label>Connected Stops (Auto-detected)</label>
                                        <div style={{
                                            minHeight: '100px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius)',
                                            padding: '0.5rem',
                                            backgroundColor: 'var(--bg-secondary)'
                                        }}>
                                            {lineForm.stopIds.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {lineForm.stopIds.map(id => {
                                                        const stop = stops.find(s => s.id === id);
                                                        return (
                                                            <div key={id} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                padding: '0.25rem 0.5rem',
                                                                backgroundColor: 'white',
                                                                borderRadius: '4px',
                                                                border: '1px solid #eee'
                                                            }}>
                                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: stop?.color || '#ccc' }}></div>
                                                                <span style={{ fontWeight: 500 }}>{stop?.name || 'Unknown Stop'}</span>
                                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>({stop?.location})</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>
                                                    Draw a path over stops to connect them.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ margin: '1rem 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p><strong>Path Segments:</strong> {drawingPath.length}</p>
                                            <div className="badge" style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: 'var(--bg-card)',
                                                border: '1px solid var(--border-color)',
                                                fontSize: '0.8rem'
                                            }}>
                                                Type: <strong>{(() => {
                                                    if (drawingPath.length < 2) return 'Drawing...';
                                                    const start = drawingPath[0];
                                                    const end = drawingPath[drawingPath.length - 1];
                                                    const isLoop = (Math.abs(start.x - end.x) + Math.abs(start.y - end.y)) <= 1;
                                                    return isLoop ? 'Loop (Circular)' : 'Point-to-Point';
                                                })()}</strong>
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-outline" onClick={() => setDrawingPath([])} style={{ fontSize: '0.8rem' }}>
                                            <Trash size={14} /> Clear Path
                                        </button>
                                    </div>

                                    <button className="btn btn-primary" type="submit"><Plus size={16} /> Create Line</button>
                                </form>

                                <div>
                                    <h4>Draw Path on Map</h4>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Click grid cells in order to draw the track.</p>
                                    <MapVisualizer
                                        interactive={true}
                                        onCellClick={handleCellClick}
                                        lines={[...lines, { ...lineForm, path: drawingPath, id: 'preview' }]}
                                        stops={stops}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3>Existing Lines</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                {lines.map(l => (
                                    <div key={l.id} className="card" style={{ padding: '1rem', borderLeft: `4px solid ${l.color}`, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{l.name}</span>
                                        <button className="btn btn-outline" style={{ color: 'var(--danger)', padding: '0.25rem' }} onClick={() => deleteLine(l.id)}>
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'schedule' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3>Create Flowchart Schedule</h3>
                            <div style={{ margin: '1rem 0' }}>
                                <label>Select Line</label>
                                <select className="input" value={scheduleForm.lineId} onChange={e => {
                                    const lineId = e.target.value;
                                    const line = lines.find(l => l.id === lineId);
                                    if (line) {
                                        // Initialize with NO trip, let user pick start stop
                                        setScheduleForm({
                                            lineId,
                                            trip: [] // Empty start
                                        });
                                    } else {
                                        setScheduleForm({ lineId: '', trip: [] });
                                    }
                                }} required>
                                    <option value="">Select Line</option>
                                    {lines.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
                                </select>
                            </div>

                            {/* Start Trip Section if empty */}
                            {scheduleForm.lineId && scheduleForm.trip.length === 0 && (
                                <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', backgroundColor: '#fafafa', marginBottom: '1rem' }}>
                                    <label>Select Starting Stop</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <select
                                            className="input"
                                            onChange={e => {
                                                const stopId = e.target.value;
                                                const line = lines.find(l => l.id === scheduleForm.lineId);
                                                if (stopId && line) {
                                                    const stopIndex = line.stopIds.indexOf(stopId);
                                                    setScheduleForm({
                                                        ...scheduleForm,
                                                        trip: [{
                                                            stopId,
                                                            arrival: '00:00',
                                                            departure: '00:00',
                                                            stopIndex,
                                                            direction: 1
                                                        }]
                                                    });
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>-- Choose Start --</option>
                                            {(lines.find(l => l.id === scheduleForm.lineId)?.stopIds || []).map(id => {
                                                const s = stops.find(stop => stop.id === id);
                                                return <option key={id} value={id}>{s?.name || 'Unknown Stop'}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {scheduleForm.lineId && scheduleForm.trip.length > 0 && (
                                <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                                    <h4>Schedule Flow</h4>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                                        {scheduleForm.trip?.map((node, idx) => {
                                            const stop = stops.find(s => s.id === node.stopId);
                                            const isLast = idx === scheduleForm.trip.length - 1;
                                            return (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.5rem',
                                                    padding: '0.5rem',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #eee',
                                                    borderRadius: '4px'
                                                }}>
                                                    <div style={{ fontWeight: 'bold', width: '20px' }}>{idx + 1}</div>
                                                    <div style={{ flex: 1 }}>
                                                        <strong>{stop?.name}</strong>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <label style={{ fontSize: '10px' }}>Arr</label>
                                                        <input
                                                            type="time"
                                                            value={node.arrival}
                                                            readOnly={idx === 0} // Start is 00:00 fixed
                                                            onChange={e => {
                                                                const newTrip = [...scheduleForm.trip];
                                                                newTrip[idx].arrival = e.target.value;
                                                                setScheduleForm({ ...scheduleForm, trip: newTrip });
                                                            }}
                                                            style={{ border: '1px solid #ccc', padding: '2px', borderRadius: '3px' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <label style={{ fontSize: '10px' }}>Dep</label>
                                                        <input
                                                            type="time"
                                                            value={node.departure}
                                                            onChange={e => {
                                                                const newTrip = [...scheduleForm.trip];
                                                                newTrip[idx].departure = e.target.value;
                                                                setScheduleForm({ ...scheduleForm, trip: newTrip });
                                                            }}
                                                            style={{ border: '1px solid #ccc', padding: '2px', borderRadius: '3px' }}
                                                        />
                                                    </div>
                                                    {isLast && idx > 0 && (
                                                        <button onClick={() => {
                                                            const newTrip = [...scheduleForm.trip];
                                                            newTrip.pop();
                                                            setScheduleForm({ ...scheduleForm, trip: newTrip });
                                                        }} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                                                            <Trash size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {(() => {
                                        if (!scheduleForm.trip || scheduleForm.trip.length === 0) return null;

                                        // "Manual Control" UI
                                        // User can add ANY stop from the line as the next step
                                        const line = lines.find(l => l.id === scheduleForm.lineId);
                                        const availableStops = (line && line.stopIds) ? stops.filter(s => line.stopIds.includes(s.id)) : [];

                                        // Default to the first stop if not set? No, let them pick.
                                        // We'll use a local state for the "Next Stop" selection helper?
                                        // Or just a simple uncontrolled select with a ref or state.
                                        // Since we are in a tight loop here, let's use a small inline form controlled by scheduleForm meta? 
                                        // Actually, let's just use a simple state or derived value.
                                        // To avoid complex state, we'll just render a Select that defaults to "Select Stop..." and an Add button.
                                        // We need state for the "selected next stop".
                                        // Limitation: We don't have a separate state variable for "nextStopSelection".
                                        // We can add one or use a "nextStopId" field in scheduleForm temporarily?
                                        // Cleaner: Add a <NextStopSelector> component or just add 'nextStopId' to scheduleForm state.

                                        return (
                                            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <select
                                                        className="input"
                                                        style={{ width: 'auto', flex: 1 }}
                                                        value={scheduleForm.nextStopId || ''}
                                                        onChange={e => setScheduleForm({ ...scheduleForm, nextStopId: e.target.value })}
                                                    >
                                                        <option value="">-- Select Next Stop --</option>
                                                        {availableStops.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn btn-primary"
                                                        disabled={!scheduleForm.nextStopId}
                                                        onClick={() => {
                                                            const nextStopId = scheduleForm.nextStopId;
                                                            if (!nextStopId) return;

                                                            const lastNode = scheduleForm.trip[scheduleForm.trip.length - 1];
                                                            const lastTime = lastNode.departure;

                                                            // Calculate metadata for simulator (best guess)
                                                            // We find the index of this stop in the line definition
                                                            const stopIndex = line.stopIds.indexOf(nextStopId);
                                                            // Determine direction relative to previous? 
                                                            // If manual, direction might be irrelevant or inferred.
                                                            // Simulator just needs start/end coords.
                                                            // But for "loop" logic, index helps.
                                                            // We'll just save the index.

                                                            setScheduleForm({
                                                                ...scheduleForm,
                                                                nextStopId: '', // Reset selector
                                                                trip: [...scheduleForm.trip, {
                                                                    stopId: nextStopId,
                                                                    arrival: lastTime, // User edits
                                                                    departure: lastTime,
                                                                    stopIndex: stopIndex,
                                                                    direction: 1 // Default to 1, simulator handles interpolation anyway
                                                                }]
                                                            });
                                                        }}
                                                    >
                                                        <Plus size={14} /> Add Leg
                                                    </button>
                                                </div>

                                                <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleCreateSchedule}>
                                                    Save Full Schedule
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3>Existing Schedules</h3>
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {schedules.map(s => {
                                    const line = lines.find(l => l.id === s.lineId);
                                    return (
                                        <div key={s.id} className="card" style={{ padding: '1rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{line?.name || 'Unknown Line'}</strong>
                                                <button className="btn btn-outline" style={{ color: 'var(--danger)', padding: '0.25rem' }} onClick={() => deleteSchedule(s.id)}>
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {s.trip ? (
                                                    <span>Flowchart: {s.trip.length} Legs ({s.trip[0].departure} - {s.trip[s.trip.length - 1].arrival})</span>
                                                ) : (
                                                    <span>Legacy: {s.departures.length} Departures</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
