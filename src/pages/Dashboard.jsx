import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import StatCard from "../components/ui/StatCard";
import UltimosAportes from "../components/dashboard/UltimosAportes";
import ProyectoCard from "../components/dashboard/ProyectoCard";
import GraficoMetodoPago from "../components/dashboard/GraficoMetodoPago";
import GraficoAportesMes from "../components/dashboard/GraficoAportesMes";
import QuickActions from "../components/dashboard/QuickActions";
import Notificaciones from "../components/dashboard/Notificaciones";

import { obtenerDashboard } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const location = useLocation();

  const [dashboard, setDashboard] = useState({
    totalMiembros: 0,
    totalRecaudado: 0,
    totalAportes: 0,
    ultimoAporte: null,
    proyecto: null,
    avance: 0,
    ultimosAportes: [],
    graficoMes: [],
    graficoMetodo: [],
    saldoPrestamos: 0,
  });

  const { usuario, perfil } = useAuth();

  console.log("USUARIO:", usuario);
  console.log("PERFIL:", perfil);
  console.log("ROL:", perfil?.rol);

  async function cargarDashboard() {
    try {
      const data = await obtenerDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  }

  useEffect(() => {
    cargarDashboard();
  }, [location]);

  return (
    <div className="w-full min-w-0 space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

      {/* =========================================
          ENCABEZADO
      ========================================= */}

      <div>
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
          Bienvenido al sistema PRO TEMPLO ERP
        </p>
      </div>

      {/* =========================================
          ACCIONES RÁPIDAS
      ========================================= */}

      <QuickActions />

      {/* =========================================
          TARJETAS PRINCIPALES
      ========================================= */}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

        <StatCard
          title="Miembros"
          value={dashboard.totalMiembros}
          icon="👥"
          color="blue"
          subtitle="Registrados"
        />

        <StatCard
          title="Recaudado"
          value={`$${Number(
            dashboard.totalRecaudado || 0
          ).toLocaleString("es-CO")}`}
          icon="💰"
          color="green"
          subtitle="Aportes registrados"
        />

        <StatCard
          title="Proyecto"
          value={dashboard.proyecto?.nombre || "Sin proyecto"}
          icon={dashboard.proyecto?.icono || "🏗️"}
          color="yellow"
          subtitle="Proyecto activo"
        />

        <StatCard
          title="Saldo préstamo"
          value={`$${Number(
            dashboard.saldoPrestamos || 0
          ).toLocaleString("es-CO")}`}
          icon="📉"
          color="red"
          subtitle="Pendiente"
        />

      </div>

      {/* =========================================
          PROYECTO + ÚLTIMOS APORTES
      ========================================= */}

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">

        <div className="min-w-0">
          <ProyectoCard
            proyecto={dashboard.proyecto}
            totalRecaudado={dashboard.totalRecaudado}
          />
        </div>

        <div className="min-w-0">
          <UltimosAportes
            aportes={dashboard.ultimosAportes || []}
          />
        </div>

      </div>

      {/* =========================================
          GRÁFICOS
      ========================================= */}

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">

        <div className="min-w-0 overflow-hidden">
          <GraficoAportesMes
            data={dashboard.graficoMes || []}
          />
        </div>

        <div className="min-w-0 overflow-hidden">
          <GraficoMetodoPago
            data={dashboard.graficoMetodo || []}
          />
        </div>

      </div>

      {/* =========================================
          NOTIFICACIONES
      ========================================= */}

      <div className="min-w-0">
        <Notificaciones dashboard={dashboard} />
      </div>

    </div>
  );
}

export default Dashboard;