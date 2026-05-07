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
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h1 className="text-xl font-bold text-white leading-none">Chukeles</h1>
                <p className="text-[10px] text-green-100 font-medium tracking-tight">A Coruña con tu mascota</p>
              </div>
            </div>
            <div className="hidden md:flex gap-1 text-sm font-medium">
              <a href="#" className="px-3 py-1.5 text-white bg-white/20 rounded-lg transition-all shadow-inner">Mapa</a>
              <a href="#" className="px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">Eventos</a>
              <a href="#" className="px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">Tablón</a>
              <a href="#" className="px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">Tienda</a>
            </div>
            <button className="bg-white text-black px-5 py-1.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-100 transition-all">
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
