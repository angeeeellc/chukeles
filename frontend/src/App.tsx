import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <div className="h-screen w-screen bg-white flex flex-col overflow-hidden">
        {/* Navbar */}
        <nav className="bg-forest-green h-16 flex items-center shadow-md z-50 w-full shrink-0">
          <div className="w-full px-4 md:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="bg-white p-1.5 rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white tracking-tight">Chukeles</h1>
                <p className="text-[10px] text-green-100 font-medium uppercase tracking-widest -mt-1">A Coruña</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <a href="#" className="px-4 py-2 text-white bg-white/20 rounded-full text-sm font-semibold transition-all">Mapa</a>
              <a href="#" className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-semibold transition-all">Eventos</a>
              <a href="#" className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-semibold transition-all">Tablón</a>
              <a href="#" className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-sm font-semibold transition-all">Tienda</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:block text-white/90 text-sm font-medium hover:text-white">Explorar</button>
              <button className="bg-white text-forest-green px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all">
                Acceder
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden w-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
