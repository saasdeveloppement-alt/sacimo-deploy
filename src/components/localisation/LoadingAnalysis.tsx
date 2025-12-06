'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Loader2, Image, Search, MapPin, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, label: 'Analyse de l\'image...', icon: Image },
  { id: 2, label: 'Extraction des caractéristiques...', icon: Search },
  { id: 3, label: 'Recherche dans la base de données...', icon: MapPin },
  { id: 4, label: 'Calcul des probabilités...', icon: Search },
  { id: 5, label: 'Génération des résultats...', icon: CheckCircle2 },
];

export default function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 p-12 shadow-2xl"
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-8"
        >
          <Loader2 className="w-16 h-16 text-purple-400" />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-8">Analyse en cours...</h3>

        <div className="w-full max-w-md mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-center text-gray-300 text-sm">{Math.round(progress)}%</div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <AnimatePresence mode="sync">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isActive || isCompleted ? 1 : 0.5, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30'
                      : isCompleted
                        ? 'bg-white/5'
                        : 'bg-white/5'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-500 to-violet-500'
                        : isCompleted
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-auto"
                    >
                      <Loader2 className="w-4 h-4 text-purple-400" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

