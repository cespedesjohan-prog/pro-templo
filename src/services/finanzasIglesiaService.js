import { supabase } from "../lib/supabase";

// ======================================
// OBTENER MOVIMIENTOS FINANCIEROS
// ======================================

export async function obtenerMovimientosIglesia() {
  const { data, error } = await supabase
    .from("movimientos_financieros_iglesia")
    .select(`
      *,
      miembros (
        id,
        nombres,
        numero_identificacion
      )
    `)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("Error obteniendo movimientos:", error);
    throw error;
  }

  return data || [];
}


// ======================================
// OBTENER MOVIMIENTOS DEL MES
// ======================================

export async function obtenerMovimientosMes() {
  const hoy = new Date();

  const primerDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const ultimoDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("movimientos_financieros_iglesia")
    .select("*")
    .gte("fecha", primerDia)
    .lte("fecha", ultimoDia);

  if (error) {
    console.error("Error obteniendo movimientos del mes:", error);
    throw error;
  }

  return data || [];
}


// ======================================
// CREAR MOVIMIENTO
// ======================================

export async function crearMovimientoIglesia(movimiento) {
  const { data, error } = await supabase
    .from("movimientos_financieros_iglesia")
    .insert([
      {
        fecha: movimiento.fecha,
        tipo: movimiento.tipo,
        categoria: movimiento.categoria,
        descripcion: movimiento.descripcion || null,
        valor: Number(movimiento.valor),
        responsable: movimiento.responsable || null,
        miembro_id: movimiento.miembro_id || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando movimiento:", error);
    throw error;
  }

  return data;
}


// ======================================
// ACTUALIZAR MOVIMIENTO
// ======================================

export async function actualizarMovimientoIglesia(
  id,
  movimiento
) {
  const { data, error } = await supabase
    .from("movimientos_financieros_iglesia")
    .update({
      fecha: movimiento.fecha,
      tipo: movimiento.tipo,
      categoria: movimiento.categoria,
      descripcion: movimiento.descripcion || null,
      valor: Number(movimiento.valor),
      responsable: movimiento.responsable || null,
      miembro_id: movimiento.miembro_id || null,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando movimiento:", error);
    throw error;
  }

  return data;
}


// ======================================
// ELIMINAR MOVIMIENTO
// ======================================

export async function eliminarMovimientoIglesia(id) {
  const { error } = await supabase
    .from("movimientos_financieros_iglesia")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando movimiento:", error);
    throw error;
  }

  return true;
}


// ======================================
// OBTENER MIEMBROS
// ======================================

export async function obtenerMiembrosIglesia() {
  const { data, error } = await supabase
    .from("miembros")
    .select(`
      id,
      nombres,
      numero_identificacion,
      telefono_movil
    `)
    .order("nombres", {
      ascending: true,
    });

  if (error) {
    console.error("Error obteniendo miembros:", error);
    throw error;
  }

  return data || [];
}


// ======================================
// BUSCAR MIEMBROS
// ======================================

export async function buscarMiembrosIglesia(busqueda) {
  if (!busqueda || busqueda.trim() === "") {
    return obtenerMiembrosIglesia();
  }

  const texto = busqueda.trim();

  const { data, error } = await supabase
    .from("miembros")
    .select(`
      id,
      nombres,
      numero_identificacion,
      telefono_movil
    `)
    .or(
      `nombres.ilike.%${texto}%,numero_identificacion.ilike.%${texto}%`
    )
    .order("nombres", {
      ascending: true,
    })
    .limit(20);

  if (error) {
    console.error("Error buscando miembros:", error);
    throw error;
  }

  return data || [];
}