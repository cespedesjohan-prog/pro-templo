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
          Bienvenido al sistema ICC PALABRA DE FE ERP
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
          PROYECTOS ACTIVOS + TOP 10 APORTANTES
      ========================================= */}

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">

        {/* =========================================
            PROYECTOS ACTIVOS
        ========================================= */}

        <div className="min-w-0 rounded-2xl bg-white p-5 shadow">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                🏗️ Proyectos activos
              </h2>

              <p className="text-sm text-gray-500">
                Proyectos actualmente en ejecución
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {dashboard.proyectosActivos?.length || 0}
            </span>

          </div>

          {dashboard.proyectosActivos?.length > 0 ? (

            <div className="space-y-3">

              {dashboard.proyectosActivos.map((proyecto) => (

                <div
                  key={proyecto.id}
                  className="rounded-xl border border-gray-200 p-4"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                      {proyecto.icono || "🏗️"}
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate font-semibold text-gray-800">
                        {proyecto.nombre || "Sin nombre"}
                      </h3>

                      {proyecto.descripcion && (
                        <p className="mt-1 text-sm text-gray-500">
                          {proyecto.descripcion}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">

                        {proyecto.fecha_inicio && (
                          <span className="text-xs text-gray-500">
                            Inicio:{" "}
                            {new Date(
                              `${proyecto.fecha_inicio}T00:00:00`
                            ).toLocaleDateString("es-CO")}
                          </span>
                        )}

                        {proyecto.meta && (
                          <span className="text-xs font-medium text-blue-600">
                            Meta:{" "}
                            {Number(
                              proyecto.meta
                            ).toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        )}

                      </div>

                    </div>

                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Activo
                    </span>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              No hay proyectos activos actualmente.
            </div>

          )}

        </div>


        {/* =========================================
            TOP 10 APORTANTES
        ========================================= */}

        <div className="min-w-0 rounded-2xl bg-white p-5 shadow">

          <div className="mb-4">

            <h2 className="text-lg font-bold text-gray-800">
              🏆 Top 10 aportantes
            </h2>

            <p className="text-sm text-gray-500">
              Ranking según aportes registrados
            </p>

          </div>

          {dashboard.topAportantes?.length > 0 ? (

            <div className="space-y-2">

              {dashboard.topAportantes.map(
                (aportante, index) => (

                  <div
                    key={`${aportante.nombre}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                  >

                    {/* Posición */}

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">

                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : index + 1}

                    </div>


                    {/* Avatar */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">

                      {aportante.nombre
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}

                    </div>


                    {/* Nombre */}

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-gray-800">
                        {aportante.nombre}
                      </p>

                      <p className="text-xs text-gray-500">
                        {aportante.cantidad}{" "}
                        {aportante.cantidad === 1
                          ? "aporte"
                          : "aportes"}
                      </p>

                    </div>


                    {/* Total */}

                    <div className="shrink-0 text-right">

                      <p className="text-sm font-bold text-green-600">

                        {Number(
                          aportante.total || 0
                        ).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        })}

                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              Aún no hay aportes registrados.
            </div>

          )}

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