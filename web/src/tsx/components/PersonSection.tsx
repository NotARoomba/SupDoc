import { motion } from "framer-motion";
import { PersonSectionProps } from "../utils/Types";

export default function PersonSection({
  name,
  role,
  image,
  quote,
  github,
  insta,
  rotate = false,
  delay,
}: PersonSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 75 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 1, delay, ease: "easeInOut" },
      }}
    >
      <div
        className={
          "w-8/12 hover:-translate-y-1 transition-all duration-300 hover:shadow-midnight_green hover:shadow-md h-64 rounded-xl justify-start gap-x-8 mx-auto relative flex z-20 outline outline-powder_blue/10 overflow-hidden p-4 " +
          (rotate
            ? "flex-row-reverse  hover:translate-x-1"
            : "flex-row  hover:-translate-x-1")
        }
      >
        <img src={image} className="rounded-xl -z-20 aspect-square h-56" />
        <div className="flex flex-col">
          <p
            className={
              " font-bold text-xl xl:text-5xl w-full    z-30 " +
              (rotate ? "text-right" : "text-left")
            }
          >
            {name}
          </p>
          <p
            className={
              "text-md w-full mt-2 text-powder_blue font-medium xl:text-4xl px-2 " +
              (rotate ? "text-right" : "text-left")
            }
          >
            {role}
          </p>
          <div className=" bg-powder_blue/10 my-4  w-full h-1 rounded-full" />
          <p
            className={
              "italic text-lg " + (rotate ? "text-right" : "text-left")
            }
          >
            "{quote}"
          </p>
          <div
            className={
              "flex gap-x-8 " + (rotate ? "flex-row-reverse" : "flex-row")
            }
          >
            {github && (
              <a
                href={github}
                className=" h-12 font-bold text-xl  z-30  transition-all duration-500 rounded-full justify-center"
              >
                <i
                  className={
                    "bx bx-md text-ivory bxl-github justify-center  my-1.5"
                  }
                />
              </a>
            )}
            <a
              href={insta}
              className=" h-12 font-bold text-xl  z-30  transition-all duration-500 rounded-full justify-center"
            >
              <i
                className={
                  "bx bx-md text-ivory bxl-instagram justify-center  my-1.5"
                }
              />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
