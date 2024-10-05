import { motion } from "framer-motion";
import "react-slideshow-image/dist/styles.css";
import { Localizations } from "../utils/Localizations";
import { Link } from "react-scroll";
import Person from "../components/PersonSection";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 75 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75 } },
  };

  return (
    <div className="text-ivory bg-richer_black">
      {/* SupDoc */}
      <div
        id="home"
        className="h-screen bg-gradient-to-b from-richer_black to-richer_black from-80%"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="h-screen flex pt-4 flex-col "
        >
          <motion.div variants={item} className="mx-auto w-full md:w-1/2">
            <img className="" src="/img/banner.png" />
          </motion.div>
          <div className="flex md:flex-row flex-col-reverse w-full justify-center">
            <div className="w-full mt-24 md:mt-0 md:w-1/2">
              <motion.img
                variants={item}
                className="mx-auto md:ml-auto animate animate-slowBounce"
                src="/img/splash-fade.png"
              />
            </div>
            <div className="flex flex-col md:pt-36 w-full md:w-1/2 gap-y-8">
              <motion.p
                variants={item}
                className="text-3xl text-ivory w-9/12 mx-auto md:w-96 font-bold text-center md:text-left md:mr-auto md:ml-0 mt-6 max-w-2xl"
              >
                {Localizations.simplificando}
              </motion.p>
              <motion.div
                className="mx-auto md:ml-0  md:mr-auto"
                variants={item}
              >
                <Link
                  className="text-lg bg-midnight_green font-semibold text-center text-ivory hover:bg-oxforder_blue w-64 hover:text-ivory hover:cursor-pointer transition-all duration-300 p-2 px-4 rounded-xl"
                  to="about"
                  spy={true}
                  smooth={true}
                  duration={500}
                >
                  {Localizations.conoceProyecto}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sección 1 */}
      <div
        className="h-screen w-full pt-8 md:pt-0 bg-gradient-to-b from-richer_black to-richer_black from-70%"
        id="about"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          className="h-full w-full flex md:flex-row flex-col items-center justify-center"
        >
          {/* Imagen */}
          <div className="w-full md:w-1/2 flex flex-col gap-y-4">
            {/* dato */}
            <motion.p
              variants={item}
              initial="hidden"
              whileInView="visible"
              className="text-powder_blue w-11/12 mx-auto font-bold text-4xl block text-center md:text-right mt-20"
            >
              {Localizations.medicinaPreventiva}
            </motion.p>
            <motion.p
              variants={item}
              initial="hidden"
              whileInView="visible"
              className="text-ivory/80 text-center md:text-right mx-auto text-lg w-11/12"
            >
              {Localizations.supdocDescripcion}
            </motion.p>
          </div>
          {/* texto */}
          <div className="w-full md:w-1/2 ">
            <motion.img
              variants={item}
              initial="hidden"
              whileInView="visible"
              className="ml-auto mt-24 md:mx-auto md:mt-0"
              src="/img/home-fade.png"
            />
          </div>
        </motion.div>
      </div>

      {/* ADVANCES */}
      <div
        className="h-screen w-full pt-8 md:pt-0 bg-gradient-to-b from-richer_black to-richer_black from-70%"
        id="advances"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          className="h-full w-full flex flex-col "
        >
          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            className="text-6xl text-center font-bold mb-8"
          >
            Our Advances
          </motion.p>
          <iframe
            className="mx-auto w-full max-w-2xl aspect-video"
            src="https://www.youtube.com/embed/H6nWI9z4lnE?si=WSRLelSqRji_mwoc"
            title="SupDoc"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </motion.div>
      </div>
      {/* TEAM */}
      <div
        className="w-full pt-8 md:pt-0 bg-gradient-to-b from-richer_black to-richer_black from-70%"
        id="team"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          className="h-full w-full flex flex-col justify-center"
        >
          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            className="text-3xl text-ivory/60 text-center font-bold"
          >
            Conoce al equipo detras de esto
          </motion.p>
          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            className="text-6xl text-center font-bold mb-8"
          >
            Los Mayores Insociables
          </motion.p>
        </motion.div>
        <div className="gap-y-4 flex flex-col">
          <Person
            name="Nathan Alspaugh"
            delay={0.25}
            role="Programmer"
            github="https://github.com/notaroomba"
            image="/img/team/alspaugh.png"
            insta="https://www.instagram.com/notaroomba"
            quote="Lo que fue fue y lo que no se quedo"
          />
          <Person
            name="Valeria Quintero"
            rotate
            delay={0.25}
            role="Video Director"
            image="/img/team/quintero.png"
            insta="https://www.instagram.com/valequintero_j"
            quote="Roger That"
          />
          <Person
            name="Samuel Correa"
            delay={0.25}
            role="Programmer"
            github="https://github.com/SupSJC"
            image="/img/team/correa.png"
            insta="https://www.instagram.com/samuel_corr_"
            quote="tu juraste"
          />
          <Person
            name="Gabriela Cortes"
            delay={0.25}
            rotate
            role="Graphic Designer"
            image="/img/team/cortes.png"
            insta="https://www.instagram.com/gabycortessss"
            quote="joa no te tocaba"
          />
          <Person
            name="Juan Pablo Sojo"
            delay={0.25}
            role="Programmer"
            github="https://github.com/Sojoooo"
            image="/img/team/sojo.png"
            insta="https://www.instagram.com/sojoo_oooo"
            quote="pero es dibertido😢"
          />
        </div>
      </div>
      {/* FOOTER */}
      <div className="w-full bg-richer_black/80 px-8">
        <div className="md:w-7/12 mx-auto justify-center py-10">
          <div className="flex flex-row">
            <div className="justify-center mx-auto">
              <p className="mb-2 font-bold text-4xl">SupDoc</p>{" "}
              {/* Static Text */}
              <p className="text-ivory">Barranquilla, Colombia</p>{" "}
              {/* Static Text */}
              <p className="text-ivory">Los Mayores Insociables</p>{" "}
              {/* Static Text */}
              <br />
              <a
                href="mailto:supdoc.ips@gmail.com"
                className="my-9 underline text-ivory"
              >
                supdoc.ips@gmail.com
              </a>
              <br />
              <a
                href="https://github.com/NotARoomba/SupDoc"
                className="my-9 underline text-ivory"
              >
                GitHub
              </a>
              <br />
              <a
                href="https://supdoc.org/policy_es.pdf"
                className="my-9 underline text-ivory"
              >
                {Localizations.politica}
              </a>
            </div>
            <div className="justify-left mx-auto text-ivory">
              <p className="text-2xl">{Localizations.enlaces}</p>
              <Link
                className="cursor-pointer underline"
                activeClass="active"
                to="home"
                href="#home"
                spy={true}
                smooth={true}
                duration={500}
              >
                {Localizations.inicio}
              </Link>
              <br />
              <Link
                className="cursor-pointer underline"
                activeClass="active"
                to="about"
                href="#about"
                spy={true}
                smooth={true}
                duration={500}
              >
                {Localizations.mision}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
