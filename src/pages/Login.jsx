import { useState } from "react";

import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Login() {

  const navigate = useNavigate();

  const {
    iniciarSesion,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [mostrarPassword, setMostrarPassword] =
    useState(false);


  // ======================================
  // INICIAR SESIÓN
  // ======================================

  async function manejarLogin(e) {

    e.preventDefault();

    if (!email.trim()) {

      toast.error(
        "Ingrese su correo electrónico."
      );

      return;

    }

    if (!password) {

      toast.error(
        "Ingrese su contraseña."
      );

      return;

    }

    try {

      setCargando(true);

      await iniciarSesion(
        email,
        password
      );

      toast.success(
        "Inicio de sesión exitoso."
      );

      navigate("/", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "Error iniciando sesión:",
        error
      );

      toast.error(
        "Correo o contraseña incorrectos."
      );

    } finally {

      setCargando(false);

    }

  }


  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* =================================
            ENCABEZADO
        ================================= */}

        <div className="text-center mb-8">

          <div className="mx-auto w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">

            PT

          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">

            PRO TEMPLO

          </h1>

          <p className="mt-2 text-gray-500">

            Sistema de gestión financiera

          </p>

        </div>


        {/* =================================
            FORMULARIO
        ================================= */}

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-800">

            Iniciar sesión

          </h2>

          <p className="mt-2 text-sm text-gray-500">

            Ingrese sus credenciales para continuar.

          </p>


          <form
            onSubmit={manejarLogin}
            className="mt-6 space-y-5"
          >

            {/* Correo */}

            <div>

              <label className="block font-medium mb-2">

                Correo electrónico

              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>


            {/* Contraseña */}

            <div>

              <label className="block font-medium mb-2">

                Contraseña

              </label>

              <div className="relative">

                <input
                  type={
                    mostrarPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(
                      !mostrarPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-800"
                >

                  {mostrarPassword
                    ? "Ocultar"
                    : "Mostrar"}

                </button>

              </div>

            </div>


            {/* Botón */}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {cargando
                ? "Ingresando..."
                : "Iniciar sesión"}

            </button>

          </form>

        </div>


        <p className="text-center text-xs text-gray-400 mt-6">

          PRO TEMPLO · Sistema administrativo

        </p>

      </div>

    </div>

  );

}

export default Login;