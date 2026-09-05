import { supabase } from "../lib/supabase";

// ======================================
// Obtener movimientos financieros
// ======================================

export async function obtenerMovimientos() {
  const { data, error } = await supabase
    .from("movimientos_financieros_iglesia")
    .select(`
      id,
      fecha,
      tipo,
      categoria,
      descripcion,
      valor,
      miembro_id,
      creado_en,
      miembros (
        id,
        nombres,
        numero_identificacion
      )
    `)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false });

  if (error) throw error;

  return data || [];
}


// ======================================
// Crear movimiento
// ======================================

export async function crearMovimiento(movimiento) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("movimientos_financieros_iglesia")
    .insert([
      {
        fecha: movimiento.fecha,
        tipo: movimiento.tipo,
        categoria: movimiento.categoria,
        descripcion: movimiento.descripcion || null,
        valor: Number(movimiento.valor),
        miembro_id: movimiento.miembro_id || null,
        usuario_id: user?.id || null,
      },
    ])
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
    .from("movimientos_financieros_iglesia")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}