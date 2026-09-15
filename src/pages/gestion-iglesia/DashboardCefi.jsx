import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Award, BarChart3, CalendarCheck, Printer, RefreshCw, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

function fechaLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function escaparHtml(valor) {
  return String(valor || "").replace(/[&<>'"]/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[caracter]);
}

function DashboardCefi() {
  const [fecha, setFecha] = useState(fechaLocal);
  const [grupos, setGrupos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargarDashboard() {
    setCargando(true);
   const [gruposRespuesta, matriculasRespuesta, clasesRespuesta, asistenciasRespuesta] = await Promise.all([
  supabase
    .from("cefi_grupos")
    .select("id, nombre, cefi_grados(nombre), cefi_periodos(nombre)")
    .eq("activo", true)
    .order("nombre"),

  supabase
    .from("cefi_matriculas")
    .select(`
      id,
      grupo_id,
      miembro_id,
      estado,
      resultado_nivel,
      fecha_matricula,
      miembros(nombres),
      cefi_grupos(
        nombre,
        cefi_grados(nombre, orden),
        cefi_periodos(nombre)
      )
    `),

  supabase
    .from("cefi_clases")
    .select("id, grupo_id, numero, nombre, fecha, estado")
    .eq("fecha", fecha),

  supabase
    .from("cefi_asistencia_clases")
    .select("id, clase_id, matricula_id, estado")
]);
    const error = gruposRespuesta.error || matriculasRespuesta.error || clasesRespuesta.error || asistenciasRespuesta.error;
    if (error) toast.error(`No fue posible cargar el dashboard: ${error.message}`);
    else {
      setGrupos(gruposRespuesta.data || []);
      setMatriculas(matriculasRespuesta.data || []);
      setAsistencias(asistenciasRespuesta.data || []);
      
    }
    setCargando(false);
  }

  useEffect(() => { cargarDashboard(); }, [fecha]);

  const conteoAsistencia = useMemo(() => asistencias.reduce((conteo, registro) => ({ ...conteo, [registro.estado]: (conteo[registro.estado] || 0) + 1 }), {}), [asistencias]);
  const matriculasActivas = useMemo(() => matriculas.filter((matricula) => matricula.estado === "activa"), [matriculas]);
const graduadosNivel4 = useMemo(() => {
  const modulosRequeridos = [
    "Mi Nueva Vida",
    "Creciendo en mi Fe",
    "Desarrollando el Propósito de Dios",
    "Líder de Excelencia",
  ];

  const nivelesPorMiembro = matriculas.reduce((niveles, matricula) => {
    if (matricula.estado !== "finalizada") return niveles;

    const nombreModulo =
      matricula.cefi_grupos?.cefi_grados?.nombre?.trim();

    if (modulosRequeridos.includes(nombreModulo)) {
      niveles[matricula.miembro_id] = new Set([
        ...(niveles[matricula.miembro_id] || []),
        nombreModulo,
      ]);
    }

    return niveles;
  }, {});

  return matriculas.filter((matricula) => {
    const nombreModulo =
      matricula.cefi_grupos?.cefi_grados?.nombre?.trim();

    return (
      matricula.estado === "finalizada" &&
      nombreModulo === "Líder de Excelencia" &&
      modulosRequeridos.every((modulo) =>
        nivelesPorMiembro[matricula.miembro_id]?.has(modulo)
      )
    );
  });
}, [matriculas]);
  const promedio = calificaciones.length ? calificaciones.reduce((total, registro) => total + Number(registro.nota), 0) / calificaciones.length : 0;
  const porcentajeAsistencia = matriculasActivas.length ? ((conteoAsistencia.presente || 0) / matriculasActivas.length) * 100 : 0;
  const resumenGrupos = grupos.map((grupo) => {
    const delGrupo = matriculasActivas.filter((matricula) => matricula.grupo_id === grupo.id);
    const ids = delGrupo.map((matricula) => matricula.id);
    const asistenciaGrupo = asistencias.filter((registro) => ids.includes(registro.matricula_id));
    return { ...grupo, estudiantes: delGrupo.length, presentes: asistenciaGrupo.filter((registro) => registro.estado === "presente").length, ausentes: asistenciaGrupo.filter((registro) => registro.estado === "ausente").length };
  });

  function imprimirReporte() {
    window.print();
  }

  function imprimirCertificado(matricula) {
    const nombre = escaparHtml(matricula.miembros?.nombres || "Estudiante");
    const periodo = escaparHtml(matricula.cefi_grupos?.cefi_periodos?.nombre || "programa CEFI");
    const ventana = window.open("", "_blank", "width=1000,height=700");
    if (!ventana) {
      toast.error("El navegador bloqueó la ventana del certificado.");
      return;
    }
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>Certificado CEFI - ${nombre}</title><style>body{margin:0;background:#f5f1e8;color:#172033;font-family:Georgia,serif}.certificado{box-sizing:border-box;min-height:100vh;margin:0 auto;padding:12vh 12vw;text-align:center;border:18px solid #c89b3c;outline:8px solid #172033;outline-offset:-32px;display:flex;flex-direction:column;justify-content:center}.marca{font:700 14px Arial,sans-serif;letter-spacing:5px;text-transform:uppercase;color:#9b741f}.titulo{margin:32px 0 10px;font-size:54px;letter-spacing:2px}.texto{font:20px Arial,sans-serif;line-height:1.7}.nombre{margin:30px 0 20px;font-size:42px;font-weight:700;border-bottom:2px solid #c89b3c;padding-bottom:12px}.nivel{font-size:25px;font-weight:700;color:#9b741f}.firma{margin:70px auto 0;width:260px;border-top:1px solid #172033;padding-top:10px;font:14px Arial,sans-serif}@media print{body{background:white}.certificado{min-height:100vh}}</style></head><body><main class="certificado"><div class="marca">Centro de Formación Integral · CEFI</div><h1 class="titulo">Certificado de culminación</h1><p class="texto">Se certifica que</p><div class="nombre">${nombre}</div><p class="texto">ha completado satisfactoriamente los cuatro niveles del programa de formación CEFI.</p><div class="nivel">Nivel 4 · Líder de Excelencia</div><p class="texto">Periodo académico: ${periodo}</p><div class="firma">Dirección CEFI</div></main></body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.setTimeout(() => ventana.print(), 250);
  }

  return (
    <main className="min-h-screen bg-[#f5f7f9] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between print-hide"><Link to="/gestion-iglesia/cefi" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={17} /> Volver a CEFI</Link><div className="flex gap-2"><button type="button" onClick={cargarDashboard} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Actualizar</button><button type="button" onClick={imprimirReporte} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"><Printer size={15} /> Imprimir</button></div></div>
        <section className="reporte-encabezado mb-8 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10"><p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Nivel 4 · Administración y reportes</p><h1 className="mt-2 text-3xl font-black tracking-tight">Dashboard académico CEFI</h1><p className="mt-2 text-sm text-slate-300">Resumen de operación, asistencia y rendimiento académico.</p></section>
        <section className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:p-7"><label className="text-sm font-semibold text-slate-700">Fecha de asistencia<input type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} className="mt-2 block rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" /></label><p className="text-xs text-slate-500">Reporte generado para {fecha}</p></section>
        {cargando ? <div className="rounded-3xl bg-white py-20 text-center text-sm text-slate-500">Cargando indicadores...</div> : <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Users className="mb-4 text-sky-600" size={22} /><strong className="block text-3xl">{matriculasActivas.length}</strong><span className="text-sm text-slate-500">Estudiantes activos</span></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CalendarCheck className="mb-4 text-emerald-600" size={22} /><strong className="block text-3xl">{porcentajeAsistencia.toFixed(0)}%</strong><span className="text-sm text-slate-500">Asistencia del día</span></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><BarChart3 className="mb-4 text-amber-500" size={22} /><strong className="block text-3xl">{promedio.toFixed(2)}</strong><span className="text-sm text-slate-500">Promedio general</span></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 text-xl font-black text-violet-600">{grupos.length}</div><strong className="block text-3xl">{conteoAsistencia.ausente || 0}</strong><span className="text-sm text-slate-500">Ausencias del día</span></div></section>
          <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Award className="text-amber-600" size={22} /><h2 className="text-xl font-bold">Certificados de culminación</h2></div><p className="mt-1 text-sm text-slate-600">Estudiantes con los cuatro niveles CEFI finalizados.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700">{graduadosNivel4.length} graduado(s)</span></div>{graduadosNivel4.length ? <div className="mt-5 divide-y divide-amber-200 rounded-2xl border border-amber-200 bg-white">{graduadosNivel4.map((matricula) => <div key={matricula.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="block">{matricula.miembros?.nombres || "Sin nombre"}</strong><span className="text-xs text-slate-500">{matricula.cefi_grupos?.nombre || "Grupo"} · {matricula.cefi_grupos?.cefi_periodos?.nombre || "Periodo académico"}</span></div><button type="button" onClick={() => imprimirCertificado(matricula)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"><Printer size={15} /> Imprimir certificado</button></div>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-white/70 px-4 py-6 text-center text-sm text-slate-600">Aún no hay estudiantes con matrícula finalizada en Nivel 4.</div>}</section>
          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Resumen por grupo</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Grupo</th><th className="px-4 py-3">Nivel</th><th className="px-4 py-3">Estudiantes</th><th className="px-4 py-3">Presentes</th><th className="px-4 py-3">Ausentes</th></tr></thead><tbody className="divide-y divide-slate-100">{resumenGrupos.map((grupo) => <tr key={grupo.id}><td className="px-4 py-4 font-semibold">{grupo.nombre}</td><td className="px-4 py-4 text-slate-600">{grupo.cefi_grados?.nombre || "Sin nivel"}</td><td className="px-4 py-4">{grupo.estudiantes}</td><td className="px-4 py-4 font-semibold text-emerald-700">{grupo.presentes}</td><td className="px-4 py-4 font-semibold text-rose-700">{grupo.ausentes}</td></tr>)}</tbody></table></div></div><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Asistencia del día</h2><div className="mt-5 space-y-3">{[["Presente", "presente", "bg-emerald-500"], ["Ausente", "ausente", "bg-rose-500"], ["Tarde", "tarde", "bg-amber-500"], ["Excusa", "excusa", "bg-sky-500"]].map(([etiqueta, clave, color]) => <div key={clave}><div className="mb-1 flex justify-between text-sm"><span>{etiqueta}</span><strong>{conteoAsistencia[clave] || 0}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: `${matriculas.length ? Math.min(100, ((conteoAsistencia[clave] || 0) / matriculas.length) * 100) : 0}%` }} /></div></div>)}</div><div className="mt-8 border-t border-slate-100 pt-5 text-sm text-slate-500">Calificaciones registradas: <strong className="text-slate-900">{calificaciones.length}</strong></div></div></section>
        </>}
      </div>
    </main>
  );
}

export default DashboardCefi;
