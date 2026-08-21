import { supabase } from "../lib/supabase";

// ======================================
// Obtener todos los parámetros
// ======================================

export async function obtenerParametros() {

  const { data, error } = await supabase
    .from("parametros_financieros")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;

  return data;

}

// ======================================
// Obtener parámetro por código
// ======================================

export async function obtenerParametro(codigo) {

  const { data, error } = await supabase
    .from("parametros_financieros")
    .select("*")
    .eq("codigo", codigo)
    .single();

  if (error) throw error;

  return data;

}

// ======================================
// Actualizar parámetro
// ======================================

export async function actualizarParametro(id, valor) {

  const { data, error } = await supabase
    .from("parametros_financieros")
    .update({

      valor,

      actualizado_en: new Date(),

    })

    .eq("id", id)

    .select()

    .single();

  if (error) throw error;

  return data;

}