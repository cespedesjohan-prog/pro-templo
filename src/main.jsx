import React from "react";
import ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

// ======================================
// AUTENTICACIÓN
// ======================================

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// ======================================
// PÁGINAS
// ======================================

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Miembros from "./pages/Miembros";
import Aportes from "./pages/Aportes";
import Proyectos from "./pages/Proyectos";
import PagosPrestamo from "./pages/PagosPrestamo";
import Reportes from "./pages/Reportes";
import ParametrosFinancieros from "./pages/ParametrosFinancieros";

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
      // DASHBOARD
      // ==================================

      {
        index: true,

        element: (
          <ProtectedRoute
            rolesPermitidos={[
              "Administrador",
              "Tesorero",
              "Miembro",
            ]}
          >
            <Dashboard />
          </ProtectedRoute>
        ),

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

        <RouterProvider router={router} />

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