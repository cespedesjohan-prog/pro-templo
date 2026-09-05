import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

function CalificacionesCefi() {
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [periodoNumero, setPeriodoNumero] = useState("1");
  const [matriculados, setMatriculados] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [notas, setNotas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarGrupos() {
    const { data, error } = await supabase
      .from("cefi_grupos")
      .select("id, nombre, cefi_grados(nombre), cefi_periodos(nombre)")
      .eq("activo", true)
      .order("nombre");
    if (error) toast.error(`No fue posible cargar grupos: ${error.message}`);
    else {
      setGrupos(data || []);
      if (data?.length) setGrupoId(data[0].id);
    }
    setCargando(false);
  }

  async function cargarTabla() {
    if (!grupoId) return;
    setCargandoTabla(true);
    const [matriculasRespuesta, asignacionesRespuesta] = await Promise.all([
      supabase.from("cefi_matriculas").select("id, miembros(nombres)").eq("grupo_id", grupoId).eq("estado", "activa").order("created_at"),
      supabase.from("cefi_asignaciones").select("id, cefi_materias(nombre), cefi_docentes(nombres, apellidos)").eq("grupo_id", grupoId).order("created_at"),
    ]);
    const error = matriculasRespuesta.error || asignacionesRespuesta.error;
    if (error) {
      toast.error(`No fue posible cargar calificaciones: ${error.message}`);
      setMatriculados([]);
      setAsignaciones([]);
      setCargandoTabla(false);
      return;
    }
    const nuevasMatriculas = matriculasRespuesta.data || [];
    const nuevasAsignaciones = asignacionesRespuesta.data || [];
    const matriculaIds = nuevasMatriculas.map((matricula) => matricula.id);
    const asignacionIds = nuevasAsignaciones.map((asignacion) => asignacion.id);
    let notasRespuesta = { data: [], error: null };
    if (matriculaIds.length && asignacionIds.length) {
      notasRespuesta = await supabase.from("cefi_calificaciones").select("matricula_id, asignacion_id, nota, observacion").in("matricula_id", matriculaIds).in("asignacion_id", asignacionIds).eq("periodo_numero", Number(periodoNumero));
    }
    if (notasRespuesta.error) toast.error(`No fue posible cargar notas: ${notasRespuesta.error.message}`);
    const notasIniciales = Object.fromEntries((notasRespuesta.data || []).map((nota) => [`${nota.matricula_id}-${nota.asignacion_id}`, nota.nota ?? ""]));
    setMatriculados(nuevasMatriculas);
    setAsignaciones(nuevasAsignaciones);
    setNotas(notasIniciales);
    setCargandoTabla(false);
  }

  useEffect(() => { cargarGrupos(); }, []);
  useEffect(() => { cargarTabla(); }, [grupoId, periodoNumero]);

  const totalCeldas = matriculados.length * asignaciones.length;
  const notasRegistradas = useMemo(() => Object.values(notas).filter((nota) => nota !== "" && nota !== null).length, [notas]);

  function actualizarNota(matriculaId, asignacionId, valor) {
    if (valor !== "" && (Number(valor) < 0 || Number(valor) > 5)) return;
    setNotas((actuales) => ({ ...actuales, [`${matriculaId}-${asignacionId}`]: valor }));
  }

  async function guardarNotas() {
    const registros = Object.entries(notas)
      .filter(([, nota]) => nota !== "" && nota !== null)
      .map(([clave, nota]) => {
        const matriculaId = clave.slice(0, 36);
        const asignacionId = clave.slice(37);
        return { matricula_id: matriculaId, asignacion_id: asignacionId, periodo_numero: Number(periodoNumero), nota: Number(nota) };
      });
    if (!registros.length) {
      toast.error("Registra al menos una nota antes de guardar.");
      return;
    }
    setGuardando(true);
    const { error } = await supabase.from("cefi_calificaciones").upsert(registros, { onConflict: "matricula_id,asignacion_id,periodo_numero" });
    setGuardando(false);
    if (error) toast.error(`No fue posible guardar: ${error.message}`);
    else toast.success("Calificaciones guardadas correctamente.");
  }

  return (
    <main className="min-h-screen bg-[#f5f7f9] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between"><Link to="/gestion-iglesia/cefi" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={17} /> Volver a CEFI</Link><BookOpen className="text-amber-500" size={26} /></div>
        <section className="mb-6 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10"><p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Nivel 3 · Seguimiento académico</p><h1 className="mt-2 text-3xl font-black tracking-tight">Calificaciones</h1><p className="mt-2 text-sm text-slate-300">Registra el avance de cada estudiante por materia y periodo.</p></section>
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end"><label className="text-sm font-semibold text-slate-700">Grupo<select value={grupoId} onChange={(evento) => setGrupoId(evento.target.value)} disabled={cargando} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Selecciona un grupo</option>{grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre} · {grupo.cefi_grados?.nombre || "Sin nivel"}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Periodo<select value={periodoNumero} onChange={(evento) => setPeriodoNumero(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400">{[1, 2, 3, 4].map((numero) => <option key={numero} value={numero}>Periodo {numero}</option>)}</select></label><button type="button" onClick={guardarNotas} disabled={guardando || cargandoTabla || !totalCeldas} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17} /> {guardando ? "Guardando..." : "Guardar notas"}</button></div><p className="mt-4 text-xs text-slate-500">{notasRegistradas} de {totalCeldas} calificaciones registradas en pantalla.</p></section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">{cargandoTabla ? <div className="py-16 text-center text-sm text-slate-500">Cargando calificaciones...</div> : !matriculados.length ? <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">No hay estudiantes matriculados en este grupo.</div> : !asignaciones.length ? <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">Este grupo aún no tiene materias asignadas.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Estudiante</th>{asignaciones.map((asignacion) => <th key={asignacion.id} className="min-w-[150px] px-4 py-3">{asignacion.cefi_materias?.nombre || "Materia"}<span className="mt-1 block font-normal normal-case tracking-normal text-slate-400">{asignacion.cefi_docentes?.nombres || "Sin docente"}</span></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{matriculados.map((matricula) => <tr key={matricula.id}><td className="px-4 py-4 font-semibold">{matricula.miembros?.nombres || "Miembro sin nombre"}</td>{asignaciones.map((asignacion) => { const clave = `${matricula.id}-${asignacion.id}`; return <td key={asignacion.id} className="px-4 py-4"><input type="number" min="0" max="5" step="0.01" value={notas[clave] ?? ""} onChange={(evento) => actualizarNota(matricula.id, asignacion.id, evento.target.value)} placeholder="0.00" className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></td>; })}</tr>)}</tbody></table></div>}</section>
      </div>
    </main>
  );
}

export default CalificacionesCefi;
