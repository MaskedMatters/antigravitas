import React, { createContext, useContext, useState, useEffect } from 'react';

const MapContext = createContext();

const API_URL = 'http://localhost:3001/api';

export const MapProvider = ({ children }) => {
    const [grid, setGrid] = useState(
        Array(20).fill(null).map(() =>
            Array(20).fill(null).map(() => ({ type: 'land', color: '#86efac', meta: null }))
        )
    );
    const [loading, setLoading] = useState(true);

    // Load grid from API
    useEffect(() => {
        loadGrid();
    }, []);

    const loadGrid = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/data`);
            if (!response.ok) throw new Error('Failed to load grid');
            const data = await response.json();
            if (data.mapGrid && Array.isArray(data.mapGrid)) {
                // Convert null values to proper cell objects
                const processedGrid = data.mapGrid.map(row =>
                    row.map(cell => cell || { type: 'land', color: '#86efac', meta: null })
                );
                setGrid(processedGrid);
            }
        } catch (err) {
            console.error('Error loading grid:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveGrid = async (newGrid) => {
        try {
            // Get current data first
            const response = await fetch(`${API_URL}/data`);
            if (!response.ok) throw new Error('Failed to load data');
            const currentData = await response.json();

            // Update with new grid
            const updatedData = { ...currentData, mapGrid: newGrid };

            const saveResponse = await fetch(`${API_URL}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!saveResponse.ok) throw new Error('Failed to save grid');
        } catch (err) {
            console.error('Error saving grid:', err);
        }
    };

    const updateCell = async (x, y, value) => {
        const newGrid = grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => (rowIdx === y && colIdx === x ? value : cell))
        );
        setGrid(newGrid);
        await saveGrid(newGrid);
    };

    return (
        <MapContext.Provider value={{ grid, updateCell, loading, gridSize: 20 }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};
