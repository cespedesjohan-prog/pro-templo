import { supabase } from "../lib/supabase";

// ======================================
// Subir comprobante
// ======================================

export async function subirComprobante(
  archivo,
  prestamoId
) {

  if (!archivo) {
    return null;
  }

  if (!prestamoId) {
    throw new Error(
      "Debe seleccionar un préstamo."
    );
  }

  // ======================================
  // Validar tipo
  // ======================================

  const tiposPermitidos = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (!tiposPermitidos.includes(archivo.type)) {

    throw new Error(
      "El comprobante debe ser PDF, JPG o PNG."
    );

  }

  // ======================================
  // Validar tamaño
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
  // Nombre único
  // ======================================

  const extension =
    archivo.name
      .split(".")
      .pop()
      .toLowerCase();

  const nombreArchivo =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const ruta =
    `${prestamoId}/${nombreArchivo}`;

  // ======================================
  // Subir a Storage
  // ======================================

  const { error } =
    await supabase.storage

      .from("comprobantes-pagos")

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
  // Devolver ruta
  // ======================================

  return ruta;

}


// ======================================
// Obtener URL temporal del comprobante
// ======================================

export async function obtenerUrlComprobante(
  ruta
) {

  if (!ruta) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.storage

    .from("comprobantes-pagos")

    .createSignedUrl(
      ruta,
      60 * 5
    );

  if (error) {
    throw error;
  }

  return data?.signedUrl || null;

}


// ======================================
// Eliminar comprobante
// ======================================

export async function eliminarComprobante(
  ruta
) {

  if (!ruta) {
    return;
  }

  const { error } =
    await supabase.storage

      .from("comprobantes-pagos")

      .remove([
        ruta,
      ]);

  if (error) {
    throw error;
  }

}