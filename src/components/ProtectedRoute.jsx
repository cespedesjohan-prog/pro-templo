import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute({
  children,
  rolesPermitidos = [],
}) {

  const {
    session,
    perfil,
    cargando,
  } = useAuth();


  // ======================================
  // VERIFICANDO SESIÓN / PERFIL
  // ======================================

  if (cargando) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="text-center">

          <div className="text-2xl font-bold text-blue-600">
            PRO TEMPLO
          </div>

          <p className="mt-2 text-gray-500">
            Verificando acceso...
          </p>

        </div>

      </div>

    );

  }


  // ======================================
  // NO HAY SESIÓN
  // ======================================

  if (!session) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  // ======================================
  // SESIÓN EXISTE PERO NO HAY PERFIL
  // ======================================

  if (!perfil) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-[#ececec] px-4">

        <div className="w-full max-w-3xl rounded-[22px] bg-[#f5f5f4] p-8 shadow-[0_8px_18px_rgba(15,23,42,0.06)] ring-1 ring-gray-200 sm:p-10">

          <div className="flex flex-col items-center text-center">

            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#111827] bg-[#facc15] shadow-inner shadow-yellow-200">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-11 w-11 text-[#111827]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" />
              </svg>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#111827] sm:text-5xl">
              Perfil no encontrado
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-[#4b5563]">
              Su usuario está autenticado, pero no tiene un perfil configurado en el sistema.
            </p>

          </div>

        </div>

      </div>

    );

  }


  // ======================================
  // USUARIO INACTIVO
  // ======================================

  if (!perfil.activo) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">

          <div className="text-4xl mb-4">
            🚫
          </div>

          <h1 className="text-xl font-bold text-red-600">
            Usuario inactivo
          </h1>

          <p className="mt-2 text-gray-500">
            Su usuario se encuentra desactivado.
            Comuníquese con el administrador.
          </p>

        </div>

      </div>

    );

  }


  // ======================================
  // VALIDAR ROL
  // ======================================

  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(perfil.rol)
  ) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">

          <div className="text-4xl mb-4">
            🔐
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Acceso denegado
          </h1>

          <p className="mt-2 text-gray-500">
            No tiene permisos para acceder a esta sección.
          </p>

          <p className="mt-4 text-sm text-gray-400">
            Rol actual: {perfil.rol}
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
          >
            Volver
          </button>

        </div>

      </div>

    );

  }


  // ======================================
  // ACCESO AUTORIZADO
  // ======================================

  return children;

}


export default ProtectedRoute;