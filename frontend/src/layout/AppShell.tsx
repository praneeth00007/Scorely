import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import GuidedTour from '../dashboard/components/GuidedTour';

const AppShell = () => {
    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        const tourCompleted = localStorage.getItem('tour_done');
        if (!tourCompleted) {
            setRunTour(true);
        }
    }, []);

    const handleTourFinish = () => {
        localStorage.setItem('tour_done', 'true');
        setRunTour(false);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[var(--accent)] selection:text-white transition-colors duration-300">
            <Navbar />

            <GuidedTour
                run={runTour}
                onFinish={handleTourFinish}
            />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 relative overflow-y-auto h-screen scrollbar-hide bg-[var(--background)]">
                {/* Background Ambient */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[var(--accent)]/5 blur-[200px] rounded-full" />
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-900/[0.02] blur-[150px] rounded-full" />
                </div>

                <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppShell;
