import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modern React AI Analysis Overlay Component
 * Fulfills the requirement for a professional AI processing experience.
 */
export const AIAnalysisOverlay = ({ file, resultPromise, onComplete }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const steps = [
    { label: "Initializing AI model...", p: 15 },
    { label: "Preprocessing image...", p: 35 },
    { label: "Scanning for patterns...", p: 60 },
    { label: "Detecting regions...", p: 85 },
    { label: "Analyzing data...", p: 95 }
  ];

  useEffect(() => {
    if (file) setImageUrl(URL.createObjectURL(file));
    
    const runAnimations = async () => {
      for (let i = 0; i < steps.length; i++) {
        setStep(i);
        setProgress(steps[i].p);
        await new Promise(r => setTimeout(r, 1200));
      }
    };

    const handleResult = async () => {
      const data = await resultPromise;
      setResult(data);
      setProgress(100);
    };

    runAnimations();
    handleResult();
  }, [file, resultPromise]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[9999] bg-[#0a0a0c]/98 flex flex-col items-center justify-center font-sans text-slate-50 backdrop-blur-md"
    >
      <div className="w-full max-w-3xl px-6 text-center">
        <div className="relative mb-8 overflow-hidden bg-black border rounded-2xl border-slate-800 shadow-2xl">
          <motion.img 
            src={imageUrl} 
            alt="Dog skin analysis" 
            className="w-full max-h-[55vh] object-contain"
            animate={{
              filter: step === 1 ? "blur(8px) grayscale(1)" : step === 2 ? "contrast(1.2) brightness(0.8)" : "none"
            }}
          />
          
          {/* Scanning Line */}
          <AnimatePresence>
            {step === 2 && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-[0_0_15px_#3b82f6] z-20"
              />
            )}
          </AnimatePresence>

          {/* Fake Bounding Boxes */}
          {step >= 3 && !result && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-[20%] left-[25%] w-1/4 h-1/3 border-2 border-blue-500 bg-blue-500/10 rounded-lg z-10" />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="absolute top-[50%] left-[55%] w-1/5 h-1/4 border-2 border-blue-500 bg-blue-500/10 rounded-lg z-10" />
            </>
          )}
        </div>

        {!result ? (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 text-slate-400 font-medium">
                <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                {steps[step].label}
              </div>
              <span className="text-sm font-bold text-slate-500">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div 
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border bg-slate-900 border-slate-800 rounded-2xl"
          >
            <h2 className="text-4xl font-extrabold mb-2">{result.prediction}</h2>
            <p className="text-xl font-semibold text-blue-500 mb-6">{result.health_status}</p>
            <div className="flex justify-center gap-6 text-slate-400 text-sm mb-8">
              <span>Confidence: <b className="text-slate-200">{(result.healthy_probability * 100).toFixed(2)}%</b></span>
            </div>
            <button onClick={onComplete} className="px-10 py-3 font-bold bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Return to Dashboard</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};