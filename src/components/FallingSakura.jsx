import React, { useEffect, useState } from 'react';

const FallingSakura = ({ active = true }) => {
    const [petals, setPetals] = useState([]);

    useEffect(() => {
        if (!active) {
            setPetals([]);
            return;
        }

        const petalCount = 30; // Number of petals
        const newPetals = [];

        for (let i = 0; i < petalCount; i++) {
            newPetals.push({
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
                opacity: 0.3 + Math.random() * 0.7,
                width: `${10 + Math.random() * 10}px`,
                height: `${10 + Math.random() * 10}px`,
            });
        }
        setPetals(newPetals);
    }, [active]);

    if (!active) return null;

    return (
        <div className="sakura-container fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {petals.map((style, i) => (
                <div
                    key={i}
                    className="sakura absolute bg-pink-300 rounded-tl-xl rounded-br-xl"
                    style={style}
                />
            ))}
        </div>
    );
};

export default FallingSakura;
