
import { obtenerUrlComprobanteAporte } from "../services/comprobantesAportesService";
function AportesTable({
  aportes,
  cargando,
  editar,
  eliminar,
  abrirEliminar,
  aprobar,
  rechazar,
  puedeAdministrar,
}) {
  // =====================================
  // Cargando
  // =====================================

  if (cargando) {

    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        Cargando aportes...
      </div>
    );

  }


  // =====================================
  // Sin aportes
  // =====================================

  if (!aportes || aportes.length === 0) {

    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
        No hay aportes registrados.
      </div>
    );

  }

async function verComprobante(ruta) {

  if (!ruta) {
    return;
  }

  try {

    const url =
      await obtenerUrlComprobanteAporte(ruta);

    if (!url) {
      throw new Error(
        "No fue posible generar el enlace del comprobante."
      );
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.error(
      "Error abriendo comprobante:",
      error
    );

    alert(
      error?.message ||
      "No fue posible abrir el comprobante."
    );

  }

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
  // Estado visual
  // =====================================

  function estadoClase(estado) {

    switch (estado) {

      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";

      case "Aprobado":
        return "bg-green-100 text-green-700";

      case "Rechazado":
        return "bg-red-100 text-red-700";

      case "Anulado":
        return "bg-gray-200 text-gray-700";

      case "Registrado":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";

    }

  }


  // =====================================
  // Estado visual con icono
  // =====================================

  function estadoTexto(estado) {

    switch (estado) {

      case "Pendiente":
        return "🟡 Pendiente";

      case "Aprobado":
        return "🟢 Aprobado";

      case "Rechazado":
        return "🔴 Rechazado";

      case "Anulado":
        return "⚪ Anulado";

      case "Registrado":
        return "🔵 Registrado";

      default:
        return estado || "—";

    }

  }


  // =====================================
  // Tabla
  // =====================================

  return (

    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1400px]">

          {/* =================================
              ENCABEZADO
          ================================= */}

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                N.º
              </th>

              <th className="text-left p-4">
                Fecha
              </th>

              <th className="text-left p-4">
                Proyecto
              </th>

              <th className="text-left p-4">
                Miembro
              </th>

              <th className="text-right p-4">
                Valor
              </th>

              <th className="text-left p-4">
                Método
              </th>

              <th className="text-center p-4">
                Estado
              </th>

              <th className="text-center p-4">
                Comprobante
              </th>

              <th className="text-left p-4">
                Observación
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

            {aportes.map(
              (aporte, index) => (

                <tr
                  key={aporte.id}
                  className="border-t hover:bg-gray-50"
                >

                  {/* N.º */}

                  <td className="p-4 font-medium">

                    {aportes.length - index}

                  </td>


                  {/* Fecha */}

                  <td className="p-4 whitespace-nowrap">

                    {aporte.fecha
                      ? new Date(
                          `${aporte.fecha}T00:00:00`
                        ).toLocaleDateString(
                          "es-CO"
                        )
                      : "—"}

                  </td>


                  {/* Proyecto */}

                  <td className="p-4">

                    <div className="font-semibold">

                      {aporte.proyectos?.nombre ||
                        "—"}

                    </div>

                  </td>


                  {/* Miembro */}

                  <td className="p-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                        {aporte.miembros?.nombres
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "?"}

                      </div>

                      <div>

                        <div className="font-semibold">

                          {aporte.miembros?.nombres ||
                            "—"}

                        </div>

                      </div>

                    </div>

                  </td>


                  {/* Valor */}

                  <td className="p-4 text-right font-semibold whitespace-nowrap">

                    {formatoMoneda(
                      aporte.valor
                    )}

                  </td>


                  {/* Método */}

                  <td className="p-4">

                    {aporte.metodos_pago?.nombre ? (

                      <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">

                        {aporte.metodos_pago.nombre}

                      </span>

                    ) : (

                      <span className="text-gray-400">
                        —
                      </span>

                    )}

                  </td>


                  {/* Estado */}

                  <td className="p-4 text-center">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${estadoClase(
                        aporte.estado
                      )}`}
                    >

                      {estadoTexto(
                        aporte.estado
                      )}

                    </span>

                    {aporte.motivo_rechazo && (

                      <div
                        className="mt-2 text-xs text-red-600 max-w-[180px]"
                        title={aporte.motivo_rechazo}
                      >
                        {aporte.motivo_rechazo}
                      </div>

                    )}

                  </td>
  {/* =================================
    COMPROBANTE
================================= */}

<td className="p-4 text-center">

  {aporte.comprobante_ruta ? (

    <button
      type="button"
      onClick={() =>
        verComprobante(
          aporte.comprobante_ruta
        )
      }
      className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
      title="Ver comprobante"
    >

      📎 Ver comprobante

    </button>

  ) : (

    <span className="text-gray-400">
      Sin comprobante
    </span>

  )}

</td>
{/* Aprobar / Rechazar */}

{puedeAdministrar &&
  aporte.estado === "Pendiente" && (
    <>
      <button
        type="button"
        onClick={() => aprobar(aporte.id)}
        className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
        title="Aprobar aporte"
      >
        ✅
      </button>

      <button
        type="button"
        onClick={() => rechazar(aporte.id)}
        className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
        title="Rechazar aporte"
      >
        ❌
      </button>
    </>
)}
                  {/* Observación */}

                  <td className="p-4 text-gray-600 max-w-[250px]">

                    <div
                      className="truncate"
                      title={
                        aporte.observacion ||
                        ""
                      }
                    >

                      {aporte.observacion ||
                        "—"}

                    </div>

                  </td>


                  {/* Acciones */}

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      {/* Editar */}

                      <button
                        type="button"
                        onClick={() =>
                          editar(aporte)
                        }
                        className="rounded-lg bg-yellow-400 px-3 py-2 hover:bg-yellow-500"
                        title="Editar aporte"
                      >

                        ✏️

                      </button>


                      {/* Eliminar */}
<button
  type="button"
 onClick={() => abrirEliminar(aporte.id)}
  className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
  title="Eliminar aporte"
>
  🗑️
</button>
                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default AportesTable;