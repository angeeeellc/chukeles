import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-forest-green text-white/80 py-6 shrink-0 border-t border-green-800">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Chukeles</h2>
          <p className="text-xs font-medium">La red social canina de A Coruña</p>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <Link to="/quienes-somos" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">
            Quiénes Somos
          </Link>
          <a href="mailto:contacto@chukeles.es" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">
            Contacto
          </a>
        </div>
        
        <div className="text-xs flex items-center gap-1.5 opacity-70">
          <span>Desarrollado con</span>
          <FontAwesomeIcon icon={faHeart} className="text-red-400 w-3 h-3" />
          <span>por Ángel Lorenzo Castañeda</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
