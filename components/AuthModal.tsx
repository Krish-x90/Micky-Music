import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { AuthMode } from '../types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: AuthMode;
  onLogin: (username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLogin }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [loading, setLoading] = useState(false);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setPasswordsMatch(true);
    }
  }, [isOpen]);

  // Real-time password match check
  useEffect(() => {
    if (mode === AuthMode.SIGNUP && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === AuthMode.SIGNUP) {
      if (!username) {
        setError('Username is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    
    setError('');
    setLoading(true);

    try {
      if (mode === AuthMode.SIGNUP) {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name
        await updateProfile(userCredential.user, {
          displayName: username
        });
        onLogin(username);
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user.displayName || email.split('@')[0]);
      }
      // Reset form on success
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      onClose();
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use";
      else if (err.code === 'auth/invalid-email') msg = "Invalid email address";
      else if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters";
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === AuthMode.LOGIN ? AuthMode.SIGNUP : AuthMode.LOGIN);
    setError('');
    setConfirmPassword('');
    setPasswordsMatch(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Neon Glow Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            {mode === AuthMode.LOGIN ? 'Welcome Back' : 'Join Micky Music'}
          </h2>
          <p className="text-center text-gray-400 mb-8 text-sm">
            {mode === AuthMode.LOGIN 
              ? 'Enter your credentials to access your library' 
              : 'Sign up to discover the universe of music'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === AuthMode.SIGNUP && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium ml-1">Username</label>
                <div className="relative group">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="johndoe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === AuthMode.SIGNUP && (
               <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-black/20 border rounded-lg py-3 pl-10 pr-10 text-white focus:ring-1 outline-none transition-all ${
                      !passwordsMatch && confirmPassword 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-white/10 focus:border-primary focus:ring-primary'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!passwordsMatch && confirmPassword && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 ml-1 animate-fade-in">
                    <AlertCircle size={12} />
                    <span>Passwords do not match</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded mt-2">{error}</p>
            )}

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Processing...' : (mode === AuthMode.LOGIN ? 'Log In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {mode === AuthMode.LOGIN ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={switchMode}
                className="ml-2 text-primary hover:text-white transition-colors font-medium hover:underline"
              >
                {mode === AuthMode.LOGIN ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};