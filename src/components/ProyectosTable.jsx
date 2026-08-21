import React from "react";

function ProyectosTable({
  proyectos,
  cargando,
  editar,
  eliminar,
  configurarPrestamo,
  puedeAdministrar,
}) {

  // =====================================
  // Cargando
  // =====================================

  if (cargando) {

    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        Cargando proyectos...
      </div>
    );

  }


  // =====================================
  // Sin proyectos
  // =====================================

  if (!proyectos || proyectos.length === 0) {

    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
        No hay proyectos registrados.
      </div>
    );

  }


  // =====================================
  // Formato moneda
  // =====================================

  function formatoMoneda(valor) {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(valor || 0)
    );

  }


  // =====================================
  // TABLA
  // =====================================

  return (

    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1200px]">

          {/* =================================
              ENCABEZADO
          ================================= */}

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Proyecto
              </th>

              <th className="text-right p-4">
                Meta
              </th>

              <th className="text-right p-4">
                Presupuesto
              </th>

              <th className="text-right p-4">
                Aportado
              </th>

              <th className="text-left p-4">
                Avance
              </th>

              <th className="text-center p-4">
                Estado
              </th>

              <th className="text-center p-4">
                Acciones
              </th>

            </tr>

          </thead>


          {/* =================================
              CUERPO
          ================================= */}

          <tbody>

            {proyectos.map((proyecto) => (

              <tr
                key={proyecto.id}
                className="border-t hover:bg-gray-50"
              >

                {/* =========================
                    PROYECTO
                ========================= */}

                <td className="p-4">

                  <div className="font-semibold text-gray-800">
                    {proyecto.nombre}
                  </div>

                  {proyecto.descripcion && (

                    <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
                      {proyecto.descripcion}
                    </div>

                  )}

                  <div className="mt-2 text-xs text-gray-400">

                    {proyecto.fecha_inicio}

                    {proyecto.fecha_fin && (
                      <> → {proyecto.fecha_fin}</>
                    )}

                  </div>

                </td>


                {/* =========================
                    META
                ========================= */}

                <td className="p-4 text-right font-semibold">

                  {formatoMoneda(
                    proyecto.meta
                  )}

                </td>


                {/* =========================
                    PRESUPUESTO
                ========================= */}

                <td className="p-4 text-right">

                  {formatoMoneda(
                    proyecto.presupuesto
                  )}

                </td>


                {/* =========================
                    APORTADO
                ========================= */}

                <td className="p-4 text-right font-semibold text-green-600">

                  {formatoMoneda(
                    proyecto.totalAportado
                  )}

                </td>


                {/* =========================
                    AVANCE
                ========================= */}

                <td className="p-4 min-w-[180px]">

                  <div className="flex items-center justify-between mb-1">

                    <span className="text-sm font-medium text-gray-700">

                      {Number(
                        proyecto.porcentajeAvance || 0
                      ).toFixed(1)}

                      %

                    </span>

                    <span className="text-xs text-gray-400">

                      {formatoMoneda(
                        proyecto.totalAportado
                      )}

                      {" / "}

                      {formatoMoneda(
                        proyecto.meta
                      )}

                    </span>

                  </div>


                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${Math.min(
                          Number(
                            proyecto.porcentajeAvance || 0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </td>


                {/* =========================
                    ESTADO
                ========================= */}

                <td className="p-4 text-center">

                  {proyecto.estado === "Activo" && (

                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">

                      🟢 Activo

                    </span>

                  )}


                  {proyecto.estado === "Suspendido" && (

                    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">

                      🟡 Suspendido

                    </span>

                  )}


                  {proyecto.estado === "Finalizado" && (

                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">

                      🔴 Finalizado

                    </span>

                  )}

                </td>


                {/* =========================
                    ACCIONES
                ========================= */}

                <td className="p-4">

                  <div className="flex justify-center gap-2">

                    {puedeAdministrar && (
                      <>

                        {/* Configurar préstamo */}

                        <button
                          type="button"
                          onClick={() =>
                            configurarPrestamo(proyecto)
                          }
                          className="rounded-lg bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                          title="Configurar préstamo"
                        >
                          🏦
                        </button>


                        {/* Editar */}

                        <button
                          type="button"
                          onClick={() =>
                            editar(proyecto)
                          }
                          className="rounded-lg bg-yellow-400 px-3 py-2 hover:bg-yellow-500"
                          title="Editar proyecto"
                        >
                          ✏️
                        </button>


                        {/* Eliminar */}

                        <button
                          type="button"
                          onClick={() =>
                            eliminar(proyecto.id)
                          }
                          className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                          title="Eliminar proyecto"
                        >
                          🗑️
                        </button>

                      </>
                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default ProyectosTable;