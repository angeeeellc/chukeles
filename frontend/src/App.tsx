import { BrowserRouter as Router, Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom'
import Inicio from './pages/Inicio'
import DetalleLugar from './pages/DetalleLugar'
import Eventos from './pages/Eventos'
import TablonAnuncios from './pages/TablonAnuncios'
import Mercado from './pages/Mercado'
import IniciarSesion from './pages/auth/IniciarSesion'
import Registro from './pages/auth/Registro'
import PanelAdministrador from './pages/admin/PanelAdministrador'
import QuienesSomos from './pages/QuienesSomos'
import NoEncontrado from './pages/NoEncontrado'
import ContenedorNotificaciones from './components/Notificacion'
import { useUserStore } from './store/storeUsuario'
import { useUiStore } from './store/storeUi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faBars, faXmark, faCog, faMap, faDog, faClipboardList, faStore, faHandSparkles } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
const Navbar = () => {
  const { isAuthenticated, user, logout } = useUserStore()
  const { addToast } = useUiStore()
  const navigate = useNavigate()
  const [menuMovil, setMenuMovil] = useState(false)

  const handleLogout = () => {
    logout()
    addToast('Sesión cerrada correctamente.', 'info')
    navigate('/')
    setMenuMovil(false)
  }

  // Clase activa/inactiva para los NavLinks del navbar
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition-all ${
      isActive
        ? 'bg-white text-forest-green shadow-sm'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`

  const navLinkMobilClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive ? 'bg-white text-forest-green' : 'text-white/80 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav className="bg-forest-green h-16 flex items-center shadow-md z-50 w-full shrink-0 relative">
      <div className="w-full px-4 md:px-8 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group" onClick={() => setMenuMovil(false)}>
          <img 
            src="/logo-white-clean.png" 
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200 relative -top-[1px]" 
            alt="Chukeles Logo" 
          />
          <div className="block">
            <h1 className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-green-100 transition-colors duration-200">Chukeles</h1>
            <p className="text-[10px] text-green-100 font-medium uppercase tracking-widest">A Coruña</p>
          </div>
        </Link>

        {/* Links de navegación — desktop */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/"       end className={navLinkClass}>Mapa</NavLink>
          <NavLink to="/eventos"     className={navLinkClass}>Eventos</NavLink>
          <NavLink to="/tablon"      className={navLinkClass}>Anuncios</NavLink>
          <NavLink to="/mercado"     className={navLinkClass}>Tienda</NavLink>
        </div>

        {/* Auth zone — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'ROL_ADMIN' && (
                <NavLink
                  to="/admin"
                  className="flex items-center gap-1.5 mr-1 px-4 py-2 rounded-full text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
                >
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4" /> Admin
                </NavLink>
              )}
              <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium truncate max-w-32">
                Hola, {user?.name?.split(' ')[0] || 'Usuario'} <FontAwesomeIcon icon={faHandSparkles} className="w-4 h-4" />
              </span>
              <button
                id="navbar-logout"
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-white/10 text-white/90 hover:bg-white/20
                           px-4 py-2 rounded-full text-sm font-semibold transition-all"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-3.5 h-3.5" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/registro"
                className="text-white/90 text-sm font-medium hover:text-white transition-colors"
              >
                Registro
              </Link>
              <Link
                to="/iniciar-sesion"
                id="navbar-login"
                className="bg-white text-forest-green px-6 py-2 rounded-full text-sm font-bold
                           shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                Acceder
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — móvil */}
        <button
          id="navbar-menu-toggle"
          onClick={() => setMenuMovil(!menuMovil)}
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Menú"
        >
          {menuMovil ? <FontAwesomeIcon icon={faXmark} className="w-5 h-5" /> : <FontAwesomeIcon icon={faBars} className="w-5 h-5" />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuMovil && (
        <div className="absolute top-16 left-0 right-0 bg-forest-green border-t border-white/10
                        shadow-xl z-40 p-4 flex flex-col gap-1 md:hidden">
          <NavLink to="/"       end className={navLinkMobilClass} onClick={() => setMenuMovil(false)}><FontAwesomeIcon icon={faMap} className="inline w-4 h-4 mr-2" />Mapa</NavLink>
          <NavLink to="/eventos"     className={navLinkMobilClass} onClick={() => setMenuMovil(false)}><FontAwesomeIcon icon={faDog} className="inline w-4 h-4 mr-2" />Eventos</NavLink>
          <NavLink to="/tablon"      className={navLinkMobilClass} onClick={() => setMenuMovil(false)}><FontAwesomeIcon icon={faClipboardList} className="inline w-4 h-4 mr-2" />Anuncios</NavLink>
          <NavLink to="/mercado"     className={navLinkMobilClass} onClick={() => setMenuMovil(false)}><FontAwesomeIcon icon={faStore} className="inline w-4 h-4 mr-2" />Tienda</NavLink>

          <div className="border-t border-white/10 my-2" />

          {isAuthenticated ? (
            <>
              {user?.role === 'ROL_ADMIN' && (
                <NavLink
                  to="/admin"
                  className={`flex items-center gap-2 ${navLinkMobilClass({isActive: false})}`}
                  onClick={() => setMenuMovil(false)}
                >
                  <FontAwesomeIcon icon={faCog} className="w-4 h-4" /> Consola Admin
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
                           text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/registro" className={navLinkMobilClass} onClick={() => setMenuMovil(false)}>Registro</NavLink>
              <NavLink to="/iniciar-sesion"    className={navLinkMobilClass} onClick={() => setMenuMovil(false)}>Acceder</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
function App() {
  return (
    <Router>
      <div className="h-[100dvh] w-screen bg-gray-50 flex flex-col overflow-hidden">
        <Navbar />

        {/* Contenido de rutas */}
        <main className="flex-1 flex flex-col overflow-hidden w-full relative">
          <Routes>
            <Route path="/"          element={<Inicio />} />
            <Route path="/place/:id" element={<DetalleLugar />} />
            <Route path="/eventos"    element={<Eventos />} />
            <Route path="/tablon"     element={<TablonAnuncios />} />
            <Route path="/mercado"    element={<Mercado />} />
            <Route path="/iniciar-sesion"     element={<IniciarSesion />} />
            <Route path="/registro"  element={<Registro />} />
            <Route path="/admin/*"   element={<PanelAdministrador />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            {/* 404 */}
            <Route path="*"          element={<NoEncontrado />} />
          </Routes>
        </main>

        {/* Toast notifications — globales */}
        <ContenedorNotificaciones />
      </div>
    </Router>
  )
}

export default App
