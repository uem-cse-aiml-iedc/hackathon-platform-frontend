import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Hackathons from './pages/Hackathons';
import CreateHackathon from './pages/CreateHackathon';
import EditHackathon from './pages/EditHackathon';
import Profile from './pages/Profile';
import OrganizerDashboard from './pages/OrganizerDashboard';
import HackathonRegistration from './pages/HackathonRegistration';
import TeamManagement from './pages/TeamManagement';
import Volunteer from './pages/Volunteer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/hackathons" element={<Hackathons />} />
                  <Route path="/volunteer" element={<Volunteer />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-hackathon"
                    element={
                      <ProtectedRoute>
                        <CreateHackathon />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-hackathon/:hackathonId"
                    element={
                      <ProtectedRoute>
                        <EditHackathon />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/organizer-dashboard"
                    element={
                      <ProtectedRoute>
                        <OrganizerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/register/:hackathonId"
                    element={
                      <ProtectedRoute>
                        <HackathonRegistration />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team/:hackathonId"
                    element={
                      <ProtectedRoute>
                        <TeamManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;