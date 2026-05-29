import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUserPlus, faDog } from '@fortawesome/free-solid-svg-icons';
import { registrarApi } from '../../servicios/servicioAutenticacion';
import { useUserStore } from '../../estado/estadoUsuario';
import { useUiStore } from '../../estado/estadoUi';

const Registro = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const { addToast } = useUiStore();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      addToast('Por favor, rellena todos los campos.', 'info');
      return;
    }
    if (password.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres.', 'info');
      return;
    }

    setCargando(true);
    try {
      const resp = await registrarApi(nombre, email, password);
      login({ id: resp.id, email: resp.email, name: resp.nombre, role: resp.rol }, resp.token);
      addToast(`¡Bienvenido a Chukeles, ${resp.nombre}!`, 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.status === 409
        ? 'Ya existe una cuenta con ese email.'
        : 'Error al registrarse. Inténtalo de nuevo.';
      addToast(msg, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 h-full bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-green rounded-2xl mb-4 shadow-lg">
              <FontAwesomeIcon icon={faDog} className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Únete a Chukeles</h1>
            <p className="text-sm text-gray-500 mt-1">Gratis para siempre • A Coruña con tu perro</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-nombre" className="text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <input
                id="register-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent
                           transition-all placeholder-gray-400"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent
                           transition-all placeholder-gray-400"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="text-sm font-semibold text-gray-700">
                Contraseña
                <span className="text-gray-400 font-normal ml-1">(mín. 6 caracteres)</span>
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Elige una contraseña"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent
                             transition-all placeholder-gray-400"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FontAwesomeIcon icon={faEyeSlash} className="w-4 h-4" /> : <FontAwesomeIcon icon={faEye} className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 bg-forest-green text-white py-3.5 rounded-xl
                         font-bold text-sm shadow-lg hover:bg-green-700 active:scale-[0.98]
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {cargando ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
              )}
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/iniciar-sesion" className="text-forest-green font-semibold hover:underline">
              Accede aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
