import { motion } from "framer-motion";
import { AdvancementCardProps } from "../utils/Types";

export default function AdvancementCard({
  title,
  subtitle,
  link,
  imagePath,
  textColor,
  linkColor,
  bgColor,
}: AdvancementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 75 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.75, delay: 0.25 },
      }}
      className="w-11/12 sm:w-96 h-fit rounded-xl justify-center mx-auto mt-8 relative group z-20 overflow-hidden"
    >
      <img src={imagePath} className="rounded-xl -z-20 " />
      <div
        className={
          "w-full h-full  absolute bottom-0 -right-full group-hover:right-0 rounded-xl transition-all duration-500 z-10 " +
          bgColor
        }
      />
      <p
        className={
          "absolute top-5 w-96 text-center font-bold text-2xl left-1/2 -translate-x-1/2 z-30 -translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 " +
          textColor
        }
      >
        {title}
      </p>
      <a
        href={link}
        className="absolute bottom-1/2 w-12 h-12 translate-y-1/2 font-bold text-xl bg-light left-1/2 -translate-x-1/2  z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full justify-center"
      >
        <i
          className={
            "bx bx-md  bx-link-alt justify-center mx-1.5 my-1.5 " + linkColor
          }
        />
      </a>
      <p
        className={
          "absolute bottom-3 text-xl text-center w-96 left-1/2 -translate-x-1/2 z-30 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 " +
          textColor
        }
      >
        {subtitle}
      </p>
    </motion.div>
  );
}
