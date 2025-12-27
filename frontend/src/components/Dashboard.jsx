import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, Droplets, Thermometer, Zap, BrainCircuit, Trees } from 'lucide-react';

const API_URL = 'http://localhost:3001/api/history';
const FORECAST_URL = 'http://localhost:3001/api/forecast';

const StatCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="glass-panel p-4 flex items-center justify-between mb-4 hover:bg-white/5 transition-colors">
        <div>
            <p className="text-secondary text-sm">{label}</p>
            <p className="text-2xl font-bold mt-1 text-primary">{value} <span className="text-sm text-secondary font-normal">{unit}</span></p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>
            <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [forecast, setForecast] = useState({ convlstm: null, random_forest: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch History
                const historyRes = await axios.get(API_URL);
                const formattedData = historyRes.data.map(d => ({
                    ...d,
                    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    pH: d.ph,
                    turbidity: d.turbidity
                }));
                setData(formattedData);

                // Fetch Forecast
                const forecastRes = await axios.get(FORECAST_URL);
                if (forecastRes.data) {
                    setForecast({
                        convlstm: forecastRes.data.convlstm || null,
                        random_forest: forecastRes.data.random_forest || null
                    });
                }

                // Fetch Alerts
                const alertsRes = await axios.get('http://localhost:3005/api/alerts');
                setAlerts(alertsRes.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    // ... (render) ...

    return (
        <div className="flex flex-col gap-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    icon={Droplets}
                    label="Avg pH Level"
                    value={data.length > 0 ? (data.reduce((acc, curr) => acc + curr.pH, 0) / data.length).toFixed(2) : '--'}
                    unit="pH"
                    color="#00f2fe"
                />
                <StatCard
                    icon={Zap}
                    label="Turbidity"
                    value={data.length > 0 ? data[data.length - 1].turbidity.toFixed(1) : '--'}
                    unit="NTU"
                    color="#ff0055"
                />
            </div>

            {/* AI Forecast Section */}
            {(forecast.convlstm || forecast.random_forest) && (
                <div className="glass-panel p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-secondary flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-purple-400" />
                            AI Forecast (Next Hour)
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <p className="text-xs text-purple-300 mb-1">ConvLSTM Model</p>
                            <p className="text-xl font-bold text-text-primary">
                                {forecast.convlstm ? forecast.convlstm.toFixed(2) : '--'}
                                <span className="text-xs font-normal text-secondary ml-1">pH</span>
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                            <p className="text-xs text-pink-300 mb-1">Random Forest</p>
                            <p className="text-xl font-bold text-text-primary">
                                {forecast.random_forest ? forecast.random_forest.toFixed(2) : '--'}
                                <span className="text-xs font-normal text-secondary ml-1">pH</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Trends Chart */}
            <div className="glass-panel p-4 flex-1 min-h-[250px]">
                <h3 className="text-sm font-semibold text-secondary mb-4">Water Quality Trends</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="pH" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorPh)" />
                        <Line type="monotone" dataKey="turbidity" stroke="#ff0055" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>


            {/* Alerts List */}
            <div className="glass-panel p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-secondary">Recent Alerts</h3>
                    <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{alerts.length} New</span>
                </div>

                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <Link to={`/alert/${alert.id}`} key={alert.id} className="block group relative">
                            {/* Hover Tooltip for AI Recommendation */}
                            {alert.recommendation && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-blue-900/95 border border-blue-500/30 rounded-lg shadow-xl backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BrainCircuit className="w-3 h-3 text-blue-400" />
                                        <span className="text-xs font-bold text-blue-200 uppercase">AI Recommendation</span>
                                    </div>
                                    <p className="text-xs text-white leading-relaxed">
                                        "{alert.recommendation}"
                                    </p>
                                    {/* Arrow */}
                                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-900/95 border-r border-b border-blue-500/30 transform rotate-45" />
                                </div>
                            )}

                            <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5 group-hover:border-accent/50 group-hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{alert.message || `High ${alert.alert_type} Detected`}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-secondary">
                                                Value: {alert.value} • {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {alerts.length === 0 && (
                        <p className="text-sm text-secondary text-center py-4">No recent alerts</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
