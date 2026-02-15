import React from 'react';
import { Button } from './ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeletePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playlistName?: string;
}

export const DeletePlaylistModal: React.FC<DeletePlaylistModalProps> = ({ isOpen, onClose, onConfirm, playlistName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border border-red-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
            <Trash2 className="text-red-500" size={24} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Delete Playlist?</h3>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Are you sure you want to delete <span className="text-white font-medium">"{playlistName || 'this playlist'}"</span>? 
            <br/><span className="text-red-400/80 text-xs mt-2 block flex items-center gap-1"><AlertTriangle size={12}/> This action cannot be undone.</span>
          </p>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-red-900/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};