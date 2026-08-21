import { supabase } from "../lib/supabase";

export async function obtenerDashboard() {

  const hoy = new Date().toISOString().split("T")[0];

  // =====================================================
  // CONSULTAS
  // =====================================================

  const [
    miembros,
    proyecto,
    aportes,
    prestamos,
  ] = await Promise.all([

    // -----------------------------------------------------
    // MIEMBROS
    // -----------------------------------------------------

    supabase
      .from("miembros")
      .select("*", { count: "exact", head: true }),

    // -----------------------------------------------------
    // PROYECTO ACTIVO
    // -----------------------------------------------------

    supabase
      .from("proyectos")
      .select("*")
      .eq("estado", "Activo")
      .maybeSingle(),

    // -----------------------------------------------------
    // APORTES
    //
    // IMPORTANTE:
    // SOLO TRAEMOS APORTES APROBADOS
    // -----------------------------------------------------

    supabase
  .from("aportes")
  .select(`
    id,
    fecha,
    valor,
    estado,
    miembros(nombres),
    metodos_pago(nombre)
  `)
  .eq("estado", "Registrado"),

    // -----------------------------------------------------
    // PRÉSTAMOS ACTIVOS
    // -----------------------------------------------------

    supabase
      .from("prestamos")
      .select("saldo_actual")
      .eq("estado", "Activo"),

  ]);


  // =====================================================
  // DATOS BASE
  // =====================================================

  const totalMiembros =
    miembros.count || 0;

  const listaAportes =
    aportes.data || [];

  const listaPrestamos =
    prestamos.data || [];


  // =====================================================
  // SALDO DE PRÉSTAMOS
  // =====================================================

  const saldoPrestamos =
    listaPrestamos.reduce(
      (total, prestamo) =>
        total +
        Number(
          prestamo.saldo_actual || 0
        ),
      0
    );


  // =====================================================
  // TOTAL RECAUDADO
  //
  // Como listaAportes contiene únicamente
  // aportes aprobados, los pendientes
  // NO se cuentan.
  // =====================================================

  const totalRecaudado =
    listaAportes.reduce(
      (total, aporte) =>
        total +
        Number(aporte.valor || 0),
      0
    );


  // =====================================================
  // RECAUDADO HOY
  // =====================================================

  const recaudadoHoy =
    listaAportes
      .filter(
        (aporte) =>
          aporte.fecha === hoy
      )
      .reduce(
        (total, aporte) =>
          total +
          Number(aporte.valor || 0),
        0
      );


  // =====================================================
  // NÚMERO DE APORTES
  // =====================================================

  const totalAportes =
    listaAportes.length;


  // =====================================================
  // ÚLTIMO APORTE APROBADO
  // =====================================================

  const aportesOrdenados =
    [...listaAportes].sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    );

  const ultimoAporte =
    aportesOrdenados[0] || null;


  // =====================================================
  // AVANCE DEL PROYECTO
  //
  // SOLO SE CALCULA CON APORTES APROBADOS
  // =====================================================

  let avance = 0;

  if (
    proyecto.data &&
    Number(proyecto.data.meta) > 0
  ) {

    avance =
      (
        totalRecaudado /
        Number(proyecto.data.meta)
      ) * 100;

    // Evitamos superar 100%
    avance = Math.min(avance, 100);
  }


  // =====================================================
  // ÚLTIMOS 5 APORTES APROBADOS
  // =====================================================

  const ultimosAportes =
    [...listaAportes]
      .sort(
        (a, b) =>
          new Date(b.fecha) -
          new Date(a.fecha)
      )
      .slice(0, 5);


  // =====================================================
  // APORTES POR MES
  // =====================================================

  const aportesPorMes = {};


  listaAportes.forEach((aporte) => {

    const fecha =
      new Date(aporte.fecha);

    const mes =
      fecha.toLocaleString(
        "es-CO",
        {
          month: "short",
        }
      );

    if (!aportesPorMes[mes]) {

      aportesPorMes[mes] = 0;

    }

    aportesPorMes[mes] +=
      Number(aporte.valor || 0);

  });


  const graficoMes =
    Object.keys(aportesPorMes)
      .map((mes) => ({

        mes,

        valor:
          aportesPorMes[mes],

      }));


  // =====================================================
  // APORTES POR MÉTODO DE PAGO
  // =====================================================

  const metodos = {};


  listaAportes.forEach((aporte) => {

    const metodo =
      aporte.metodos_pago?.nombre ||
      "Sin método";


    if (!metodos[metodo]) {

      metodos[metodo] = 0;

    }


    metodos[metodo] +=
      Number(aporte.valor || 0);

  });


  const graficoMetodo =
    Object.keys(metodos)
      .map((metodo) => ({

        name: metodo,

        value:
          metodos[metodo],

      }));


  // =====================================================
  // RETORNO
  // =====================================================

  return {

    totalMiembros,

    totalRecaudado,

    recaudadoHoy,

    totalAportes,

    ultimoAporte,

    proyecto:
      proyecto.data,

    avance,

    ultimosAportes,

    graficoMes,

    graficoMetodo,

    saldoPrestamos,

  };

}