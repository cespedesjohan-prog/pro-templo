import { supabase } from "../lib/supabase";

// ======================================================
// UTILIDADES
// ======================================================

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function redondear(valor) {
  return Math.round(
    (numero(valor) + Number.EPSILON) * 100
  ) / 100;
}

function positivo(valor) {
  return Math.max(redondear(valor), 0);
}


// ======================================================
// OBTENER TODOS LOS PAGOS
// ======================================================

export async function obtenerPagosPrestamo() {

  const { data, error } = await supabase
    .from("pagos_prestamo")
    .select("*")
    .order("fecha", {
      ascending: true,
    })
    .order("creado_en", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}


// ======================================================
// OBTENER PAGOS DE UN PRÉSTAMO
// ======================================================

export async function obtenerPagosDePrestamo(
  prestamoId
) {

  if (!prestamoId) {
    throw new Error(
      "No se recibió el ID del préstamo."
    );
  }

  const { data, error } = await supabase
    .from("pagos_prestamo")
    .select("*")
    .eq("prestamo_id", prestamoId)
    .order("fecha", {
      ascending: true,
    })
    .order("creado_en", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}


// ======================================================
// OBTENER UN PAGO
// ======================================================

export async function obtenerPagoPrestamo(
  pagoId
) {

  if (!pagoId) {
    throw new Error(
      "No se recibió el ID del pago."
    );
  }

  const { data, error } = await supabase
    .from("pagos_prestamo")
    .select("*")
    .eq("id", pagoId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}


// ======================================================
// OBTENER PRÉSTAMO
// ======================================================

async function obtenerPrestamo(
  prestamoId
) {

  const { data, error } = await supabase
    .from("prestamos")
    .select(`
      id,
      capital,
      saldo_actual,
      capital_pagado,
      intereses_pagados,
      tasa_interes,
      tipo_interes,
      plazo_meses,
      fecha_inicio
    `)
    .eq("id", prestamoId)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "No se encontró el préstamo."
    );
  }

  return data;
}


// ======================================================
// OBTENER CUOTAS
// ======================================================

async function obtenerCuotas(
  prestamoId
) {

  const { data, error } = await supabase
    .from("cuotas_prestamo")
    .select("*")
    .eq("prestamo_id", prestamoId)
    .order("numero_cuota", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}


// ======================================================
// REINICIAR CUOTAS
// ======================================================
//
// Las cuotas vuelven a su estado original:
//
// capital_pagado     = 0
// intereses_pagado  = 0
// saldo_capital     = capital
// estado             = Pendiente
//
// ======================================================

async function reiniciarCuotas(
  prestamoId
) {

  const cuotas = await obtenerCuotas(
    prestamoId
  );

  for (const cuota of cuotas) {

    const capital =
      redondear(cuota.capital);

    const { error } = await supabase
      .from("cuotas_prestamo")
      .update({
        capital_pagado: 0,
        intereses_pagado: 0,
        saldo_capital: capital,
        estado: "Pendiente",
      })
      .eq("id", cuota.id);

    if (error) {
      throw error;
    }
  }

  return true;
}


// ======================================================
// CALCULAR ESTADO DE UNA CUOTA
// ======================================================

function calcularEstadoCuota(
  cuota
) {

  const capital =
    redondear(cuota.capital);

  const interes =
    redondear(cuota.interes);

  const capitalPagado =
    redondear(cuota.capital_pagado);

  const interesesPagado =
    redondear(cuota.intereses_pagado);

  const capitalPendiente =
    positivo(
      capital - capitalPagado
    );

  const interesPendiente =
    positivo(
      interes - interesesPagado
    );

  const totalPendiente =
    redondear(
      capitalPendiente +
      interesPendiente
    );

  if (
    totalPendiente <= 0
  ) {
    return "Pagada";
  }

  if (
    capitalPagado > 0 ||
    interesesPagado > 0
  ) {
    return "Parcial";
  }

  return "Pendiente";
}


// ======================================================
// APLICAR UN PAGO A LAS CUOTAS
// ======================================================
//
// REGLA:
//
// 1. Primero intereses
// 2. Después capital
// 3. Si sobra dinero pasa a la siguiente cuota
//
// ======================================================

async function aplicarPagoACuotas(
  pago,
  cuotas
) {

  let dineroDisponible =
    redondear(pago.valor);

  let capitalAplicado = 0;

  let interesesAplicados = 0;

  // ----------------------------------------------
  // Recorrer cuotas en orden
  // ----------------------------------------------

  for (const cuota of cuotas) {

    if (
      dineroDisponible <= 0
    ) {
      break;
    }

    const interesTotal =
      redondear(cuota.interes);

    const capitalTotal =
      redondear(cuota.capital);

    const interesesPagadoActual =
      redondear(
        cuota.intereses_pagado
      );

    const capitalPagadoActual =
      redondear(
        cuota.capital_pagado
      );

    // ==========================================
    // INTERÉS PENDIENTE
    // ==========================================

    const interesPendiente =
      positivo(
        interesTotal -
        interesesPagadoActual
      );

    // ==========================================
    // PAGAR INTERÉS
    // ==========================================

    const pagoInteres =
      redondear(
        Math.min(
          dineroDisponible,
          interesPendiente
        )
      );

    if (
      pagoInteres > 0
    ) {

      cuota.intereses_pagado =
        redondear(
          interesesPagadoActual +
          pagoInteres
        );

      dineroDisponible =
        redondear(
          dineroDisponible -
          pagoInteres
        );

      interesesAplicados =
        redondear(
          interesesAplicados +
          pagoInteres
        );
    }

    // ==========================================
    // CAPITAL PENDIENTE
    // ==========================================

    const capitalPendiente =
      positivo(
        capitalTotal -
        capitalPagadoActual
      );

    // ==========================================
    // PAGAR CAPITAL
    // ==========================================

    const pagoCapital =
      redondear(
        Math.min(
          dineroDisponible,
          capitalPendiente
        )
      );

    if (
      pagoCapital > 0
    ) {

      cuota.capital_pagado =
        redondear(
          capitalPagadoActual +
          pagoCapital
        );

      dineroDisponible =
        redondear(
          dineroDisponible -
          pagoCapital
        );

      capitalAplicado =
        redondear(
          capitalAplicado +
          pagoCapital
        );
    }

    // ==========================================
    // SALDO DE CAPITAL
    // ==========================================

    cuota.saldo_capital =
      positivo(
        capitalTotal -
        cuota.capital_pagado
      );

    // ==========================================
    // ESTADO
    // ==========================================

    cuota.estado =
      calcularEstadoCuota(
        cuota
      );
  }

  return {
    capitalAplicado,
    interesesAplicados,
    dineroSobrante:
      redondear(dineroDisponible),
  };
}


// ======================================================
// GUARDAR CAMBIOS DE TODAS LAS CUOTAS
// ======================================================

async function guardarCuotas(
  cuotas
) {

  for (const cuota of cuotas) {

    const { error } = await supabase
      .from("cuotas_prestamo")
      .update({
        capital_pagado:
          redondear(
            cuota.capital_pagado
          ),

        intereses_pagado:
          redondear(
            cuota.intereses_pagado
          ),

        saldo_capital:
          redondear(
            cuota.saldo_capital
          ),

        estado:
          cuota.estado,
      })
      .eq("id", cuota.id);

    if (error) {
      throw error;
    }
  }

  return true;
}


// ======================================================
// RECALCULAR TODOS LOS PAGOS DEL PRÉSTAMO
// ======================================================
//
// Esta es la función principal.
//
// Reconstruye todo:
//
// préstamo
//    ↓
// cuotas
//    ↓
// pagos
//    ↓
// aplicación de cada pago
//    ↓
// actualización de cuotas
//    ↓
// actualización del préstamo
//
// ======================================================

export async function recalcularPagosPrestamo(
  prestamoId
) {

  if (!prestamoId) {
    throw new Error(
      "No se recibió el ID del préstamo."
    );
  }

  // ==========================================
  // 1. Obtener préstamo
  // ==========================================

  const prestamo =
    await obtenerPrestamo(
      prestamoId
    );

  const capitalInicial =
    redondear(
      prestamo.capital
    );

  // ==========================================
  // 2. Obtener cuotas
  // ==========================================

  const cuotas =
    await obtenerCuotas(
      prestamoId
    );

  if (
    cuotas.length === 0
  ) {

    throw new Error(
      "El préstamo no tiene cuotas generadas."
    );
  }

  // ==========================================
  // 3. Reiniciar cuotas
  // ==========================================

  for (const cuota of cuotas) {

    cuota.capital_pagado = 0;

    cuota.intereses_pagado = 0;

    cuota.saldo_capital =
      redondear(
        cuota.capital
      );

    cuota.estado =
      "Pendiente";
  }

  // ==========================================
  // 4. Obtener pagos
  // ==========================================

  const pagos =
    await obtenerPagosDePrestamo(
      prestamoId
    );

  let capitalPagadoTotal = 0;

  let interesesPagadosTotal = 0;

  // ==========================================
  // 5. Aplicar cada pago
  // ==========================================

  for (const pago of pagos) {

    const valorPago =
      redondear(
        pago.valor
      );

    if (
      valorPago <= 0
    ) {
      continue;
    }

    const resultado =
      await aplicarPagoACuotas(
        {
          ...pago,
          valor: valorPago,
        },
        cuotas
      );

    capitalPagadoTotal =
      redondear(
        capitalPagadoTotal +
        resultado.capitalAplicado
      );

    interesesPagadosTotal =
      redondear(
        interesesPagadosTotal +
        resultado.interesesAplicados
      );

    // ========================================
    // Actualizar el pago
    // ========================================

    const { error } =
  await supabase
    .from("pagos_prestamo")
    .update({

      capital:
        resultado.capitalAplicado,

      interes:
        resultado.interesesAplicados,

      valor:
        valorPago,

    })
    .eq(
      "id",
      pago.id
    );

if (error) {
  throw error;

  }
}
  // ==========================================
  // 6. Guardar cuotas
  // ==========================================

  await guardarCuotas(
    cuotas
  );

  // ==========================================
  // 7. Calcular saldo general
  // ==========================================

  const saldoActual =
    positivo(
      capitalInicial -
      capitalPagadoTotal
    );

  // ==========================================
  // 8. Actualizar préstamo
  // ==========================================

  const { error:
    errorPrestamo
  } = await supabase
    .from("prestamos")
    .update({

      saldo_actual:
        saldoActual,

      capital_pagado:
        capitalPagadoTotal,

      intereses_pagados:
        interesesPagadosTotal,

    })
    .eq(
      "id",
      prestamoId
    );

  if (errorPrestamo) {
    throw errorPrestamo;
  }

  return {

    capitalInicial,

    capitalPagado:
      capitalPagadoTotal,

    interesesPagados:
      interesesPagadosTotal,

    saldoActual,

    cuotas,

  };
}


// ======================================================
// REGISTRAR PAGO
// ======================================================
//
// El formulario puede mandar:
//
// valor = $3.000.000
//
// El sistema decide:
//
// interés = $2.000.000
// capital = $1.000.000
//
// ======================================================

export async function registrarPagoPrestamo(
  pago
) {

  if (!pago?.prestamo_id) {

    throw new Error(
      "Debe seleccionar un préstamo."
    );
  }

  if (!pago?.metodo_pago_id) {

    throw new Error(
      "Debe seleccionar un método de pago."
    );
  }

  if (!pago?.fecha) {

    throw new Error(
      "Debe seleccionar la fecha del pago."
    );
  }

  const valor =
    redondear(
      pago.valor
    );

  if (
    valor <= 0
  ) {

    throw new Error(
      "El valor del pago debe ser mayor que cero."
    );
  }

  // ==========================================
  // Buscar préstamo
  // ==========================================

  const prestamo =
    await obtenerPrestamo(
      pago.prestamo_id
    );

  const saldoActual =
    redondear(
      prestamo.saldo_actual
    );

  // ==========================================
  // Validar que no pague más capital
  // ==========================================
  //
  // IMPORTANTE:
  //
  // El valor total puede ser mayor que el
  // capital porque incluye intereses.
  //
  // Por eso NO comparamos:
  //
  // valor > saldo
  //
  // sino que dejamos que las cuotas
  // determinen la distribución.
  //
  // ==========================================

  if (
    saldoActual <= 0
  ) {

    throw new Error(
      "El préstamo ya se encuentra totalmente pagado."
    );
  }

  // ==========================================
  // Insertar pago
  // ==========================================

  const {
    data: nuevoPago,
    error: errorInsertar,
  } = await supabase
    .from("pagos_prestamo")
    .insert([{

      prestamo_id:
        pago.prestamo_id,

      fecha:
        pago.fecha,

      capital:
        0,

      interes:
        0,

      valor:
        valor,

      metodo_pago_id:
        pago.metodo_pago_id,

      observacion:
        pago.observacion ||
        null,

      comprobante:
        pago.comprobante ||
        null,

      usuario_id:
        pago.usuario_id ||
        null,

      saldo_resultante:
        null,

    }])
    .select()
    .single();

  if (errorInsertar) {
    throw errorInsertar;
  }

  // ==========================================
  // Recalcular todo
  // ==========================================

  const resultado =
    await recalcularPagosPrestamo(
      pago.prestamo_id
    );

  // ==========================================
  // Buscar pago actualizado
  // ==========================================

  const {
    data: pagoFinal,
    error: errorFinal,
  } = await supabase
    .from("pagos_prestamo")
    .select("*")
    .eq(
      "id",
      nuevoPago.id
    )
    .single();

  if (errorFinal) {
    throw errorFinal;
  }

  // ==========================================
  // Actualizar saldo resultante del pago
  // ==========================================

  await supabase
    .from("pagos_prestamo")
    .update({

      saldo_resultante:
        resultado.saldoActual,

    })
    .eq(
      "id",
      nuevoPago.id
    );

  return {

    pago:
      {
        ...pagoFinal,

        saldo_resultante:
          resultado.saldoActual,
      },

    capitalPagado:
      resultado.capitalPagado,

    interesesPagados:
      resultado.interesesPagados,

    saldoNuevo:
      resultado.saldoActual,

  };
}


// ======================================================
// ACTUALIZAR PAGO
// ======================================================

export async function actualizarPagoPrestamo(
  id,
  pago
) {

  if (!id) {

    throw new Error(
      "No se recibió el ID del pago."
    );
  }

  // ==========================================
  // Buscar pago actual
  // ==========================================

  const {
    data: pagoActual,
    error: errorBuscar,
  } = await supabase
    .from("pagos_prestamo")
    .select("*")
    .eq(
      "id",
      id
    )
    .single();

  if (errorBuscar) {
    throw errorBuscar;
  }

  if (!pagoActual) {

    throw new Error(
      "No se encontró el pago."
    );
  }

  // ==========================================
  // Validaciones
  // ==========================================

  if (
    !pago.prestamo_id
  ) {

    throw new Error(
      "Debe seleccionar un préstamo."
    );
  }

  if (
    pago.prestamo_id !==
    pagoActual.prestamo_id
  ) {

    throw new Error(
      "No se puede cambiar el préstamo de un pago existente."
    );
  }

  if (
    !pago.metodo_pago_id
  ) {

    throw new Error(
      "Debe seleccionar un método de pago."
    );
  }

  const valor =
    redondear(
      pago.valor
    );

  if (
    valor <= 0
  ) {

    throw new Error(
      "El valor del pago debe ser mayor que cero."
    );
  }

  // ==========================================
  // Actualizar datos introducidos
  // ==========================================

  const {
    error: errorActualizar,
  } = await supabase
    .from("pagos_prestamo")
    .update({

      fecha:
        pago.fecha,

      valor:
        valor,

      metodo_pago_id:
        pago.metodo_pago_id,

      observacion:
        pago.observacion ||
        null,

      comprobante:
        pago.comprobante ||
        null,

    })
    .eq(
      "id",
      id
    );

  if (errorActualizar) {
    throw errorActualizar;
  }

  // ==========================================
  // Recalcular TODO
  // ==========================================

  const resultado =
    await recalcularPagosPrestamo(
      pagoActual.prestamo_id
    );

  // ==========================================
  // Obtener pago actualizado
  // ==========================================

  const {
    data: pagoFinal,
    error: errorFinal,
  } = await supabase
    .from("pagos_prestamo")
    .select("*")
    .eq(
      "id",
      id
    )
    .single();

  if (errorFinal) {
    throw errorFinal;
  }

  return {

    pago:
      pagoFinal,

    capitalPagado:
      resultado.capitalPagado,

    interesesPagados:
      resultado.interesesPagados,

    saldoNuevo:
      resultado.saldoActual,

  };
}


// ======================================================
// ELIMINAR PAGO
// ======================================================

export async function eliminarPagoPrestamo(
  id
) {

  if (!id) {

    throw new Error(
      "No se recibió el ID del pago."
    );
  }

  // ==========================================
  // Buscar pago
  // ==========================================

  const {
    data: pago,
    error: errorBuscar,
  } = await supabase
    .from("pagos_prestamo")
    .select(`
      id,
      prestamo_id
    `)
    .eq(
      "id",
      id
    )
    .single();

  if (errorBuscar) {
    throw errorBuscar;
  }

  if (!pago) {

    throw new Error(
      "No se encontró el pago."
    );
  }

  const prestamoId =
    pago.prestamo_id;

  // ==========================================
  // Eliminar
  // ==========================================

  const {
    error: errorEliminar,
  } = await supabase
    .from("pagos_prestamo")
    .delete()
    .eq(
      "id",
      id
    );

  if (errorEliminar) {
    throw errorEliminar;
  }

  // ==========================================
  // RECONSTRUIR TODO
  // ==========================================

  const resultado =
    await recalcularPagosPrestamo(
      prestamoId
    );

  return {

    eliminado:
      true,

    prestamoId,

    capitalPagado:
      resultado.capitalPagado,

    interesesPagados:
      resultado.interesesPagados,

    saldoNuevo:
      resultado.saldoActual,

  };
}


// ======================================================
// RECALCULAR MANUALMENTE UN PRÉSTAMO
// ======================================================

export async function recalcularPrestamo(
  prestamoId
) {

  return await recalcularPagosPrestamo(
    prestamoId
  );
}