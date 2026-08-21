import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import {
  obtenerResumenGeneral,
} from "../services/reportesService";

// ======================================
// Formato moneda
// ======================================

function formatoMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

// ======================================
// Formato fecha
// ======================================

function formatoFecha(fecha) {

  if (!fecha) {
    return "-";
  }

  return new Date(
    `${fecha}T00:00:00`
  ).toLocaleDateString("es-CO");
}
// ======================================
// Formato de período
// ======================================

function formatoPeriodo(desde, hasta) {
  if (!desde && !hasta) {
    return "Todos los movimientos";
  }

  if (desde && hasta) {
    return `${formatoFecha(desde)} al ${formatoFecha(hasta)}`;
  }

  if (desde) {
    return `Desde ${formatoFecha(desde)}`;
  }

  return `Hasta ${formatoFecha(hasta)}`;
}

// ======================================
// Imprimir reporte
// ======================================

function imprimirReporte() {
  window.print();
}

// ======================================
// Página Reportes
// ======================================

function Reportes() {
const { perfil } = useAuth();

const esMiembro =
  perfil?.rol === "Miembro";

const miembroId =
  perfil?.miembro_id;
  // ======================================
  // Estados
  // ======================================

  const [datos, setDatos] = useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [fechaDesde, setFechaDesde] =
    useState("");

  const [fechaHasta, setFechaHasta] =
    useState("");

  // ======================================
  // Cargar reporte
  // ======================================

 async function cargarReporte() {

  try {

    setCargando(true);

    // Si es miembro, necesitamos tener su miembro_id
    if (esMiembro && !miembroId) {

      setDatos(null);

      return;

    }

    const data = await obtenerResumenGeneral(
  fechaDesde,
  fechaHasta,
  esMiembro ? miembroId : null
);

setDatos(data);

  } catch (error) {

    console.error(
      "Error cargando reportes:",
      error
    );

    toast.error(
      error?.message ||
      "No fue posible cargar los reportes."
    );

  } finally {

    setCargando(false);

  }

}

  // ======================================
  // Carga inicial
  // ======================================

useEffect(() => {

  if (esMiembro && !miembroId) {
    return;
  }

  cargarReporte();

}, [
  esMiembro,
  miembroId,
]);

  // ======================================
  // Limpiar filtros
  // ======================================

  function limpiarFiltros() {

    setFechaDesde("");
    setFechaHasta("");

  }
// ======================================
// EXPORTAR PDF
// ======================================

function exportarPDF() {

  window.print();

}


// ======================================
// EXPORTAR EXCEL / CSV
// ======================================

function exportarExcel() {

  try {

    const filas = [];

    // ==================================
    // ENCABEZADO
    // ==================================

    filas.push([
      "PRO TEMPLO"
    ]);

    filas.push([
      "REPORTE FINANCIERO"
    ]);

    filas.push([
      "Fecha desde",
      fechaDesde || "Todas"
    ]);

    filas.push([
      "Fecha hasta",
      fechaHasta || "Todas"
    ]);

    filas.push([]);


    // ==================================
    // RESUMEN
    // ==================================

    filas.push([
      "RESUMEN FINANCIERO"
    ]);

    filas.push([
      "Concepto",
      "Valor"
    ]);

    filas.push([
      "Total aportes",
      resumen.totalAportes || 0
    ]);

    filas.push([
      "Pagos de préstamos",
      resumen.totalPagosPrestamos || 0
    ]);

    filas.push([
      "Capital pendiente",
      resumen.totalSaldoPendiente || 0
    ]);

    filas.push([
      "Intereses pagados",
      resumen.totalInteresesPagados || 0
    ]);

    filas.push([]);


    // ==================================
    // APORTES
    // ==================================

    filas.push([
      "APORTES REGISTRADOS"
    ]);

    filas.push([
      "Fecha",
      "Miembro",
      "Método",
      "Valor"
    ]);

    aportes.forEach((aporte) => {

      filas.push([
        aporte.fecha || "",
        aporte.miembros?.nombres || "",
        aporte.metodos_pago?.nombre || "",
        Number(aporte.valor || 0)
      ]);

    });

    filas.push([]);


    // ==================================
    // PAGOS DE PRÉSTAMOS
    // ==================================

    filas.push([
      "PAGOS DE PRÉSTAMOS"
    ]);

    filas.push([
      "Fecha",
      "Proyecto",
      "Capital",
      "Interés",
      "Total",
      "Saldo"
    ]);

    pagosPrestamos.forEach((pago) => {

      filas.push([
        pago.fecha || "",
        pago.prestamos?.proyectos?.nombre || "",
        Number(pago.capital || 0),
        Number(pago.interes || 0),
        Number(pago.valor || 0),
        Number(pago.saldo_resultante || 0)
      ]);

    });

    filas.push([]);


    // ==================================
    // PRÉSTAMOS
    // ==================================

    filas.push([
      "PRÉSTAMOS"
    ]);

    filas.push([
      "Proyecto",
      "Capital",
      "Capital pagado",
      "Saldo",
      "Estado"
    ]);

    prestamos.forEach((prestamo) => {

      filas.push([
        prestamo.proyectos?.nombre || "",
        Number(prestamo.capital || 0),
        Number(prestamo.capital_pagado || 0),
        Number(prestamo.saldo_actual || 0),
        prestamo.estado || ""
      ]);

    });

    filas.push([]);


    // ==================================
    // PROYECTOS
    // ==================================

    filas.push([
      "PROYECTOS"
    ]);

    filas.push([
      "Proyecto",
      "Inicio",
      "Fin",
      "Estado"
    ]);

    proyectos.forEach((proyecto) => {

      filas.push([
        proyecto.nombre || "",
        proyecto.fecha_inicio || "",
        proyecto.fecha_fin || "",
        proyecto.estado || ""
      ]);

    });


    // ==================================
    // CONVERTIR A CSV
    // ==================================

    const csv = filas
      .map((fila) =>
        fila
          .map((valor) => {

            const texto =
              String(valor ?? "");

            return `"${texto.replace(
              /"/g,
              '""'
            )}"`;

          })
          .join(",")
      )
      .join("\n");


    // ==================================
    // CREAR ARCHIVO
    // ==================================

    const blob = new Blob(
      ["\ufeff" + csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


    const url =
      URL.createObjectURL(blob);


    const enlace =
      document.createElement("a");

    enlace.href = url;

    const fechaArchivo =
      new Date()
        .toISOString()
        .split("T")[0];

    enlace.download =
      `Reporte_Pro_Templo_${fechaArchivo}.csv`;

    document.body.appendChild(
      enlace
    );

    enlace.click();

    document.body.removeChild(
      enlace
    );

    URL.revokeObjectURL(url);


    toast.success(
      "Reporte exportado correctamente."
    );

  } catch (error) {

    console.error(
      "Error exportando reporte:",
      error
    );

    toast.error(
      "No fue posible exportar el reporte."
    );

  }

}
  // ======================================
  // Datos
  // ======================================

  const resumen =
    datos?.resumen ?? {};

  const aportes =
    datos?.aportes ?? [];

  const pagosPrestamos =
    datos?.pagosPrestamos ?? [];

  const prestamos =
    datos?.prestamos ?? [];

  const proyectos =
    datos?.proyectos ?? [];

  // ======================================
  // RETURN
  // ======================================

  return (
  <div className="space-y-6">

    {/* ==================================
        ENCABEZADO
    ================================== */}

    <div>
      <h1 className="text-4xl font-bold text-gray-800">
        Reportes financieros
      </h1>

      <p className="text-gray-500 mt-2">
        Consulta y descarga de información financiera.
      </p>
    </div>


    {/* ==================================
        FILTROS
    ================================== */}

    {/* Mantén aquí tu bloque actual de filtros
        y botones de PDF / Excel */}


    {/* ==================================
        RESUMEN FINANCIERO
    ================================== */}
   <div className="flex justify-end mb-4 print-hide">
  <button
    type="button"
    onClick={imprimirReporte}
    className="rounded-xl bg-red-600 px-5 py-3 text-white font-medium hover:bg-red-700"
  >
    📄 Descargar PDF
  </button>
</div>
    {!esMiembro && (
      <>
   

        <div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Resumen financiero
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Total aportes
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatoMoneda(resumen.totalAportes)}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {resumen.cantidadAportes || 0} registros
              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Pagos de préstamos
              </p>

              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatoMoneda(resumen.totalPagosPrestamos)}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {resumen.cantidadPagosPrestamos || 0} pagos
              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Capital pendiente
              </p>

              <p className="text-2xl font-bold text-red-600 mt-2">
                {formatoMoneda(resumen.totalSaldoPendiente)}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Saldo de préstamos
              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Intereses pagados
              </p>

              <p className="text-2xl font-bold text-purple-600 mt-2">
                {formatoMoneda(resumen.totalInteresesPagados)}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Intereses registrados
              </p>

            </div>

          </div>

        </div>


        {/* ==================================
            RESUMEN DE PRÉSTAMOS
        ================================== */}

        <div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Estado de préstamos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Capital prestado
              </p>

              <p className="text-2xl font-bold mt-2">
                {formatoMoneda(resumen.totalCapitalPrestado)}
              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Capital recuperado
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatoMoneda(resumen.totalCapitalPagadoPrestamos)}
              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Intereses acumulados
              </p>

              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatoMoneda(resumen.totalInteresesPrestamos)}
              </p>

            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

              <p className="text-sm text-gray-500">
                Préstamos
              </p>

              <p className="text-2xl font-bold text-gray-800 mt-2">
                {resumen.cantidadPrestamos || 0}
              </p>

            </div>

          </div>

        </div>

      </>
    )}


    {/* ==================================
        APORTES
    ================================== */}

    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      <div className="p-5 border-b">

        <h2 className="text-xl font-bold text-gray-800">
          {esMiembro
            ? "Mis aportes"
            : "Aportes registrados"}
        </h2>

      </div>


      {aportes.length === 0 ? (

        <div className="p-8 text-center text-gray-500">

          {esMiembro
            ? "No tienes aportes registrados para el período seleccionado."
            : "No hay aportes para el período seleccionado."}

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="text-left p-4">
                  Fecha
                </th>

                {!esMiembro && (
                  <th className="text-left p-4">
                    Miembro
                  </th>
                )}

                <th className="text-left p-4">
                  Método
                </th>

                <th className="text-right p-4">
                  Valor
                </th>

              </tr>

            </thead>


            <tbody>

              {aportes.map((aporte) => (

                <tr
                  key={aporte.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-4">
                    {formatoFecha(aporte.fecha)}
                  </td>

                  {!esMiembro && (
                    <td className="p-4 font-medium">
                      {aporte.miembros?.nombres || "-"}
                    </td>
                  )}

                  <td className="p-4">
                    {aporte.metodos_pago?.nombre || "-"}
                  </td>

                  <td className="p-4 text-right font-semibold">
                    {formatoMoneda(aporte.valor)}
                  </td>

                </tr>

              ))}

            </tbody>


            <tfoot>

              <tr className="bg-gray-100 border-t-2 border-gray-300">

                <td
                  colSpan={esMiembro ? 2 : 3}
                  className="p-4 text-right font-bold"
                >
                  TOTAL APORTES
                </td>

                <td className="p-4 text-right font-bold text-green-700">
                  {formatoMoneda(resumen.totalAportes)}
                </td>

              </tr>

            </tfoot>

          </table>

        </div>

      )}

    </div>


    {/* ==================================
        PAGOS DE PRÉSTAMOS
    ================================== */}

    {!esMiembro && (
      <>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold text-gray-800">
              Pagos de préstamos
            </h2>

          </div>


          {pagosPrestamos.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No hay pagos para el período seleccionado.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left p-4">
                      Fecha
                    </th>

                    <th className="text-left p-4">
                      Proyecto
                    </th>

                    <th className="text-right p-4">
                      Capital
                    </th>

                    <th className="text-right p-4">
                      Interés
                    </th>

                    <th className="text-right p-4">
                      Total
                    </th>

                    <th className="text-right p-4">
                      Saldo
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pagosPrestamos.map((pago) => (

                    <tr
                      key={pago.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4">
                        {formatoFecha(pago.fecha)}
                      </td>

                      <td className="p-4 font-medium">
                        {pago.prestamos?.proyectos?.nombre || "-"}
                      </td>

                      <td className="p-4 text-right">
                        {formatoMoneda(pago.capital)}
                      </td>

                      <td className="p-4 text-right">
                        {formatoMoneda(pago.interes)}
                      </td>

                      <td className="p-4 text-right font-semibold">
                        {formatoMoneda(pago.valor)}
                      </td>

                      <td className="p-4 text-right">
                        {formatoMoneda(pago.saldo_resultante)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ==================================
            PRÉSTAMOS
        ================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold text-gray-800">
              Préstamos
            </h2>

          </div>


          {prestamos.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No hay préstamos registrados.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left p-4">
                      Proyecto
                    </th>

                    <th className="text-right p-4">
                      Capital
                    </th>

                    <th className="text-right p-4">
                      Capital pagado
                    </th>

                    <th className="text-right p-4">
                      Saldo
                    </th>

                    <th className="text-center p-4">
                      Estado
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {prestamos.map((prestamo) => (

                    <tr
                      key={prestamo.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 font-medium">
                        {prestamo.proyectos?.nombre || "-"}
                      </td>

                      <td className="p-4 text-right">
                        {formatoMoneda(prestamo.capital)}
                      </td>

                      <td className="p-4 text-right">
                        {formatoMoneda(prestamo.capital_pagado)}
                      </td>

                      <td className="p-4 text-right font-semibold">
                        {formatoMoneda(prestamo.saldo_actual)}
                      </td>

                      <td className="p-4 text-center">

                        {prestamo.estado === "Activo" &&
                          "🟢 Activo"}

                        {prestamo.estado === "Suspendido" &&
                          "🟡 Suspendido"}

                        {prestamo.estado === "Finalizado" &&
                          "🔴 Finalizado"}

                      </td>

                    </tr>

                  ))}

                </tbody>


                <tfoot>

                  <tr className="bg-gray-100 border-t-2 border-gray-300">

                    <td className="p-4 text-right font-bold">
                      TOTALES
                    </td>

                    <td className="p-4 text-right font-bold">
                      {formatoMoneda(
                        resumen.totalCapitalPrestado
                      )}
                    </td>

                    <td className="p-4 text-right font-bold text-green-700">
                      {formatoMoneda(
                        resumen.totalCapitalPagadoPrestamos
                      )}
                    </td>

                    <td className="p-4 text-right font-bold text-red-700">
                      {formatoMoneda(
                        resumen.totalSaldoPendiente
                      )}
                    </td>

                    <td></td>

                  </tr>

                </tfoot>

              </table>

            </div>

          )}

        </div>


        {/* ==================================
            PROYECTOS
        ================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-5 border-b">

            <h2 className="text-xl font-bold text-gray-800">
              Proyectos
            </h2>

          </div>


          {proyectos.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No hay proyectos registrados.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left p-4">
                      Proyecto
                    </th>

                    <th className="text-left p-4">
                      Inicio
                    </th>

                    <th className="text-left p-4">
                      Fin
                    </th>

                    <th className="text-center p-4">
                      Estado
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {proyectos.map((proyecto) => (

                    <tr
                      key={proyecto.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 font-medium">
                        {proyecto.nombre}
                      </td>

                      <td className="p-4">
                        {formatoFecha(proyecto.fecha_inicio)}
                      </td>

                      <td className="p-4">
                        {formatoFecha(proyecto.fecha_fin)}
                      </td>

                      <td className="p-4 text-center">

                        {proyecto.estado === "Activo" &&
                          "🟢 Activo"}

                        {proyecto.estado === "Suspendido" &&
                          "🟡 Suspendido"}

                        {proyecto.estado === "Finalizado" &&
                          "🔴 Finalizado"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

            </>

    )}

    {/* ==================================
        PIE DEL REPORTE
    ================================== */}

    <div className="reporte-footer print-only">

      <p>
        PRO TEMPLO — Reporte financiero
      </p>

      <p>
        Documento generado el{" "}
        {new Date().toLocaleDateString("es-CO")}
      </p>

    </div>

  </div>

);

}

export default Reportes;