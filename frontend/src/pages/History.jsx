import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Calendar, 
  ShieldCheck, 
  History as HistoryIcon,
  Trash2,
  MoreHorizontal,
  FileText,
  Eye,
  Settings2,
  Globe,
  Radio
} from 'lucide-react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700 font-outfit">
      
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Report History</h1>
          <p className="text-gray-400 font-bold mt-1 text-sm">Review multimedia analysis and multilingual reports.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500 font-bold hover:text-blue-600 transition-all text-sm">
              <Download size={18} /> Export Results
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 overflow-hidden mx-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Filter by title, language or mode..."
            className="w-full pl-14 pr-8 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-gray-700 font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="pb-6 px-6">Timestamp</th>
                <th className="pb-6 px-6">Analysis Target</th>
                <th className="pb-6 px-6">Language / Mode</th>
                <th className="pb-6 px-6 text-center">Outcome</th>
                <th className="pb-6 px-6 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loading ? (
                 <tr><td colSpan="5" className="py-20 text-center text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em]">Synchronizing Records...</td></tr>
              ) : filteredHistory.length > 0 ? filteredHistory.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-all group">
                  <td className="py-6 px-6 font-bold text-gray-400">
                     <span className="text-gray-500">{item.date.split(' ')[0]}</span>
                     <div className="text-[9px] font-black text-blue-300 mt-1 uppercase">{item.date.split(' ')[1]}</div>
                  </td>
                  <td className="py-6 px-6">
                    <p className="font-black text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</p>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-3">
                       <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase">
                          <Globe size={10} /> {item.language}
                       </span>
                       <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg text-[9px] font-black text-blue-500 uppercase">
                          <Radio size={10} /> {item.type}
                       </span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border ${
                      item.result === 'Real' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {item.result === 'Real' ? 'REAL' : 'FAKE'}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-right pr-6">
                      <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all">
                          <MoreHorizontal size={16} />
                      </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
                        <HistoryIcon size={40} />
                      </div>
                      <div>
                        <p className="text-gray-800 font-black text-lg">No records found</p>
                        <p className="text-gray-400 font-bold text-xs max-w-xs mx-auto">Try verifying some multimedia content first.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
