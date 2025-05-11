// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Carousel({ images }) {
  const height = "100vh";
  const duplicatedImages = [...images, ...images];
  const totalWidth = `${duplicatedImages.length * 16.66}vw`;

  return (
    <div className="relative overflow-hidden w-full z-[-10]" style={{ height }}>
      <motion.div
        className="flex animate-scroll-x"
        style={{ width: totalWidth, height }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0 }}
      >
        {duplicatedImages.map((img, index) => (
          <div
            key={index}
            className="relative overflow-hidden"
            style={{ width: "16.66vw", height }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                width: img.scale || "100%", // tu contrôles le zoom ici
                height: img.scale || "100%",
                transform: `translate(${img.translateX || "0"}, ${
                  img.translateY || "0"
                })`,
                transformOrigin: img.transformOrigin || "center",
              }}
            >
              <img
                src={img.src}
                alt=""
                draggable={false}
                className="pointer-events-none select-none w-full h-full"
                style={{
                  objectPosition: img.position || "center",
                  objectFit: "cover", // ou contain selon le cas
                }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
