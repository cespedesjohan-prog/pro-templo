import { useState } from "react";

import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import logoAnimado from "../assets/Logo CC.png";
import { useAuth } from "../context/AuthContext";

function OlvideContrasena() {
  const { solicitarRestablecimiento } = useAuth();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function manejarEnvio(event) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Ingresa tu correo electrónico.");
      return;
    }

    try {
      setEnviando(true);
      await solicitarRestablecimiento(
        email,
        `${window.location.origin}/restablecer-contrasena`
      );
      setEnviado(true);
      toast.success("Revisa tu correo para continuar.");
    } catch (error) {
      console.error("Error solicitando recuperación:", error);
      toast.error("No fue posible enviar el correo. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#e2e8f0_38%,_#dfe7ef_100%)] px-4 py-6 sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:px-8" style={{ maxWidth: "420px" }}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-[0_16px_40px_rgba(37,99,235,0.3)] ring-4 ring-blue-100">
          <img src={logoAnimado} alt="Logo de PRO TEMPLO" className="login-logo h-11 w-11 object-contain" />
        </div>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">Recuperar acceso</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">¿Olvidaste tu contraseña?</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        {enviado ? (
          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm leading-6 text-emerald-800">
            Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un correo con las instrucciones. Revisa también la carpeta de spam.
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(37,99,235,0.35)] transition hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {enviando ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}

export default OlvideContrasena;
