import { supabase } from "../lib/supabase";


// ======================================
// OBTENER CUOTAS DE UN PRÉSTAMO
// ======================================

export async function obtenerCuotasPrestamo(
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


// ======================================
// OBTENER UNA CUOTA
// ======================================

export async function obtenerCuota(
  cuotaId
) {

  if (!cuotaId) {

    throw new Error(
      "No se recibió el ID de la cuota."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .select("*")

    .eq(
      "id",
      cuotaId
    )

    .single();


  if (error) {

    throw error;

  }


  return data;

}


// ======================================
// CREAR UNA CUOTA
// ======================================

export async function crearCuota(
  cuota
) {

  if (!cuota?.prestamo_id) {

    throw new Error(
      "La cuota debe estar asociada a un préstamo."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .insert([
      cuota,
    ])

    .select()

    .single();


  if (error) {

    throw error;

  }


  return data;

}


// ======================================
// CREAR VARIAS CUOTAS
// ======================================

export async function crearCuotas(
  cuotas
) {

  if (
    !Array.isArray(cuotas) ||
    cuotas.length === 0
  ) {

    throw new Error(
      "No hay cuotas para registrar."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .insert(
      cuotas
    )

    .select();


  if (error) {

    throw error;

  }


  return data ?? [];

}


// ======================================
// GENERAR CUOTAS DEL PRÉSTAMO
//
// INTERÉS SOBRE SALDO
// ======================================

export async function generarCuotasPrestamo(
  prestamo
) {

  // ====================================
  // VALIDAR PRÉSTAMO
  // ====================================

  if (!prestamo?.id) {

    throw new Error(
      "No se recibió el ID del préstamo."
    );

  }


  // ====================================
  // DATOS DEL PRÉSTAMO
  // ====================================

  const capitalInicial =
    Number(
      prestamo.capital || 0
    );


  const tasaMensual =
    Number(
      prestamo.tasa_interes || 0
    );


  const plazo =
    Number(
      prestamo.plazo_meses || 0
    );


  const fechaInicio =
    prestamo.fecha_inicio;


  // ====================================
  // VALIDACIONES
  // ====================================

  if (
    capitalInicial <= 0
  ) {

    throw new Error(
      "El capital del préstamo debe ser mayor que cero."
    );

  }


  if (
    plazo <= 0
  ) {

    throw new Error(
      "El plazo del préstamo debe ser mayor que cero."
    );

  }


  if (!fechaInicio) {

    throw new Error(
      "El préstamo debe tener fecha de inicio."
    );

  }


  // ====================================
  // CAPITAL FIJO POR CUOTA
  // ====================================

  const capitalBase =
    capitalInicial /
    plazo;


  // ====================================
  // VERIFICAR CUOTAS EXISTENTES
  // ====================================

  const {
    data: cuotasExistentes,
    error: errorExistentes,
  } = await supabase

    .from("cuotas_prestamo")

    .select("id")

    .eq(
      "prestamo_id",
      prestamo.id
    );


  if (errorExistentes) {

    throw errorExistentes;

  }


  // ====================================
  // EVITAR DUPLICADOS
  // ====================================

  if (
    cuotasExistentes &&
    cuotasExistentes.length > 0
  ) {

    throw new Error(
      "Este préstamo ya tiene cuotas generadas."
    );

  }


  // ====================================
  // PREPARAR CUOTAS
  // ====================================

  const cuotas = [];


  let saldo =
    capitalInicial;


  // ====================================
  // GENERAR CADA CUOTA
  // ====================================

  for (
    let numero = 1;
    numero <= plazo;
    numero++
  ) {

    // ==================================
    // FECHA DE VENCIMIENTO
    // ==================================

    const fecha =
      new Date(
        `${fechaInicio}T00:00:00`
      );


    fecha.setMonth(
      fecha.getMonth() +
      numero
    );


    const anio =
      fecha.getFullYear();


    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const dia =
      String(
        fecha.getDate()
      ).padStart(
        2,
        "0"
      );


    const fechaVencimiento =
      `${anio}-${mes}-${dia}`;


    // ==================================
    // CAPITAL DE LA CUOTA
    // ==================================

    let capitalCuota =
      capitalBase;


    // ==================================
    // ÚLTIMA CUOTA
    //
    // Ajuste para que el saldo termine
    // exactamente en cero
    // ==================================

    if (
      numero === plazo
    ) {

      capitalCuota =
        saldo;

    }


    capitalCuota =
      Number(
        capitalCuota.toFixed(2)
      );


    // ==================================
    // INTERÉS SOBRE SALDO
    // ==================================

    const interesCuota =
      Number(
        (
          saldo *
          (
            tasaMensual /
            100
          )
        ).toFixed(2)
      );


    // ==================================
    // VALOR TOTAL DE LA CUOTA
    // ==================================

    const valorCuota =
      Number(
        (
          capitalCuota +
          interesCuota
        ).toFixed(2)
      );


    // ==================================
    // NUEVO SALDO
    // ==================================

    saldo =
      Number(
        (
          saldo -
          capitalCuota
        ).toFixed(2)
      );


    // Evitar saldo negativo
    if (
      saldo < 0
    ) {

      saldo = 0;

    }


    // ==================================
    // AGREGAR CUOTA
    // ==================================

    cuotas.push({

      prestamo_id:
        prestamo.id,

      numero_cuota:
        numero,

      fecha_vencimiento:
        fechaVencimiento,

      capital:
        capitalCuota,

      interes:
        interesCuota,

      valor_cuota:
        valorCuota,

      capital_pagado:
        0,

      intereses_pagado:
        0,

      saldo_capital:
        saldo,

      estado:
        "Pendiente",

    });

  }


  // ====================================
  // INSERTAR TODAS LAS CUOTAS
  // ====================================

  const {
    data,
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .insert(
      cuotas
    )

    .select();


  if (error) {

    throw error;

  }


  // ====================================
  // RETORNAR CUOTAS
  // ====================================

  return data ?? [];

}


// ======================================
// ELIMINAR CUOTAS DE UN PRÉSTAMO
// ======================================

export async function eliminarCuotasPrestamo(
  prestamoId
) {

  if (!prestamoId) {

    throw new Error(
      "No se recibió el ID del préstamo."
    );

  }


  const {
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .delete()

    .eq(
      "prestamo_id",
      prestamoId
    );


  if (error) {

    throw error;

  }


  return true;

}


// ======================================
// ACTUALIZAR UNA CUOTA
// ======================================

export async function actualizarCuota(
  cuotaId,
  cambios
) {

  if (!cuotaId) {

    throw new Error(
      "No se recibió el ID de la cuota."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("cuotas_prestamo")

    .update(
      cambios
    )

    .eq(
      "id",
      cuotaId
    )

    .select()

    .single();


  if (error) {

    throw error;

  }


  return data;

}