import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Check, Save } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

const estados = [
  { valor: "presente", etiqueta: "Presente", clase: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { valor: "ausente", etiqueta: "Ausente", clase: "border-rose-200 bg-rose-50 text-rose-700" },
  { valor: "tarde", etiqueta: "Tarde", clase: "border-amber-200 bg-amber-50 text-amber-700" },
  { valor: "excusa", etiqueta: "Excusa", clase: "border-sky-200 bg-sky-50 text-sky-700" },
];

function fechaLocal() {
  const ahora = new Date();
  const diferencia = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - diferencia).toISOString().slice(0, 10);
}

function AsistenciaCefi() {
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [fecha, setFecha] = useState(fechaLocal);
  const [matriculados, setMatriculados] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [cargando, setCargando] = useState(true);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cargarGrupos() {
    const { data, error } = await supabase
      .from("cefi_grupos")
      .select("id, nombre, cefi_grados(nombre), cefi_periodos(nombre)")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (error) toast.error(`No fue posible cargar grupos: ${error.message}`);
    else {
      setGrupos(data || []);
      if (data?.length && !grupoId) setGrupoId(data[0].id);
    }
    setCargando(false);
  }

  async function cargarLista() {
    if (!grupoId || !fecha) {
      setMatriculados([]);
      return;
    }

    setCargandoLista(true);
    const [matriculasRespuesta, asistenciasRespuesta] = await Promise.all([
      supabase
        .from("cefi_matriculas")
        .select("id, miembro_id, miembros(nombres, numero_identificacion)")
        .eq("grupo_id", grupoId)
        .eq("estado", "activa")
        .order("created_at", { ascending: true }),
      supabase
        .from("cefi_asistencias")
        .select("matricula_id, estado, observacion")
        .eq("fecha", fecha),
    ]);

    const error = matriculasRespuesta.error || asistenciasRespuesta.error;
    if (error) {
      toast.error(`No fue posible cargar asistencia: ${error.message}`);
      setMatriculados([]);
    } else {
      const registros = asistenciasRespuesta.data || [];
      const estadosIniciales = Object.fromEntries(registros.map((registro) => [registro.matricula_id, registro.estado]));
      setMatriculados(matriculasRespuesta.data || []);
      setAsistencias(estadosIniciales);
    }
    setCargandoLista(false);
  }

  useEffect(() => {
    cargarGrupos();
  }, []);

  useEffect(() => {
    cargarLista();
  }, [grupoId, fecha]);

  const resumen = useMemo(() => estados.reduce((resultado, estado) => {
    resultado[estado.valor] = matriculados.filter((matricula) => asistencias[matricula.id] === estado.valor).length;
    return resultado;
  }, {}), [asistencias, matriculados]);

  function marcarTodos(estado) {
    setAsistencias((actuales) => Object.fromEntries(matriculados.map((matricula) => [matricula.id, actuales[matricula.id] || estado])));
  }

  async function guardarAsistencia() {
    if (!matriculados.length) return;
    setGuardando(true);
    const registros = matriculados.map((matricula) => ({
      matricula_id: matricula.id,
      fecha,
      estado: asistencias[matricula.id] || "presente",
    }));
    const { error } = await supabase.from("cefi_asistencias").upsert(registros, { onConflict: "matricula_id,fecha" });
    setGuardando(false);

    if (error) toast.error(`No fue posible guardar: ${error.message}`);
    else {
      toast.success("Asistencia guardada correctamente.");
      cargarLista();
    }
  }

  const grupoActual = grupos.find((grupo) => grupo.id === grupoId);

  return (
    <main className="min-h-screen bg-[#f5f7f9] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/gestion-iglesia/cefi" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={17} /> Volver a CEFI</Link>
          <CalendarCheck className="text-amber-500" size={26} />
        </div>

        <section className="mb-6 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Nivel 2 · Operación académica</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Control de asistencia</h1>
          <p className="mt-2 text-sm text-slate-300">Registra la asistencia diaria de los estudiantes matriculados.</p>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
            <label className="text-sm font-semibold text-slate-700">Grupo
              <select value={grupoId} onChange={(evento) => setGrupoId(evento.target.value)} disabled={cargando} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Selecciona un grupo</option>{grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre} · {grupo.cefi_grados?.nombre || "Sin nivel"}</option>)}</select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Fecha
              <input type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" />
            </label>
            <button type="button" onClick={guardarAsistencia} disabled={guardando || cargandoLista || !matriculados.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17} /> {guardando ? "Guardando..." : "Guardar asistencia"}</button>
          </div>
          {grupoActual && <p className="mt-4 text-xs text-slate-500">{grupoActual.cefi_periodos?.nombre || "Periodo sin definir"} · {matriculados.length} estudiante(s) matriculado(s)</p>}
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{estados.map((estado) => <div key={estado.valor} className={`rounded-2xl border px-4 py-3 ${estado.clase}`}><strong className="block text-xl">{resumen[estado.valor] || 0}</strong><span className="text-xs font-semibold">{estado.etiqueta}</span></div>)}</section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Lista del día</h2><p className="mt-1 text-sm text-slate-500">Los cambios se guardan para la fecha seleccionada.</p></div><button type="button" onClick={() => marcarTodos("presente")} disabled={!matriculados.length} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"><Check size={15} /> Marcar presentes</button></div>
          {cargandoLista ? <div className="py-14 text-center text-sm text-slate-500">Cargando lista...</div> : !matriculados.length ? <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">No hay estudiantes matriculados en este grupo.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Estudiante</th><th className="px-4 py-3">Documento</th><th className="px-4 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{matriculados.map((matricula) => <tr key={matricula.id}><td className="px-4 py-4 font-semibold">{matricula.miembros?.nombres || "Miembro sin nombre"}</td><td className="px-4 py-4 text-slate-600">{matricula.miembros?.numero_identificacion || "No registrado"}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{estados.map((estado) => <button key={estado.valor} type="button" onClick={() => setAsistencias((actuales) => ({ ...actuales, [matricula.id]: estado.valor }))} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${asistencias[matricula.id] === estado.valor ? estado.clase : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>{estado.etiqueta}</button>)}</div></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </main>
  );
}

export default AsistenciaCefi;
