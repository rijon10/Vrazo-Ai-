import React from 'react';
import { Home, Wand2, Compass, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'home', label: 'HOME', icon: <Home size={20} /> },
    { id: 'editor', label: 'ENHANCE', icon: <Wand2 size={20} /> },
    { id: 'explore', label: 'TRENDING', icon: <Compass size={20} /> },
    { id: 'settings', label: 'SETTINGS', icon: <Settings size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;