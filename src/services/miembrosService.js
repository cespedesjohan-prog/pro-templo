import { supabase } from "../lib/supabase";

// Obtener todos los miembros
export async function obtenerMiembros() {

  const respuesta = await supabase
    .from("miembros")
    .select("*")
    .order("creado_en", { ascending: false });

  console.log("RESPUESTA SUPABASE:", respuesta);

  const { data, error } = respuesta;

  if (error) {
    console.error(error);
    throw error;
  }

  return data;

}

// Crear un miembro

export async function crearMiembro(miembro) {
  const { data, error } = await supabase
    .from("miembros")
    .insert([miembro])
    .select();

  if (error) throw error;

  return data;
}


// Actualizar un miembro

export async function actualizarMiembro(id, miembro) {
  const { data, error } = await supabase
    .from("miembros")
    .update(miembro)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}


// Eliminar un miembro

export async function eliminarMiembro(id) {
  const { error } = await supabase
    .from("miembros")
    .delete()
    .eq("id", id);

  if (error) throw error;
}


// ======================================
// CREAR USUARIO DE ACCESO DEL MIEMBRO
// ======================================
export async function crearUsuarioMiembro({
  miembroId,
  correo,
  password,
}) {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "crear-usuario-miembro",
    {
      body: {
        miembro_id: miembroId,
        correo,
        password,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}