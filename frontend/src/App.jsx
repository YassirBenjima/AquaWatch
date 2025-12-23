import React, { useState } from 'react';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
import { LayoutDashboard, Map as MapIcon, Bell } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="relative w-full h-screen bg-bg-darker text-text-primary overflow-hidden">
            {/* Header / Nav (Floating) */}
            <nav className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center px-6 py-4 glass-panel">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        Aqua<span className="text-gradient">Watch</span>
                    </h1>
                </div>

                <div className="flex gap-4">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Bell className="w-6 h-6 text-accent" />
                    </button>
                </div>
            </nav>

            {/* Main Content (Map as background, Dashboard as overlay) */}
            <main className="absolute inset-0 z-0">
                <Map />
            </main>

            {/* Floating Dashboard Panel */}
            <aside className="absolute top-24 left-4 bottom-8 w-96 z-40 glass-panel p-6 overflow-y-auto transition-transform duration-300 transform">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        Live Monitor
                    </h2>
                    <span className="text-xs text-secondary bg-white/5 px-2 py-1 rounded-full border border-white/10">
                        ● Live
                    </span>
                </div>

                <Dashboard />
            </aside>
        </div>
    );
}

export default App;
