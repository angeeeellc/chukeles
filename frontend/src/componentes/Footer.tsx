import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-forest-green text-white/90 py-8 shrink-0 border-t border-green-800 w-full mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faPaw} className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Chukeles</h2>
            <p className="text-xs font-medium opacity-80">La red social canina</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-bold">
          <Link to="/quienes-somos" className="hover:text-green-300 transition-colors underline decoration-white/30 underline-offset-4">
            Quiénes Somos
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
