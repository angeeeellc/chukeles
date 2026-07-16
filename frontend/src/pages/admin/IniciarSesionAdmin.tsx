import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faShieldHalved, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { loginApi } from '../../services/servicioAutenticacion';
import { useUserStore } from '../../store/storeUsuario';
import { useUiStore } from '../../store/storeUi';

const IniciarSesionAdmin = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const { addToast } = useUiStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Por favor, introduce tu email y contraseña.', 'info');
      return;
    }

    setCargando(true);
    try {
      const resp = await loginApi(email, password);
      
      // Validación estricta del rol de administrador
      if (resp.rol !== 'ROL_ADMIN') {
        addToast('Acceso denegado. No tienes permisos de administrador.', 'error');
        setCargando(false);
        return;
      }

      // Si rememberMe es true -> localStorage, si no -> sessionStorage
      login(
        { id: resp.id, email: resp.email, name: resp.nombre, role: resp.rol },
        resp.token,
        rememberMe
      );

      addToast(`¡Acceso concedido! Bienvenido al panel de administración, ${resp.nombre}.`, 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg = err.response?.status === 401
        ? 'Credenciales de administrador incorrectas.'
        : 'Error al acceder al panel. Inténtalo de nuevo.';
      addToast(msg, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-slate-900 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 p-8 text-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-900/50">
              <FontAwesomeIcon icon={faShieldHalved} className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Panel Administrativo</h1>
            <p className="text-sm text-emerald-200/60 mt-1 font-medium">Chukeles — Solo personal autorizado</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Correo de Administrador
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chukeles.es"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                           focus:bg-white/10 transition-all placeholder-gray-500"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-sm text-white
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                             focus:bg-white/10 transition-all placeholder-gray-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FontAwesomeIcon icon={faEyeSlash} className="w-4 h-4" /> : <FontAwesomeIcon icon={faEye} className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 my-1">
              <input
                type="checkbox"
                id="admin-remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-white/5 border-white/10 focus:ring-emerald-500
                           focus:ring-offset-gray-900 cursor-pointer"
              />
              <label htmlFor="admin-remember" className="text-xs font-semibold text-gray-300 select-none cursor-pointer">
                Mantener sesión iniciada (para este dispositivo)
              </label>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 
                         text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-950/40
                         hover:brightness-110 active:scale-[0.98] transition-all duration-200 
                         disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {cargando ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faRightToBracket} className="w-4 h-4" />
              )}
              {cargando ? 'Accediendo de forma segura...' : 'Iniciar Sesión Segura'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors hover:underline"
            >
              ← Volver al sitio público
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IniciarSesionAdmin;
