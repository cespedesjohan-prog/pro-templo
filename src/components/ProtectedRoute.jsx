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

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md">

          <div className="text-4xl mb-4">
            🔒
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            Perfil no encontrado
          </h1>

          <p className="mt-2 text-gray-500">
            Su usuario está autenticado, pero no tiene
            un perfil configurado en el sistema.
          </p>

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