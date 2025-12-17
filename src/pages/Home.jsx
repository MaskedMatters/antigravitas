import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import LineCard from '../components/LineCard';
import MapVisualizer from '../components/MapVisualizer';
import TrainSimulator from '../components/TrainSimulator';
import { Search, Map as MapIcon } from 'lucide-react';

const Home = () => {
    const { lines, stops, loading, error } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Show loading state
    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
                <h2>Loading train data...</h2>
                <p style={{ color: 'var(--text-muted)' }}>Connecting to database...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--danger)' }}>Error Loading Data</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                    Make sure the backend server is running on port 3001
                </p>
            </div>
        );
    }

    const filteredLines = lines.filter(line =>
        line.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedLines = user?.role !== 'admin' && searchTerm === '' && user?.savedLineIds?.length > 0
        ? [...lines.filter(l => user.savedLineIds.includes(l.id)), ...lines.filter(l => !user.savedLineIds.includes(l.id))]
        : filteredLines;

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            <header style={{
                padding: '3rem 0',
                textAlign: 'center',
                background: 'linear-gradient(to bottom, white, var(--bg-secondary))',
                marginBottom: '2rem',
                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Find Your <span style={{ color: 'var(--primary)' }}>Next Train</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                    Real-time schedules and route information at your fingertips.
                </p>

                <div style={{ maxWidth: '500px', margin: '2rem auto 0', position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search for a line (e.g. Red Express)..."
                        className="input"
                        style={{ paddingLeft: '3rem', fontSize: '1.125rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* Live Map Section */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapIcon /> Live Network Map
                </h2>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', padding: '1rem', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
                        <MapVisualizer lines={lines} stops={stops}>
                            <TrainSimulator />
                        </MapVisualizer>
                    </div>
                </div>
            </div>

            {user?.savedLineIds?.length > 0 && !searchTerm && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapIcon size={20} /> Saved Routes
                    </h2>
                    {displayedLines.filter(l => user.savedLineIds.includes(l.id)).map(line => (
                        <LineCard key={line.id} line={line} />
                    ))}
                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>All Routes</h2>
                </div>
            )}

            <div>
                {displayedLines.filter(l => !user?.savedLineIds?.includes(l.id)).length > 0 ? (
                    displayedLines.filter(l => !user?.savedLineIds?.includes(l.id)).map(line => (
                        <LineCard key={line.id} line={line} />
                    ))
                ) : (
                    <div className="flex-center" style={{ flexDirection: 'column', height: '200px', color: 'var(--text-muted)' }}>
                        <p>No train lines found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
