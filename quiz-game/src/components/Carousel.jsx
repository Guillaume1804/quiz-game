// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Carousel({ images }) {
  const height = "100vh";
  const duplicatedImages = [...images, ...images];

  return (
    <div className="relative overflow-hidden w-full z-[-10]" style={{ height }}>
      <motion.div
        className="flex animate-scroll-x [animation-duration:90s] sm:[animation-duration:90s] lg:[animation-duration:120s] min-w-fit"
        style={{ height }}
      >
        {duplicatedImages.map((img, index) => (
          <div
            key={index}
            className="relative overflow-hidden w-[120vw] sm:w-[50vw] lg:w-[33.33vw] xl:w-[22.22vw] 2xl:w-[16.66vw]"
            style={{ height }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                width: img.scale || "100%",
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
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
