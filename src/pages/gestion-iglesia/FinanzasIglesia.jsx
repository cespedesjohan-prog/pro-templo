import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import logoCC from "../../assets/Logo CC.png?inline";

function Finanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormularioIngreso, setMostrarFormularioIngreso] = useState(false);
  const [mostrarFormularioEgreso, setMostrarFormularioEgreso] = useState(false);
  const [mostrarNuevoMiembro, setMostrarNuevoMiembro] = useState(false);
  const [busquedaMiembro, setBusquedaMiembro] = useState("");
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: "Todos",
    categoria: "Todos",
    fechaDesde: "",
    fechaHasta: "",
    busqueda: "",
  });

  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombres: "",
    telefono_movil: "",
    correo_electronico: "",
    numero_identificacion: "",
  });

  const [formulario, setFormulario] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipo: "Ingreso",
    categoria: "Diezmo",
    concepto: "",
    responsable: "",
    medio_pago: "",
    descripcion: "",
    valor: "",
  });

  async function cargarMiembros() {
    const { data, error } = await supabase
      .from("miembros")
      .select(`
        id,
        nombres,
        telefono_movil,
        numero_identificacion,
        activo
      `)
      .order("nombres", { ascending: true });

    if (error) {
      console.error("Error cargando miembros:", error);
      return;
    }

    setMiembros(data || []);
  }

  async function cargarMovimientos() {
    setCargando(true);

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
        responsable,
        medio_pago,
        creado_en,
        miembros (
          id,
          nombres,
          numero_identificacion
        )
      `)
      .order("fecha", { ascending: false })
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error cargando movimientos:", error);
      toast.error("No se pudieron cargar los movimientos");
      setMovimientos([]);
    } else {
      setMovimientos(data || []);
    }

    setCargando(false);
  }

  useEffect(() => {
    cargarMiembros();
    cargarMovimientos();
  }, []);

  function cambiarFormulario(e) {
    const { name, value } = e.target;

    setFormulario((actual) => {
      const nuevoFormulario = {
        ...actual,
        [name]: value,
      };

      if (name === "tipo") {
        nuevoFormulario.categoria = value === "Ingreso" ? "Diezmo" : "Administración";
      }

      return nuevoFormulario;
    });

    if (name === "tipo" && value === "Egreso") {
      setMiembroSeleccionado(null);
      setBusquedaMiembro("");
    }
  }

  const miembrosFiltrados = miembros.filter((miembro) =>
    miembro.nombres?.toLowerCase().includes(busquedaMiembro.toLowerCase())
  );

  async function crearMiembroManual(e) {
    e.preventDefault();

    if (!nuevoMiembro.nombres.trim()) {
      toast.error("El nombre del miembro es obligatorio");
      return;
    }

    try {
      setGuardando(true);

      const { data, error } = await supabase
        .from("miembros")
        .insert([
          {
            nombres: nuevoMiembro.nombres.trim(),
            telefono_movil: nuevoMiembro.telefono_movil.trim() || null,
            correo_electronico: nuevoMiembro.correo_electronico.trim() || null,
            numero_identificacion: nuevoMiembro.numero_identificacion.trim() || null,
            activo: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creando miembro:", error);
        toast.error("No se pudo crear el miembro");
        return;
      }

      toast.success("Miembro creado correctamente");

      setMiembros((actuales) =>
        [...actuales, data].sort((a, b) =>
          (a.nombres || "").localeCompare(b.nombres || "")
        )
      );

      setMiembroSeleccionado(data);
      setBusquedaMiembro(data.nombres);
      setNuevoMiembro({
        nombres: "",
        telefono_movil: "",
        correo_electronico: "",
        numero_identificacion: "",
      });
      setMostrarNuevoMiembro(false);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarMovimiento(e) {
    e.preventDefault();

    if (!formulario.fecha) {
      toast.error("Selecciona la fecha");
      return;
    }

    if (!formulario.categoria) {
      toast.error("Selecciona una categoría");
      return;
    }

    if (formulario.tipo === "Ingreso" && !miembroSeleccionado) {
      toast.error("Selecciona o crea un miembro");
      return;
    }

    if (formulario.tipo === "Egreso" && !formulario.responsable.trim()) {
      toast.error("Ingresa el responsable del egreso");
      return;
    }

    if (formulario.tipo === "Egreso" && !formulario.concepto.trim()) {
      toast.error("Ingresa el concepto del egreso");
      return;
    }

    if (!formulario.medio_pago) {
      toast.error("Selecciona el medio de pago");
      return;
    }

    if (!formulario.valor || Number(formulario.valor) <= 0) {
      toast.error("Ingresa un valor válido");
      return;
    }

    try {
      setGuardando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const movimiento = {
        fecha: formulario.fecha,
        tipo: formulario.tipo,
        categoria: formulario.categoria || null,
        descripcion:
          formulario.tipo === "Egreso"
            ? formulario.concepto.trim() || null
            : formulario.descripcion.trim() || null,
        valor: Number(formulario.valor),
        miembro_id: formulario.tipo === "Ingreso" ? miembroSeleccionado?.id || null : null,
        responsable: formulario.tipo === "Egreso" ? formulario.responsable.trim() || null : null,
        medio_pago: formulario.medio_pago || null,
        usuario_id: user?.id || null,
      };

      const { error } = await supabase
        .from("movimientos_financieros_iglesia")
        .insert([movimiento]);

      if (error) {
        console.error("Error guardando movimiento:", error);
        toast.error("No se pudo guardar el movimiento");
        return;
      }

      toast.success("Movimiento registrado correctamente");

      setFormulario({
        fecha: new Date().toISOString().split("T")[0],
        tipo: "Ingreso",
        categoria: "Diezmo",
        concepto: "",
        responsable: "",
        medio_pago: "",
        descripcion: "",
        valor: "",
      });

      setMiembroSeleccionado(null);
      setBusquedaMiembro("");
      setMostrarFormularioIngreso(false);
      setMostrarFormularioEgreso(false);
      cargarMovimientos();
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarMovimiento(id) {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este movimiento?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("movimientos_financieros_iglesia")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando movimiento:", error);
      toast.error("No se pudo eliminar");
      return;
    }

    toast.success("Movimiento eliminado");
    cargarMovimientos();
  }

  const categoriasDisponibles = [...new Set(movimientos.map((mov) => mov.categoria).filter(Boolean))].sort();

  const movimientosFiltrados = movimientos.filter((mov) => {
    const tipoOk = filtros.tipo === "Todos" || mov.tipo === filtros.tipo;
    const categoriaOk = filtros.categoria === "Todos" || mov.categoria === filtros.categoria;
    const fechaDesdeOk = !filtros.fechaDesde || (mov.fecha && mov.fecha >= filtros.fechaDesde);
    const fechaHastaOk = !filtros.fechaHasta || (mov.fecha && mov.fecha <= filtros.fechaHasta);
    const textoBusqueda = filtros.busqueda.trim().toLowerCase();
    const busquedaOk =
      !textoBusqueda ||
      [
        mov.descripcion,
        mov.categoria,
        mov.responsable,
        mov.medio_pago,
        mov.miembros?.nombres,
        mov.miembros?.numero_identificacion,
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(textoBusqueda));

    return tipoOk && categoriaOk && fechaDesdeOk && fechaHastaOk && busquedaOk;
  });

  const egresosFiltrados = movimientosFiltrados.filter((mov) => mov.tipo === "Egreso");

  const totalIngresos = movimientosFiltrados
    .filter((mov) => mov.tipo === "Ingreso")
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  const totalEgresos = movimientosFiltrados
    .filter((mov) => mov.tipo === "Egreso")
    .reduce((total, mov) => total + Number(mov.valor || 0), 0);

  const saldo = totalIngresos - totalEgresos;

  function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor);
  }

  function fechaHoraColombia(date = new Date()) {
    return new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }

  function imprimirComprobante(movimiento) {
    const ventana = window.open("", "_blank", "width=900,height=700");

    if (!ventana) {
      toast.error("El navegador bloqueó la ventana de impresión");
      return;
    }

    const fecha = movimiento.fecha
      ? new Date(movimiento.fecha + "T00:00:00").toLocaleDateString("es-CO")
      : "—";

    const persona =
      movimiento.tipo === "Ingreso"
        ? movimiento.miembros?.nombres || "Sin miembro"
        : movimiento.responsable || "—";

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de ${movimiento.tipo}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 30px; color: #222; background: white; }
            .comprobante { max-width: 850px; min-height: 600px; margin: auto; border: 2px solid #1e3a8a; padding: 30px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; }
            .iglesia { display: flex; align-items: center; gap: 15px; }
            .logo { width: 75px; height: 75px; object-fit: contain; }
            h1 { margin: 0; color: #1e3a8a; font-size: 24px; }
            .iglesia p { margin: 5px 0 0; color: #666; font-size: 14px; }
            .titulo { text-align: right; }
            .titulo h2 { margin: 0; color: #1e3a8a; font-size: 20px; }
            .titulo p { margin-top: 8px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
            .campo { margin-bottom: 16px; font-size: 16px; }
            .label { font-weight: bold; color: #1e3a8a; }
            .valor { margin-top: 35px; padding: 18px; background: #f0fdf4; border: 1px solid #86efac; color: #166534; font-size: 24px; font-weight: bold; text-align: right; border-radius: 8px; }
            .firmas { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 100px; }
            .firma { border-top: 1px solid #222; text-align: center; padding-top: 10px; font-weight: bold; }
            .pie { text-align: center; margin-top: 60px; color: #777; font-size: 13px; }
            @media print { body { padding: 0; } .comprobante { border: 1px solid #1e3a8a; } }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <div class="iglesia">
                <img src="${logoCC}" class="logo" alt="ICC Palabra de Fe" />
                <div>
                  <h1>ICC PALABRA DE FE</h1>
                  <p>Gestión financiera y administrativa</p>
                </div>
              </div>

              <div class="titulo">
                <h2>COMPROBANTE DE ${movimiento.tipo.toUpperCase()}</h2>
                <p>Nº ${movimiento.id.slice(0, 8)}</p>
              </div>
            </div>

            <div class="grid">
              <div>
                <div class="campo"><span class="label">Fecha:</span> ${fecha}</div>
                <div class="campo"><span class="label">Categoría:</span> ${movimiento.categoria || "—"}</div>
                <div class="campo"><span class="label">${movimiento.tipo === "Ingreso" ? "Miembro:" : "Responsable:"}</span> ${persona}</div>
                <div class="campo"><span class="label">Medio de pago:</span> ${movimiento.medio_pago || "—"}</div>
              </div>

              <div>
                <div class="campo"><span class="label">Descripción:</span><br />${movimiento.descripcion || "—"}</div>
              </div>
            </div>

            <div class="valor">VALOR: ${formatoMoneda(Number(movimiento.valor || 0))}</div>

            <div class="firmas">
              <div class="firma">Responsable</div>
              <div class="firma">Elaborado por</div>
            </div>

            <p class="pie">Documento generado automáticamente<br />ICC PALABRA DE FE</p>
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  }

  function exportarInformeEgresos(formato) {
    if (!egresosFiltrados.length) {
      toast.error("No hay egresos para exportar con los filtros actuales");
      return;
    }

    if (formato === "excel") {
      const encabezados = [
        "Fecha",
        "Categoría",
        "Responsable",
        "Descripción",
        "Medio de pago",
        "Valor",
      ];

      const filas = egresosFiltrados.map((movimiento) => [
        movimiento.fecha || "",
        movimiento.categoria || "",
        movimiento.responsable || "",
        (movimiento.descripcion || "").replace(/\s+/g, " ").trim(),
        movimiento.medio_pago || "",
        Number(movimiento.valor || 0),
      ]);

      const csv = [encabezados, ...filas]
        .map((fila) =>
          fila
            .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "informe_egresos.xls";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Excel descargado");
      return;
    }

    const ventana = window.open("", "_blank", "width=1000,height=800");

    if (!ventana) {
      toast.error("El navegador bloqueó la ventana de impresión del informe");
      return;
    }

    const total = egresosFiltrados.reduce(
      (sum, movimiento) => sum + Number(movimiento.valor || 0),
      0
    );

    const filasHtml = egresosFiltrados
      .map(
        (movimiento) => `
          <tr>
            <td>${movimiento.fecha ? new Date(movimiento.fecha + "T00:00:00").toLocaleDateString("es-CO") : "—"}</td>
            <td>${movimiento.categoria || "—"}</td>
            <td>${movimiento.responsable || "—"}</td>
            <td>${movimiento.descripcion || "—"}</td>
            <td>${movimiento.medio_pago || "—"}</td>
            <td style="text-align:right; font-weight:bold;">${formatoMoneda(Number(movimiento.valor || 0))}</td>
          </tr>
        `
      )
      .join("");

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe de egresos</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 30px; background: #f8fafc; color: #111827; }
            .container { max-width: 1100px; margin: 0 auto; background: white; border: 2px solid #1e3a8a; border-radius: 12px; overflow: hidden; }
            .header { padding: 18px 30px 12px; text-align: center; border-bottom: 2px solid #111827; }
            .logo-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
            .logo { width: 54px; height: 54px; object-fit: contain; border-radius: 50%; background: white; padding: 4px; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.02em; }
            .header p { margin: 0; font-size: 15px; font-weight: 700; }
            .header-line { border-top: 2px solid #111827; margin: 10px 0 0; }
            .meta { text-align: center; font-size: 12px; margin-top: 8px; color: #374151; }
            .content { padding: 24px 30px 30px; }
            .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
            .card span { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
            .card strong { display: block; margin-top: 8px; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background: #0f172a; color: white; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 26px; text-align: right; font-weight: bold; color: #1e3a8a; }
            .firma-row { display: flex; justify-content: center; align-items: flex-end; margin-top: 28px; }
            .firma-box { width: 260px; text-align: center; }
            .firma-line { border-top: 2px solid #111827; margin-top: 54px; }
            .firma-label { font-weight: 700; margin-top: 8px; }
            .final-note { margin-top: 22px; text-align: center; font-size: 12px; font-weight: 700; line-height: 1.5; }
            .planilla-title { font-size: 16px; font-weight: 700; margin: 10px 0 0; }
            @media print { body { background: white; } .container { border: 1px solid #1e3a8a; border-radius: 0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-wrap">
                <img src="${logoCC}" class="logo" alt="Logo iglesia" />
                <h1>IGLESIA FAMILIA DE REINO CRUZADA CRISTIANA</h1>
                <p>NIT. 900.679.123-7</p>
                <div class="header-line"></div>
                <p style="margin-top: 8px;">IGLESIA FILIAL PALABRA DE FE</p>
                <p class="planilla-title">PLANILLA DE CAJA PARA PAGOS</p>
              </div>
              <div class="meta">Generado: ${fechaHoraColombia()} · Registros: ${egresosFiltrados.length}</div>
            </div>

            <div class="content">
              <div class="summary">
                <div class="card">
                  <span>Total egresos</span>
                  <strong>${formatoMoneda(total)}</strong>
                </div>
                <div class="card">
                  <span>Periodo</span>
                  <strong>${filtros.fechaDesde || "—"} / ${filtros.fechaHasta || "—"}</strong>
                </div>
                <div class="card">
                  <span>Categoría</span>
                  <strong>${filtros.categoria === "Todos" ? "Todas" : filtros.categoria}</strong>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Responsable</th>
                    <th>Descripción</th>
                    <th>Medio de pago</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasHtml}
                </tbody>
              </table>

              <div class="footer">TOTAL: ${formatoMoneda(total)}</div>

              <div class="firma-row">
                <div class="firma-box">
                  <div class="firma-line"></div>
                  <div class="firma-label">FIRMA PASTOR</div>
                </div>
              </div>

              <div class="final-note">DOY FE QUE TODOS LOS PAGOS REALIZADOS EN LA IGLESIA ESTAN REGISTRADOS EN LA PRESENTE PLANILLA.</div>
            </div>
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
    toast.success("Informe de egresos listo para imprimir");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900 p-6 text-white shadow">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-300">Gestión Iglesia</p>
            <h1 className="mt-1 text-3xl font-bold">Finanzas</h1>
            <p className="mt-2 text-gray-300">
              Control de ingresos, egresos y movimientos financieros.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setFormulario({
                  fecha: new Date().toISOString().split("T")[0],
                  tipo: "Ingreso",
                  categoria: "Diezmo",
                  concepto: "",
                  responsable: "",
                  medio_pago: "",
                  descripcion: "",
                  valor: "",
                });
                setMiembroSeleccionado(null);
                setBusquedaMiembro("");
                setMostrarFormularioIngreso(true);
              }}
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
            >
              + Registrar ingreso
            </button>

            <button
              type="button"
              onClick={() => {
                setFormulario({
                  fecha: new Date().toISOString().split("T")[0],
                  tipo: "Egreso",
                  categoria: "Administración",
                  concepto: "",
                  responsable: "",
                  medio_pago: "",
                  descripcion: "",
                  valor: "",
                });
                setMiembroSeleccionado(null);
                setBusquedaMiembro("");
                setMostrarFormularioEgreso(true);
              }}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-red-700"
            >
              + Registrar egreso
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm font-semibold text-gray-500">Total ingresos</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{formatoMoneda(totalIngresos)}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm font-semibold text-gray-500">Total egresos</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{formatoMoneda(totalEgresos)}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm font-semibold text-gray-500">Saldo</p>
          <p className={`mt-2 text-2xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatoMoneda(saldo)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Informe de egresos</p>
            <p className="text-sm text-red-600">Genera un resumen con logo, PDF y Excel.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportarInformeEgresos("pdf")}
              className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-red-700"
            >
              📄 PDF
            </button>
            <button
              type="button"
              onClick={() => exportarInformeEgresos("excel")}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow hover:bg-emerald-700"
            >
              📊 Excel
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="border-b p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Movimientos financieros</h2>
              <p className="mt-1 text-gray-500">{movimientosFiltrados.length} movimientos registrados</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Tipo</label>
                <select
                  name="tipo"
                  value={filtros.tipo}
                  onChange={(e) => setFiltros((actual) => ({ ...actual, tipo: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Todos">Todos</option>
                  <option value="Ingreso">Ingreso</option>
                  <option value="Egreso">Egreso</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Categoría</label>
                <select
                  name="categoria"
                  value={filtros.categoria}
                  onChange={(e) => setFiltros((actual) => ({ ...actual, categoria: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Todos">Todas</option>
                  {categoriasDisponibles.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Desde</label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros((actual) => ({ ...actual, fechaDesde: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Hasta</label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros((actual) => ({ ...actual, fechaHasta: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Buscar</label>
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros((actual) => ({ ...actual, busqueda: e.target.value }))}
                  placeholder="Descripción, nombre..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setFiltros({
                  tipo: "Todos",
                  categoria: "Todos",
                  fechaDesde: "",
                  fechaHasta: "",
                  busqueda: "",
                })
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {cargando && <div className="p-10 text-center text-gray-500">Cargando movimientos...</div>}

        {!cargando && movimientosFiltrados.length === 0 && (
          <div className="p-10 text-center text-gray-500">No hay movimientos que coincidan con los filtros.</div>
        )}

        {!cargando && movimientosFiltrados.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Categoría</th>
                  <th className="p-4 text-left">Persona / Responsable</th>
                  <th className="p-4 text-left">Descripción</th>
                  <th className="p-4 text-left">Medio de pago</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      {movimiento.fecha
                        ? new Date(movimiento.fecha + "T00:00:00").toLocaleDateString("es-CO")
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                          movimiento.tipo === "Ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {movimiento.tipo}
                      </span>
                    </td>

                    <td className="p-4 font-medium">{movimiento.categoria || "—"}</td>

                    <td className="p-4">
                      {movimiento.tipo === "Ingreso" && movimiento.miembros ? (
                        <div>
                          <p className="font-semibold text-gray-800">{movimiento.miembros.nombres}</p>
                          {movimiento.miembros.numero_identificacion && (
                            <p className="text-sm text-gray-500">{movimiento.miembros.numero_identificacion}</p>
                          )}
                        </div>
                      ) : movimiento.tipo === "Egreso" ? (
                        <span className="font-medium text-gray-700">{movimiento.responsable || "—"}</span>
                      ) : (
                        <span className="text-gray-400">Sin miembro</span>
                      )}
                    </td>

                    <td className="p-4">{movimiento.descripcion || "—"}</td>

                    <td className="p-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {movimiento.medio_pago || "—"}
                      </span>
                    </td>

                    <td className={`p-4 text-right font-bold ${movimiento.tipo === "Ingreso" ? "text-green-600" : "text-red-600"}`}>
                      {formatoMoneda(Number(movimiento.valor || 0))}
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => imprimirComprobante(movimiento)}
                        className="mr-2 rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-600 hover:bg-blue-100"
                        title="Imprimir comprobante"
                      >
                        🖨️
                      </button>

                      <button
                        onClick={() => eliminarMovimiento(movimiento.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-600 hover:bg-red-100"
                        title="Eliminar movimiento"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarFormularioIngreso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-green-50 p-6">
              <div>
                <h2 className="text-2xl font-bold text-green-800">💰 Registrar ingreso</h2>
                <p className="text-gray-500">Registra diezmos, ofrendas, donaciones u otros ingresos.</p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormularioIngreso(false)}
                className="text-3xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarMovimiento} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block font-semibold">Fecha</label>
                <input type="date" name="fecha" value={formulario.fecha} onChange={cambiarFormulario} className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Tipo de ingreso</label>
                <select name="categoria" value={formulario.categoria} onChange={cambiarFormulario} className="w-full rounded-xl border px-4 py-3">
                  <option value="Diezmo">Diezmo</option>
                  <option value="Ofrenda">Ofrenda</option>
                  <option value="Donación">Donación</option>
                  <option value="Primicias">Primicias</option>
                  <option value="Actividad">Actividad</option>
                  <option value="Otro ingreso">Otro ingreso</option>
                </select>
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <label className="font-semibold">Miembro</label>
                  <button type="button" onClick={() => setMostrarNuevoMiembro(true)} className="font-semibold text-blue-600">
                    + Crear miembro
                  </button>
                </div>

                {miembroSeleccionado ? (
                  <div className="flex items-center justify-between rounded-xl border border-green-300 bg-green-50 p-4">
                    <div>
                      <p className="font-bold">{miembroSeleccionado.nombres}</p>
                      <p className="text-sm text-gray-500">
                        {miembroSeleccionado.numero_identificacion || "Sin identificación"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMiembroSeleccionado(null);
                        setBusquedaMiembro("");
                      }}
                      className="font-semibold text-red-600"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={busquedaMiembro}
                      onChange={(e) => setBusquedaMiembro(e.target.value)}
                      placeholder="Buscar miembro..."
                      className="w-full rounded-xl border px-4 py-3"
                    />

                    {busquedaMiembro && (
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border">
                        {miembrosFiltrados.map((miembro) => (
                          <button
                            key={miembro.id}
                            type="button"
                            onClick={() => {
                              setMiembroSeleccionado(miembro);
                              setBusquedaMiembro(miembro.nombres);
                            }}
                            className="block w-full border-b p-3 text-left hover:bg-green-50"
                          >
                            <p className="font-semibold">{miembro.nombres}</p>
                            <p className="text-sm text-gray-500">
                              {miembro.numero_identificacion || "Sin identificación"}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="mb-2 block font-semibold">Medio de pago</label>
                <select name="medio_pago" value={formulario.medio_pago} onChange={cambiarFormulario} className="w-full rounded-xl border px-4 py-3">
                  <option value="">Selecciona</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Consignación">Consignación</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Valor</label>
                <input type="number" name="valor" value={formulario.valor} onChange={cambiarFormulario} placeholder="Ej: 100000" className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Descripción</label>
                <textarea name="descripcion" value={formulario.descripcion} onChange={cambiarFormulario} rows="3" className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button type="button" onClick={() => setMostrarFormularioIngreso(false)} className="rounded-xl bg-gray-100 px-5 py-3">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white">
                  {guardando ? "Guardando..." : "Guardar ingreso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarFormularioEgreso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-red-50 p-6">
              <div>
                <h2 className="text-2xl font-bold text-red-800">💸 Registrar egreso</h2>
                <p className="text-gray-500">Registra los gastos y pagos de la iglesia.</p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormularioEgreso(false)}
                className="text-3xl text-gray-400"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarMovimiento} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block font-semibold">Fecha</label>
                <input type="date" name="fecha" value={formulario.fecha} onChange={cambiarFormulario} className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Tipo de egreso</label>
                <select name="categoria" value={formulario.categoria} onChange={cambiarFormulario} className="w-full rounded-xl border px-4 py-3">
                  <option value="">Selecciona un tipo</option>
                  <option value="Agua">Agua</option>
                  <option value="Energía">Energía</option>
                  <option value="Arriendo">Arriendo</option>
                  <option value="Nómina">Nómina</option>
                  <option value="Compras">Compras</option>
                  <option value="Honorarios (Predicador)">Honorarios (Predicador)</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Seguridad Social">Seguridad Social</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Concepto del egreso</label>
                <input type="text" name="concepto" value={formulario.concepto} onChange={cambiarFormulario} placeholder="Ej: Pago servicio de energía" className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Responsable</label>
                <input type="text" name="responsable" value={formulario.responsable} onChange={cambiarFormulario} placeholder="Nombre de quien recibe o gestiona el pago" className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block font-semibold">💰 Monto</label>
                <input type="number" name="valor" value={formulario.valor} onChange={cambiarFormulario} placeholder="Ej: 100000" className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Medio de pago</label>
                <select name="medio_pago" value={formulario.medio_pago} onChange={cambiarFormulario} className="w-full rounded-xl border px-4 py-3">
                  <option value="">Selecciona un medio</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Banco">Banco</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Observaciones</label>
                <textarea name="descripcion" value={formulario.descripcion} onChange={cambiarFormulario} rows="3" placeholder="Información adicional..." className="w-full rounded-xl border px-4 py-3" />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button type="button" onClick={() => setMostrarFormularioEgreso(false)} className="rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                  {guardando ? "Guardando..." : "Registrar egreso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarNuevoMiembro && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Crear miembro</h2>
                <p className="text-gray-500">Registra el miembro para asociarlo al movimiento.</p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarNuevoMiembro(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={crearMiembroManual} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block font-semibold">Nombres completos *</label>
                <input
                  type="text"
                  value={nuevoMiembro.nombres}
                  onChange={(e) =>
                    setNuevoMiembro({
                      ...nuevoMiembro,
                      nombres: e.target.value,
                    })
                  }
                  placeholder="Nombre del miembro"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Número de identificación</label>
                <input
                  type="text"
                  value={nuevoMiembro.numero_identificacion}
                  onChange={(e) =>
                    setNuevoMiembro({
                      ...nuevoMiembro,
                      numero_identificacion: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Teléfono</label>
                <input
                  type="text"
                  value={nuevoMiembro.telefono_movil}
                  onChange={(e) =>
                    setNuevoMiembro({
                      ...nuevoMiembro,
                      telefono_movil: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Correo electrónico</label>
                <input
                  type="email"
                  value={nuevoMiembro.correo_electronico}
                  onChange={(e) =>
                    setNuevoMiembro({
                      ...nuevoMiembro,
                      correo_electronico: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button type="button" onClick={() => setMostrarNuevoMiembro(false)} className="rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {guardando ? "Guardando..." : "Crear miembro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finanzas;
