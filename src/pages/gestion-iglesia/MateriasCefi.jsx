import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

function MateriasCefi() {
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [grupoId, setGrupoId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [nombreMateria, setNombreMateria] = useState("");
  const [descripcionMateria, setDescripcionMateria] = useState("");
  const [nombresDocente, setNombresDocente] = useState("");
  const [apellidosDocente, setApellidosDocente] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  async function cargarDatos() {
    setCargando(true);
    const [materiasRespuesta, gruposRespuesta, docentesRespuesta] = await Promise.all([
      supabase.from("cefi_materias").select("id, nombre, descripcion, horas_semana").eq("activo", true).order("nombre"),
      supabase.from("cefi_grupos").select("id, nombre, cefi_grados(nombre), cefi_periodos(nombre)").eq("activo", true).order("nombre"),
      supabase.from("cefi_docentes").select("id, nombres, apellidos").eq("estado", "activo").order("nombres"),
    ]);
    const error = materiasRespuesta.error || gruposRespuesta.error || docentesRespuesta.error;
    if (error) toast.error(`No fue posible cargar configuración: ${error.message}`);
    else {
      setMaterias(materiasRespuesta.data || []);
      setGrupos(gruposRespuesta.data || []);
      setDocentes(docentesRespuesta.data || []);
      if (gruposRespuesta.data?.length && !grupoId) setGrupoId(gruposRespuesta.data[0].id);
    }
    setCargando(false);
  }

  async function cargarAsignaciones() {
    if (!grupoId) {
      setAsignaciones([]);
      return;
    }
    const { data, error } = await supabase.from("cefi_asignaciones").select("id, materia_id, docente_id, cefi_materias(nombre), cefi_docentes(nombres, apellidos)").eq("grupo_id", grupoId).order("created_at");
    if (error) toast.error(`No fue posible cargar materias del grupo: ${error.message}`);
    else setAsignaciones(data || []);
  }

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { cargarAsignaciones(); }, [grupoId]);

  async function crearMateria(evento) {
    evento.preventDefault();
    if (!nombreMateria.trim()) return;
    setGuardando(true);
    const { error } = await supabase.from("cefi_materias").insert({ nombre: nombreMateria.trim(), descripcion: descripcionMateria.trim() || null });
    setGuardando(false);
    if (error) toast.error(error.code === "23505" ? "Ya existe una materia con ese nombre." : error.message);
    else {
      toast.success("Materia creada correctamente.");
      setNombreMateria("");
      setDescripcionMateria("");
      cargarDatos();
    }
  }

  async function asignarMateria(evento) {
    evento.preventDefault();
    if (!grupoId || !materiaId) return;
    setGuardando(true);
    const { error } = await supabase.from("cefi_asignaciones").insert({ grupo_id: grupoId, materia_id: materiaId, docente_id: docenteId || null });
    setGuardando(false);
    if (error) toast.error(error.code === "23505" ? "Esta materia ya está asignada al grupo." : error.message);
    else {
      toast.success("Materia asignada correctamente.");
      setMateriaId("");
      setDocenteId("");
      cargarAsignaciones();
    }
  }

  async function crearDocente(evento) {
    evento.preventDefault();
    if (!nombresDocente.trim() || !apellidosDocente.trim()) return;
    setGuardando(true);
    const { data, error } = await supabase.from("cefi_docentes").insert({
      nombres: nombresDocente.trim(),
      apellidos: apellidosDocente.trim(),
    }).select("id, nombres, apellidos").single();
    setGuardando(false);
    if (error) {
      toast.error(error.code === "23505" ? "Ya existe un docente con ese documento." : error.message);
      return;
    }
    toast.success("Docente registrado correctamente.");
    setDocentes((actuales) => [...actuales, data].sort((a, b) => a.nombres.localeCompare(b.nombres)));
    setDocenteId(data.id);
    setNombresDocente("");
    setApellidosDocente("");
  }

  async function quitarAsignacion(id) {
    const { error } = await supabase.from("cefi_asignaciones").delete().eq("id", id);
    if (error) toast.error(`No fue posible quitar la asignación: ${error.message}`);
    else {
      toast.success("Asignación retirada.");
      cargarAsignaciones();
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f9] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between"><Link to="/gestion-iglesia/cefi" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={17} /> Volver a CEFI</Link><BookOpen className="text-amber-500" size={26} /></div>
        <section className="mb-6 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10"><p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Nivel 1 · Configuración base</p><h1 className="mt-2 text-3xl font-black tracking-tight">Materias y docentes</h1><p className="mt-2 text-sm text-slate-300">Define las materias que aparecerán en las calificaciones de cada grupo.</p></section>
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Registrar docente</h2>
          <p className="mt-1 text-sm text-slate-500">Después de registrarlo aparecerá en el selector de asignación.</p>
          <form onSubmit={crearDocente} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-sm font-semibold text-slate-700">Nombres<input value={nombresDocente} onChange={(evento) => setNombresDocente(evento.target.value)} placeholder="Nombres" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" /></label>
            <label className="text-sm font-semibold text-slate-700">Apellidos<input value={apellidosDocente} onChange={(evento) => setApellidosDocente(evento.target.value)} placeholder="Apellidos" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" /></label>
            <button type="submit" disabled={guardando} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Plus size={17} /> Registrar</button>
          </form>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Nueva materia</h2><form onSubmit={crearMateria} className="mt-5 space-y-4"><input value={nombreMateria} onChange={(evento) => setNombreMateria(evento.target.value)} placeholder="Ej. Fundamentos de la fe" required className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" /><textarea value={descripcionMateria} onChange={(evento) => setDescripcionMateria(evento.target.value)} placeholder="Descripción opcional" rows="3" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" /><button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Plus size={17} /> Guardar materia</button></form><div className="mt-7 border-t border-slate-100 pt-5"><h3 className="font-bold">Catálogo ({materias.length})</h3><div className="mt-3 space-y-2">{materias.map((materia) => <div key={materia.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm"><div className="font-semibold">{materia.nombre}</div>{materia.descripcion && <div className="mt-1 text-xs text-slate-500">{materia.descripcion}</div>}</div>)}</div></div></section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Asignar al grupo</h2><form onSubmit={asignarMateria} className="mt-5 space-y-4"><select value={grupoId} onChange={(evento) => setGrupoId(evento.target.value)} required disabled={cargando} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Selecciona un grupo</option>{grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre} · {grupo.cefi_grados?.nombre || "Sin nivel"}</option>)}</select><select value={materiaId} onChange={(evento) => setMateriaId(evento.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Selecciona una materia</option>{materias.map((materia) => <option key={materia.id} value={materia.id}>{materia.nombre}</option>)}</select><select value={docenteId} onChange={(evento) => setDocenteId(evento.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Sin docente asignado</option>{docentes.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombres} {docente.apellidos || ""}</option>)}</select><button type="submit" disabled={guardando || !grupoId} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus size={17} /> Asignar materia</button></form><div className="mt-7 border-t border-slate-100 pt-5"><h3 className="font-bold">Asignadas ({asignaciones.length})</h3><div className="mt-3 space-y-2">{asignaciones.map((asignacion) => <div key={asignacion.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm"><div><div className="font-semibold">{asignacion.cefi_materias?.nombre || "Materia"}</div><div className="mt-1 text-xs text-slate-500">{asignacion.cefi_docentes ? `${asignacion.cefi_docentes.nombres} ${asignacion.cefi_docentes.apellidos || ""}` : "Sin docente"}</div></div><button type="button" onClick={() => quitarAsignacion(asignacion.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Quitar asignación"><Trash2 size={16} /></button></div>)}</div></div></section>
        </div>
      </div>
    </main>
  );
}

export default MateriasCefi;
