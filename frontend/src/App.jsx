import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Settings from './components/Settings';
import News from './components/News';
import AlertDetails from './components/AlertDetails';
import { LayoutDashboard, Map as MapIcon } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';


const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const LoginRoute = ({ children }) => {
    const { user } = useAuth();
    if (user) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="relative w-full h-screen bg-bg-darker text-text-primary overflow-hidden transition-colors duration-300">
            {/* Header / Nav (Floating) */}
            <nav className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center px-6 py-4 glass-panel">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        Aqua<span className="text-gradient">Watch</span>
                    </h1>
                </div>

                <div className="flex gap-4 items-center">
                    <ThemeToggle />
                    <Link
                        to="/news"
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
                    >
                        Water News
                    </Link>
                    <Settings email={user} onLogout={logout} />
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
};

const PageTitle = () => {
    const location = useLocation();

    useEffect(() => {
        const titles = {
            '/': 'Dashboard',
            '/login': 'Login',
            '/register': 'Register',
            '/news': 'Water News'
        };
        const title = titles[location.pathname] || 'Monitor';
        document.title = `AquaWatch | ${title}`;
    }, [location]);

    return null;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <PageTitle />
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <LoginRoute>
                                    <LoginWithContext />
                                </LoginRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <LoginRoute>
                                    <Register />
                                </LoginRoute>
                            }
                        />
                        <Route
                            path="/news"
                            element={
                                <ProtectedRoute>
                                    <News />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/alert/:id"
                            element={
                                <ProtectedRoute>
                                    <AlertDetails />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

// Wrapper to pass login function to Login component
const LoginWithContext = () => {
    const { login } = useAuth();
    return <Login onLogin={login} />;
};

export default App;
