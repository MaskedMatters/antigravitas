import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Clock, MapPin, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from 'lucide-react';

const LineCard = ({ line }) => {
    const { user, toggleSaveLine } = useAuth();
    const { getBrand, getStop, getLineSchedule } = useData();
    const [expanded, setExpanded] = useState(false);

    const brand = getBrand(line.brandId);
    const schedule = getLineSchedule(line.id);
    const firstStop = getStop(line.stopIds[0]);
    const lastStop = getStop(line.stopIds[line.stopIds.length - 1]);

    const isSaved = user?.savedLineIds?.includes(line.id);

    return (
        <div className="card" style={{ marginBottom: '1rem', borderLeft: `6px solid ${line.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{brand?.logo}</span>
                        <span style={{
                            backgroundColor: `${line.color}20`,
                            color: line.color,
                            padding: '0.125rem 0.5rem',
                            borderRadius: '99px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                        }}>
                            {brand?.name}
                        </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', margin: '0.25rem 0' }}>{line.name}</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <div className="flex-center" style={{ gap: '0.25rem' }}>
                            <MapPin size={14} />
                            <span>{firstStop?.name}</span>
                        </div>
                        <span>→</span>
                        <div className="flex-center" style={{ gap: '0.25rem' }}>
                            <MapPin size={14} />
                            <span>{lastStop?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-center" style={{ gap: '0.5rem' }}>
                    {user && (
                        <button
                            onClick={() => toggleSaveLine(line.id)}
                            className="btn"
                            style={{ padding: '0.5rem', color: isSaved ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                            {isSaved ? <BookmarkCheck /> : <Bookmark />}
                        </button>
                    )}

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem' }}
                    >
                        {expanded ? <ChevronUp /> : <ChevronDown />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Stops</h4>
                            <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '0.25rem',
                                    top: '0.5rem',
                                    bottom: '0.5rem',
                                    width: '2px',
                                    background: 'var(--border-color)'
                                }} />
                                {line.stopIds.map((stopId) => {
                                    const stop = getStop(stopId);
                                    return (
                                        <div key={stopId} style={{ marginBottom: '0.5rem', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: '-1.05rem',
                                                top: '0.35rem',
                                                width: '0.6rem',
                                                height: '0.6rem',
                                                borderRadius: '50%',
                                                background: 'white',
                                                border: `2px solid ${line.color}`
                                            }} />
                                            {stop?.name}
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({stop?.location})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Schedule</h4>
                            {schedule.trip && schedule.trip.length > 0 ? (
                                // New trip-based schedule format - show as timeline
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {schedule.trip.map((leg, idx) => {
                                        const stop = getStop(leg.stopId);
                                        const isFirst = idx === 0;
                                        const isLast = idx === schedule.trip.length - 1;

                                        return (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                paddingLeft: '1rem',
                                                position: 'relative'
                                            }}>
                                                {/* Timeline dot */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '0',
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: line.color,
                                                    border: '2px solid white',
                                                    boxShadow: '0 0 0 1px ' + line.color
                                                }} />

                                                {/* Stop name */}
                                                <div style={{
                                                    fontWeight: 500,
                                                    minWidth: '120px',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {stop?.name || 'Unknown Stop'}
                                                </div>

                                                {/* Times */}
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    {!isFirst && (
                                                        <div className="flex-center" style={{ gap: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Arr</span>
                                                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leg.arrival}</span>
                                                        </div>
                                                    )}
                                                    {!isLast && (
                                                        <div className="flex-center" style={{ gap: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Dep</span>
                                                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leg.departure}</span>
                                                        </div>
                                                    )}
                                                    {isFirst && (
                                                        <div className="flex-center" style={{ gap: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Start</span>
                                                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leg.departure}</span>
                                                        </div>
                                                    )}
                                                    {isLast && (
                                                        <div className="flex-center" style={{ gap: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>End</span>
                                                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leg.arrival}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : schedule.departures && schedule.departures.length > 0 ? (
                                // Legacy departures format
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Departure times:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {schedule.departures.map((time, idx) => (
                                            <div key={idx} className="flex-center" style={{
                                                background: 'var(--bg-secondary)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.875rem',
                                                gap: '0.25rem'
                                            }}>
                                                <Clock size={12} />
                                                {time}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <span style={{ color: 'var(--text-muted)' }}>No scheduled departures.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineCard;
