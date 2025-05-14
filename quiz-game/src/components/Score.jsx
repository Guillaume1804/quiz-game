// Score.jsx
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function Score({ value, combo }) {
  const [animatedScore, setAnimatedScore] = useState(value);

  useEffect(() => {
    setAnimatedScore(value);
  }, [value]);

  return (
    <motion.div
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold font-title shadow-md transition ${
        combo > 0
          ? "bg-yellow-200 text-yellow-900 ring-4 ring-yellow-400 animate-pulse shadow-yellow-400"
          : "bg-blue-100 text-blue-800"
      }`}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={animatedScore}
          className="font-body text-lg"
          initial={{ scale: 1 }}
          animate={{ scale: 1.3 }}
          exit={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          {animatedScore}
        </motion.span>
        {combo > 0 && (
          <motion.span
            key={`combo-${combo}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-semibold text-yellow-800 ml-2"
          >
            ⚡ +{combo}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
