import { supabase } from "../lib/supabase";


// ======================================
// OBTENER APORTES
// ======================================

export async function obtenerAportes() {

  const {
    data,
    error,
  } = await supabase

    .from("aportes")

    .select(`
      *,
      proyectos (
        id,
        nombre
      ),
      miembros (
        id,
        nombres
      ),
      metodos_pago (
        id,
        nombre
      )
    `)

    .order("fecha", {
      ascending: false,
    })

    .order("creado_en", {
      ascending: false,
    });


  if (error) {
    throw error;
  }


  return data ?? [];

}



// ======================================
// CREAR APORTE
// ======================================

export async function crearAporte(aporte) {

  if (!aporte.proyecto_id) {

    throw new Error(
      "Debe seleccionar un proyecto."
    );

  }


  if (!aporte.miembro_id) {

    throw new Error(
      "Debe seleccionar un miembro."
    );

  }


  const valor =
    Number(aporte.valor || 0);


  if (valor <= 0) {

    throw new Error(
      "El valor del aporte debe ser mayor que cero."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("aportes")

    .insert([
      {

        proyecto_id:
          aporte.proyecto_id,

        miembro_id:
          aporte.miembro_id,

        fecha:
          aporte.fecha,

        valor,

        metodo_pago_id:
          aporte.metodo_pago_id ||
          null,

        observacion:
          aporte.observacion ||
          null,

        estado:
          aporte.estado ||
          "Pendiente",

        usuario_id:
          aporte.usuario_id ||
          null,

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
// ACTUALIZAR APORTE
// ======================================

export async function actualizarAporte(
  id,
  aporte
) {

  if (!id) {

    throw new Error(
      "No se recibió el ID del aporte."
    );

  }


  const valor =
    Number(aporte.valor || 0);


  if (valor <= 0) {

    throw new Error(
      "El valor del aporte debe ser mayor que cero."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("aportes")

    .update({

      proyecto_id:
        aporte.proyecto_id,

      miembro_id:
        aporte.miembro_id,

      fecha:
        aporte.fecha,

      valor,

      metodo_pago_id:
        aporte.metodo_pago_id ||
        null,

      observacion:
        aporte.observacion ||
        null,

      estado:
        aporte.estado ||
        "Pendiente",

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
// ELIMINAR APORTE
// ======================================

export async function eliminarAporte(id) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del aporte."
    );
  }

  const { error } = await supabase
    .from("aportes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar aporte:", error);
    throw error;
  }

  return true;
}


// ======================================
// MÉTODOS DE PAGO
// ======================================

export async function obtenerMetodosPago() {

  const {
    data,
    error,
  } = await supabase

    .from("metodos_pago")

    .select(`
      id,
      nombre,
      activo
    `)

    .eq("activo", true)

    .order("nombre", {
      ascending: true,
    });


  if (error) {
    throw error;
  }


  return data ?? [];

}



// ======================================
// GUARDAR INFORMACIÓN DEL COMPROBANTE
// ======================================

export async function actualizarComprobanteAporte(
  aporteId,
  archivo
) {

  if (!aporteId) {

    throw new Error(
      "No se recibió el ID del aporte."
    );

  }


  if (!archivo?.ruta) {

    throw new Error(
      "No se recibió la ruta del comprobante."
    );

  }


  const {
    data,
    error,
  } = await supabase

    .from("aportes")

    .update({

      comprobante_ruta:
        archivo.ruta,

      comprobante_nombre:
        archivo.nombre ||
        null,

      comprobante_tipo:
        archivo.tipo ||
        null,

      comprobante_tamano:
        archivo.tamano ||
        null,

    })

    .eq("id", aporteId)

    .select()

    .single();


  if (error) {
    throw error;
  }


  return data;

}



// ======================================
// APROBAR APORTE
// ======================================



export async function aprobarAporte(id) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del aporte."
    );
  }

  const { data, error } = await supabase
    .from("aportes")
    .update({
      estado: "Registrado",
    })
    .eq("id", id)
    .select("id, estado")
    .maybeSingle();

  if (error) {
    console.error("Error Supabase aprobando:", error);
    throw error;
  }

  console.log("RESULTADO APROBAR:", data);

  if (!data) {
    throw new Error(
      "Supabase no modificó el aporte. Probablemente la política RLS no permite actualizar aportes con este usuario."
    );
  }

  return data;
}
// ======================================
// RECHAZAR APORTE
// ======================================

export async function rechazarAporte(id) {

  if (!id) {
    throw new Error(
      "No se recibió el ID del aporte."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("aportes")
    .update({
      estado: "Anulado",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}