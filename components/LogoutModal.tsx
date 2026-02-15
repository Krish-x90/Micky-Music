import React from 'react';
import { Button } from './ui/Button';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-2xl p-6 border border-white/10 animate-fade-in-up">
        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Log Out?</h3>
        <p className="text-muted mb-6">Are you sure you want to sign out of your account?</p>
        <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <button 
                onClick={onConfirm}
                className="flex-1 px-6 py-2 rounded-full font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20"
            >
                Log Out
            </button>
        </div>
      </div>
    </div>
  );
};