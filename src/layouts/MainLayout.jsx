
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function MainLayout() {

  const [menuAbierto, setMenuAbierto] = useState(false);
  const {
    perfil,
    cerrarSesion,
  } = useAuth();

  const rol = perfil?.rol;

 

  // ======================================
  // MENÚ SEGÚN ROL
  // ======================================

  const menu = [
    {
      nombre: "Dashboard",
      ruta: "/",
      icono: "🏠",
      roles: [
        "Administrador",
        "Tesorero",
        "Miembro",
      ],
    },

    {
      nombre: "Miembros",
      ruta: "/miembros",
      icono: "👥",
      roles: [
        "Administrador",
        "Tesorero",
        "Miembro",
      ],
    },

    {
      nombre: rol === "Miembro"
        ? "Mis aportes"
        : "Aportes",
      ruta: "/aportes",
      icono: "💰",
      roles: [
        "Administrador",
        "Tesorero",
        "Miembro",
      ],
    },

    {
      nombre: "Proyectos",
      ruta: "/proyectos",
      icono: "🏗️",
      roles: [
        "Administrador",
        "Tesorero",
        "Miembro",
      ],
    },

    {
      nombre: "Reportes",
      ruta: "/reportes",
      icono: "📊",
      roles: [
        "Administrador",
        "Tesorero",
        "Miembro",
      ],
    },

    {
      nombre: "Pagos Préstamo",
      ruta: "/pagos-prestamo",
      icono: "🏦",
      roles: [
        "Administrador",
        "Tesorero",
      ],
    },

    {
      nombre: "Parámetros",
      ruta: "/parametros-financieros",
      icono: "⚙️",
      roles: [
        "Administrador",
      ],
    },
  ];

  // ======================================
  // FILTRAR MENÚ
  // ======================================

  const menuVisible = menu.filter(
    (item) => item.roles.includes(rol)
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
          BARRA SUPERIOR - SOLO MÓVIL
      ================================== */}

      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-slate-900 px-4 text-white shadow-md lg:hidden">

        <button
          type="button"
          onClick={() => setMenuAbierto(true)}
          className="rounded-lg p-2 text-2xl hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <div className="text-lg font-bold">
          ⛪ PRO TEMPLO
        </div>

        <div className="w-10" />

      </header>


      {/* ==================================
          FONDO OSCURO - MÓVIL
      ================================== */}

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrarMenuMovil}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}


      {/* ==================================
          SIDEBAR
      ================================== */}

     <aside
  className={`
    fixed inset-y-0 left-0 z-50
    w-64 bg-slate-900 text-white p-6
    flex flex-col
    transform transition-transform duration-300
    md:static md:translate-x-0
    ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
  `}
>
<button
  type="button"
  onClick={() => setMenuAbierto(false)}
  className="mb-4 self-end rounded-lg px-3 py-2 text-xl hover:bg-slate-800 md:hidden"
>
  ✕
</button>
        {/* ==================================
            LOGO
        ================================== */}

        <div className="mb-8">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              ⛪ PRO TEMPLO
            </h2>

            {/* CERRAR - SOLO MÓVIL */}

            <button
              type="button"
              onClick={cerrarMenuMovil}
              className="rounded-lg p-2 text-xl hover:bg-slate-800 lg:hidden"
              aria-label="Cerrar menú"
            >
              ✕
            </button>

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Sistema de gestión financiera
          </p>

        </div>


        {/* ==================================
            USUARIO
        ================================== */}

        <div className="mb-6 rounded-xl bg-slate-800 p-4">

          <p className="text-sm font-semibold">
            {perfil?.nombres || "Usuario"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {rol || "Sin rol"}
          </p>

        </div>


        {/* ==================================
            MENÚ
        ================================== */}

        <nav className="space-y-2">

          {menuVisible.map((item) => (

        <NavLink
  key={item.ruta}
  to={item.ruta}
  end={item.ruta === "/"}
  onClick={() => setMenuAbierto(false)}
  className={({ isActive }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-blue-600"
        : "hover:bg-slate-800"
    }`
  }
>

              {item.icono} {item.nombre}

            </NavLink>

          ))}

        </nav>


        {/* ==================================
            ESPACIO
        ================================== */}

        <div className="flex-1" />


        {/* ==================================
            CERRAR SESIÓN
        ================================== */}

        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full rounded-lg px-4 py-3 text-left text-red-300 transition hover:bg-red-900/30"
        >
          🚪 Cerrar sesión
        </button>

      </aside>


      {/* ==================================
          CONTENIDO PRINCIPAL
      ================================== */}

      <main className="min-h-screen min-w-0 bg-gray-100 pt-16 lg:ml-64 lg:pt-0">

        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
<button
  type="button"
  onClick={() => setMenuAbierto(true)}
  className="mb-4 rounded-lg bg-slate-900 px-4 py-2 text-xl text-white md:hidden"
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