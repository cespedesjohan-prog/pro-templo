import { supabase } from "../lib/supabase";

// ======================================
// Registrar movimiento financiero
// ======================================

export async function registrarMovimiento(datos) {

  const { data, error } = await supabase

    .from("movimientos_financieros")

    .insert([datos])

    .select()

    .single();

  if (error) throw error;

  return data;

}

// ======================================
// Obtener movimientos
// ======================================

export async function obtenerMovimientos() {

  const { data, error } = await supabase

    .from("movimientos_financieros")

    .select("*")

    .order("fecha", { ascending: false });

  if (error) throw error;

  return data;

}