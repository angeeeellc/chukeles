import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faCode, faPaw } from '@fortawesome/free-solid-svg-icons';
import Footer from '../componentes/Footer';

const QuienesSomos = () => {
  return (
    <div className="flex-1 w-full overflow-y-auto bg-gray-50 flex flex-col">
      <div className="bg-forest-green py-12 px-4 text-center shrink-0">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex justify-center items-center gap-4">
          <FontAwesomeIcon icon={faPaw} className="text-green-300" />
          Sobre Chukeles
          <FontAwesomeIcon icon={faPaw} className="text-green-300" />
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-gray-700 leading-relaxed text-lg text-center">
          
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <FontAwesomeIcon icon={faGraduationCap} className="w-10 h-10 text-forest-green" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Proyecto de Fin de Ciclo</h2>
          
          <p className="mb-6">
            Esta página web ha sido desarrollada como <strong>Proyecto de Fin de Ciclo (TFG)</strong> para el ciclo superior de <strong>Desarrollo de Aplicaciones Web (DAW)</strong>.
          </p>

          <p className="mb-6 text-xl">
            Desarrollado por: <br/>
            <span className="font-black text-forest-green text-2xl">Ángel Lorenzo Castañeda</span>
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mt-8 border border-gray-100 inline-block text-left mx-auto">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCode} className="text-forest-green" />
              Tecnologías utilizadas
            </h3>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• <strong>Frontend:</strong> React, TypeScript, Tailwind CSS, Vite</li>
              <li>• <strong>Backend:</strong> Java, Spring Boot, MySQL</li>
              <li>• <strong>Despliegue:</strong> Docker, Sliplane</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 mt-6 border border-amber-200 text-left w-full">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-base">
              <FontAwesomeIcon icon={faPaw} className="text-amber-500" />
              Aviso sobre el contenido
            </h3>
            <ul className="text-sm space-y-2 text-amber-700">
              <li>✅ <strong>Los lugares del mapa</strong> son establecimientos y espacios <strong>reales</strong> de A Coruña verificados manualmente.</li>
              <li>⚠️ <strong>Los anuncios del tablón, los productos de la tienda y las quedadas</strong> son contenido de <strong>prueba</strong> generado para demostrar las funcionalidades de la aplicación y no corresponden a ofertas o eventos reales.</li>
            </ul>
          </div>


        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuienesSomos;
