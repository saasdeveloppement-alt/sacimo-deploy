'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ChatWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  if (!isVisible) return null;

  const handleClick = () => {
    router.push('/app/contact');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={handleClick}
        className="h-14 w-14 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white border-0 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(124, 92, 219, 0.4)",
            "0 0 40px rgba(124, 92, 219, 0.6)",
            "0 0 20px rgba(124, 92, 219, 0.4)",
          ],
        }}
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        title="Contacter le support"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
        {/* Effet de pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-600 to-primary-700"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.button>
    </div>
  );
}

