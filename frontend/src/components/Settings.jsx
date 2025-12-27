import React, { useState, useEffect, useRef } from 'react';
import { getUser, updateSettings } from '../services/api';
import { Bell, BellOff, LogOut, Settings as SettingsIcon, User, ChevronDown } from 'lucide-react';

const Settings = ({ email, onLogout }) => {
    const [enabled, setEnabled] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const user = await getUser(email);
                setEnabled(user.notifications_enabled);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [email]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = async () => {
        const newState = !enabled;
        setEnabled(newState);
        try {
            await updateSettings(email, newState);
        } catch (err) {
            console.error(err);
            setEnabled(!newState); // Revert on error
        }
    };

    if (loading) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                    {email[0].toUpperCase()}
                </div>
                <ChevronDown className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 glass-panel p-2 animate-fade-in origin-top-right z-50">
                    <div className="p-3 border-b border-white/5 mb-2">
                        <p className="text-sm font-medium text-white truncate">{email}</p>
                        <p className="text-xs text-secondary mt-0.5">User Account</p>
                    </div>

                    <div className="px-2 py-1 space-y-1">
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${enabled ? 'bg-primary/10 text-primary' : 'bg-white/5 text-secondary'}`}>
                                    {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-white">Notifications</p>
                                    <p className="text-xs text-secondary">Receive email alerts</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle}
                                className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-white/5 mt-2 pt-2 px-2 pb-1">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
