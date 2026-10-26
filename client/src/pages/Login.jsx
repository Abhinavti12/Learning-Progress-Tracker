import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0E9D8]">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-xl border border-[#DDD1B8] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#132A2A] text-[#B7D6A5] shadow-lg shadow-[#132A2A]/20 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#132A2A] tracking-tight">Student Sign In</h1>
          <p className="text-sm text-[#132A2A]/70 mt-1">
            Access your learning goals, study sessions, and self-assessment
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 text-xs text-[#8b521c] bg-[#fdf4ec] border border-[#E6A66A] rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E6A66A]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#132A2A]/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#132A2A]/40 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#DDD1B8] focus:outline-none focus:ring-2 focus:ring-[#245B52]/20 focus:border-[#245B52] transition bg-[#FAF7F0]/60 text-[#132A2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#132A2A]/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#132A2A]/40 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#DDD1B8] focus:outline-none focus:ring-2 focus:ring-[#245B52]/20 focus:border-[#245B52] transition bg-[#FAF7F0]/60 text-[#132A2A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#245B52] hover:bg-[#1b4740] text-white font-bold text-sm rounded-xl shadow-md shadow-[#245B52]/20 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#B7D6A5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#DDD1B8]/40 text-center">
          <p className="text-xs text-[#132A2A]/70">
            Don't have an account yet?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-[#245B52] hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
