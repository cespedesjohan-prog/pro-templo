import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { perfil, cerrarSesion } = useAuth();

  const location = useLocation();

  const rol = perfil?.rol;

  // ======================================
  // DETECTAR SISTEMA ACTIVO
  // ======================================

  const estaEnGestionIglesia =
    location.pathname.startsWith("/gestion-iglesia");

  const estaEnProTemplo =
    !estaEnGestionIglesia;

  // ======================================
  // MENÚ PRO TEMPLO
  // ======================================

  const menuProTemplo = [
    {
      nombre: "Dashboard",
      ruta: "/dashboard",
      icono: "🏠",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: "Miembros",
      ruta: "/miembros",
      icono: "👥",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: rol === "Miembro" ? "Mis aportes" : "Aportes",
      ruta: "/aportes",
      icono: "💰",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: "Proyectos",
      ruta: "/proyectos",
      icono: "🏗️",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: "Reportes",
      ruta: "/reportes",
      icono: "📊",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: "Pagos Préstamo",
      ruta: "/pagos-prestamo",
      icono: "🏦",
      roles: ["Administrador", "Tesorero"],
    },
    {
      nombre: "Parámetros",
      ruta: "/parametros-financieros",
      icono: "⚙️",
      roles: ["Administrador"],
    },
  ];

  // ======================================
  // MENÚ GESTIÓN IGLESIA
  // ======================================

  const menuGestionIglesia = [
    {
     nombre: "Dashboard Iglesia",
      ruta: "/gestion-iglesia",
      icono: "⛪",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: "Miembros",
      ruta: "/gestion-iglesia/miembros",
      icono: "👥",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
    {
      nombre: "Finanzas",
      ruta: "/gestion-iglesia/finanzas",
      icono: "💰",
      roles: ["Administrador", "Tesorero"],
    },
    {
      nombre: "Ministerios",
      ruta: "/gestion-iglesia/ministerios",
      icono: "🤝",
      roles: ["Administrador"],
    },
    {
      nombre: "CEFI",
      ruta: "/gestion-iglesia/cefi",
      icono: "🎓",
      roles: ["Administrador", "Tesorero", "Miembro"],
    },
  ];

  // ======================================
  // FILTRAR POR ROL
  // ======================================

  const menuActual = (
    estaEnGestionIglesia
      ? menuGestionIglesia
      : menuProTemplo
  ).filter((item) =>
    item.roles.includes(rol)
  );

  // ======================================
  // CERRAR MENÚ MÓVIL
  // ======================================

  const cerrarMenuMovil = () => {
    setMenuAbierto(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ==================================
          BARRA SUPERIOR MÓVIL
      ================================== */}

      <header
        className="
          fixed inset-x-0 top-0 z-50
          flex h-16 items-center justify-between
          bg-slate-950 px-4 text-white shadow-lg
          lg:hidden
        "
      >

        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="
            rounded-lg p-2 text-2xl
            hover:bg-slate-800
          "
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <div className="text-lg font-bold">
          {estaEnGestionIglesia
            ? "⛪ Gestión Iglesia"
            : "⛪ PRO TEMPLO"}
        </div>

        <div className="w-10" />

      </header>


      {/* ==================================
          FONDO MÓVIL
      ================================== */}

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrarMenuMovil}
          className="
            fixed inset-0 z-40
            bg-black/50
            lg:hidden
          "
        />
      )}


      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          bg-slate-950 text-white
          shadow-2xl
          transition-transform duration-300

          ${menuAbierto
            ? "translate-x-0"
            : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >

        {/* ==================================
            CABECERA
        ================================== */}

        <div className="border-b border-slate-800 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold tracking-tight">
                ⛪ PRO TEMPLO
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Plataforma administrativa
              </p>

            </div>

            <button
              type="button"
              onClick={cerrarMenuMovil}
              className="
                rounded-lg p-2 text-xl
                text-slate-400
                hover:bg-slate-800 hover:text-white
                lg:hidden
              "
              aria-label="Cerrar menú"
            >
              ✕
            </button>

          </div>

        </div>


        {/* ==================================
            SELECTOR DE SISTEMAS
        ================================== */}

        <div className="p-4">

          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sistema
          </p>

          <div className="grid grid-cols-2 gap-2">

            {/* PRO TEMPLO */}

            <NavLink
              to="/dashboard"
              onClick={cerrarMenuMovil}
              className={`
                rounded-xl p-3 text-center
                transition
                ${
                  estaEnProTemplo
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }
              `}
            >

              <div className="text-2xl">
                💰
              </div>

              <div className="mt-1 text-xs font-bold">
                PRO TEMPLO
              </div>

            </NavLink>


            {/* GESTIÓN IGLESIA */}

            <NavLink
              to="/gestion-iglesia"
              onClick={cerrarMenuMovil}
              className={`
                rounded-xl p-3 text-center
                transition
                ${
                  estaEnGestionIglesia
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }
              `}
            >

              <div className="text-2xl">
                ⛪
              </div>

              <div className="mt-1 text-xs font-bold">
                IGLESIA
              </div>

            </NavLink>

          </div>

        </div>


        {/* ==================================
            USUARIO
        ================================== */}

        <div className="mx-4 mb-4 rounded-xl bg-slate-900 p-4">

          <p className="text-sm font-semibold">
            {perfil?.nombres || "Usuario"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {rol || "Sin rol"}
          </p>

        </div>


        {/* ==================================
            TÍTULO DEL MENÚ ACTUAL
        ================================== */}

        <div className="px-5 pb-3">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">

            {estaEnGestionIglesia
              ? "Gestión Iglesia"
              : "PRO TEMPLO"}

          </p>

        </div>


        {/* ==================================
            FUNCIONES DEL SISTEMA
        ================================== */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">

          {menuActual.map((item) => (

            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={
                item.ruta === "/" ||
                item.ruta === "/gestion-iglesia"
              }
              onClick={cerrarMenuMovil}
              className={({ isActive }) =>
                `
                  flex items-center gap-3
                  rounded-xl px-4 py-3
                  text-sm font-medium
                  transition

                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `
              }
            >

              <span className="text-xl">
                {item.icono}
              </span>

              <span>
                {item.nombre}
              </span>

            </NavLink>

          ))}

        </nav>


        {/* ==================================
            CERRAR SESIÓN
        ================================== */}

        <div className="border-t border-slate-800 p-4">

          <button
            type="button"
            onClick={cerrarSesion}
            className="
              flex w-full items-center gap-3
              rounded-xl px-4 py-3
              text-left text-red-300
              transition
              hover:bg-red-950/40
              hover:text-red-200
            "
          >

            <span className="text-xl">
              🚪
            </span>

            <span>
              Cerrar sesión
            </span>

          </button>

        </div>

      </aside>


      {/* ==================================
          CONTENIDO PRINCIPAL
      ================================== */}

      <main
        className="
          min-h-screen min-w-0
          bg-gray-100
          pt-16
          lg:ml-72
          lg:pt-0
        "
      >

        <div
          className="
            w-full min-w-0
            px-3 py-4
            sm:px-5 sm:py-5
            lg:px-6 lg:py-6
          "
        >

          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            className="
              mb-4 rounded-lg
              bg-slate-950
              px-4 py-2
              text-xl text-white
              md:hidden
            "
          >
            ☰
          </button>

          <Outlet />

        </div>

      </main>

    </div>
  );
}

export default MainLayout;