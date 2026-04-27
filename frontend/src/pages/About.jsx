import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Layout, 
  Mail, 
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 font-outfit">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto space-y-10"
      >
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">About Us</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
            We are dedicated to combating misinformation using advanced AI technology. 
            Our tool provides real-time analysis to help users identify fake news.
          </p>
        </div>

        {/* Feature Cards Grid - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Reliable",
              description: "Utilizes advanced ML and NLP to detect fake news.",
              icon: <Cpu size={24} className="text-blue-500" />,
              bg: "bg-blue-50"
            },
            {
              title: "User-Friendly",
              description: "Simple interface for quick news verification.",
              icon: <Layout size={24} className="text-emerald-500" />,
              bg: "bg-emerald-50"
            },
            {
              title: "Secure",
              description: "Ensures data privacy and secure handling.",
              icon: <ShieldCheck size={24} className="text-indigo-500" />,
              bg: "bg-indigo-50"
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-3"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center`}>
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-800">{feature.title}</h3>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact Section - Compact and Clean */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-gray-50 text-center space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm">
            <a 
              href="mailto:info@fakenewsdetector.com" 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-semibold"
            >
              <div className="p-1.5 bg-gray-50 rounded-md"><Mail size={16} /></div>
              <span>Email: info@fakenewsdetector.com</span>
            </a>
            <a 
              href="https://www.fakenewsdetector.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-semibold"
            >
              <div className="p-1.5 bg-gray-50 rounded-md"><Globe size={16} /></div>
              <span>Website: www.fakenewsdetector.com</span>
            </a>
          </div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-4">
            © 2026 Fake News Detection System • All Truth Reserved
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
