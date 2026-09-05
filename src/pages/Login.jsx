import { useState } from "react";

import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import logoAnimado from "../assets/Logo CC.png";
import { useAuth } from "../context/AuthContext";

const getHomeRouteByRole = (rol) => {
  switch (rol) {
    case "Administrador":
      return "/gestion-iglesia";
    case "Tesorero":
    case "Miembro":
      return "/";
    default:
      return "/";
  }
};

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

      const perfilActual = await iniciarSesion(
        email,
        password
      );

      const destino = getHomeRouteByRole(
        perfilActual?.rol || "Miembro"
      );

      toast.success(
        "Inicio de sesión exitoso."
      );

      navigate(destino, {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#e2e8f0_38%,_#dfe7ef_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.18),_transparent_28%)]" />
            <div className="relative z-10">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                  <img src={logoAnimado} alt="Logo de PRO TEMPLO" className="login-logo h-9 w-9 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">Plataforma</p>
                  <h1 className="text-xl font-black tracking-tight">PRO TEMPLO</h1>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">Sistema administrativo</p>
                <h2 className="mt-4 max-w-md text-3xl font-black leading-tight sm:text-4xl">
                  Bienvenido a tu centro de gestión.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                  Administra miembros, finanzas, reportes y operación pastoral desde una sola plataforma.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { title: "Miembros", text: "Control y seguimiento", icon: "👥" },
                  { title: "Finanzas", text: "Ingresos y egresos", icon: "💰" },
                  { title: "Iglesia", text: "Células y ministerios", icon: "⛪" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <div className="mb-2 text-2xl">{item.icon}</div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-300">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-[0_20px_60px_rgba(37,99,235,0.35)] ring-4 ring-blue-100">
              <img src={logoAnimado} alt="Logo de PRO TEMPLO" className="login-logo h-14 w-14 object-contain" />
            </div>

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">Acceso</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900">Iniciar sesión</h2>
              <p className="mt-2 text-sm text-slate-500">Ingresa tus credenciales para continuar.</p>
            </div>

            <form onSubmit={manejarLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                  >
                    {mostrarPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(37,99,235,0.35)] transition hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
              PRO TEMPLO · Sistema administrativo y financiero
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Login;