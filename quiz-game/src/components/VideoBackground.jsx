import { useEffect, useState } from "react";

const videos = [
  "/assets/backgrounds/lotr.mp4",
  "/assets/backgrounds/inception.mp4",
  "/assets/backgrounds/harrypotter.mp4"
];

export default function VideoBackground() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % videos.length);
    }, 10000); // change every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {videos.map((src, index) => (
        <video
          key={src}
          src={src}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
        />
      ))}

      {/* Optionnel : filtre pour lisibilité */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />
    </div>
  );
}
