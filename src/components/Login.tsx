'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import { auth } from '../services/api';

interface LoginProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'signup';
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate, initialMode = 'login', onLogin }) => {
  const isLogin = initialMode === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        if (isLogin) {
          await auth.login(email, password);
        } else {
          await auth.signup(email, password, name);
        }

        if (onLogin) {
          onLogin();
        } else {
          onNavigate('home');
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-brand-yellow/10 z-0"></div>
      <div className="absolute inset-0 bg-grain-texture opacity-5 z-0"></div>

      <div className="bg-brand-blue w-full max-w-[480px] rounded-3xl shadow-2xl relative z-10 p-8 sm:p-12 border border-brand-white/10 animate-fade-in text-brand-white">
        
        <button 
          onClick={() => onNavigate('home')}
          className="absolute top-6 right-6 text-brand-white/40 hover:text-brand-yellow transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-24 mx-auto mb-6 cursor-pointer filter brightness-0 invert" onClick={() => onNavigate('home')}>
             <Logo />
          </div>
          <h1 className="font-heading text-3xl text-brand-white mb-2">
            {isLogin ? 'Welcome back' : 'Join Odd Folk'}
          </h1>
          <p className="font-body text-brand-white/70">
            {isLogin ? 'Log in to continue to Odd Folk' : 'Create an account to start renting'}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <button onClick={onLogin} className="w-full flex items-center justify-center px-4 py-3.5 border border-brand-white/20 rounded-xl font-body font-medium text-brand-white hover:bg-white/5 hover:border-brand-white/40 transition-all relative group bg-brand-blue shadow-sm">
             <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             Continue with Google
          </button>
        </div>

        <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-brand-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-brand-white/40 font-body text-[10px] font-bold tracking-widest uppercase">
                {isLogin ? 'Or email login' : 'Or email signup'}
            </span>
            <div className="flex-grow border-t border-brand-white/10"></div>
        </div>

        <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {!isLogin && (
              <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-brand-white/90">Full name</label>
                  <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-brand-white/20 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all bg-white/5 text-brand-white placeholder-brand-white/30 font-body"
                      placeholder="Jane Doe"
                      required
                  />
              </div>
            )}
            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-brand-white/90">Email address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-brand-white/20 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all bg-white/5 text-brand-white placeholder-brand-white/30 font-body"
                    placeholder="name@example.com"
                    required
                />
            </div>
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-brand-white/90">Password</label>
                    {isLogin && (
                        <button type="button" className="text-sm text-brand-yellow hover:text-white font-medium transition-colors">Forgot?</button>
                    )}
                </div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-brand-white/20 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 outline-none transition-all bg-white/5 text-brand-white placeholder-brand-white/30 font-body"
                    placeholder="••••••••"
                    required
                    minLength={6}
                />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-brand-white font-body font-bold text-lg py-4 rounded-xl hover:brightness-110 hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Please wait...' : (isLogin ? 'Log in' : 'Create account')}
            </button>
        </form>

        <div className="mt-10 text-center font-body text-brand-white/70">
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <button 
                onClick={() => onNavigate(isLogin ? 'signup' : 'login')} 
                className="text-brand-yellow font-bold hover:text-white hover:underline transition-all ml-1"
            >
                {isLogin ? 'Sign up' : 'Log in'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;