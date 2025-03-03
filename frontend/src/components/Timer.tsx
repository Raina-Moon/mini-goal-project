import React, { useState, useEffect } from 'react';

const Timer: React.FC<{ duration: number; onSuccess: () => void }> = ({ duration, onSuccess }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isActive && isVisible && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            onSuccess();
            resetTimer();
        }

        return () => clearTimeout(timer);
    }, [isActive, isVisible, timeLeft, onSuccess]);

    const startTimer = () => {
        setIsActive(true);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold">{timeLeft} seconds left</h2>
            <button onClick={startTimer} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Start Timer
            </button>
            <button onClick={resetTimer} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
                Reset Timer
            </button>
        </div>
    );
};

export default Timer;