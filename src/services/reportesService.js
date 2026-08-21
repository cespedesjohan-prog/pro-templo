import { supabase } from "../lib/supabase";

// ======================================
// REPORTE GENERAL
// ======================================

export async function obtenerResumenGeneral(
  fechaDesde = null,
  fechaHasta = null,
  miembroId = null
) {

  // ======================================
  // 1. APORTES
  // ======================================

  let consultaAportes = supabase
    .from("aportes")
    .select(`
      id,
      fecha,
      valor,
      miembro_id,
      metodo_pago_id,
      estado,
      miembros (
        id,
        nombres
      ),
      metodos_pago (
        id,
        nombre
      )
    `)
    .eq("estado", "Registrado")
    .order("fecha", {
      ascending: false,
    });

  // ======================================
  // FILTRO FECHA DESDE
  // ======================================

  if (fechaDesde) {

    consultaAportes =
      consultaAportes.gte(
        "fecha",
        fechaDesde
      );

  }

  // ======================================
  // FILTRO FECHA HASTA
  // ======================================

  if (fechaHasta) {

    consultaAportes =
      consultaAportes.lte(
        "fecha",
        fechaHasta
      );

  }

  // ======================================
  // FILTRO POR MIEMBRO
  // ======================================

  if (miembroId) {

    consultaAportes =
      consultaAportes.eq(
        "miembro_id",
        miembroId
      );

  }

  const {
    data: aportes,
    error: errorAportes,
  } = await consultaAportes;

  if (errorAportes) {
    throw errorAportes;
  }

  // ======================================
  // TOTAL APORTES
  // ======================================

  const totalAportes =
    (aportes ?? []).reduce(
      (total, item) =>
        total +
        Number(item.valor || 0),
      0
    );

  // ======================================
  // SI ES MIEMBRO
  //
  // No necesitamos cargar información
  // administrativa de préstamos/proyectos.
  // ======================================

  if (miembroId) {

    return {

      aportes:
        aportes ?? [],

      pagosPrestamos: [],

      prestamos: [],

      proyectos: [],

      resumen: {

        totalAportes,

        totalPagosPrestamos: 0,

        totalCapitalPagado: 0,

        totalInteresesPagados: 0,

        totalSaldoPendiente: 0,

        totalCapitalPrestado: 0,

        totalCapitalPagadoPrestamos: 0,

        totalInteresesPrestamos: 0,

        cantidadAportes:
          (aportes ?? []).length,

        cantidadPagosPrestamos: 0,

        cantidadPrestamos: 0,

        cantidadProyectos: 0,

      },

    };

  }

  // ======================================
  // 2. PAGOS DE PRÉSTAMOS
  // SOLO ADMINISTRADOR
  // ======================================

  let consultaPagos =
    supabase
      .from("pagos_prestamo")
      .select(`
        id,
        fecha,
        valor,
        capital,
        interes,
        saldo_resultante,
        prestamo_id,
        metodo_pago_id,
        metodos_pago (
          id,
          nombre
        ),
        prestamos (
          id,
          capital,
          proyectos (
            id,
            nombre
          )
        )
      `)
      .order("fecha", {
        ascending: false,
      });

  if (fechaDesde) {

    consultaPagos =
      consultaPagos.gte(
        "fecha",
        fechaDesde
      );

  }

  if (fechaHasta) {

    consultaPagos =
      consultaPagos.lte(
        "fecha",
        fechaHasta
      );

  }

  const {
    data: pagosPrestamos,
    error: errorPagos,
  } = await consultaPagos;

  if (errorPagos) {
    throw errorPagos;
  }

  // ======================================
  // 3. PRÉSTAMOS
  // ======================================

  const {
    data: prestamos,
    error: errorPrestamos,
  } = await supabase
    .from("prestamos")
    .select(`
      id,
      capital,
      saldo_actual,
      capital_pagado,
      intereses_pagados,
      tasa_interes,
      estado,
      proyecto_id,
      proyectos (
        id,
        nombre
      )
    `);

  if (errorPrestamos) {
    throw errorPrestamos;
  }

  // ======================================
  // 4. PROYECTOS
  // ======================================

  const {
    data: proyectos,
    error: errorProyectos,
  } = await supabase
    .from("proyectos")
    .select(`
      id,
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      estado
    `)
    .order("fecha_inicio", {
      ascending: false,
    });

  if (errorProyectos) {
    throw errorProyectos;
  }

  // ======================================
  // 5. CÁLCULOS ADMINISTRATIVOS
  // ======================================

  const totalPagosPrestamos =
    (pagosPrestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(item.valor || 0),
      0
    );

  const totalCapitalPagado =
    (pagosPrestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(item.capital || 0),
      0
    );

  const totalInteresesPagados =
    (pagosPrestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(item.interes || 0),
      0
    );

  const totalSaldoPendiente =
    (prestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(
          item.saldo_actual || 0
        ),
      0
    );

  const totalCapitalPrestado =
    (prestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(
          item.capital || 0
        ),
      0
    );

  const totalCapitalPagadoPrestamos =
    (prestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(
          item.capital_pagado || 0
        ),
      0
    );

  const totalInteresesPrestamos =
    (prestamos ?? []).reduce(
      (total, item) =>
        total +
        Number(
          item.intereses_pagados || 0
        ),
      0
    );

  // ======================================
  // 6. RETORNAR REPORTE GENERAL
  // ======================================

  return {

    aportes:
      aportes ?? [],

    pagosPrestamos:
      pagosPrestamos ?? [],

    prestamos:
      prestamos ?? [],

    proyectos:
      proyectos ?? [],

    resumen: {

      totalAportes,

      totalPagosPrestamos,

      totalCapitalPagado,

      totalInteresesPagados,

      totalSaldoPendiente,

      totalCapitalPrestado,

      totalCapitalPagadoPrestamos,

      totalInteresesPrestamos,

      cantidadAportes:
        (aportes ?? []).length,

      cantidadPagosPrestamos:
        (pagosPrestamos ?? []).length,

      cantidadPrestamos:
        (prestamos ?? []).length,

      cantidadProyectos:
        (proyectos ?? []).length,

    },

  };

}