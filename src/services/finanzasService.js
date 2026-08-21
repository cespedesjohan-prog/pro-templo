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
  return Math.max(
    redondear(valor),
    0
  );
}


// ======================================================
// OBTENER PRÉSTAMO
// ======================================================

async function obtenerPrestamo(prestamoId) {

  const {
    data,
    error,
  } = await supabase

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

    .eq(
      "id",
      prestamoId
    )

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

async function obtenerCuotas(prestamoId) {

  const {
    data,
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .select("*")

    .eq(
      "prestamo_id",
      prestamoId
    )

    .order(
      "numero_cuota",
      {
        ascending: true,
      }
    );

  if (error) {
    throw error;
  }

  return data ?? [];
}


// ======================================================
// OBTENER PAGOS
// ======================================================

export async function obtenerPagosPrestamo() {

  const {
    data,
    error,
  } = await supabase

    .from("pagos_prestamo")

    .select("*")

    .order(
      "fecha",
      {
        ascending: true,
      }
    )

    .order(
      "creado_en",
      {
        ascending: true,
      }
    );

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

  const {
    data,
    error,
  } = await supabase

    .from("pagos_prestamo")

    .select("*")

    .eq(
      "prestamo_id",
      prestamoId
    )

    .order(
      "fecha",
      {
        ascending: true,
      }
    )

    .order(
      "creado_en",
      {
        ascending: true,
      }
    );

  if (error) {
    throw error;
  }

  return data ?? [];
}


// ======================================================
// CALCULAR APLICACIÓN DE UN PAGO
//
// REGLA:
//
// 1. Interés pendiente
// 2. Capital pendiente
// 3. Siguiente cuota
//
// ======================================================

function aplicarPagoACuotas(
  valorPago,
  cuotas
) {

  let disponible =
    redondear(
      valorPago
    );

  let capitalAplicado = 0;

  let interesesAplicados = 0;


  for (
    const cuota of cuotas
  ) {

    if (
      disponible <= 0
    ) {
      break;
    }


    // ====================================
    // DATOS DE LA CUOTA
    // ====================================

    const interesTotal =
      redondear(
        cuota.interes
      );

    const interesPagado =
      redondear(
        cuota.intereses_pagado
      );

    const capitalTotal =
      redondear(
        cuota.capital
      );

    const capitalPagado =
      redondear(
        cuota.capital_pagado
      );


    // ====================================
    // INTERÉS PENDIENTE
    // ====================================

    const interesPendiente =
      positivo(
        interesTotal -
        interesPagado
      );


    // ====================================
    // APLICAR INTERÉS
    // ====================================

    const pagoInteres =
      redondear(
        Math.min(
          disponible,
          interesPendiente
        )
      );

    cuota.intereses_pagado =
      redondear(
        interesPagado +
        pagoInteres
      );

    disponible =
      redondear(
        disponible -
        pagoInteres
      );

    interesesAplicados =
      redondear(
        interesesAplicados +
        pagoInteres
      );


    // ====================================
    // CAPITAL PENDIENTE
    // ====================================

    const capitalPendiente =
      positivo(
        capitalTotal -
        capitalPagado
      );


    // ====================================
    // APLICAR CAPITAL
    // ====================================

    const pagoCapital =
      redondear(
        Math.min(
          disponible,
          capitalPendiente
        )
      );

    cuota.capital_pagado =
      redondear(
        capitalPagado +
        pagoCapital
      );

    disponible =
      redondear(
        disponible -
        pagoCapital
      );

    capitalAplicado =
      redondear(
        capitalAplicado +
        pagoCapital
      );


    // ====================================
    // SALDO DE CAPITAL
    // ====================================

    cuota.saldo_capital =
      positivo(
        capitalTotal -
        cuota.capital_pagado
      );


    // ====================================
    // ESTADO
    // ====================================

    const interesPendienteFinal =
      positivo(
        interesTotal -
        cuota.intereses_pagado
      );

    const capitalPendienteFinal =
      positivo(
        capitalTotal -
        cuota.capital_pagado
      );


    if (
      interesPendienteFinal <= 0 &&
      capitalPendienteFinal <= 0
    ) {

      cuota.estado =
        "Pagada";

    } else if (
      cuota.intereses_pagado > 0 ||
      cuota.capital_pagado > 0
    ) {

      cuota.estado =
        "Parcial";

    } else {

      cuota.estado =
        "Pendiente";

    }

  }


  return {

    capitalAplicado,

    interesesAplicados,

    dineroSobrante:
      disponible,

  };
}


// ======================================================
// GUARDAR CUOTAS
// ======================================================

async function guardarCuotas(
  cuotas
) {

  for (
    const cuota of cuotas
  ) {

    const {
      error,
    } = await supabase

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

      .eq(
        "id",
        cuota.id
      );


    if (error) {
      throw error;
    }

  }

  return true;
}


// ======================================================
// RECALCULAR TODO EL PRÉSTAMO
// ======================================================
//
// Esta función reconstruye:
//
// PAGOS
//   ↓
// CUOTAS
//   ↓
// CAPITAL PAGADO
//   ↓
// INTERESES PAGADOS
//   ↓
// SALDO DEL PRÉSTAMO
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


  // ====================================
  // 1. PRÉSTAMO
  // ====================================

  const prestamo =
    await obtenerPrestamo(
      prestamoId
    );


  const capitalInicial =
    redondear(
      prestamo.capital
    );


  // ====================================
  // 2. CUOTAS
  // ====================================

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


  // ====================================
  // 3. REINICIAR CUOTAS EN MEMORIA
  // ====================================

  for (
    const cuota of cuotas
  ) {

    cuota.capital_pagado =
      0;

    cuota.intereses_pagado =
      0;

    cuota.saldo_capital =
      redondear(
        cuota.capital
      );

    cuota.estado =
      "Pendiente";

  }


  // ====================================
  // 4. OBTENER PAGOS
  // ====================================

  const pagos =
    await obtenerPagosDePrestamo(
      prestamoId
    );


  let capitalPagadoTotal =
    0;

  let interesesPagadosTotal =
    0;


  // ====================================
  // 5. APLICAR PAGOS
  // ====================================

  for (
    const pago of pagos
  ) {

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
      aplicarPagoACuotas(
        valorPago,
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


    // ==================================
    // ACTUALIZAR PAGO
    // ==================================

    const valorAplicado =
      redondear(
        resultado.capitalAplicado +
        resultado.interesesAplicados
      );


    const {
      error,
    } = await supabase

      .from("pagos_prestamo")

      .update({

        capital:
          resultado.capitalAplicado,

        interes:
          resultado.interesesAplicados,

        valor:
          valorAplicado,

      })

      .eq(
        "id",
        pago.id
      );


    if (error) {
      throw error;
    }

  }


  // ====================================
  // 6. GUARDAR CUOTAS
  // ====================================

  await guardarCuotas(
    cuotas
  );


  // ====================================
  // 7. SALDO DEL PRÉSTAMO
  // ====================================

  const saldoActual =
    positivo(
      capitalInicial -
      capitalPagadoTotal
    );


  // ====================================
  // 8. ACTUALIZAR PRÉSTAMO
  // ====================================

  const {
    error:
      errorPrestamo,
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

    saldoAnterior:
      capitalInicial,

    saldoNuevo:
      saldoActual,

    capitalPagado:
      capitalPagadoTotal,

    interesesPagados:
      interesesPagadosTotal,

    cuotas,

  };

}


// ======================================================
// CALCULAR SALDO REAL DESDE CUOTAS
// ======================================================
//
// IMPORTANTE:
// El saldo de capital se obtiene directamente
// de las cuotas y NO depende de saldo_actual.
//
// ======================================================

async function obtenerSaldoRealDesdeCuotas(
  prestamoId
) {

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


  const saldoCapital =
    cuotas.reduce(
      (
        total,
        cuota
      ) => {

        const capital =
          redondear(
            cuota.capital
          );

        const capitalPagado =
          redondear(
            cuota.capital_pagado
          );

        return (
          total +
          positivo(
            capital -
            capitalPagado
          )
        );

      },
      0
    );


  return {
    cuotas,
    saldoCapital:
      redondear(
        saldoCapital
      ),
  };

}


// ======================================================
// REGISTRAR PAGO
// ======================================================
//
// El usuario solamente envía:
//
// valor = valor total del pago
//
// El sistema calcula:
//
// interés + capital
//
// ======================================================

export async function registrarPagoPrestamo(
  pago
) {

  // ====================================
  // VALIDACIONES
  // ====================================

  if (
    !pago?.prestamo_id
  ) {

    throw new Error(
      "Debe seleccionar un préstamo."
    );

  }


  if (
    !pago?.fecha
  ) {

    throw new Error(
      "Debe seleccionar la fecha del pago."
    );

  }


  if (
    !pago?.metodo_pago_id
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


  // ====================================
  // BUSCAR PRÉSTAMO
  // ====================================

  const prestamo =
    await obtenerPrestamo(
      pago.prestamo_id
    );


  // ====================================
  // OBTENER SALDO REAL
  // DESDE LAS CUOTAS
  // ====================================

  const {
    cuotas,
    saldoCapital,
  } =
    await obtenerSaldoRealDesdeCuotas(
      pago.prestamo_id
    );


  // ====================================
  // VERIFICAR SALDO
  // ====================================

  if (
    saldoCapital <= 0
  ) {

    throw new Error(
      "El préstamo ya se encuentra totalmente pagado."
    );

  }


  // ====================================
  // CALCULAR INTERÉS PENDIENTE
  // ====================================

  const interesesPendientes =
    cuotas.reduce(
      (
        total,
        cuota
      ) => {

        const interes =
          redondear(
            cuota.interes
          );

        const interesPagado =
          redondear(
            cuota.intereses_pagado
          );

        return (
          total +
          positivo(
            interes -
            interesPagado
          )
        );

      },
      0
    );


  const totalPendiente =
    redondear(
      saldoCapital +
      interesesPendientes
    );


  // ====================================
  // VALIDAR EXCESO
  // ====================================

  if (
    valor >
    totalPendiente + 0.01
  ) {

    throw new Error(
      `El pago no puede superar el total pendiente de ${totalPendiente.toLocaleString(
        "es-CO"
      )}.`
    );

  }


  // ====================================
  // INSERTAR PAGO
  // ====================================

  const {
    data:
      nuevoPago,
    error:
      errorPago,
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


  if (errorPago) {
    throw errorPago;
  }


  // ====================================
  // RECALCULAR TODO
  // ====================================

  const resultado =
    await recalcularPagosPrestamo(
      pago.prestamo_id
    );


  // ====================================
  // SALDO DEL PAGO
  // ====================================

  const {
    error:
      errorSaldo,
  } = await supabase

    .from("pagos_prestamo")

    .update({

      saldo_resultante:
        resultado.saldoNuevo,

    })

    .eq(
      "id",
      nuevoPago.id
    );


  if (errorSaldo) {
    throw errorSaldo;
  }


  // ====================================
  // OBTENER PAGO FINAL
  // ====================================

  const {
    data:
      pagoFinal,
    error:
      errorFinal,
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


  return {

    pago:
      pagoFinal,

    capitalPagado:
      resultado.capitalPagado,

    interesesPagados:
      resultado.interesesPagados,

    saldoNuevo:
      resultado.saldoNuevo,

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


  // ====================================
  // BUSCAR PAGO ACTUAL
  // ====================================

  const {
    data:
      pagoActual,
    error:
      errorBuscar,
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


  // ====================================
  // NO CAMBIAR PRÉSTAMO
  // ====================================

  if (
    pago.prestamo_id !==
    pagoActual.prestamo_id
  ) {

    throw new Error(
      "No se puede cambiar el préstamo de un pago existente."
    );

  }


  // ====================================
  // VALIDACIONES
  // ====================================

  if (
    !pago.fecha
  ) {

    throw new Error(
      "Debe seleccionar la fecha del pago."
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


  // ====================================
  // ACTUALIZAR PAGO
  // ====================================

  const {
    error:
      errorActualizar,
  } = await supabase

    .from("pagos_prestamo")

    .update({

      fecha:
        pago.fecha,

      valor:
        valor,

      capital:
        0,

      interes:
        0,

      metodo_pago_id:
        pago.metodo_pago_id,

      observacion:
        pago.observacion ||
        null,

      comprobante:
        pago.comprobante ??
        pagoActual.comprobante ??
        null,

    })

    .eq(
      "id",
      id
    );


  if (errorActualizar) {
    throw errorActualizar;
  }


  // ====================================
  // RECALCULAR TODO
  // ====================================

  const resultado =
    await recalcularPagosPrestamo(
      pagoActual.prestamo_id
    );


  // ====================================
  // OBTENER PAGO FINAL
  // ====================================

  const {
    data:
      pagoFinal,
    error:
      errorFinal,
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
      resultado.saldoNuevo,

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


  // ====================================
  // BUSCAR PAGO
  // ====================================

  const {
    data:
      pago,
    error:
      errorBuscar,
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


  // ====================================
  // ELIMINAR
  // ====================================

  const {
    error:
      errorEliminar,
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


  // ====================================
  // RECALCULAR TODO
  // ====================================

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
      resultado.saldoNuevo,

  };

}


// ======================================================
// RECALCULAR PRÉSTAMO
// ======================================================

export async function recalcularPrestamo(
  prestamoId
) {

  return await recalcularPagosPrestamo(
    prestamoId
  );

}