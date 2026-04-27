import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CheckNews from './pages/CheckNews';
import History from './pages/History';
import About from './pages/About';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

// Layout component to wrap pages with the sidebar
const Layout = ({ children, title }) => {
  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <Header title={title} />
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <Signup 
          onNavigateLogin={(msg) => {
            if (msg) setSuccessMessage(msg);
            setAuthView('login');
          }} 
        />
      );
    }
    
    return (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        onNavigateSignup={() => setAuthView('signup')}
        successMessage={successMessage}
      />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout title="Dashboard"><Dashboard /></Layout>} />
        <Route path="/check" element={<Layout title="Check News Authenticity"><CheckNews /></Layout>} />
        <Route path="/history" element={<Layout title="Detection History"><History /></Layout>} />
        <Route path="/about" element={<Layout title="About Project"><About /></Layout>} />
        <Route path="/settings" element={<Layout title="Settings"><Settings /></Layout>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
