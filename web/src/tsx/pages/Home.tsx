import { motion } from "framer-motion";
import "react-slideshow-image/dist/styles.css";
import { Localizations } from "../utils/Localizations";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 75 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75 } },
  };

  return (
    <div id="home" className="text-ivory bg-richer_black">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="h-screen flex justify-center flex-col"
      >
        <motion.div
          variants={item}
          className="w-fit mx-auto h-1/3 aspect-square"
        >
          <img className="aspect-square " src="/icon.png" />
        </motion.div>

        <motion.p
          variants={item}
          className="text-7xl sm:text-8xl mx-auto font-bold"
        >
          SupDoc
        </motion.p>
        <motion.p
          variants={item}
          className=" text-powder_blue font-semibold text-lg mx-auto mt-4"
        >
          {Localizations.construction}
        </motion.p>
      </motion.div>
    </div>
  );
}
