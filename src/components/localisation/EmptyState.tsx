'use client';

import { motion } from 'framer-motion';
import { Upload, Link, FileText, Sparkles } from 'lucide-react';

export default function EmptyState() {
  const methods = [
    {
      icon: Upload,
      title: 'Par Image',
      description: 'Téléchargez une photo du bien',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Link,
      title: 'Par URL',
      description: 'Collez un lien d\'annonce',
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      icon: FileText,
      title: 'Par Texte',
      description: 'Décrivez le bien',
      gradient: 'from-violet-500 to-indigo-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[500px]"
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="mb-8"
      >
        <div className="relative">
          <Sparkles className="w-24 h-24 text-purple-500" />
          <div className="absolute inset-0 bg-purple-200/30 rounded-full blur-2xl" />
        </div>
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
        Lancez votre première localisation
      </h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Utilisez l'une des trois méthodes ci-dessous pour localiser précisément un bien immobilier grâce à l'IA
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        {methods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 cursor-pointer group shadow-md hover:shadow-lg transition-all"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${method.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${method.gradient} mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

