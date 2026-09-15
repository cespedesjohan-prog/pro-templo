import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, GraduationCap, Users, UserPlus, X, CalendarCheck, BookOpen, Settings2, BarChart3, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Cefi() {
  const [miembros, setMiembros] = useState([]);
  const [clases, setClases] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [modalGrupo, setModalGrupo] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [cupoGrupo, setCupoGrupo] = useState("");
  const [nombrePeriodo, setNombrePeriodo] = useState("");
  const [fechaInicioPeriodo, setFechaInicioPeriodo] = useState("");
  const [fechaFinPeriodo, setFechaFinPeriodo] = useState("");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");

  async function cargarDatos() {
  setCargando(true);

  const [
    miembrosRespuesta,
    gruposRespuesta,
    matriculasRespuesta,
    gradosRespuesta,
    periodosRespuesta,
    clasesRespuesta,
    docentesRespuesta,
  ] = await Promise.all([
    supabase
      .from("miembros")
      .select(
        "id, nombres, numero_identificacion, telefono_movil, correo_electronico, nivel_cefi, activo"
      )
      .or("nivel_cefi.is.null,nivel_cefi.eq.")
      .order("nombres", { ascending: true }),

    supabase
      .from("cefi_grupos")
      .select(`
        id,
        nombre,
        cupo,
        grado_id,
        periodo_id,
        docente_id,
        cefi_grados(nombre),
        cefi_periodos(nombre),
        cefi_docentes(
          id,
          nombres,
          apellidos
        )
      `)
      .eq("activo", true)
      .order("nombre", { ascending: true }),

    supabase
  .from("cefi_matriculas")
  .select(`
    id,
    miembro_id,
    grupo_id,
    estado,
    cefi_grupos(
      nombre,
      cefi_grados(id, nombre, orden),
      cefi_periodos(nombre)
    )
  `),

    supabase
      .from("cefi_grados")
      .select("id, nombre, orden")
      .eq("activo", true)
      .order("orden"),

    supabase
      .from("cefi_periodos")
      .select("id, nombre, fecha_inicio, fecha_fin")
      .eq("activo", true)
      .order("fecha_inicio", { ascending: false }),

    supabase
      .from("cefi_clases")
      .select(`
        id,
        grupo_id,
        numero,
        nombre,
        descripcion,
        docente_id,
        fecha,
        estado,
        cefi_docentes(
          id,
          nombres,
          apellidos
        )
      `)
      .order("numero", { ascending: true }),

    supabase
      .from("cefi_docentes")
      .select("id, nombres, apellidos")
      .eq("estado", "activo")
      .order("nombres", { ascending: true }),
  ]);

  if (
    miembrosRespuesta.error ||
    gruposRespuesta.error ||
    matriculasRespuesta.error ||
    gradosRespuesta.error ||
    periodosRespuesta.error ||
    clasesRespuesta.error ||
    docentesRespuesta.error
  ) {
    const error =
      miembrosRespuesta.error ||
      gruposRespuesta.error ||
      matriculasRespuesta.error ||
      gradosRespuesta.error ||
      periodosRespuesta.error ||
      clasesRespuesta.error ||
      docentesRespuesta.error;

    toast.error(`No fue posible cargar CEFI: ${error.message}`);
  } else {
    setMiembros(miembrosRespuesta.data || []);
    setGrupos(gruposRespuesta.data || []);
    setMatriculas(matriculasRespuesta.data || []);
    setGrados(gradosRespuesta.data || []);
    setPeriodos(periodosRespuesta.data || []);
    setClases(clasesRespuesta.data || []);
    setDocentes(docentesRespuesta.data || []);
  }

  setCargando(false);
}
  useEffect(() => {
    cargarDatos();
  }, []);

    const miembrosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    const miembrosFinalizados = new Set(
      miembros
        .filter((miembro) => {
          const matriculasMiembro = matriculas.filter(
            (matricula) => matricula.miembro_id === miembro.id
          );

          const ordenesFinalizadas = new Set(
            matriculasMiembro
              .filter((matricula) => matricula.estado === "finalizada")
              .map(
                (matricula) =>
                  matricula.cefi_grupos?.cefi_grados?.orden
              )
              .filter(Boolean)
          );

          return [1, 2, 3, 4].every((orden) =>
            ordenesFinalizadas.has(orden)
          );
        })
        .map((miembro) => miembro.id)
    );

    const miembrosPendientes = miembros.filter(
      (miembro) => !miembrosFinalizados.has(miembro.id)
    );

    if (!termino) return miembrosPendientes;

    return miembrosPendientes.filter((miembro) =>
      [
        miembro.nombres,
        miembro.numero_identificacion,
        miembro.correo_electronico,
      ]
        .filter(Boolean)
        .some((valor) =>
          valor.toLowerCase().includes(termino)
        )
    );
  }, [busqueda, miembros, matriculas]);
  function abrirMatricula(miembro) {
    setMiembroSeleccionado(miembro);
    setGrupoSeleccionado("");
  }

  function cerrarMatricula() {
    setMiembroSeleccionado(null);
    setGrupoSeleccionado("");
  }

  async function matricularMiembro(evento) {
    evento.preventDefault();
    if (!grupoSeleccionado || !miembroSeleccionado) return;

    setGuardando(true);
    const { error } = await supabase.from("cefi_matriculas").insert({
      miembro_id: miembroSeleccionado.id,
      grupo_id: grupoSeleccionado,
    });
    setGuardando(false);

    if (error) {
      toast.error(error.code === "23505" ? "El miembro ya está matriculado en este grupo." : error.message);
      return;
    }

    toast.success("Matrícula creada correctamente.");
    cerrarMatricula();
    cargarDatos();
  }

  async function eliminarMatricula(id) {
    if (!window.confirm("¿Deseas retirar esta matrícula?")) return;
    const { error } = await supabase.from("cefi_matriculas").delete().eq("id", id);
    if (error) toast.error(`No fue posible retirar la matrícula: ${error.message}`);
    else {
      toast.success("Matrícula retirada correctamente.");
      cargarDatos();
    }
  }

  async function cambiarEstadoMatricula(matriculaId, estado) {
    const { error } = await supabase.from("cefi_matriculas").update({ estado }).eq("id", matriculaId);
    if (error) toast.error(`No fue posible actualizar la matrícula: ${error.message}`);
    else {
      toast.success(estado === "finalizada" ? "Nivel marcado como finalizado." : "Estado de matrícula actualizado.");
      cargarDatos();
    }
  }

  function gruposDisponibles(miembroId) {
    const idsMatriculados = matriculas
      .filter((matricula) => matricula.miembro_id === miembroId)
      .map((matricula) => matricula.grupo_id);
    return grupos.filter((grupo) => !idsMatriculados.includes(grupo.id));
  }

function limpiarGrupo() {
  setNombreGrupo("");
  setGradoSeleccionado("");
  setPeriodoSeleccionado("");
  setCupoGrupo("");
  setDocenteSeleccionado("");
  setGrupoEditando(null);
  setModalGrupo(false);
}

  function abrirEditarGrupo(grupo) {
  setGrupoEditando(grupo);
  setNombreGrupo(grupo.nombre || "");
  setGradoSeleccionado(grupo.grado_id || "");
  setPeriodoSeleccionado(grupo.periodo_id || "");
  setCupoGrupo(grupo.cupo || "");
  setDocenteSeleccionado(grupo.docente_id || "");
  setModalGrupo(true);
}

  async function crearGrupo(evento) {
    evento.preventDefault();
    if (!nombreGrupo.trim() || !gradoSeleccionado || !periodoSeleccionado) return;

    setGuardando(true);
    const datosGrupo = {
  nombre: nombreGrupo.trim(),
  grado_id: gradoSeleccionado,
  periodo_id: periodoSeleccionado,
  cupo: cupoGrupo ? Number(cupoGrupo) : null,
  docente_id: docenteSeleccionado || null,
};



    const { error } = grupoEditando
      ? await supabase.from("cefi_grupos").update(datosGrupo).eq("id", grupoEditando.id)
      : await supabase.from("cefi_grupos").insert(datosGrupo);
    setGuardando(false);

    if (error) {
      toast.error(error.code === "23505" ? "Ya existe ese grupo en el periodo seleccionado." : error.message);
      return;
    }

    toast.success(grupoEditando ? "Grupo actualizado correctamente." : "Grupo creado correctamente.");
    limpiarGrupo();
    cargarDatos();
  }

  async function eliminarGrupo(id) {
    if (!window.confirm("¿Deseas eliminar este grupo? Las matrículas existentes deben retirarse primero.")) return;
    const { error } = await supabase.from("cefi_grupos").delete().eq("id", id);
    if (error) toast.error(error.code === "23503" ? "No se puede eliminar: el grupo tiene matrículas relacionadas." : `No fue posible eliminar el grupo: ${error.message}`);
    else {
      toast.success("Grupo eliminado correctamente.");
      cargarDatos();
    }
  }

  async function crearPeriodo(evento) {
    evento.preventDefault();
    if (!nombrePeriodo.trim() || !fechaInicioPeriodo || !fechaFinPeriodo) return;

    setGuardando(true);
    const { error } = await supabase.from("cefi_periodos").insert({
      nombre: nombrePeriodo.trim(),
      fecha_inicio: fechaInicioPeriodo,
      fecha_fin: fechaFinPeriodo,
    });
    setGuardando(false);

    if (error) {
      toast.error(error.code === "23505" ? "Ya existe un periodo con ese nombre." : error.message);
      return;
    }

    toast.success("Periodo creado correctamente.");
    setNombrePeriodo("");
    setFechaInicioPeriodo("");
    setFechaFinPeriodo("");
    cargarDatos();
  }

  return (
    <main className="min-h-screen bg-[#f5f7f9] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Escuela de formación</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">CEFI</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Administra los estudiantes de la iglesia y sus matrículas por nivel.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-wrap gap-2 self-end"><Link to="/gestion-iglesia/cefi/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"><BarChart3 size={17} /> Dashboard</Link><Link to="/gestion-iglesia/cefi/materias" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"><Settings2 size={17} /> Materias</Link><Link to="/gestion-iglesia/cefi/asistencia" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"><CalendarCheck size={17} /> Asistencia</Link><Link to="/gestion-iglesia/cefi/calificaciones" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"><BookOpen size={17} /> Notas</Link></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <Users size={18} className="mb-2 text-amber-300" />
                <strong className="block text-2xl">{miembros.length}</strong>
                <span className="text-xs text-slate-300">Miembros</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <GraduationCap size={18} className="mb-2 text-amber-300" />
                <strong className="block text-2xl">{matriculas.filter((matricula) => matricula.estado === "activa").length}</strong>
                <span className="text-xs text-slate-300">Matrículas activas</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Configuración académica</h2>
              <p className="mt-1 text-sm text-slate-500">Crea el periodo y los grupos donde se matricularán los estudiantes.</p>
            </div>
            <button type="button" onClick={() => setModalGrupo(true)} disabled={!periodos.length || !grados.length} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">+ Nuevo grupo</button>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <form onSubmit={crearPeriodo} className="rounded-2xl bg-slate-50 p-4">
              <h3 className="font-bold">Nuevo periodo</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <input value={nombrePeriodo} onChange={(evento) => setNombrePeriodo(evento.target.value)} placeholder="Ej. 2026" required className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
                <input type="date" value={fechaInicioPeriodo} onChange={(evento) => setFechaInicioPeriodo(evento.target.value)} required className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
                <input type="date" value={fechaFinPeriodo} onChange={(evento) => setFechaFinPeriodo(evento.target.value)} required className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </div>
              <button type="submit" disabled={guardando} className="mt-3 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50">Guardar periodo</button>
            </form>
            <div>
              <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Grupos activos</h3><span className="text-xs text-slate-500">{grupos.length} configurados</span></div>
              {grupos.length ? <div className="grid gap-3 sm:grid-cols-2">{grupos.map((grupo) => <div key={grupo.id} className="rounded-2xl border border-slate-200 px-4 py-3"><div className="flex items-start justify-between gap-2"><div className="font-semibold">{grupo.nombre}</div><div className="flex gap-1"><button type="button" onClick={() => abrirEditarGrupo(grupo)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Editar grupo"><Pencil size={15} /></button><button type="button" onClick={() => eliminarGrupo(grupo.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Eliminar grupo"><Trash2 size={15} /></button></div></div><div className="mt-1 text-xs text-slate-500">{grupo.cefi_grados?.nombre || "Nivel sin definir"} · {grupo.cefi_periodos?.nombre || "Periodo sin definir"}{grupo.cupo ? ` · Cupo ${grupo.cupo}` : ""}</div></div>)}</div> : <div className="rounded-2xl bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">Crea un periodo y luego un grupo para comenzar.</div>}
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Estudiantes</h2>
              <p className="mt-1 text-sm text-slate-500">Aquí aparecen los miembros pendientes de asignar a un nivel desde Miembros.</p>
            </div>
            <label className="relative block w-full sm:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar por nombre, documento o correo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </label>
          </div>

          {cargando ? (
            <div className="py-16 text-center text-sm text-slate-500">Cargando estudiantes...</div>
          ) : miembrosFiltrados.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">No se encontraron miembros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Miembro</th>
                    <th className="px-4 py-3 font-semibold">Documento</th>
                    <th className="px-4 py-3 font-semibold">Nivel</th>
                    <th className="px-4 py-3 font-semibold">Estado CEFI</th>
                    <th className="px-4 py-3 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {miembrosFiltrados.map((miembro) => {
                    const matriculasMiembro = matriculas.filter((matricula) => matricula.miembro_id === miembro.id);
                    return (
                      <tr key={miembro.id} className="transition hover:bg-amber-50/40">
                        <td className="px-4 py-4">
                          <div className="font-semibold">{miembro.nombres}</div>
                          <div className="text-xs text-slate-500">{miembro.correo_electronico || miembro.telefono_movil || "Sin contacto"}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{miembro.numero_identificacion || "No registrado"}</td>
                        <td className="px-4 py-4 text-slate-600">Sin nivel</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{matriculasMiembro.length ? `${matriculasMiembro.length} matrícula(s)` : "Pendiente"}</span>
                          {matriculasMiembro.map((matricula) => <div key={matricula.id} className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{matricula.cefi_grupos?.nombre || "Grupo asignado"} · {matricula.cefi_grupos?.cefi_grados?.nombre || "Nivel sin definir"}</span><select value={matricula.estado} onChange={(evento) => cambiarEstadoMatricula(matricula.id, evento.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"><option value="activa">Activa</option><option value="finalizada">Finalizada</option><option value="cancelada">Cancelada</option></select><button type="button" onClick={() => eliminarMatricula(matricula.id)} className="font-semibold text-rose-600 hover:text-rose-800">Retirar</button></div>)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button type="button" onClick={() => abrirMatricula(miembro)} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300">
                            <UserPlus size={15} /> Matricular
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {miembroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Nueva matrícula</p>
                <h2 className="mt-1 text-xl font-bold">{miembroSeleccionado.nombres}</h2>
              </div>
              <button type="button" onClick={cerrarMatricula} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar"><X size={20} /></button>
            </div>
            <form onSubmit={matricularMiembro}>
              <label className="block text-sm font-semibold text-slate-700">Grupo CEFI
                <select value={grupoSeleccionado} onChange={(evento) => setGrupoSeleccionado(evento.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                  <option value="">Selecciona un grupo</option>
                  {gruposDisponibles(miembroSeleccionado.id).map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre} · {grupo.cefi_grados?.nombre || "Sin nivel"} · {grupo.cefi_periodos?.nombre || "Sin periodo"}</option>)}
                </select>
              </label>
              {gruposDisponibles(miembroSeleccionado.id).length === 0 && <p className="mt-3 text-sm text-amber-700">No hay grupos disponibles para este miembro. Crea primero un grupo en Supabase.</p>}
              <button disabled={guardando || !grupoSeleccionado} type="submit" className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{guardando ? "Guardando..." : "Guardar matrícula"}</button>
            </form>
          </div>
        </div>
      )}

      {modalGrupo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <form onSubmit={crearGrupo} className="cefi-group-form-modal rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Configuración</p><h2 className="mt-1 text-xl font-bold">{grupoEditando ? "Modificar grupo CEFI" : "Nuevo grupo CEFI"}</h2></div><button type="button" onClick={limpiarGrupo} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar"><X size={20} /></button></div>
            <div className="space-y-4">
              <input value={nombreGrupo} onChange={(evento) => setNombreGrupo(evento.target.value)} placeholder="Nombre del grupo, ej. Grupo mañana" required className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" />
              <select value={gradoSeleccionado} onChange={(evento) => setGradoSeleccionado(evento.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Selecciona el nivel</option>{grados.map((grado) => <option key={grado.id} value={grado.id}>{grado.nombre}</option>)}</select>
              <select value={periodoSeleccionado} onChange={(evento) => setPeriodoSeleccionado(evento.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"><option value="">Selecciona el periodo</option>{periodos.map((periodo) => <option key={periodo.id} value={periodo.id}>{periodo.nombre}</option>)}</select>
              <select
  value={docenteSeleccionado}
  onChange={(evento) => setDocenteSeleccionado(evento.target.value)}
  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400"
>
  <option value="">Selecciona el maestro responsable</option>
  {docentes.map((docente) => (
    <option key={docente.id} value={docente.id}>
      {docente.nombres} {docente.apellidos}
    </option>
  ))}
</select>
              <input type="number" min="1" value={cupoGrupo} onChange={(evento) => setCupoGrupo(evento.target.value)} placeholder="Cupo máximo (opcional)" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400" />
            </div>
            <button disabled={guardando} type="submit" className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{guardando ? "Guardando..." : grupoEditando ? "Actualizar grupo" : "Guardar grupo"}</button>
          </form>
        </div>
      )}
    </main>
  );
}

export default Cefi;
