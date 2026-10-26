import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GoalsPage from './pages/GoalsPage';
import GoalDetailsPage from './pages/GoalDetailsPage';
import SessionsPage from './pages/SessionsPage';
import RevisionPage from './pages/RevisionPage';
import ReportsPage from './pages/ReportsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import GoalModal from './components/GoalModal';
import SessionModal from './components/SessionModal';
import api from './api/client';

export function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Goal Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Session Modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [preselectedGoalId, setPreselectedGoalId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="w-10 h-10 border-4 border-botanical border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Goal Modal Handlers
  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (goalData) => {
    if (editingGoal) {
      await api.put(`/goals/${editingGoal._id}`, goalData);
    } else {
      await api.post('/goals', goalData);
    }
  };

  // Session Modal Handlers
  const handleOpenLogSession = (goal = null) => {
    setEditingSession(null);
    setPreselectedGoalId(goal ? goal._id : null);
    setIsSessionModalOpen(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setPreselectedGoalId(session.goalId?._id || session.goalId || null);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = async (sessionData) => {
    if (editingSession) {
      await api.put(`/sessions/${editingSession._id}`, sessionData);
    } else {
      await api.post('/sessions', sessionData);
    }
  };

  const handleOpenRevisionSession = (revisionItem) => {
    setEditingSession({
      topicStudied: `Revision: ${revisionItem.topicStudied}`,
      goalId: revisionItem.goalId?._id || revisionItem.goalId,
      durationMinutes: 30,
      understandingRating: 3,
      notes: `Revisiting earlier doubts on: ${revisionItem.notes || revisionItem.topicStudied}`
    });
    setPreselectedGoalId(revisionItem.goalId?._id || revisionItem.goalId || null);
    setIsSessionModalOpen(true);
  };

  const handleSelectGoal = (goal) => {
    setSelectedGoalId(goal._id);
    setActiveTab('goal-details');
  };

  return (
    <div className="min-h-screen bg-parchment text-forest flex flex-col">
      <Navbar
        activeTab={activeTab === 'goal-details' ? 'goals' : activeTab}
        setActiveTab={(tab) => {
          setSelectedGoalId(null);
          setActiveTab(tab);
        }}
        onOpenNewGoalModal={handleOpenNewGoal}
        onOpenLogSessionModal={() => handleOpenLogSession(null)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToGoals={() => setActiveTab('goals')}
            onSelectGoal={handleSelectGoal}
            onOpenNewGoalModal={handleOpenNewGoal}
            onOpenLogSessionModal={() => handleOpenLogSession(null)}
            onNavigateToRevision={() => setActiveTab('revision')}
            onNavigateToSessions={() => setActiveTab('sessions')}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsPage
            onSelectGoal={handleSelectGoal}
            onOpenNewGoalModal={handleOpenNewGoal}
            onEditGoal={handleEditGoal}
            onOpenLogSessionForGoal={handleOpenLogSession}
          />
        )}

        {activeTab === 'goal-details' && selectedGoalId && (
          <GoalDetailsPage
            goalId={selectedGoalId}
            onBack={() => {
              setSelectedGoalId(null);
              setActiveTab('goals');
            }}
            onEditGoal={handleEditGoal}
            onDeleteGoal={async (g) => {
              if (window.confirm(`Delete goal "${g.title}"?`)) {
                await api.delete(`/goals/${g._id}`);
                setSelectedGoalId(null);
                setActiveTab('goals');
              }
            }}
            onOpenLogSessionForGoal={handleOpenLogSession}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsPage
            onOpenLogSessionModal={() => handleOpenLogSession(null)}
            onEditSession={handleEditSession}
          />
        )}

        {activeTab === 'revision' && (
          <RevisionPage onOpenLogSessionForTopic={handleOpenRevisionSession} />
        )}

        {activeTab === 'analytics' && <ReportsPage />}
      </main>

      {/* Global Goal Create/Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />

      {/* Global Study Session Modal */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
          setPreselectedGoalId(null);
        }}
        onSave={handleSaveSession}
        session={editingSession}
        preselectedGoalId={preselectedGoalId}
      />

      {/* Footer */}
      <footer className="border-t border-parchment-border bg-parchment-light/80 py-6 mt-12 text-center text-xs text-forest/70">
        <div className="max-w-7xl mx-auto px-4">
          Learning Progress Tracker &bull; MERN Stack (MongoDB, Express, React, Node.js)
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
