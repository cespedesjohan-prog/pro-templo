import {
  obtenerUrlComprobante,
} from "../services/comprobantesService";

async function verComprobante(ruta) {

  try {

    const url =
      await obtenerUrlComprobante(ruta);

    if (!url) {

      alert(
        "No se encontró el comprobante."
      );

      return;

    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.error(error);

    alert(
      "No fue posible abrir el comprobante."
    );

  }

}

function PagosPrestamoTable({
  pagos,
  cargando,
  editar,
  eliminar,
}) {

  // =====================================
  // Formato moneda
  // =====================================

  function formatoMoneda(valor) {

    return `$${Number(valor || 0).toLocaleString("es-CO")}`;

  }


  // =====================================
  // Cargando
  // =====================================

  if (cargando) {

    return (

      <div className="bg-white rounded-2xl shadow p-6">

        <p className="text-gray-500">
          Cargando pagos...
        </p>

      </div>

    );

  }


  // =====================================
  // Sin pagos
  // =====================================

  if (!pagos || pagos.length === 0) {

    return (

      <div className="bg-white rounded-2xl shadow p-6">

        <p className="text-gray-500">
          No hay pagos registrados.
        </p>

      </div>

    );

  }


  // =====================================
  // Tabla
  // =====================================

  return (

    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[1500px]">

          {/* =====================================
              ENCABEZADO
          ===================================== */}

          <thead className="bg-gray-50">

            <tr>

              {/* 1 */}

              <th className="px-6 py-4 text-left text-sm font-semibold">
                N.º
              </th>


              {/* 2 */}

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Fecha
              </th>


              {/* 3 */}

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Cuota
              </th>


              {/* 4 */}

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Capital
              </th>


              {/* 5 */}

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Interés
              </th>


              {/* 6 */}

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Saldo anterior
              </th>


              {/* 7 */}

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Saldo resultante
              </th>


              {/* 8 */}

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Tasa
              </th>


              {/* 9 */}

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Método
              </th>


              {/* 10 */}

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Comprobante
              </th>


              {/* 11 */}

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Observación
              </th>


              {/* 12 */}

              <th className="px-6 py-4 text-center text-sm font-semibold">
                Acciones
              </th>

            </tr>

          </thead>


          {/* =====================================
              CUERPO
          ===================================== */}

          <tbody className="divide-y divide-gray-100">

            {pagos.map((pago, index) => {

              // =====================================
              // Saldo anterior
              // =====================================

              const saldoAnterior =
                Number(pago.saldo_resultante || 0) +
                Number(pago.capital || 0);


              return (

                <tr
                  key={pago.id}
                  className="hover:bg-gray-50"
                >

                  {/* =================================
                      1. NÚMERO
                  ================================= */}

                  <td className="px-6 py-4 font-semibold">

                    {pagos.length - index}

                  </td>


                  {/* =================================
                      2. FECHA
                  ================================= */}

                  <td className="px-6 py-4 whitespace-nowrap">

                    {pago.fecha}

                  </td>


                  {/* =================================
                      3. CUOTA
                  ================================= */}

                  <td className="px-6 py-4 text-right font-semibold">

                    {formatoMoneda(pago.valor)}

                  </td>


                  {/* =================================
                      4. CAPITAL
                  ================================= */}

                  <td className="px-6 py-4 text-right">

                    {formatoMoneda(pago.capital)}

                  </td>


                  {/* =================================
                      5. INTERÉS
                  ================================= */}

                  <td className="px-6 py-4 text-right">

                    {formatoMoneda(pago.interes)}

                  </td>


                  {/* =================================
                      6. SALDO ANTERIOR
                  ================================= */}

                  <td className="px-6 py-4 text-right">

                    {formatoMoneda(saldoAnterior)}

                  </td>


                  {/* =================================
                      7. SALDO RESULTANTE
                  ================================= */}

                  <td className="px-6 py-4 text-right font-semibold">

                    {formatoMoneda(
                      pago.saldo_resultante
                    )}

                  </td>


                  {/* =================================
                      8. TASA
                  ================================= */}

                  <td className="px-6 py-4 text-right">

                    {pago.prestamos?.tasa_interes != null
                      ? `${pago.prestamos.tasa_interes}%`
                      : "—"}

                  </td>


                  {/* =================================
                      9. MÉTODO
                  ================================= */}

                  <td className="px-6 py-4">

                    {pago.metodos_pago?.nombre || "—"}
                     

                  </td>


                  {/* =================================
                      10. COMPROBANTE
                  ================================= */}

                  <td className="px-6 py-4">

  {pago.comprobante ? (

    <button
      type="button"
      onClick={() =>
        verComprobante(
          pago.comprobante
        )
      }
      className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
    >
      📎 Ver comprobante
    </button>

  ) : (

    <span className="text-gray-400">
      —
    </span>

  )}

</td>

                  {/* =================================
                      11. OBSERVACIÓN
                  ================================= */}

                  <td className="px-6 py-4 text-gray-600">

                    {pago.observacion || "—"}

                  </td>


                  {/* =================================
                      12. ACCIONES
                  ================================= */}

                  <td className="px-6 py-4">

                    <div className="flex justify-center gap-2">

                      {editar && (

                        <button
                          type="button"
                          onClick={() => editar(pago)}
                          className="rounded-lg bg-yellow-400 px-3 py-2 hover:bg-yellow-500"
                          title="Editar pago"
                        >

                          ✏️

                        </button>

                      )}


                      {eliminar && (

                        <button
                          type="button"
                          onClick={() => eliminar(pago.id)}
                          className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                          title="Eliminar pago"
                        >

                          🗑️

                        </button>

                      )}


                      {!editar && !eliminar && (

                        <span className="text-gray-400">
                          —
                        </span>

                      )}

                    </div>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </div>

  );

}


export default PagosPrestamoTable;