import { supabase } from "../lib/supabase";

// =======================================
// Obtener todos los proyectos
// =======================================

export async function obtenerProyectos() {

  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) throw error;

  return data;

}

// =======================================
// Crear proyecto
// =======================================

export async function crearProyecto(proyecto) {

  const { data, error } = await supabase
    .from("proyectos")
    .insert([proyecto])
    .select();

  if (error) throw error;

  return data;

}

// =======================================
// Actualizar proyecto
// =======================================

export async function actualizarProyecto(id, proyecto) {

  const { data, error } = await supabase
    .from("proyectos")
    .update(proyecto)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;

}

// =======================================
// Eliminar proyecto
// =======================================

export async function eliminarProyecto(id) {

  const { error } = await supabase
    .from("proyectos")
    .delete()
    .eq("id", id);

  if (error) throw error;

}