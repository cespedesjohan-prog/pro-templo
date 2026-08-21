function MembersTable({
  miembros,
  cargando,
  editar,
  eliminar,
  puedeAdministrar,
}) {

  // =====================================
  // Cargando
  // =====================================

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center">
        Cargando miembros...
      </div>
    );
  }


  // =====================================
  // Sin miembros
  // =====================================

  if (!miembros || miembros.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
        No hay miembros registrados.
      </div>
    );
  }


  // =====================================
  // Formato moneda
  // =====================================

  function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(valor || 0));
  }


  // =====================================
  // Tabla
  // =====================================

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full">

          {/* ================================
              ENCABEZADO
          ================================= */}

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Nombre
              </th>

              <th className="text-left p-4">
                Teléfono
              </th>

              <th className="text-left p-4">
                Correo
              </th>

              <th className="text-right p-4">
                Compromiso
              </th>

              <th className="text-center p-4">
                Estado
              </th>

              {puedeAdministrar && (
                <th className="text-center p-4">
                  Acciones
                </th>
              )}

            </tr>

          </thead>


          {/* ================================
              CUERPO
          ================================= */}

          <tbody>

            {miembros.map((miembro) => (

              <tr
                key={miembro.id}
                className="border-t hover:bg-gray-50"
              >

                {/* =========================
                    NOMBRE
                ========================== */}

                <td className="p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                      {miembro.nombres
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}

                    </div>

                    <div>

                      <div className="font-semibold">
                        {miembro.nombres || "—"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {miembro.telefono_movil || "—"}
                      </div>

                    </div>

                  </div>

                </td>


                {/* =========================
                    TELÉFONO
                ========================== */}

                <td className="p-4">
                  {miembro.telefono_movil || "—"}
                </td>


                {/* =========================
                    CORREO
                ========================== */}

                <td className="p-4">
                  {miembro.correo_electronico || "—"}
                </td>


                {/* =========================
                    COMPROMISO
                ========================== */}

                <td className="p-4 text-right font-semibold">

                  {formatoMoneda(
                    miembro.compromiso_mensual
                  )}

                </td>


                {/* =========================
                    ESTADO
                ========================== */}

                <td className="p-4 text-center">

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      miembro.estado
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >

                    {miembro.estado
                      ? "Activo"
                      : "Inactivo"}

                  </span>

                </td>


                {/* =========================
                    ACCIONES
                ========================== */}

                {puedeAdministrar && (

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      {/* Editar */}

                      <button
                        type="button"
                        onClick={() =>
                          editar(miembro)
                        }
                        className="rounded-lg bg-yellow-400 px-3 py-2 hover:bg-yellow-500"
                        title="Editar miembro"
                      >
                        ✏️
                      </button>


                      {/* Eliminar */}

                      <button
                        type="button"
                        onClick={() =>
                          eliminar(miembro.id)
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                        title="Eliminar miembro"
                      >
                        🗑️
                      </button>

                    </div>

                  </td>

                )}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default MembersTable;