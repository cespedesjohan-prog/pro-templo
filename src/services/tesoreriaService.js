import { supabase } from "../lib/supabase";

// ======================================
// Obtener movimientos de Tesorería
// ======================================

export async function obtenerMovimientos() {

  const { data, error } = await supabase
    .from("tesoreria")
    .select(`
      *,
      proyectos (
        id,
        nombre
      ),
      aportes (
        id,
        valor
      ),
      pagos_prestamo (
        id,
        valor
      )
    `)
    .order("fecha", { ascending: false });

  if (error) throw error;

  return data;

}

// ======================================
// Registrar movimiento
// ======================================

export async function registrarMovimiento(movimiento) {

  const { data, error } = await supabase
    .from("tesoreria")
    .insert([movimiento])
    .select()
    .single();

  if (error) throw error;

  return data;

}

// ======================================
// Actualizar movimiento
// ======================================

export async function actualizarMovimiento(id, movimiento) {

  const { data, error } = await supabase
    .from("tesoreria")
    .update(movimiento)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;

}

// ======================================
// Eliminar movimiento
// ======================================

export async function eliminarMovimiento(id) {

  const { error } = await supabase
    .from("tesoreria")
    .delete()
    .eq("id", id);

  if (error) throw error;

}

// ======================================
// Resumen financiero
// ======================================

export async function obtenerResumenTesoreria() {

  const { data, error } = await supabase
    .from("tesoreria")
    .select("tipo, valor");

  if (error) throw error;

  const ingresos = data
    .filter(m => m.tipo === "Ingreso")
    .reduce((t, m) => t + Number(m.valor), 0);

  const egresos = data
    .filter(m => m.tipo === "Egreso")
    .reduce((t, m) => t + Number(m.valor), 0);

  return {

    ingresos,

    egresos,

    saldo: ingresos - egresos,

  };

}