import { supabase } from "../lib/supabase";

export async function obtenerDashboard() {

  const hoy = new Date().toISOString().split("T")[0];

  // =====================================================
  // CONSULTAS
  // =====================================================

  const [
    miembros,
    proyectos,
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
    // PROYECTOS ACTIVOS
    // -----------------------------------------------------

    supabase
      .from("proyectos")
      .select("*")
      .eq("estado", "Activo")
      .order("id", { ascending: false }),

    // -----------------------------------------------------
    // APORTES REGISTRADOS
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

  const listaProyectos =
    proyectos.data || [];

  const listaAportes =
    aportes.data || [];

  const listaPrestamos =
    prestamos.data || [];


  // =====================================================
  // PROYECTO PRINCIPAL
  //
  // Conservamos el primer proyecto activo para que
  // ProyectoCard siga funcionando.
  // =====================================================

  const proyecto =
    listaProyectos[0] || null;


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
  // APORTES ORDENADOS
  // =====================================================

  const aportesOrdenados =
    [...listaAportes].sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha)
    );


  // =====================================================
  // ÚLTIMO APORTE
  // =====================================================

  const ultimoAporte =
    aportesOrdenados[0] || null;


  // =====================================================
  // AVANCE DEL PROYECTO PRINCIPAL
  // =====================================================

  let avance = 0;

  if (
    proyecto &&
    Number(proyecto.meta) > 0
  ) {

    avance =
      (
        totalRecaudado /
        Number(proyecto.meta)
      ) * 100;

    avance =
      Math.min(avance, 100);
  }


  // =====================================================
  // ÚLTIMOS 5 APORTES
  // =====================================================

  const ultimosAportes =
    aportesOrdenados.slice(0, 5);


  // =====================================================
  // TOP 10 APORTANTES
  //
  // SOLO APORTES REGISTRADOS
  // =====================================================

  const aportantes = {};

  listaAportes.forEach((aporte) => {

    const nombre =
      aporte.miembros?.nombres ||
      "Sin nombre";

    if (!aportantes[nombre]) {

      aportantes[nombre] = {
        nombre,
        total: 0,
        cantidad: 0,
      };

    }

    aportantes[nombre].total +=
      Number(aporte.valor || 0);

    aportantes[nombre].cantidad += 1;

  });


  const topAportantes =
    Object.values(aportantes)
      .sort(
        (a, b) =>
          b.total - a.total
      )
      .slice(0, 10);


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

    // Proyecto principal
    proyecto,

    // TODOS los proyectos activos
    proyectosActivos:
      listaProyectos,

    avance,

    ultimosAportes,

    graficoMes,

    graficoMetodo,

    saldoPrestamos,

    // Ranking
    topAportantes,

  };

}