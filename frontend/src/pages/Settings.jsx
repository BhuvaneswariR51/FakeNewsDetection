import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  ChevronRight,
  LogOut,
  Lock,
  Cpu,
  Mail,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  Zap,
  RefreshCw,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    alerts: true,
    reports: false
  });

  const [selectedModel, setSelectedModel] = useState('logistic');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '' });
  const [passwordStatus, setPasswordStatus] = useState({ text: '', type: '' });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('http://localhost:5000/update-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ current_password: passwordData.current, new_password: passwordData.new })
        });
        const data = await res.json();
        if (data.status === 'success') {
            setPasswordStatus({ text: 'Password updated successfully!', type: 'success' });
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordStatus({ text: '', type: '' });
                setPasswordData({ current: '', new: '' });
            }, 2000);
        } else {
            setPasswordStatus({ text: data.message || 'Update failed', type: 'error' });
        }
    } catch (e) {
        setPasswordStatus({ text: 'Server error', type: 'error' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-outfit">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto space-y-10"
      >
        <div className="flex items-center gap-4 mb-2">
           <Zap size={32} className="text-blue-500 fill-blue-500/20" />
           <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">System Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Notification Settings */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between group">
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                     <Bell size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 tracking-tight">Notification Settings</h3>
               </div>
               
               <div className="space-y-4">
                 {[
                   { id: 'alerts', label: 'Receive Alerts', description: 'Real-time prediction alerts' },
                   { id: 'reports', label: 'Weekly Reports', description: 'Digest of all news trends' }
                 ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-1">
                     <div className="space-y-0.5">
                       <p className="text-sm font-bold text-gray-700">{item.label}</p>
                       <p className="text-[10px] text-gray-400 font-medium">{item.description}</p>
                     </div>
                     <button 
                       onClick={() => toggleNotification(item.id)}
                       className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notifications[item.id] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                     >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${notifications[item.id] ? 'translate-x-6' : ''}`} />
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>

          {/* Model Settings */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 group lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                     <Cpu size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 tracking-tight">Model Analysis Engine</h3>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">Active Engine</span>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'logistic', name: 'Logistic Regression', desc: 'Predictive modeling based on statistical probability.', tag: 'DEFAULT' },
                { id: 'svm', name: 'Support Vector Machine', desc: 'High-dimensional classification for complex patterns.', tag: 'ADVANCED' }
              ].map((model) => (
                <button 
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative p-6 rounded-3xl border-2 text-left transition-all overflow-hidden ${
                    selectedModel === model.id 
                      ? 'bg-indigo-50/50 border-indigo-400/30' 
                      : 'bg-gray-50/50 border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className={`absolute top-0 right-0 p-3 ${selectedModel === model.id ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                     <Check className="text-indigo-600" size={16} strokeWidth={3} />
                  </div>
                  <span className={`text-[8px] font-black italic tracking-widest px-2 py-0.5 rounded-full mb-3 inline-block ${selectedModel === model.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {model.tag}
                  </span>
                  <p className={`font-black tracking-tight mb-2 ${selectedModel === model.id ? 'text-indigo-600' : 'text-gray-700'}`}>{model.name}</p>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed leading-tight">{model.desc}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
               <RefreshCw size={14} className="text-blue-500 animate-spin-slow" />
               <p className="text-xs font-bold text-gray-500">Note: <span className="text-indigo-600">Trained with 50K+ Articles</span> from real-world verified data sources.</p>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 group">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                   <User size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 tracking-tight">Account Profile</h3>
             </div>

             <div className="space-y-3">
                <button 
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-blue-50 group/btn transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-white rounded-xl text-gray-400 group-hover/btn:text-blue-500 shadow-sm"><Key size={16} /></div>
                     <span className="text-sm font-bold text-gray-700">Update Password</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-rose-50 group/btn transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-white rounded-xl text-gray-400 group-hover/btn:text-rose-500 shadow-sm"><LogOut size={16} /></div>
                     <span className="text-sm font-bold text-rose-500">Sign Our System</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </motion.div>

          

          {/* Contact Support */}
          <motion.div variants={itemVariants} className="bg-blue-600 rounded-[2rem] p-8 shadow-xl shadow-blue-200 relative overflow-hidden group">
             <div className="relative z-10 space-y-6 flex flex-col h-full justify-between">
                <div className="space-y-3">
                   <div className="p-3 bg-white/20 rounded-2xl text-white w-fit">
                      <HelpCircle size={24} />
                   </div>
                   <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Expert Support Assistance</h3>
                   <p className="text-xs text-blue-100 font-medium leading-relaxed italic opacity-80">
                     "Have suggestions or issues? We are here to assist you 24/7 with your verification needs."
                   </p>
                </div>
                
                <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg">
                   Connect With Support
                </button>
             </div>
             
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </motion.div>

        </div>
      </motion.div>

        <AnimatePresence>
          {isPasswordModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border border-gray-100"
              >
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl font-black leading-none">&times;</span>
                </button>
                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Lock size={18} /></div>
                  Update Password
                </h3>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  
                  {passwordStatus.text && (
                    <p className={`text-xs font-bold text-center ${passwordStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {passwordStatus.text}
                    </p>
                  )}
                  
                  <button 
                    type="submit"
                    className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Confirm Update
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default Settings;
