import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  Clock,
  RotateCcw,
  BarChart3,
  LogOut,
  Plus,
  GraduationCap
} from 'lucide-react';

const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenNewGoalModal,
  onOpenLogSessionModal
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Learning Goals', icon: Target },
    { id: 'sessions', label: 'Study Sessions', icon: Clock },
    { id: 'revision', label: 'Self-Assessment', icon: RotateCcw },
    { id: 'analytics', label: 'DBMS Reports', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#DDD1B8] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#132A2A] flex items-center justify-center text-[#B7D6A5] shadow-md shadow-[#132A2A]/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold text-[#132A2A] tracking-tight">
                Learning Progress Tracker
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B7D6A5]/40 text-[#245B52] font-bold border border-[#B7D6A5]">
                MERN
              </span>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#E5DCBE]/50 p-1.5 rounded-2xl border border-[#DDD1B8]/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#245B52] text-white shadow-sm'
                      : 'text-[#132A2A]/70 hover:text-[#132A2A] hover:bg-[#FAF7F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Log Session Button */}
            <button
              onClick={onOpenLogSessionModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#245B52] bg-[#B7D6A5]/30 hover:bg-[#B7D6A5]/50 border border-[#B7D6A5] rounded-xl transition active:scale-95 shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-[#245B52]" />
              <span>Log Session</span>
            </button>

            {/* New Goal Button (Botanical Green Primary Button) */}
            <button
              onClick={onOpenNewGoalModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#245B52] hover:bg-[#1b4740] rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Goal</span>
            </button>

            <div className="h-6 w-px bg-[#DDD1B8] mx-1 hidden sm:block" />

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#132A2A] text-[#B7D6A5] font-extrabold flex items-center justify-center text-xs shadow-2xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>

              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-[#132A2A]/50 hover:text-[#8b521c] hover:bg-[#E6A66A]/20 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex xl:hidden border-t border-[#DDD1B8] py-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap ${
                  isActive
                    ? 'bg-[#245B52] text-white shadow-2xs'
                    : 'text-[#132A2A]/70 hover:bg-[#E5DCBE]/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
