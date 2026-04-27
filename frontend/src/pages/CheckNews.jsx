import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Check, 
  Search, 
  Loader2, 
  AlertTriangle, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  Type, 
  Globe,
  FileAudio,
  Play,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const CheckNews = () => {
  const [mode, setMode] = useState('text');
  const [newsText, setNewsText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setNewsText(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  useEffect(() => {
    if (location.state && location.state.text) {
      setNewsText(location.state.text);
      setMode('text');
    }
  }, [location]);

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('language', language);

    if (mode === 'text' && !newsText.trim()) return setLoading(false);
    if (mode === 'url' && !url.trim()) return setLoading(false);
    if (mode === 'voice' && !newsText.trim()) return setLoading(false);
    if (mode !== 'text' && mode !== 'url' && mode !== 'voice' && !file) return setLoading(false);

    if (mode === 'text' || mode === 'voice') formData.append('text', newsText);
    else if (mode === 'url') formData.append('url', url);
    else formData.append('file', file);

    const endpoint = (mode === 'text' || mode === 'voice') ? 'http://localhost:5000/predict' : 'http://localhost:5000/analyze';
    
    try {
      const res = await axios.post(endpoint, (mode === 'text' || mode === 'voice') ? { text: newsText } : formData, {
        headers: { 'Content-Type': (mode === 'text' || mode === 'voice') ? 'application/json' : 'multipart/form-data' }
      });
      setResult({
        ...res.data,
        extracted_text: res.data.extracted_text || (mode === 'voice' ? newsText : null)
      });
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      if (recognition) {
        setMode('voice');
        recognition.start();
        setIsRecording(true);
      } else {
        setError("Speech recognition not supported in this browser.");
      }
    }
  };

  const modes = [
    { id: 'text', label: 'Text', icon: <Type size={16} /> },
    { id: 'url', label: 'URL', icon: <LinkIcon size={16} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={16} /> },
    { id: 'audio', label: 'Audio', icon: <FileAudio size={16} /> },
    { id: 'video', label: 'Video', icon: <VideoIcon size={16} /> },
    { id: 'voice', label: 'Voice', icon: <Mic size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center pt-12 px-4 font-outfit pb-20">
      <div className="w-full max-w-2xl text-center space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fake News Detector</h1>
          <p className="text-gray-500 text-xs font-medium">Identify state-sponsored misinformation and fake content instantly.</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center p-1 bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-x-auto no-scrollbar max-w-fit mx-auto">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setFile(null); setError(''); if(isRecording) recognition.stop(); setIsRecording(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap ${
                mode === m.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 space-y-4">
          <AnimatePresence mode="wait">
            {(mode === 'text' || mode === 'voice') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <textarea
                  className="w-full h-36 p-4 bg-gray-50/50 rounded-xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-gray-700 text-xs transition-all resize-none font-medium leading-relaxed"
                  placeholder={mode === 'voice' ? "Listening... Your speech will appear here." : "Enter or paste the news text to analyze..."}
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                />
                {mode === 'voice' && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <div className="flex gap-1 animate-pulse">
                      <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                      <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {mode === 'url' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="url"
                    className="w-full p-4 pl-11 bg-gray-50/50 rounded-xl border border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-gray-700 text-xs font-medium"
                    placeholder="https://news-portal.com/article-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium text-left px-1">We will extract the main content from the provided URL.</p>
              </motion.div>
            )}

            {(mode === 'image' || mode === 'video' || mode === 'audio') && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-blue-300 transition-colors flex flex-col items-center gap-3 bg-gray-50/50"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                  {mode === 'image' ? <ImageIcon size={20} /> : mode === 'video' ? <VideoIcon size={20} /> : <FileAudio size={20} />}
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-gray-700">{file ? file.name : `Select ${mode} to upload`}</p>
                  <p className="text-[9px] text-gray-400 font-medium mt-0.5">MP4, JPG, PNG, MP3 supported (Max 16MB)</p>
                </div>
                <input 
                  type="file" 
                  accept={mode === 'image' ? 'image/*' : mode === 'video' ? 'video/*' : 'audio/*'}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'voice' && (
            <div className="flex justify-center pt-2">
              <button 
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all ${isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}
              >
                {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                {isRecording ? "Stop Listening" : "Start Voice Assistant"}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold px-4 py-2 bg-rose-50 rounded-lg">
              <AlertTriangle size={12} />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleCheck}
            disabled={loading || (mode === 'text' && !newsText.trim()) || (mode === 'voice' && !newsText.trim()) || (mode === 'url' && !url.trim()) || (mode !== 'text' && mode !== 'url' && mode !== 'voice' && !file)}
            className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? 'Processing...' : 'Analyze News'}
          </button>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showModal && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.5rem] shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors">
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  result.prediction === 'Real' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                }`}>
                  {result.prediction === 'Real' ? <Check size={32} strokeWidth={3} /> : <AlertTriangle size={32} strokeWidth={3} />}
                </div>

                <div className="space-y-1">
                  <h2 className={`text-2xl font-black uppercase tracking-tight ${result.prediction === 'Real' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {result.prediction === 'Real' ? 'REAL NEWS' : 'FAKE NEWS'}
                  </h2>
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-gray-900 text-xl font-bold">{Math.round(result.confidence * 100)}%</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Confidence Score</span>
                  </div>
                </div>

                <div className="bg-gray-50/80 rounded-xl p-4 text-left border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Method: {mode}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{result.language}</span>
                  </div>
                  {result.extracted_text && (
                    <p className="text-[10px] text-gray-600 font-medium leading-relaxed line-clamp-4 italic">
                      "{result.extracted_text}"
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
                >
                  Dismiss Result
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckNews;
