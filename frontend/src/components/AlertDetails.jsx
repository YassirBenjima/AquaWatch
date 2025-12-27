import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, AlertTriangle, Activity, BrainCircuit, Thermometer, Droplets, Zap } from 'lucide-react';

const AlertDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlert = async () => {
            try {
                // In a real app, you might fetch a single alert by ID. 
                // Since the API returns all alerts, we filter here for simplicity 
                // or assume the endpoint /api/alerts/:id exists. 
                // Based on previous files, we only saw /api/alerts returning all.
                // We will fetch all and find the one.
                const res = await axios.get('http://localhost:3005/api/alerts');
                const found = res.data.find(a => a.id.toString() === id);
                setAlert(found);
            } catch (err) {
                console.error("Error fetching alert details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlert();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-secondary">Loading details...</div>;
    if (!alert) return <div className="p-8 text-center text-red-400">Alert not found.</div>;

    const getSeverityColor = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'CRITICAL': return 'red';
            case 'WARNING': return 'yellow';
            default: return 'blue';
        }
    };

    const color = getSeverityColor(alert.severity);

    return (
        <div className="h-screen bg-bg-darker text-text-primary p-6 md:p-12 relative overflow-y-auto">
            {/* Background Effects */}
            <div className={`fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-${color}-500/10 blur-[120px] pointer-events-none`} />

            <div className="max-w-4xl mx-auto relative z-10 w-full">
                <Link to="/" className="inline-flex items-center gap-2 text-secondary hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </Link>

                <div className="glass-panel p-8 md:p-12 border-t-4" style={{ borderColor: color === 'red' ? '#ef4444' : color === 'yellow' ? '#eab308' : '#3b82f6' }}>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Icon Box */}
                        <div className={`p-6 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 shrink-0`}>
                            <AlertTriangle className={`w-12 h-12 text-${color}-500`} />
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
                                        {alert.severity} Severity
                                    </span>
                                    <span className="text-secondary text-sm">
                                        ID: #{alert.id}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                                    {alert.message}
                                </h1>
                                <p className="text-secondary">
                                    Detected at {new Date(alert.timestamp).toLocaleString()}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-secondary mb-1">Measured Value</p>
                                    <p className="text-2xl font-mono font-bold text-text-primary">
                                        {alert.value}
                                        <span className="text-sm font-normal text-secondary ml-1">
                                            {alert.type === 'TURBIDITY' ? 'NTU' : alert.type === 'PH' ? 'pH' : ''}
                                        </span>
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-secondary mb-1">Threshold</p>
                                    <p className="text-xl font-mono text-secondary">
                                        {alert.threshold}
                                    </p>
                                </div>
                            </div>

                            {/* AI Recommendation Section */}
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-6 md:p-8">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <BrainCircuit className="w-24 h-24" />
                                </div>

                                <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5" />
                                    AI Technician Recommendation
                                </h3>

                                <div className="text-lg md:text-xl text-white font-medium leading-relaxed italic">
                                    "{alert.recommendation || "No specific recommendation available."}"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertDetails;
