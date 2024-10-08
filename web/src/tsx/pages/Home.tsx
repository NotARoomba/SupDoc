import { motion } from "framer-motion";
import { Link } from "react-scroll";
import "react-slideshow-image/dist/styles.css";
import AdvancementCard from "../components/AdvancementCard";
import Person from "../components/PersonSection";
import { Localizations } from "../utils/Localizations";

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
            <img className="" src="/img/banner.png" alt="Banner" />
          </motion.div>
          <div className="flex md:flex-row flex-col-reverse w-full justify-center">
            <div className="w-full mt-24 md:mt-0 md:w-1/2">
              <motion.img
                variants={item}
                className="mx-auto md:ml-auto animate animate-slowBounce"
                src="/img/splash-fade.png"
                alt="Splash"
              />
            </div>
            <div className="flex flex-col md:pt-36 w-full md:w-1/2 gap-y-8">
              <motion.p
                variants={item}
                className="text-3xl text-ivory w-9/12 mx-auto md:w-96 font-bold text-center md:text-left md:mr-auto md:ml-0 mt-6 max-w-2xl"
              >
                {Localizations.simplifyingHealth}
              </motion.p>
              <motion.div
                className="mx-auto md:ml-0  md:mr-auto"
                variants={item}
              >
                <Link
                  className="text-lg bg-oxford_blue font-semibold text-center text-ivory hover:bg-oxforder_blue w-64 hover:text-ivory hover:cursor-pointer transition-all duration-300 p-2 px-4 rounded-xl"
                  to="about"
                  spy={true}
                  smooth={true}
                  duration={500}
                >
                  {Localizations.learnMoreProject}
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
              {Localizations.preventiveMedicine}
            </motion.p>
            <motion.p
              variants={item}
              initial="hidden"
              whileInView="visible"
              className="text-ivory/80 text-center md:text-right mx-auto text-lg w-11/12"
            >
              {Localizations.supdocDescription}
            </motion.p>
          </div>
          {/* texto */}
          <div className="w-full md:w-1/2 ">
            <motion.img
              variants={item}
              initial="hidden"
              whileInView="visible"
              className="mt-24 mx-auto md:mt-0"
              src="/img/home-fade.png"
              alt="Home"
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
            {Localizations.advances}
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
          className="h-full w-full flex flex-col justify-center pt-12"
        >
          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            className="text-3xl text-ivory/60 text-center font-bold"
          >
            {Localizations.meetTeam}
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
            role={Localizations.roles.programmer}
            github="https://github.com/notaroomba"
            image="/img/team/alspaugh.png"
            insta="https://www.instagram.com/notaroomba"
            linkedin="https://www.linkedin.com/in/notaroomba"
            quote="de pena se murio un burro en cartagena"
          />
          <Person
            name="Valeria Quintero"
            rotate
            delay={0.25}
            role={Localizations.roles.videoDirector}
            image="/img/team/quintero.png"
            insta="https://www.instagram.com/valequintero_j"
            quote="Roger That"
          />
          <Person
            name="Samuel Correa"
            delay={0.25}
            role={Localizations.roles.programmer}
            github="https://github.com/SupSJC"
            image="/img/team/correa.png"
            insta="https://www.instagram.com/samuel_corr_"
            quote="tu juraste"
          />
          <Person
            name="Gabriela Cortes"
            delay={0.25}
            rotate
            role={Localizations.roles.graphicDesigner}
            image="/img/team/cortes.png"
            insta="https://www.instagram.com/gabycortessss"
            quote="joa no te tocaba"
          />
          <Person
            name="Juan Pablo Sojo"
            delay={0.25}
            role={Localizations.roles.programmer}
            github="https://github.com/Sojoooo"
            image="/img/team/sojo.png"
            insta="https://www.instagram.com/sojoo_oooo"
            quote="pero es dibertido😢"
          />
        </div>
      </div>

      {/* RESOURCES */}
      <div
        className="w-full h-screen mt-4 bg-gradient-to-b from-richer_black to-richer_black from-0%"
        id="resources"
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
            className="text-6xl text-center font-bold mb-8"
          >
            {Localizations.resources}
          </motion.p>
          <div className="flex-row md:flex justify-center mx-auto w-full gap-3 my-8">
            <AdvancementCard
              title="GitHub"
              subtitle=""
              link="https://github.com/NotARoomba/SupDoc"
              imagePath="/img/github.png"
              textColor="text-ivory"
              linkColor="text-ivory"
              bgColor="bg-powder_blue/30"
            />
            <AdvancementCard
              title={Localizations.privacyPolicy}
              subtitle=""
              link={`https://supdoc.org/policy_${Localizations.getLanguage()}.pdf`}
              imagePath="/img/policy.png"
              textColor="text-oxford_blue"
              linkColor="text-oxford_blue"
              bgColor="bg-richer_black/20"
            />
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="w-full bg-richer_black px-8 text-ivory">
        <div className="md:w-7/12 mx-auto justify-center py-10">
          <div className="flex flex-row">
            <div className="justify-center mx-auto">
              <p className="mb-2 font-bold text-4xl">SupDoc</p>
              {/* Static Text */}
              <p className="">Barranquilla, Colombia</p>
              {/* Static Text */}
              <p className="font-bold">Los Mayores Insociables</p>
              {/* Static Text */}
              <br />
              <a href="mailto:supdoc.ips@gmail.com" className="my-9 underline ">
                supdoc.ips@gmail.com
              </a>
              <br />
              <a
                href="https://github.com/NotARoomba/SupDoc"
                className="my-9 underline "
              >
                GitHub
              </a>
              <br />
              <a
                href={`https://supdoc.org/policy_${Localizations.getLanguage()}.pdf`}
                className="my-9 underline "
              >
                {Localizations.privacyPolicy}
              </a>
            </div>
            <div className="justify-left mx-auto ">
              <p className="text-2xl">{Localizations.links}</p>
              <Link
                className="cursor-pointer underline"
                activeClass="active"
                to="home"
                spy={true}
                smooth={true}
                duration={500}
              >
                {Localizations.home}
              </Link>
              <br />
              <Link
                className="cursor-pointer underline"
                activeClass="active"
                to="about"
                spy={true}
                smooth={true}
                duration={500}
              >
                {Localizations.mission}
              </Link>
              <br />
              <Link
                className="cursor-pointer underline"
                activeClass="active"
                to="team"
                spy={true}
                smooth={true}
                duration={500}
              >
                {Localizations.team}
              </Link>
              <br />
              <Link
                className="cursor-pointer underline"
                activeClass="active"
                to="resources"
                spy={true}
                smooth={true}
                duration={500}
              >
                {Localizations.resources}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
