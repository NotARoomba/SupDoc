import { motion } from "framer-motion";
import { PersonSectionProps } from "../utils/Types";

export default function PersonSection({
  name,
  role,
  image,
  quote,
  github,
  insta,
  linkedin,
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
          "w-11/12 md:w-9/12 lg:w-8/12 hover:-translate-y-1 transition-all justify-center duration-300 hover:shadow-midnight_green hover:shadow-md md:h-64 rounded-xl md:justify-start gap-x-8 mx-auto relative md:flex flex-col z-20 outline outline-powder_blue/10 overflow-hidden p-4 " +
          (rotate
            ? "md:flex-row-reverse flex-col  hover:translate-x-1"
            : "md:flex-row flex-col  hover:-translate-x-1")
        }
      >
        <img
          src={image}
          className="rounded-xl -z-20 mx-auto md:m-0 aspect-square h-56"
        />
        <div className="flex flex-col">
          <p
            className={
              " font-bold text-3xl lg:text-4xl xl:text-5xl w-full    z-30 text-center " +
              (rotate ? "md:text-right" : "md:text-left")
            }
          >
            {name}
          </p>
          <p
            className={
              "text-md w-full mt-2 text-powder_blue font-medium text-2xl lg:text-3xl xl:text-4xl px-2 text-center " +
              (rotate ? "md:text-right" : "md:text-left")
            }
          >
            {role}
          </p>
          <div className=" bg-powder_blue/10 my-4  w-full h-1 rounded-full" />
          <p
            className={
              "italic text-lg text-center " +
              (rotate ? "md:text-right" : "md:text-left")
            }
          >
            "{quote}"
          </p>
          <div
            className={
              "flex gap-x-8 mx-auto md:m-0 " +
              (rotate ? "flex-row-reverse" : "flex-row")
            }
          >
            {linkedin && (
              <a
                href={linkedin}
                className=" h-12 font-bold text-xl  z-30  transition-all duration-500 rounded-full justify-center"
              >
                <i
                  className={
                    "bx bx-md text-ivory bxl-linkedin justify-center  my-1.5"
                  }
                />
              </a>
            )}
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
