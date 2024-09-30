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
    <div className="text-ivory bg-richer_black">
      {/* SupDoc */}
      <div className="h-screen">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="h-full flex justify-center flex-col"
        >
          <motion.div
            variants={item}
            className="w-fit mx-auto h-1/3 aspect-square"
          >
            <img className="aspect-square" src="/icon.png" />
          </motion.div>
          <motion.p
            variants={item}
            className="text-7xl sm:text-8xl mx-auto font-bold"
          >
            SupDoc
          </motion.p>
          <motion.p
            variants={item}
            className="text-lg sm:text-xl mx-auto mt-6 text-center max-w-2xl px-4"
          >
            “SupDoc, Racionalizando* tu camino a la salud”
          </motion.p>
          <motion.p
            variants={item}
            className="text-powder_blue font-semibold text-lg mx-auto mt-4"
          >
            {Localizations.construction}
          </motion.p>
        </motion.div>
      </div>

      {/* Sección 1 */}
      <div className="h-screen bg-gray-900">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="h-full flex items-center justify-center"
        >
          <motion.div
            variants={item}
            className="flex items-center w-full max-w-4xl mx-auto"
          >
            {/* Imagen */}
            <div className="w-1/2 flex justify-center">
              <img className="aspect-square w-1/2" src="/icon.png" />
            </div>

            {/* texto */}
            <div className="w-1/2 text-right ml-4">
              <motion.p
                variants={item}
                className="text-7xl sm:text-4xl font-bold text-center my-8"
              >
                La saturación de consultas en Colombia
              </motion.p>
              <motion.p
                variants={item}
                className="text-lg sm:text-xl mt-4 text-justify text-center max-w-2xl mx-auto"
              >
                SupDoc is a healthcare app designed to reduce the overload in specialist consultations and healthcare services. It provides a simple, reliable, and secure platform, allowing users to receive virtual medical attention completely anonymously. SupDoc ensures effective communication between patients and specialists, delivering accurate and professional responses at all times.
              </motion.p>
              {/* Asterisco */}
              <span className="text-gray-400 text-lg block text-center mt-2">
                * Las quejas ante la Superintendencia de Salud han incrementado hasta en un 12% en el último año.
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Sección 2*/}
      <div className="h-screen bg-gray-800">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="h-full flex items-center justify-center"
        >
          <motion.div
            variants={item}
            className="w-full max-w-4xl mx-auto"
          >
            <motion.p
              variants={item}
              className="text-7xl sm:text-4xl font-bold text-center my-8"
            >
              La plena pelao
            </motion.p>
            <div className="bg-gray-700 p-4 rounded-lg">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-gray-600 text-left text-lg font-semibold text-gray-300 px-4 py-2 text-center">
                      Problemas de EPS
                    </th>
                    <th className="border-b border-gray-600 text-left text-lg font-semibold text-gray-300 px-4 py-2 text-center">
                      Soluciones de SupDoc
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-600 text-center">
                    <td className="px-4 py-2 text-gray-200">
                      Largas esperas para citas.
                    </td>
                    <td className="px-4 py-2 text-gray-200">
                      Atención médica virtual inmediata.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-600 text-center">
                    <td className="px-4 py-2 text-gray-200">
                      Limitaciones en el acceso a especialistas.
                    </td>
                    <td className="px-4 py-2 text-gray-200">
                      Conexiones directas con médicos especializados.
                    </td>
                  </tr>
                  <tr className="border-b border-gray-600 text-center">
                    <td className="px-4 py-2 text-gray-200">
                      Falta de seguimiento y comunicación.
                    </td>
                    <td className="px-4 py-2 text-gray-200">
                      Plataforma segura para la comunicación constante.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
