import { supabase } from "../lib/supabase";

// ======================================
// Subir comprobante de aporte
// ======================================

export async function subirComprobanteAporte(
  archivo,
  miembroId
) {

  if (!archivo) {
    throw new Error(
      "Debe seleccionar un comprobante."
    );
  }

  if (!miembroId) {
    throw new Error(
      "No se pudo identificar el miembro."
    );
  }


  // ======================================
  // Tipos permitidos
  // ======================================

  const tiposPermitidos = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (
    !tiposPermitidos.includes(
      archivo.type
    )
  ) {

    throw new Error(
      "El comprobante debe ser PDF, JPG o PNG."
    );

  }


  // ======================================
  // Máximo 5 MB
  // ======================================

  const maximo =
    5 * 1024 * 1024;

  if (archivo.size > maximo) {

    throw new Error(
      "El comprobante no puede superar 5 MB."
    );

  }


  // ======================================
  // Extensión
  // ======================================

  const extension =
    archivo.name
      .split(".")
      .pop()
      ?.toLowerCase();


  // ======================================
  // Nombre único
  // ======================================

  const nombreArchivo =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;


  // ======================================
  // Ruta
  // ======================================

  const ruta =
    `aportes/${miembroId}/${nombreArchivo}`;


  // ======================================
  // Subir Storage
  // ======================================

  const {
    error,
  } = await supabase.storage

    .from("comprobantes-aportes")

    .upload(
      ruta,
      archivo,
      {
        cacheControl: "3600",
        upsert: false,
        contentType: archivo.type,
      }
    );


  if (error) {
    throw error;
  }


  // ======================================
  // Información del archivo
  // ======================================

  return {

    ruta,

    nombre:
      archivo.name,

    tipo:
      archivo.type,

    tamano:
      archivo.size,

  };

}


// ======================================
// Obtener URL temporal
// ======================================

export async function obtenerUrlComprobanteAporte(
  ruta
) {

  if (!ruta) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.storage

    .from("comprobantes-aportes")

    .createSignedUrl(
      ruta,
      60 * 5
    );


  if (error) {
    throw error;
  }


  return (
    data?.signedUrl ||
    null
  );

}


// ======================================
// Eliminar comprobante
// ======================================

export async function eliminarComprobanteAporte(
  ruta
) {

  if (!ruta) {
    return;
  }


  const {
    error,
  } = await supabase.storage

    .from("comprobantes-aportes")

    .remove([
      ruta,
    ]);


  if (error) {
    throw error;
  }

}