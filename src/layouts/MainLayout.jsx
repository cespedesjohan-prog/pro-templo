import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {

  const {
    perfil,
    cerrarSesion,
  } = useAuth();

  const rol = perfil?.rol;


  // ======================================
  // MENÚ SEGÚN ROL
  // ======================================

  const menu = [

    // ====================================
    // DASHBOARD
    // ====================================

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


    // ====================================
    // MIEMBROS
    // ====================================

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


    // ====================================
    // APORTES ADMINISTRATIVOS
    // ====================================

   {
  nombre:
    rol === "Miembro"
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


    // ====================================
    // PROYECTOS
    // ====================================

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


    // ====================================
    // REPORTES
    // ====================================

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


    // ====================================
    // PAGOS PRÉSTAMO
    // ====================================

    {
      nombre: "Pagos Préstamo",
      ruta: "/pagos-prestamo",
      icono: "🏦",
      roles: [
        "Administrador",
        "Tesorero",
      ],
    },


    // ====================================
    // PARÁMETROS
    // ====================================

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
  // FILTRAR MENÚ SEGÚN ROL
  // ======================================

  const menuVisible = menu.filter(
    (item) =>
      item.roles.includes(rol)
  );


  return (

    <div className="flex min-h-screen">


      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">


        {/* ==================================
            LOGO
        ================================== */}

        <div className="mb-8">

          <h2 className="text-2xl font-bold">
            ⛪ PRO TEMPLO
          </h2>

          <p className="text-xs text-slate-400 mt-2">
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

          <p className="text-xs text-slate-400 mt-1">
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
          className="w-full rounded-lg px-4 py-3 text-left text-red-300 hover:bg-red-900/30 transition"
        >
          🚪 Cerrar sesión
        </button>


      </aside>


      {/* ==================================
          CONTENIDO
      ================================== */}

      <main className="flex-1 bg-gray-100 p-8">

        <Outlet />

      </main>


    </div>

  );

}

export default MainLayout;