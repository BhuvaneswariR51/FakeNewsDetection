import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  History, 
  Settings, 
  Info,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Check News', icon: <Search size={20} />, path: '/check' },
    { title: 'History', icon: <History size={20} />, path: '/history' },
    { title: 'About Us', icon: <Info size={20} />, path: '/about' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="h-screen w-[260px] bg-[#11141B] text-white flex flex-col fixed left-0 top-0 z-50">
      {/* Brand Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-[#1D60D8] p-1.5 rounded-full flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
           <h1 className="text-[17px] font-bold tracking-tight leading-tight">Fake News<br/>Detection</h1>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-[#0E49B5] text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="text-[15px]">{item.title}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;

