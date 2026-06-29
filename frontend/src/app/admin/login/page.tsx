"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ShieldCheck, Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setError('');
    setLoading(true);
    try {
      await api.login(username, password);
      router.push('/admin'); // Redirect to dashboard
    } catch (err: any) {
      setError('Credenciales inválidas. Por favor, reintenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-card border border-dark-border/80 rounded-3xl p-8 shadow-premium space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-orange" />
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">Acceso de Administración</h2>
          <p className="text-xs text-dark-muted">Ingresá tus credenciales para administrar el estudio.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-center text-xs font-semibold text-brand-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-dark-muted uppercase tracking-wider">Nombre de Usuario</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue placeholder-dark-muted"
                placeholder="Ej. admin"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-dark-muted uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue placeholder-dark-muted"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-brand-blue-hover hover:scale-[1.01] hover:shadow-lg disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-blue-glow transition-all"
          >
            {loading ? 'Iniciando Sesión...' : 'Ingresar al Panel'}
          </button>
        </form>

        <div className="text-center text-[10px] text-dark-muted pt-2 border-t border-dark-border/40">
          * Para demostración rápida, podés ingresar con: <br />
          <span className="text-white font-mono">admin</span> / <span className="text-white font-mono">admin123</span>
        </div>
      </div>
    </div>
  );
}
