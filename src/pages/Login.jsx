import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');

    const handleLogin = (role) => {
        if (!name.trim()) return;
        login(role, name);
        navigate(role === 'admin' ? '/admin' : '/');
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh', background: 'var(--bg-secondary)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Aboard</h2>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Your Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => handleLogin('user')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.75rem' }}
                        disabled={!name.trim()}
                    >
                        <User size={18} style={{ marginRight: '0.5rem' }} />
                        Continue as User
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ height: '1px', background: 'var(--border-color)', flex: 1 }}></div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>OR</span>
                        <div style={{ height: '1px', background: 'var(--border-color)', flex: 1 }}></div>
                    </div>

                    <button
                        onClick={() => handleLogin('admin')}
                        className="btn btn-outline"
                        style={{ width: '100%', padding: '0.75rem' }}
                        disabled={!name.trim()}
                    >
                        <ShieldCheck size={18} style={{ marginRight: '0.5rem' }} />
                        Admin Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
