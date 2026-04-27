import React, { useState, useEffect } from 'react';
import {
  Bell,
  HelpCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  Search,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, real: 0, fake: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:5000/stats');
        setStats(statsRes.data);

        const historyRes = await axios.get('http://localhost:5000/history');
        const formattedHistory = historyRes.data.slice(0, 3).map((item, index) => ({
          id: index,
          title: item.title,
          time: item.date.split(' ')[0],
          status: item.result,
          color: item.result === 'Real' ? 'text-[#0EB77B]' : 'text-[#F14646]'
        }));
        setRecentActivity(formattedHistory);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };

    const fetchTrendingNews = async () => {
      try {
        // Fetch through backend to bypass browser CORS restrictions
        const res = await axios.get('http://localhost:5000/trending-news');
        if (res.data.articles) {
          setTrendingNews(res.data.articles.slice(0, 5));
        } else {
          setNewsError("Trending news currently unavailable");
        }
      } catch (err) {
        setNewsError("Trending news currently unavailable");
      } finally {
        setNewsLoading(false);
      }
    };

    fetchData();
    fetchTrendingNews();
  }, []);

  const monthlyData = [
    { name: 'Jan', real: 130, fake: 85 },
    { name: 'Feb', real: 165, fake: 100 },
    { name: 'Mar', real: 110, fake: 90 },
    { name: 'Apr', real: 145, fake: 80 },
    { name: 'May', real: 180, fake: 110 },
    { name: 'Jun', real: 150, fake: 75 },
  ];

  return (
    <div className="font-outfit text-[#111827] max-w-6xl mx-auto h-full flex flex-col pb-10">

      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
        <div className="flex items-center gap-5">
          <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Bell size={22} className="text-gray-500" />
            <span className="absolute top-1 right-2 w-2 h-2 bg-[#F14646] rounded-full border border-white"></span>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-gray-50 flex flex-col justify-center relative overflow-hidden h-[120px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <HelpCircle size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Checked</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800">{stats.total.toLocaleString()}</h2>
        </div>

        <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-gray-50 flex flex-col justify-center relative overflow-hidden h-[120px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Real Articles</span>
          </div>
          <h2 className="text-3xl font-black text-emerald-500">{stats.real.toLocaleString()}</h2>
        </div>

        <div className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-gray-50 flex flex-col justify-center relative overflow-hidden h-[120px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-rose-500 flex items-center justify-center">
              <AlertCircle size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fake Articles</span>
          </div>
          <h2 className="text-3xl font-black text-rose-500">{stats.fake.toLocaleString()}</h2>
        </div>
      </div>

      {/* Recent Trending News Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <TrendingUp size={20} className="text-blue-500" />
            Recent Trending News
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 rounded-full border border-gray-100 italic">Live Updates</span>
        </div>

        {newsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-56 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : newsError ? (
          <div className="py-12 bg-gray-50 rounded-3xl text-center border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{newsError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {trendingNews.map((article, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all hover:-translate-y-1">
                <div className="h-28 bg-gray-100 relative overflow-hidden">
                  <img
                    src={article.urlToImage || 'https://images.unsplash.com/photo-1585829365234-781fcd04c838?w=400&q=80'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="News"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1585829365234-781fcd04c838?w=400&q=80'}
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                    Trending
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-blue-500 uppercase mb-1.5 truncate">{article.source.name}</p>
                    <h4 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h4>
                  </div>
                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1.5">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => navigate('/check', { state: { text: article.title } })}
                      className="w-full py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Search size={10} /> Verify News
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white rounded-[1.25rem] p-6 shadow-sm border border-gray-50 h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Monthly News Analysis</h3>
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#0CA76C] rounded-full"></div>
                Real
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#F14646] rounded-full"></div>
                Fake
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative -left-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dx={-10} />
                <Bar dataKey="real" fill="#0EAC6D" radius={[4, 4, 4, 4]} />
                <Bar dataKey="fake" fill="#F45151" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[220px]">
        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-gray-50 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6">Recent Reports</h3>
          <div className="flex-1 flex flex-col gap-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100 group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${activity.status === 'Real' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    <FileText size={18} />
                  </div>
                  <div className="max-w-[180px] md:max-w-xs">
                    <p className="text-xs font-bold text-gray-700 truncate">{activity.title}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{activity.time}</p>
                  </div>
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${activity.status === 'Real' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-gray-50 flex flex-col items-center justify-center relative">
          <h3 className="font-bold text-gray-800 absolute top-6 left-6">Prediction Accuracy</h3>
          <div className="w-44 h-44 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: Math.round(stats.accuracy * 100) || 0 }, { value: 100 - (Math.round(stats.accuracy * 100) || 0) }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#0CA76C" />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
              <span className="text-4xl font-black text-gray-800 leading-none">{Math.round(stats.accuracy * 100) || 0}<span className="text-xl">%</span></span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Performance</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const Check = ({ size, className, strokeWidth }) => <FileText size={size} className={className} strokeWidth={strokeWidth} />;

export default Dashboard;
