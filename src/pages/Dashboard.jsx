import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import StatCard from "../components/ui/StatCard";
import ProgressCard from "../components/ui/ProgressCard";
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

  totalProyectos: 0,

  totalRecaudado: 0,

});

const {
  usuario,
  perfil,
} = useAuth();

console.log("USUARIO:", usuario);
console.log("PERFIL:", perfil);
console.log("ROL:", perfil?.rol);

async function cargarDashboard() {

  try {

    const data = await obtenerDashboard();

    setDashboard(data);

  } catch (error) {

    console.error(error);

  }

}
useEffect(() => {

  cargarDashboard();

}, [location]);
  return (

    <div className="space-y-8">

      {/* Encabezado */}

      <div>

        <h1 className="text-4xl font-bold text-gray-800">

          Dashboard

        </h1>

        <p className="text-gray-500 mt-2">

          Bienvenido al sistema PRO TEMPLO ERP

        </p>

      </div>
    <QuickActions />

      {/* Tarjetas */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Miembros"
          value={dashboard.totalMiembros}
          icon="👥"
          color="blue"
          subtitle="Registrados"
        />

        <StatCard
          title="Recaudado"
          value={`$${dashboard.totalRecaudado.toLocaleString("es-CO")}`}
          icon="💰"
          color="green"
          subtitle="Este mes"
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

      {/* Avance */}

 
{/* Panel principal */}

{/* Proyecto + Últimos aportes */}

<div className="grid gap-6 lg:grid-cols-2">

  <ProyectoCard
    proyecto={dashboard.proyecto}
    totalRecaudado={dashboard.totalRecaudado}
  />

  <UltimosAportes
    aportes={dashboard.ultimosAportes || []}
  />

</div>

{/* Gráficos */}

<div className="grid gap-6 lg:grid-cols-2">

  <GraficoAportesMes
    data={dashboard.graficoMes || []}
  />

  <GraficoMetodoPago
    data={dashboard.graficoMetodo || []}
  />

</div>

{/* Gráfico */}

<GraficoAportesMes
  data={dashboard.graficoMes || []}
/>

    </div>

  );
<Notificaciones dashboard={dashboard} />
}

export default Dashboard;