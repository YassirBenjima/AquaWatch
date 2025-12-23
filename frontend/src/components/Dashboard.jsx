import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, Droplets, Thermometer, Zap } from 'lucide-react';

const MOCK_DATA = [
    { time: '08:00', pH: 7.1, turbidity: 4 },
    { time: '09:00', pH: 7.2, turbidity: 3 },
    { time: '10:00', pH: 7.0, turbidity: 5 },
    { time: '11:00', pH: 6.9, turbidity: 8 },
    { time: '12:00', pH: 7.3, turbidity: 4 },
    { time: '13:00', pH: 7.4, turbidity: 3 },
    { time: '14:00', pH: 7.2, turbidity: 4 },
];

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
    return (
        <div className="flex flex-col gap-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4">
                <StatCard icon={Droplets} label="Avg pH Level" value="7.2" unit="pH" color="#00f2fe" />
                <StatCard icon={Thermometer} label="Water Temp" value="22.5" unit="°C" color="#ffbf00" />
                <StatCard icon={Zap} label="Turbidity" value="4.1" unit="NTU" color="#ff0055" />
            </div>

            {/* Charts */}
            <div className="glass-panel p-4">
                <h3 className="text-sm font-semibold mb-4 text-secondary">Water Quality Trends</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_DATA}>
                            <defs>
                                <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="pH" stroke="#00f2fe" fillOpacity={1} fill="url(#colorPh)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alerts List */}
            <div className="glass-panel p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-secondary">Recent Alerts</h3>
                    <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">3 New</span>
                </div>

                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-accent/30 transition-colors cursor-pointer">
                            <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-white">High Turbidity Detected</p>
                                <p className="text-xs text-secondary mt-1">Sensor #00{i} • 14:3{i} PM</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
