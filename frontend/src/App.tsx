import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col w-full">
        {/* Navbar */}
        <nav className="bg-forest-green h-16 flex items-center shadow-md z-10 w-full px-8">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐶</span>
              <div>
                <h1 className="text-xl font-bold text-white leading-none">Chukeles</h1>
                <p className="text-[10px] text-green-100 font-medium tracking-tight">A Coruña con tu perro</p>
              </div>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-white/90">
              <a href="#" className="hover:text-white transition-colors border-b-2 border-white pb-0.5">Mapa</a>
              <a href="#" className="hover:text-white transition-colors">Eventos</a>
              <a href="#" className="hover:text-white transition-colors">Tablón</a>
              <a href="#" className="hover:text-white transition-colors">Market</a>
            </div>
            <button className="bg-ocean-blue text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg hover:bg-blue-800 transition-all">
              Entrar
            </button>
          </div>
        </nav>

        {/* Routes */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Future routes will go here */}
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
