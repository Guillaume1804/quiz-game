// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function Lives({ count }) {
  const [shake, setShake] = useState(false);
  const [hearts, setHearts] = useState([true, true, true]);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count < prevCount.current) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    const newHearts = Array(3).fill(false).map((_, i) => i < count);
    setHearts(newHearts);
    prevCount.current = count;
  }, [count]);

  return (
    <motion.div
      className="flex items-center gap-1"
      animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {hearts.map((active, index) =>
        active ? (
          <motion.span
            key={index}
            className="text-2xl text-red-500"
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ❤️
          </motion.span>
        ) : null // <- on n'affiche rien si le cœur est "mort"
      )}
    </motion.div>
  );
}
