import React, { useState } from 'react';
import { Shield, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';

const Signup = ({ onNavigateLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        full_name: fullName,
        email,
        password
      });

      if (response.data.status === 'success') {
        onNavigateLogin('Account created successfully. Please login.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error creating account');
      } else {
        setError('Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-inter bg-gradient-to-br from-[#4A86F7] via-[#3372E9] to-[#1F5AC7]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-r from-transparent via-white/5 to-transparent transform -rotate-12 rounded-[100%] blur-xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-12 rounded-[100%] blur-3xl"></div>
        <div className="absolute top-[30%] left-[-20%] w-[150%] h-[50%] bg-gradient-to-b from-transparent via-white/5 to-transparent transform -rotate-6 rounded-[100%] blur-2xl"></div>
      </div>

      <div className="bg-[#FBFCFE] rounded-3xl shadow-[0_20px_60px_rgba(0,0,100,0.3)] w-full max-w-[420px] p-8 space-y-7 relative z-10 border border-white/40">

        <div className="flex flex-col items-center text-center pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex items-center justify-center">
              <Shield size={34} strokeWidth={2.5} className="text-[#2B73F6]" fill="#E8F0FE" />
              <svg className="absolute w-4 h-4 text-[#2B73F6] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1F2937] tracking-tight">Fake News Detection</h1>
          </div>
          <h2 className="text-[1.1rem] font-medium text-[#6B7280]">Create Account</h2>
        </div>

        <div className="bg-[#F8FAFC] rounded-2xl p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-[#F1F5F9]">

          {error && (
            <div className="mb-4 text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="text-[#94A3B8] group-focus-within:text-blue-500 transition-colors" size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[#334155] placeholder:text-[#94A3B8] text-sm transition-all shadow-sm font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="text-[#94A3B8] group-focus-within:text-blue-500 transition-colors" size={18} strokeWidth={2} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[#334155] placeholder:text-[#94A3B8] text-sm transition-all shadow-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="text-[#94A3B8] group-focus-within:text-blue-500 transition-colors" size={18} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[#334155] placeholder:text-[#94A3B8] text-sm transition-all shadow-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="text-[#94A3B8] group-focus-within:text-blue-500 transition-colors" size={18} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[#334155] placeholder:text-[#94A3B8] text-sm transition-all shadow-sm font-medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#296FF2] to-[#1853C7] hover:from-[#2363DD] hover:to-[#1448B0] text-white text-sm font-semibold py-3.5 rounded-xl shadow-[0_6px_15px_rgba(30,90,200,0.3)] transform transition-transform active:scale-[0.98] mt-2"
            >
              Sign Up
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => onNavigateLogin()}
                className="text-sm font-semibold text-blue-500 hover:text-blue-700 hover:underline"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
