import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            background: 'white',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" className="flex-center" style={{ gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    <div style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex'
                    }}>
                        <Train size={24} />
                    </div>
                    <span>Antigravitas</span>
                </Link>

                <div className="flex-center" style={{ gap: '1rem' }}>
                    {user ? (
                        <>
                            <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
                                {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                                <span>{user.name}</span>
                            </div>

                            {user.role === 'admin' && (
                                <Link to="/admin" className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                                    Dashboard
                                </Link>
                            )}

                            <button onClick={handleLogout} className="btn btn-outline" style={{ border: 'none', color: 'var(--danger)' }}>
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
