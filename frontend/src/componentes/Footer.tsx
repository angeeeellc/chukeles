import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="w-full shrink-0 flex justify-center py-8 mt-auto">
      <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-gray-200 flex items-center gap-4 w-max transition-all hover:bg-white hover:shadow-md">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faPaw} className="text-white w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Chukeles</h2>
        </Link>
        
        <span className="w-px h-6 bg-gray-300"></span>
        
        <Link to="/quienes-somos" className="text-sm font-bold text-gray-600 hover:text-forest-green transition-colors">
          Quiénes Somos
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
