import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

// ======================================
// AUTENTICACIÓN
// ======================================

import Login from "./pages/Login";
import OlvideContrasena from "./pages/OlvideContrasena";
import RestablecerContrasena from "./pages/RestablecerContrasena";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ======================================
// PÁGINAS
// ======================================

import MainLayout from "./layouts/MainLayout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardIglesia = lazy(() => import("./pages/DashboardIglesia"));
const Miembros = lazy(() => import("./pages/Miembros"));
const GestionIglesia = lazy(() => import("./pages/GestionIglesia"));
const GestionIglesiaMiembros = lazy(() => import("./pages/GestionIglesiaMiembros"));
const FinanzasIglesia = lazy(() => import("./pages/gestion-iglesia/FinanzasIglesia"));
const Aportes = lazy(() => import("./pages/Aportes"));
const Proyectos = lazy(() => import("./pages/Proyectos"));
const PagosPrestamo = lazy(() => import("./pages/PagosPrestamo"));
const Reportes = lazy(() => import("./pages/Reportes"));
const ParametrosFinancieros = lazy(() => import("./pages/ParametrosFinancieros"));
const Cefi = lazy(() => import("./pages/gestion-iglesia/Cefi"));
const AsistenciaCefi = lazy(() => import("./pages/gestion-iglesia/AsistenciaCefi"));
const CalificacionesCefi = lazy(() => import("./pages/gestion-iglesia/CalificacionesCefi"));
const MateriasCefi = lazy(() => import("./pages/gestion-iglesia/MateriasCefi"));
const DashboardCefi = lazy(() => import("./pages/gestion-iglesia/DashboardCefi"));
const MinisteriosIglesia = lazy(() => import("./pages/gestion-iglesia/MinisteriosIglesia"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">PRO TEMPLO</div>
      <p className="mt-2 text-gray-500">Cargando sección...</p>
    </div>
  </div>
);

const getHomeRouteByRole = (rol) => {
  switch (rol) {
    case "Administrador":
      return "/gestion-iglesia";
    case "Tesorero":
    case "Miembro":
    default:
      return "/";
  }
};

function HomeRedirect() {
  const { perfil, cargando } = useAuth();

  if (cargando) {
    return <RouteFallback />;
  }

  if (perfil?.rol === "Administrador") {
    return <Navigate to="/gestion-iglesia" replace />;
  }

  return <Dashboard />;
}


// ======================================
// MODALES
// ======================================

import { ModalProvider } from "./context/ModalContext";
import ModalHost from "./components/ModalHost";

// ======================================
// NOTIFICACIONES
// ======================================

import { Toaster } from "react-hot-toast";


// ======================================
// ROUTER
// ======================================

const router = createBrowserRouter([

  // ====================================
  // LOGIN
  // ====================================

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/olvide-contrasena",
    element: <OlvideContrasena />,
  },
  {
    path: "/restablecer-contrasena",
    element: <RestablecerContrasena />,
  },


  // ====================================
  // SISTEMA PROTEGIDO
  // ====================================

  {
    path: "/",

    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),

    children: [
      // ==================================
      // DASHBOARD INICIAL POR ROL
      // ==================================

      {
        index: true,
        element: <HomeRedirect />,
      },

      {
        path: "*",
        element: <Dashboard />,
      },


      // ==================================
      // MIEMBROS
      // ==================================

      {
        path: "miembros",

        element: (
          <ProtectedRoute
            rolesPermitidos={[
              "Administrador",
              "Tesorero",
              "Miembro",
            ]}
          >
            <Miembros />
          </ProtectedRoute>
        ),

      },

// ==================================
// DASHBOARD IGLESIA
// ==================================

{
  path: "gestion-iglesia",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
      ]}
    >
      <DashboardIglesia />
    </ProtectedRoute>
  ),

},
{
  path: "gestion-iglesia/miembros",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
      ]}
    >
      <GestionIglesiaMiembros />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/finanzas",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
      ]}
    >
      <FinanzasIglesia />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/ministerios",
  element: (
    <ProtectedRoute rolesPermitidos={["Administrador"]}>
      <MinisteriosIglesia />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/cefi",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
        "Tesorero",
        "Miembro",
      ]}
    >
      <Cefi />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/cefi/asistencia",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
        "Tesorero",
        "Miembro",
      ]}
    >
      <AsistenciaCefi />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/cefi/calificaciones",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
        "Tesorero",
        "Miembro",
      ]}
    >
      <CalificacionesCefi />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/cefi/materias",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
        "Tesorero",
        "Miembro",
      ]}
    >
      <MateriasCefi />
    </ProtectedRoute>
  ),
},
{
  path: "gestion-iglesia/cefi/dashboard",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
        "Tesorero",
        "Miembro",
      ]}
    >
      <DashboardCefi />
    </ProtectedRoute>
  ),
},

      // ==================================
      // APORTES
      // SOLO ADMINISTRADOR Y TESORERO
      // ==================================

      
       {
  path: "aportes",

  element: (
    <ProtectedRoute
      rolesPermitidos={[
        "Administrador",
        "Tesorero",
        "Miembro",
      ]}
    >
      <Aportes />
    </ProtectedRoute>
  ),

},

      


      // ==================================
      // PROYECTOS
      // ==================================

      {
        path: "proyectos",

        element: (
          <ProtectedRoute
            rolesPermitidos={[
              "Administrador",
              "Tesorero",
              "Miembro",
            ]}
          >
            <Proyectos />
          </ProtectedRoute>
        ),

      },


      // ==================================
      // PAGOS DE PRÉSTAMO
      // SOLO ADMINISTRADOR Y TESORERO
      // ==================================

      {
        path: "pagos-prestamo",

        element: (
          <ProtectedRoute
            rolesPermitidos={[
              "Administrador",
              "Tesorero",
            ]}
          >
            <PagosPrestamo />
          </ProtectedRoute>
        ),

      },


      // ==================================
      // REPORTES
      // ==================================

      {
        path: "reportes",

        element: (
          <ProtectedRoute
            rolesPermitidos={[
              "Administrador",
              "Tesorero",
              "Miembro",
            ]}
          >
            <Reportes />
          </ProtectedRoute>
        ),

      },


      // ==================================
      // PARÁMETROS FINANCIEROS
      // SOLO ADMINISTRADOR
      // ==================================

      {
        path: "parametros-financieros",

        element: (
          <ProtectedRoute
            rolesPermitidos={[
              "Administrador",
            ]}
          >
            <ParametrosFinancieros />
          </ProtectedRoute>
        ),

      },

    ],

  },

]);


// ======================================
// RENDER PRINCIPAL
// ======================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    {/* AUTENTICACIÓN */}

    <AuthProvider>

      {/* MODALES */}

      <ModalProvider>

        {/* RUTAS */}

        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>

        {/* HOST DE MODALES */}

        <ModalHost />

        {/* NOTIFICACIONES */}

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,

            style: {
              borderRadius: "12px",
              background: "#ffffff",
              color: "#333333",
            },
          }}
        />

      </ModalProvider>

    </AuthProvider>

  </React.StrictMode>

);
