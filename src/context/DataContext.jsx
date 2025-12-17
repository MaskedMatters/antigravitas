import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

const API_URL = 'http://localhost:3001/api';

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        brands: [],
        stops: [],
        lines: [],
        schedules: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load data from API on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/data`);
            if (!response.ok) throw new Error('Failed to load data');
            const jsonData = await response.json();
            setData({
                brands: jsonData.brands || [],
                stops: jsonData.stops || [],
                lines: jsonData.lines || [],
                schedules: jsonData.schedules || []
            });
            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveData = async (newData) => {
        try {
            const response = await fetch(`${API_URL}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (!response.ok) throw new Error('Failed to save data');
            return true;
        } catch (err) {
            console.error('Error saving data:', err);
            setError(err.message);
            return false;
        }
    };

    // CRUD Operations
    const addBrand = async (brand) => {
        const newData = { ...data, brands: [...data.brands, brand] };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const addStop = async (stop) => {
        const newData = { ...data, stops: [...data.stops, stop] };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const addLine = async (line) => {
        const newData = { ...data, lines: [...data.lines, line] };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const addSchedule = async (schedule) => {
        const newData = { ...data, schedules: [...data.schedules, schedule] };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const deleteBrand = async (id) => {
        const newData = { ...data, brands: data.brands.filter(b => b.id !== id) };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const deleteStop = async (id) => {
        const newData = { ...data, stops: data.stops.filter(s => s.id !== id) };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const deleteLine = async (id) => {
        const newData = { ...data, lines: data.lines.filter(l => l.id !== id) };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    const deleteSchedule = async (id) => {
        const newData = { ...data, schedules: data.schedules.filter(s => s.id !== id) };
        if (await saveData(newData)) {
            setData(newData);
        }
    };

    // Helper functions
    const getBrand = (id) => data.brands.find(b => b.id === id);
    const getStop = (id) => data.stops.find(s => s.id === id);
    const getLine = (id) => data.lines.find(l => l.id === id);
    const getLineSchedule = (lineId) => data.schedules.find(s => s.lineId === lineId) || { departures: [], trip: [] };

    return (
        <DataContext.Provider value={{
            ...data,
            loading,
            error,
            addBrand,
            addStop,
            addLine,
            addSchedule,
            deleteBrand,
            deleteStop,
            deleteLine,
            deleteSchedule,
            getBrand,
            getStop,
            getLine,
            getLineSchedule,
            reload: loadData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
