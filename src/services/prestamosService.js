import { supabase } from "../lib/supabase";

// ======================================
// Obtener préstamos
// ======================================

export async function obtenerPrestamos() {

  const {
    data,
    error,
  } = await supabase

    .from("prestamos")

    .select(`
      *,
      proyectos (
        id,
        nombre
      )
    `)

    .order("fecha_inicio", {
      ascending: false,
    });


  if (error) {
    throw error;
  }


  return data ?? [];

}


// ======================================
// Obtener préstamo activo
// ======================================

export async function obtenerPrestamoActivo() {

  const {
    data,
    error,
  } = await supabase

    .from("prestamos")

    .select(`
      *,
      proyectos (
        id,
        nombre
      )
    `)

    .eq("estado", "Activo")

    .order("creado_en", {
      ascending: false,
    })

    .limit(1);


  if (error) {
    throw error;
  }


  return data?.[0] ?? null;

}


// ======================================
// Obtener préstamo por ID
// ======================================

export async function obtenerPrestamoPorId(id) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del préstamo."
    );
  }


  const {
    data,
    error,
  } = await supabase

    .from("prestamos")

    .select(`
      *,
      proyectos (
        id,
        nombre
      )
    `)

    .eq("id", id)

    .single();


  if (error) {
    throw error;
  }


  return data;

}


// ======================================
// Crear préstamo
// ======================================

export async function crearPrestamo(prestamo) {

  if (!prestamo.proyecto_id) {
    throw new Error(
      "Debe seleccionar un proyecto."
    );
  }


  const capital =
    Number(prestamo.capital || 0);


  if (capital <= 0) {
    throw new Error(
      "El capital debe ser mayor que cero."
    );
  }


  const tasaInteres =
    Number(prestamo.tasa_interes || 0);


  if (tasaInteres < 0) {
    throw new Error(
      "La tasa de interés no puede ser negativa."
    );
  }


  const plazoMeses =
    Number(prestamo.plazo_meses || 0);


  if (plazoMeses <= 0) {
    throw new Error(
      "El plazo debe ser mayor que cero."
    );
  }


  if (!prestamo.fecha_inicio) {
    throw new Error(
      "Debe seleccionar la fecha de inicio."
    );
  }


  // ======================================
  // Cálculos iniciales
  // ======================================

  const cuotaCapital =
    capital / plazoMeses;


  const cuotaInteres =
    capital * (tasaInteres / 100);


  const {
    data,
    error,
  } = await supabase

    .from("prestamos")

    .insert([
      {

        proyecto_id:
          prestamo.proyecto_id,

        capital,

        tasa_interes:
          tasaInteres,

        tipo_interes:
          prestamo.tipo_interes ||
          "Mensual",

        plazo_meses:
          plazoMeses,

        fecha_inicio:
          prestamo.fecha_inicio,

        saldo_actual:
          capital,

        estado:
          prestamo.estado ||
          "Activo",

        cuota_capital:
          cuotaCapital,

        cuota_interes:
          cuotaInteres,

        capital_pagado:
          0,

        intereses_pagados:
          0,

      },
    ])

    .select()

    .single();


  if (error) {
    throw error;
  }


  return data;

}


// ======================================
// Actualizar préstamo
// ======================================

export async function actualizarPrestamo(
  id,
  prestamo
) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del préstamo."
    );
  }


  if (!prestamo.proyecto_id) {
    throw new Error(
      "Debe seleccionar un proyecto."
    );
  }


  const capital =
    Number(prestamo.capital || 0);


  if (capital <= 0) {
    throw new Error(
      "El capital debe ser mayor que cero."
    );
  }


  const tasaInteres =
    Number(prestamo.tasa_interes || 0);


  if (tasaInteres < 0) {
    throw new Error(
      "La tasa de interés no puede ser negativa."
    );
  }


  const plazoMeses =
    Number(prestamo.plazo_meses || 0);


  if (plazoMeses <= 0) {
    throw new Error(
      "El plazo debe ser mayor que cero."
    );
  }


  const cuotaCapital =
    capital / plazoMeses;


  const cuotaInteres =
    capital * (tasaInteres / 100);


  const {
    data,
    error,
  } = await supabase

    .from("prestamos")

    .update({

      proyecto_id:
        prestamo.proyecto_id,

      capital,

      tasa_interes:
        tasaInteres,

      tipo_interes:
        prestamo.tipo_interes ||
        "Mensual",

      plazo_meses:
        plazoMeses,

      fecha_inicio:
        prestamo.fecha_inicio,

      estado:
        prestamo.estado ||
        "Activo",

      cuota_capital:
        cuotaCapital,

      cuota_interes:
        cuotaInteres,

    })

    .eq("id", id)

    .select()

    .single();


  if (error) {
    throw error;
  }


  return data;

}


// ======================================
// Eliminar préstamo
// ======================================

export async function eliminarPrestamo(id) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del préstamo."
    );
  }


  const {
    error,
  } = await supabase

    .from("prestamos")

    .delete()

    .eq("id", id);


  if (error) {
    throw error;
  }


  return true;

}


// ======================================
// Cambiar estado del préstamo
// ======================================

export async function cambiarEstadoPrestamo(
  id,
  estado
) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del préstamo."
    );
  }


  if (!estado) {
    throw new Error(
      "Debe indicar el nuevo estado."
    );
  }


  const {
    data,
    error,
  } = await supabase

    .from("prestamos")

    .update({
      estado,
    })

    .eq("id", id)

    .select()

    .single();


  if (error) {
    throw error;
  }


  return data;

}