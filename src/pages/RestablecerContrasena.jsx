import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import logoAnimado from "../assets/Logo CC.png";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function RestablecerContrasena() {
  const navigate = useNavigate();
  const { actualizarPassword, cerrarSesion } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargandoEnlace, setCargandoEnlace] = useState(true);
  const [enlaceValido, setEnlaceValido] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function comprobarEnlace() {
      const { data } = await supabase.auth.getSession();
      if (activo) {
        setEnlaceValido(Boolean(data.session));
        setCargandoEnlace(false);
      }
    }

    comprobarEnlace();
    return () => { activo = false; };
  }, []);

  async function manejarCambio(event) {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      setGuardando(true);
      await actualizarPassword(password);
      await cerrarSesion();
      toast.success("Contraseña actualizada correctamente.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      toast.error("El enlace no es válido o expiró. Solicita uno nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#e2e8f0_38%,_#dfe7ef_100%)] px-4 py-6 sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:px-8" style={{ maxWidth: "420px" }}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-[0_16px_40px_rgba(37,99,235,0.3)] ring-4 ring-blue-100">
          <img src={logoAnimado} alt="Logo de PRO TEMPLO" className="login-logo h-11 w-11 object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">Nueva contraseña</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Crea tu contraseña</h1>
        </div>

        {cargandoEnlace ? (
          <p className="mt-7 text-center text-sm text-slate-500">Verificando enlace...</p>
        ) : enlaceValido ? (
          <form onSubmit={manejarCambio} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Nueva contraseña</label>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Confirmar contraseña</label>
              <input type="password" value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} autoComplete="new-password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>
            <button type="submit" disabled={guardando} className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(37,99,235,0.35)] transition hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70">
              {guardando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        ) : (
          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm leading-6 text-amber-800">
            Este enlace es inválido o expiró. Solicita un nuevo enlace de recuperación.
          </div>
        )}

        <Link to={enlaceValido ? "/login" : "/olvide-contrasena"} className="mt-6 block text-center text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline">
          {enlaceValido ? "Volver a iniciar sesión" : "Solicitar nuevo enlace"}
        </Link>
      </div>
    </div>
  );
}

export default RestablecerContrasena;
