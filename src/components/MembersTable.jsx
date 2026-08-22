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


  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">

      {/* =================================================
          VISTA MÓVIL
          ================================================= */}

      <div className="md:hidden p-4 space-y-4">

        {miembros.map((miembro) => (

          <div
            key={miembro.id}
            className="rounded-xl border border-gray-200 p-4 shadow-sm"
          >

            {/* Nombre */}

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                {miembro.nombres
                  ?.charAt(0)
                  ?.toUpperCase() || "?"}
              </div>

              <div className="min-w-0">

                <div className="font-semibold text-lg text-gray-800 break-words">
                  {miembro.nombres || "—"}
                </div>

                <div className="text-sm text-gray-500">
                  {miembro.telefono_movil || "—"}
                </div>

              </div>

            </div>


            {/* Información */}

            <div className="space-y-3 text-sm">

              <div>

                <p className="text-gray-500">
                  Teléfono
                </p>

                <p className="font-medium text-gray-800">
                  {miembro.telefono_movil || "—"}
                </p>

              </div>


              <div className="min-w-0">

                <p className="text-gray-500">
                  Correo
                </p>

                <p className="font-medium text-gray-800 break-all">
                  {miembro.correo_electronico || "—"}
                </p>

              </div>


              <div>

                <p className="text-gray-500">
                  Compromiso mensual
                </p>

                <p className="font-semibold text-gray-800">
                  {formatoMoneda(
                    miembro.compromiso_mensual
                  )}
                </p>

              </div>


              <div>

                <p className="text-gray-500">
                  Estado
                </p>

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

              </div>

            </div>


            {/* Acciones */}

            {puedeAdministrar && (

              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    editar(miembro)
                  }
                  className="flex-1 rounded-lg bg-yellow-400 px-4 py-3 hover:bg-yellow-500"
                >
                  ✏️ Editar
                </button>


                <button
                  type="button"
                  onClick={() =>
                    eliminar(miembro.id)
                  }
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700"
                >
                  🗑️ Eliminar
                </button>

              </div>

            )}

          </div>

        ))}

      </div>


      {/* =================================================
          VISTA PC
          ================================================= */}

      <div className="hidden md:block overflow-x-auto">

        <table className="w-full">

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


          <tbody>

            {miembros.map((miembro) => (

              <tr
                key={miembro.id}
                className="border-t hover:bg-gray-50"
              >

                {/* Nombre */}

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


                {/* Teléfono */}

                <td className="p-4">
                  {miembro.telefono_movil || "—"}
                </td>


                {/* Correo */}

                <td className="p-4">
                  {miembro.correo_electronico || "—"}
                </td>


                {/* Compromiso */}

                <td className="p-4 text-right font-semibold">

                  {formatoMoneda(
                    miembro.compromiso_mensual
                  )}

                </td>


                {/* Estado */}

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


                {/* Acciones */}

                {puedeAdministrar && (

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

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