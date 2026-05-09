import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Investigations from '@/pages/Investigations';
import CaseWorkspace from '@/pages/CaseWorkspace';
import KnowledgeGraph from '@/pages/KnowledgeGraph';
import TimelineView from '@/pages/TimelineView';
import GPSReconstruction from '@/pages/GPSReconstruction';
import Contradictions from '@/pages/Contradictions';
import ScenarioSimulation from '@/pages/ScenarioSimulation';
import WitnessLogs from '@/pages/WitnessLogs';
import AIInvestigator from '@/pages/AIInvestigator';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { useAuth } from '@/hooks/useAuth';
import { TooltipProvider } from '@/components/ui/tooltip';
import MainLayout from '@/components/layout/MainLayout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-black text-primary font-mono animate-pulse">INITIATING SECURE ACCESS...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <TooltipProvider>
        <div className="min-h-screen bg-black text-foreground relative overflow-hidden">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>
            } />
            
            <Route path="/investigations" element={
              <PrivateRoute><MainLayout><Investigations /></MainLayout></PrivateRoute>
            } />

            <Route path="/investigation/:id" element={
              <PrivateRoute><MainLayout><CaseWorkspace /></MainLayout></PrivateRoute>
            } />

            <Route path="/graph" element={
              <PrivateRoute><MainLayout><KnowledgeGraph /></MainLayout></PrivateRoute>
            } />

            <Route path="/timeline" element={
              <PrivateRoute><MainLayout><TimelineView /></MainLayout></PrivateRoute>
            } />

            <Route path="/gps/:id" element={
              <PrivateRoute><MainLayout><GPSReconstruction /></MainLayout></PrivateRoute>
            } />
            <Route path="/gps/active" element={
              <PrivateRoute><MainLayout><GPSReconstruction /></MainLayout></PrivateRoute>
            } />

            <Route path="/contradictions" element={
              <PrivateRoute><MainLayout><Contradictions /></MainLayout></PrivateRoute>
            } />

            <Route path="/simulation/:id" element={
              <PrivateRoute><MainLayout><ScenarioSimulation /></MainLayout></PrivateRoute>
            } />
            <Route path="/simulation/active" element={
              <PrivateRoute><MainLayout><ScenarioSimulation /></MainLayout></PrivateRoute>
            } />

            <Route path="/witness" element={
              <PrivateRoute><MainLayout><WitnessLogs /></MainLayout></PrivateRoute>
            } />

            <Route path="/ai-investigator" element={
              <PrivateRoute><MainLayout><AIInvestigator /></MainLayout></PrivateRoute>
            } />

            <Route path="/reports" element={
              <PrivateRoute><MainLayout><Reports /></MainLayout></PrivateRoute>
            } />

            <Route path="/settings" element={
              <PrivateRoute><MainLayout><Settings /></MainLayout></PrivateRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </TooltipProvider>
    </Router>
  );
}

