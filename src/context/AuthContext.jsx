import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user from local storage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('trainAppUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (role, name) => {
        const newUser = {
            name,
            role,
            savedLineIds: [] // For saving routes
        };
        setUser(newUser);
        localStorage.setItem('trainAppUser', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('trainAppUser');
    };

    const toggleSaveLine = (lineId) => {
        if (!user) return;

        let newSaved = [...(user.savedLineIds || [])];
        if (newSaved.includes(lineId)) {
            newSaved = newSaved.filter(id => id !== lineId);
        } else {
            newSaved.push(lineId);
        }

        const updatedUser = { ...user, savedLineIds: newSaved };
        setUser(updatedUser);
        localStorage.setItem('trainAppUser', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, toggleSaveLine }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
