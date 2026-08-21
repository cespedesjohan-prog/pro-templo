import { crearAporte } from "../aportesService";
import { registrarMovimiento } from "../movimientosFinancierosService";

// ========================================
// Registrar aporte
// ========================================

export async function registrarAporteERP(aporte) {

  // 1. Guardar aporte

  const nuevoAporte = await crearAporte(aporte);

  // 2. Crear ingreso en Tesorería

  await registrarMovimiento({

    fecha: aporte.fecha,

    tipo: "Ingreso",

    categoria: "Aportes",

    descripcion: "Aporte registrado",

    valor: aporte.valor,

    proyecto_id: aporte.proyecto_id,

    aporte_id: nuevoAporte[0].id,

  });

  return nuevoAporte;

}