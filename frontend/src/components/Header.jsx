import React from 'react';
import { Search } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="hidden md:flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none ml-2 text-sm text-gray-600 w-64"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
