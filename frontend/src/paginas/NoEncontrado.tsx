import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faHome, faDog } from '@fortawesome/free-solid-svg-icons';

const NoEncontrado = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full px-6 py-16 bg-gray-50">
      <div className="text-center max-w-md">
        {/* Dog emoji illustration */}
        <FontAwesomeIcon icon={faPaw} className="w-24 h-24 text-forest-green mx-auto mb-6 select-none animate-bounce" />

        {/* 404 */}
        <h1 className="text-7xl font-black text-forest-green mb-2 tracking-tighter">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          ¡Ups! Esta página se ha escapado
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Parece que la página que buscas no existe o ha sido movida.
          <br />
          No te preocupes, tu perro tampoco la encuentra.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-forest-green text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg
                       hover:bg-green-700 active:scale-95 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faHome} className="w-4 h-4 inline mr-1" /> Volver al inicio
          </Link>
          <Link
            to="/eventos"
            className="bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-full font-bold text-sm
                       hover:border-forest-green hover:text-forest-green transition-all duration-200"
          >
            <FontAwesomeIcon icon={faDog} className="w-4 h-4 inline mr-1" /> Ver eventos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoEncontrado;
