import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  UserPlus,
  Users,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

function nombreDocente(docente) {
  if (!docente) return "Sin maestro asignado";
  return `${docente.nombres || ""} ${docente.apellidos || ""}`.trim() || "Sin maestro asignado";
}

function MateriasCefi() {
  const [modulos, setModulos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [clases, setClases] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [miembros, setMiembros] = useState([]);

  const [moduloId, setModuloId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [busquedaMiembro, setBusquedaMiembro] = useState("");
  const [miembroId, setMiembroId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardandoClaseId, setGuardandoClaseId] = useState("");
  const [matriculas, setMatriculas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(false);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState("");
  const [vistaGrupo, setVistaGrupo] = useState("estudiantes");
  const [matriculaResultadoPendiente, setMatriculaResultadoPendiente] = useState(null);
  const [resultadoNivelPendiente, setResultadoNivelPendiente] = useState("");
  const [grupoSiguienteId, setGrupoSiguienteId] = useState("");
  const [guardandoResultado, setGuardandoResultado] = useState(false);

  async function cargarDatos() {
    setCargando(true);

    const [
      modulosRespuesta,
      gruposRespuesta,
      clasesRespuesta,
      docentesRespuesta,
      miembrosRespuesta,
    ] = await Promise.all([
      supabase
        .from("cefi_grados")
        .select("id, nombre, orden, activo")
        .eq("activo", true)
        .order("orden"),

      supabase
        .from("cefi_grupos")
        .select(
          `
          id,
          nombre,
          grado_id,
          periodo_id,
          cupo,
          activo,
          docente_id,
          cefi_grados(id, nombre, orden),
          cefi_periodos(id, nombre, fecha_inicio, fecha_fin, activo),
          cefi_docentes(id, nombres, apellidos)
        `
        )
        .eq("activo", true)
        .order("nombre"),

      supabase
        .from("cefi_clases")
        .select(
          `
          id,
          grupo_id,
          numero,
          nombre,
          descripcion,
          docente_id,
          fecha,
          estado,
          cefi_docentes(id, nombres, apellidos)
        `
        )
        .order("numero"),

      supabase
        .from("cefi_docentes")
        .select("id, nombres, apellidos, miembro_id, perfil_id, estado")
        .eq("estado", "activo")
        .order("nombres"),

      supabase
        .from("miembros")
        .select("id, nombres, correo_electronico, telefono_movil, activo")
        .eq("activo", true)
        .order("nombres"),
    ]);

    const error =
      modulosRespuesta.error ||
      gruposRespuesta.error ||
      clasesRespuesta.error ||
      docentesRespuesta.error ||
      miembrosRespuesta.error;

    if (error) {
      toast.error(`No fue posible cargar CEFI: ${error.message}`);
    } else {
      setModulos(modulosRespuesta.data || []);
      setGrupos(gruposRespuesta.data || []);
      setClases(clasesRespuesta.data || []);
      setDocentes(docentesRespuesta.data || []);
      setMiembros(miembrosRespuesta.data || []);

      if (!moduloId && modulosRespuesta.data?.length) {
        setModuloId(modulosRespuesta.data[0].id);
      }
    }

    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarAsistenciaGrupo() {
    if (!grupoId) {
      setMatriculas([]);
      setAsistencias([]);
      return;
    }

    setCargandoAsistencia(true);

    const [matriculasRespuesta, asistenciasRespuesta] = await Promise.all([
      supabase
        .from("cefi_matriculas")
        .select(
          `
          id,
          miembro_id,
          grupo_id,
          estado,
          resultado_nivel,
          fecha_matricula,
          miembros(id, nombres, correo_electronico)
        `
        )
        .eq("grupo_id", grupoId)
        .eq("estado", "activa")
        .order("created_at"),

      supabase
        .from("cefi_asistencia_clases")
        .select(
          `
          id,
          clase_id,
          matricula_id,
          estado,
          observacion
        `
        )
        .in(
          "clase_id",
          clases
            .filter((clase) => clase.grupo_id === grupoId)
            .map((clase) => clase.id)
        ),
    ]);

    const error =
      matriculasRespuesta.error || asistenciasRespuesta.error;

    if (error) {
      toast.error(`No fue posible cargar la asistencia: ${error.message}`);
    } else {
      setMatriculas(matriculasRespuesta.data || []);
      setAsistencias(asistenciasRespuesta.data || []);
    }

    setCargandoAsistencia(false);
  }

  useEffect(() => {
    cargarAsistenciaGrupo();
  }, [grupoId, clases]);

  const modulosConGrupos = useMemo(
    () =>
      modulos.map((modulo) => ({
        ...modulo,
        grupos: grupos.filter((grupo) => grupo.grado_id === modulo.id),
      })),
    [modulos, grupos]
  );

  const gruposDelModulo = useMemo(
    () => grupos.filter((grupo) => grupo.grado_id === moduloId),
    [grupos, moduloId]
  );

  useEffect(() => {
    if (!gruposDelModulo.length) {
      setGrupoId("");
      return;
    }

    if (!gruposDelModulo.some((grupo) => grupo.id === grupoId)) {
      setGrupoId(gruposDelModulo[0].id);
    }
  }, [gruposDelModulo, grupoId]);

  const grupoSeleccionado = grupos.find((grupo) => grupo.id === grupoId);

  const clasesDelGrupo = useMemo(
    () =>
      clases
        .filter((clase) => clase.grupo_id === grupoId)
        .sort((a, b) => (a.numero || 0) - (b.numero || 0)),
    [clases, grupoId]
  );

  useEffect(() => {
    if (!clasesDelGrupo.length) {
      setClaseSeleccionadaId("");
      return;
    }

    if (!clasesDelGrupo.some((clase) => clase.id === claseSeleccionadaId)) {
      setClaseSeleccionadaId(clasesDelGrupo[0].id);
    }
  }, [clasesDelGrupo, claseSeleccionadaId]);

  const claseSeleccionada = clasesDelGrupo.find(
    (clase) => clase.id === claseSeleccionadaId
  );

  function resumenClase(claseId) {
    const registros = asistencias.filter((item) => item.clase_id === claseId);
    const presentes = registros.filter((item) =>
      ["presente", "tarde"].includes(item.estado)
    ).length;
    const excusas = registros.filter((item) => item.estado === "excusa").length;

    return {
      presentes,
      excusas,
      marcados: registros.length,
    };
  }

  const miembrosDisponibles = useMemo(() => {
    const texto = busquedaMiembro.trim().toLowerCase();

    return miembros
      .filter((miembro) => {
        if (!texto) return true;
        return (
          miembro.nombres?.toLowerCase().includes(texto) ||
          miembro.correo_electronico?.toLowerCase().includes(texto)
        );
      })
      .sort((a, b) =>
        (a.nombres || "").localeCompare(b.nombres || "")
      );
  }, [miembros, busquedaMiembro]);

  async function actualizarMaestroGrupo(docenteId) {
    if (!grupoSeleccionado) return;

    setGuardando(true);

    const { error } = await supabase
      .from("cefi_grupos")
      .update({ docente_id: docenteId || null })
      .eq("id", grupoSeleccionado.id);

    setGuardando(false);

    if (error) {
      toast.error(`No fue posible asignar el maestro: ${error.message}`);
      return;
    }

    toast.success("Maestro del grupo actualizado.");
    await cargarDatos();
  }

  async function actualizarMaestroClase(claseId, docenteId) {
    setGuardandoClaseId(claseId);

    const { error } = await supabase
      .from("cefi_clases")
      .update({ docente_id: docenteId || null })
      .eq("id", claseId);

    setGuardandoClaseId("");

    if (error) {
      toast.error(`No fue posible asignar el maestro a la clase: ${error.message}`);
      return;
    }

    toast.success("Maestro de la clase actualizado.");
    await cargarDatos();
  }

  async function generarClases() {
    if (!grupoSeleccionado) return;

    if (clasesDelGrupo.length > 0) {
      toast.error("Este grupo ya tiene clases registradas.");
      return;
    }

    setGuardando(true);

    const nuevasClases = Array.from({ length: 10 }, (_, indice) => ({
      grupo_id: grupoSeleccionado.id,
      numero: indice + 1,
      nombre: `Clase ${indice + 1}`,
      estado: "pendiente",
    }));

    const { error } = await supabase
      .from("cefi_clases")
      .insert(nuevasClases);

    setGuardando(false);

    if (error) {
      toast.error(`No fue posible crear las 10 clases: ${error.message}`);
      return;
    }

    toast.success("Se crearon las 10 clases del grupo.");
    await cargarDatos();
  }

  function obtenerAsistencia(claseId, matriculaId) {
    return (
      asistencias.find(
        (item) =>
          item.clase_id === claseId && item.matricula_id === matriculaId
      )?.estado || ""
    );
  }

  async function guardarAsistencia(claseId, matriculaId, estado) {
    if (!claseId || !matriculaId || !estado) return;

    setGuardandoAsistencia(true);

    const asistenciaExistente = asistencias.find(
      (item) =>
        item.clase_id === claseId && item.matricula_id === matriculaId
    );

    let respuesta;

    if (asistenciaExistente) {
      respuesta = await supabase
        .from("cefi_asistencia_clases")
        .update({ estado })
        .eq("id", asistenciaExistente.id);
    } else {
      respuesta = await supabase
        .from("cefi_asistencia_clases")
        .insert({
          clase_id: claseId,
          matricula_id: matriculaId,
          estado,
        });
    }

    setGuardandoAsistencia(false);

    if (respuesta.error) {
      toast.error(`No fue posible guardar la asistencia: ${respuesta.error.message}`);
      return;
    }

    setAsistencias((actuales) => {
      if (asistenciaExistente) {
        return actuales.map((item) =>
          item.id === asistenciaExistente.id
            ? { ...item, estado }
            : item
        );
      }

      return [
        ...actuales,
        {
          id: respuesta.data?.[0]?.id || crypto.randomUUID(),
          clase_id: claseId,
          matricula_id: matriculaId,
          estado,
        },
      ];
    });

    toast.success("Asistencia guardada.");
  }

  function abrirResultadoNivel(matricula, resultado) {
    if (!matricula || !grupoSeleccionado) return;

    const ordenActual = grupoSeleccionado.cefi_grados?.orden || 0;
    const siguienteModulo = modulos.find((modulo) => modulo.orden === ordenActual + 1);

    if (ordenActual < 4 && !siguienteModulo) {
      toast.error("No se encontró el siguiente módulo CEFI.");
      return;
    }

    const gruposSiguientes = grupos.filter(
      (grupo) =>
        grupo.grado_id === siguienteModulo?.id &&
        grupo.periodo_id === grupoSeleccionado.periodo_id &&
        grupo.activo
    );

    setMatriculaResultadoPendiente(matricula);
    setResultadoNivelPendiente(resultado);
    setGrupoSiguienteId(gruposSiguientes[0]?.id || "");
  }

  function cerrarResultadoNivel() {
    setMatriculaResultadoPendiente(null);
    setResultadoNivelPendiente("");
    setGrupoSiguienteId("");
  }

  async function confirmarResultadoNivel() {
    if (!matriculaResultadoPendiente || !resultadoNivelPendiente || !grupoSeleccionado) {
      return;
    }

    const ordenActual = grupoSeleccionado.cefi_grados?.orden || 0;
    const siguienteModulo = modulos.find((modulo) => modulo.orden === ordenActual + 1);

    setGuardandoResultado(true);

    try {
      if (ordenActual < 4) {
        if (!grupoSiguienteId) {
          throw new Error("Selecciona el grupo del siguiente módulo.");
        }

        const { data: matriculaSiguienteExistente, error: consultaError } =
          await supabase
            .from("cefi_matriculas")
            .select("id, estado, resultado_nivel")
            .eq("miembro_id", matriculaResultadoPendiente.miembro_id)
            .eq("grupo_id", grupoSiguienteId)
            .maybeSingle();

        if (consultaError) throw consultaError;

        if (matriculaSiguienteExistente) {
          if (matriculaSiguienteExistente.estado !== "activa" || matriculaSiguienteExistente.resultado_nivel !== "en_curso") {
            const { error: reactivarError } = await supabase
              .from("cefi_matriculas")
              .update({
                estado: "activa",
                resultado_nivel: "en_curso",
              })
              .eq("id", matriculaSiguienteExistente.id);

            if (reactivarError) throw reactivarError;
          }
        } else {
          const { error: insercionError } = await supabase
            .from("cefi_matriculas")
            .insert({
              miembro_id: matriculaResultadoPendiente.miembro_id,
              grupo_id: grupoSiguienteId,
              fecha_matricula: new Date().toISOString().slice(0, 10),
              estado: "activa",
              resultado_nivel: "en_curso",
            });

          if (insercionError) throw insercionError;
        }
      }

      const { error: finalizarError } = await supabase
        .from("cefi_matriculas")
        .update({
          estado: "finalizada",
          resultado_nivel: resultadoNivelPendiente,
        })
        .eq("id", matriculaResultadoPendiente.id);

      if (finalizarError) throw finalizarError;

      if (ordenActual >= 4) {
        toast.success(
          `${matriculaResultadoPendiente.miembros?.nombres || "El estudiante"} finalizó CEFI.`
        );
      } else {
        toast.success(
          `${matriculaResultadoPendiente.miembros?.nombres || "El estudiante"} avanzó a ${siguienteModulo?.nombre}.`
        );
      }

      cerrarResultadoNivel();
      await cargarAsistenciaGrupo();
    } catch (error) {
      toast.error(error.message || "No fue posible registrar el resultado del nivel.");
    } finally {
      setGuardandoResultado(false);
    }
  }

  async function marcarClaseRealizada(claseId) {
    const { error } = await supabase
      .from("cefi_clases")
      .update({
        estado: "realizada",
        fecha: new Date().toISOString().slice(0, 10),
      })
      .eq("id", claseId);

    if (error) {
      toast.error(`No fue posible marcar la clase: ${error.message}`);
      return;
    }

    toast.success("Clase marcada como realizada.");
    await cargarDatos();
  }

  async function convertirMiembroEnProfesor(evento) {
    evento.preventDefault();

    if (!miembroId) {
      toast.error("Selecciona un miembro.");
      return;
    }

    const miembro = miembros.find((item) => item.id === miembroId);

    if (!miembro) {
      toast.error("No se encontrÃ³ el miembro seleccionado.");
      return;
    }

    setGuardando(true);

    try {
      const { data: docenteExistente, error: docenteConsultaError } =
        await supabase
          .from("cefi_docentes")
          .select("id, nombres, apellidos, miembro_id, perfil_id, estado")
          .eq("miembro_id", miembro.id)
          .maybeSingle();

      if (docenteConsultaError) throw docenteConsultaError;

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("id, nombres, rol, activo, miembro_id")
        .eq("miembro_id", miembro.id)
        .maybeSingle();

      if (perfilError) throw perfilError;

      if (!perfil) {
        throw new Error(
          "Este miembro no tiene un perfil de acceso asociado. Primero debe tener un perfil en ICC PALABRA DE FE."
        );
      }

      const { data: rolCefiExistente, error: rolConsultaError } =
        await supabase
          .from("cefi_roles_usuario")
          .select("id, perfil_id, rol_cefi, activo")
          .eq("perfil_id", perfil.id)
          .maybeSingle();

      if (rolConsultaError) throw rolConsultaError;

      if (
        rolCefiExistente &&
        rolCefiExistente.rol_cefi !== "Profesor"
      ) {
        throw new Error(
          `Este miembro ya tiene el rol CEFI "${rolCefiExistente.rol_cefi}".`
        );
      }

      if (rolCefiExistente) {
        const { error } = await supabase
          .from("cefi_roles_usuario")
          .update({
            rol_cefi: "Profesor",
            activo: true,
            actualizado_en: new Date().toISOString(),
          })
          .eq("id", rolCefiExistente.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cefi_roles_usuario")
          .insert({
            perfil_id: perfil.id,
            rol_cefi: "Profesor",
            activo: true,
          });

        if (error) throw error;
      }

      if (!docenteExistente) {
        const { error } = await supabase
          .from("cefi_docentes")
          .insert({
            miembro_id: miembro.id,
            perfil_id: perfil.id,
            nombres: miembro.nombres,
            apellidos: "",
            correo: miembro.correo_electronico || null,
            telefono: miembro.telefono_movil || null,
            estado: "activo",
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cefi_docentes")
          .update({
            perfil_id: perfil.id,
            nombres: miembro.nombres,
            correo: miembro.correo_electronico || null,
            telefono: miembro.telefono_movil || null,
            estado: "activo",
          })
          .eq("id", docenteExistente.id);

        if (error) throw error;
      }

      toast.success(`${miembro.nombres} ahora es Profesor CEFI.`);
      setMiembroId("");
      setBusquedaMiembro("");
      await cargarDatos();
    } catch (error) {
      toast.error(error.message || "No fue posible asignar el profesor.");
    } finally {
      setGuardando(false);
    }
  }

  const totalClasesGrupo = clasesDelGrupo.length;
  const clasesRealizadas = clasesDelGrupo.filter(
    (clase) => clase.estado === "realizada"
  ).length;
  const totalEstudiantes = matriculas.length;
  const progresoClases =
    totalClasesGrupo > 0
      ? Math.round((clasesRealizadas / totalClasesGrupo) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#f5f7f9] px-3 py-5 text-slate-900 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex items-center justify-between">
          <Link
            to="/gestion-iglesia/cefi"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Volver a CEFI
          </Link>
          <BookOpen className="text-blue-600" size={23} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Módulos */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-5">
            <div className="px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <GraduationCap size={19} />
                </div>
                <div>
                  <h1 className="font-black">Módulos CEFI</h1>
                  <p className="text-[11px] text-slate-500">
                    4 etapas del proceso formativo
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {modulosConGrupos.map((modulo) => (
                <button
                  key={modulo.id}
                  type="button"
                  onClick={() => {
                    setModuloId(modulo.id);
                    setVistaGrupo("estudiantes");
                  }}
                  className={`w-full rounded-2xl border p-3.5 text-left transition ${
                    moduloId === modulo.id
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Módulo {modulo.orden}
                      </div>
                      <div className="mt-1 text-sm font-bold leading-snug">
                        {modulo.nombre}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {modulo.grupos.length}{" "}
                        {modulo.grupos.length === 1 ? "grupo" : "grupos"}
                      </div>
                    </div>
                    {moduloId === modulo.id && (
                      <ChevronRight size={17} className="mt-1 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Área principal */}
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
            {!moduloId ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Selecciona un módulo.
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span>CEFI</span>
                        <ChevronRight size={13} />
                        <span>Módulo {modulos.find((item) => item.id === moduloId)?.orden}</span>
                        <ChevronRight size={13} />
                        <span>Grupo</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                          {modulos.find((item) => item.id === moduloId)?.nombre}
                        </h2>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
                          MÓDULO {modulos.find((item) => item.id === moduloId)?.orden}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {grupoSeleccionado
                          ? `${grupoSeleccionado.nombre} · Período ${
                              grupoSeleccionado.cefi_periodos?.nombre || "—"
                            }`
                          : "Selecciona un grupo"}
                      </p>
                    </div>

                    {grupoSeleccionado && (
                      <div className="min-w-[220px] rounded-2xl bg-slate-950 px-4 py-3 text-white">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-400">Progreso del grupo</span>
                          <span className="text-xs font-bold">{progresoClases}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${progresoClases}%` }}
                          />
                        </div>
                        <div className="mt-2 text-sm font-bold">
                          {clasesRealizadas}/{totalClasesGrupo || 0} clases realizadas
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Grupo
                      <select
                        value={grupoId}
                        onChange={(evento) => setGrupoId(evento.target.value)}
                        disabled={cargando}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Selecciona un grupo</option>
                        {gruposDelModulo.map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nombre}
                            {grupo.cefi_periodos?.nombre
                              ? ` · Período ${grupo.cefi_periodos.nombre}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {grupoSeleccionado && (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Grupo
                        </div>
                        <div className="mt-1 font-bold">{grupoSeleccionado.nombre}</div>
                        <div className="text-xs text-slate-500">
                          Cupo: {grupoSeleccionado.cupo ?? "Sin límite"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Período
                        </div>
                        <div className="mt-1 font-bold">
                          {grupoSeleccionado.cefi_periodos?.nombre || "Sin período"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {grupoSeleccionado.cefi_periodos?.fecha_inicio || "—"} →{" "}
                          {grupoSeleccionado.cefi_periodos?.fecha_fin || "—"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Maestro responsable
                        </div>
                        <div className="mt-1 truncate font-bold">
                          {nombreDocente(grupoSeleccionado.cefi_docentes)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {totalEstudiantes} estudiante{totalEstudiantes === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {grupoSeleccionado ? (
                  <>
                    {/* Navegación interna */}
                    <div className="border-b border-slate-100 px-5 sm:px-7">
                      <div className="flex gap-1 overflow-x-auto">
                        {[
                          ["estudiantes", "Estudiantes", Users],
                          ["clases", `Clases (${totalClasesGrupo})`, BookOpen],
                          ["configuracion", "Configuración", Settings2],
                        ].map(([valor, etiqueta, Icono]) => (
                          <button
                            key={valor}
                            type="button"
                            onClick={() => setVistaGrupo(valor)}
                            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-bold transition ${
                              vistaGrupo === valor
                                ? "border-blue-600 text-blue-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <Icono size={16} />
                            {etiqueta}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ESTUDIANTES */}
                    {vistaGrupo === "estudiantes" && (
                      <div className="p-5 sm:p-7">
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                                <Users size={19} />
                              </div>
                              <div>
                                <h3 className="font-black">Estudiantes del nivel</h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  El resultado se registra una sola vez por estudiante.
                                  La asistencia se gestiona desde cada clase.
                                </p>
                              </div>
                            </div>
                            <div className="relative md:w-64">
                              <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                value={busquedaMiembro}
                                onChange={(evento) => setBusquedaMiembro(evento.target.value)}
                                placeholder="Buscar estudiante..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                          <div className="hidden grid-cols-[40px_minmax(180px,1.4fr)_minmax(180px,1fr)_110px_220px_40px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400 md:grid">
                            <div>#</div>
                            <div>Estudiante</div>
                            <div>Contacto</div>
                            <div>Estado</div>
                            <div>Resultado del nivel</div>
                            <div />
                          </div>

                          {matriculas
                            .filter((matricula) => {
                              const q = busquedaMiembro.trim().toLowerCase();
                              if (!q) return true;
                              return (
                                matricula.miembros?.nombres?.toLowerCase().includes(q) ||
                                matricula.miembros?.correo_electronico?.toLowerCase().includes(q)
                              );
                            })
                            .map((matricula, indice) => (
                              <div
                                key={matricula.id}
                                className="grid gap-3 border-t border-slate-100 px-4 py-4 md:grid-cols-[40px_minmax(180px,1.4fr)_minmax(180px,1fr)_110px_220px_40px] md:items-center"
                              >
                                <div className="text-xs font-bold text-slate-400">
                                  {indice + 1}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700">
                                    {(matricula.miembros?.nombres || "E").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-bold">
                                      {matricula.miembros?.nombres || "Estudiante"}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      Matrícula activa
                                    </div>
                                  </div>
                                </div>
                                <div className="truncate text-xs text-slate-500">
                                  {matricula.miembros?.correo_electronico || "Sin correo registrado"}
                                </div>
                                <div>
                                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                    En curso
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={guardandoResultado}
                                    onClick={() => abrirResultadoNivel(matricula, "admitido")}
                                    className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    Admitido
                                  </button>
                                  <button
                                    type="button"
                                    disabled={guardandoResultado}
                                    onClick={() => abrirResultadoNivel(matricula, "terminado")}
                                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                  >
                                    Terminado
                                  </button>
                                </div>
                                <div className="hidden md:block text-center text-slate-400">
                                  ···
                                </div>
                              </div>
                            ))}

                          {matriculas.length === 0 && (
                            <div className="border-t border-slate-100 p-8 text-center">
                              <Users className="mx-auto text-slate-300" size={30} />
                              <p className="mt-3 text-sm font-semibold text-slate-600">
                                No hay estudiantes matriculados activamente en este grupo.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CLASES */}
                    {vistaGrupo === "clases" && (
                      <div className="bg-orange-50/30 p-5 sm:p-7">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="flex items-center gap-2 font-black">
                              <LayoutGrid size={18} className="text-orange-500" />
                              Clases del grupo
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Selecciona una clase para trabajar su asistencia. No se
                              muestran las 10 listas de estudiantes al mismo tiempo.
                            </p>
                          </div>

                          {clasesDelGrupo.length === 0 && (
                            <button
                              type="button"
                              onClick={generarClases}
                              disabled={guardando}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                            >
                              <Plus size={15} />
                              Generar 10 clases
                            </button>
                          )}
                        </div>

                        {clasesDelGrupo.length === 0 ? (
                          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                            <BookOpen className="mx-auto text-slate-300" size={32} />
                            <p className="mt-3 text-sm font-semibold text-slate-600">
                              Este grupo todavía no tiene clases.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                              {clasesDelGrupo.map((clase) => {
                                const resumen = resumenClase(clase.id);
                                const seleccionada = clase.id === claseSeleccionadaId;

                                return (
                                  <button
                                    key={clase.id}
                                    type="button"
                                    onClick={() => setClaseSeleccionadaId(clase.id)}
                                    className={`rounded-2xl border p-3.5 text-left transition ${
                                      seleccionada
                                        ? "border-blue-400 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-black">
                                        Clase {clase.numero}
                                      </span>
                                      {clase.estado === "realizada" ? (
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                      ) : (
                                        <Clock3 size={16} className="text-blue-600" />
                                      )}
                                    </div>
                                    <div className="mt-2 truncate text-[11px] text-slate-500">
                                      {clase.fecha || "Sin fecha"}
                                    </div>
                                    <div
                                      className={`mt-2 text-[11px] font-bold ${
                                        clase.estado === "realizada"
                                          ? "text-emerald-600"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      {clase.estado === "realizada" ? "Realizada" : "Pendiente"}
                                    </div>
                                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                                      {resumen.presentes}/{totalEstudiantes} presentes
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {claseSeleccionada && (
                              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="text-[10px] font-black uppercase tracking-wide text-blue-600">
                                      Clase seleccionada
                                    </div>
                                    <h4 className="mt-1 text-lg font-black">
                                      {claseSeleccionada.nombre || `Clase ${claseSeleccionada.numero}`}
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Clase {claseSeleccionada.numero} ·{" "}
                                      {claseSeleccionada.fecha || "Sin fecha"} ·{" "}
                                      Maestro: {nombreDocente(claseSeleccionada.cefi_docentes)}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    {claseSeleccionada.estado !== "realizada" &&
                                      matriculas.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => marcarClaseRealizada(claseSeleccionada.id)}
                                          className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                                        >
                                          Marcar clase realizada
                                        </button>
                                      )}
                                    <label className="min-w-[220px] text-[10px] font-black uppercase tracking-wide text-slate-400">
                                      Maestro de esta clase
                                      <select
                                        value={claseSeleccionada.docente_id || ""}
                                        onChange={(evento) =>
                                          actualizarMaestroClase(
                                            claseSeleccionada.id,
                                            evento.target.value
                                          )
                                        }
                                        disabled={guardandoClaseId === claseSeleccionada.id}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800 outline-none focus:border-blue-400"
                                      >
                                        <option value="">Sin maestro asignado</option>
                                        {docentes.map((docente) => (
                                          <option key={docente.id} value={docente.id}>
                                            {nombreDocente(docente)}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                  </div>
                                </div>

                                <div className="p-4">
                                  {cargandoAsistencia ? (
                                    <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                      Cargando estudiantes...
                                    </div>
                                  ) : matriculas.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                                      No hay estudiantes matriculados activamente en este grupo.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <div className="min-w-[720px] overflow-hidden rounded-xl border border-slate-100">
                                        <div className="grid grid-cols-[minmax(220px,1fr)_repeat(4,100px)] bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                          <div>Estudiante</div>
                                          <div className="text-center">Presente</div>
                                          <div className="text-center">Ausente</div>
                                          <div className="text-center">Tarde</div>
                                          <div className="text-center">Excusa</div>
                                        </div>

                                        {matriculas.map((matricula) => {
                                          const estadoActual = obtenerAsistencia(
                                            claseSeleccionada.id,
                                            matricula.id
                                          );

                                          return (
                                            <div
                                              key={matricula.id}
                                              className="grid grid-cols-[minmax(220px,1fr)_repeat(4,100px)] items-center border-t border-slate-100 px-4 py-3"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                                                  {(matricula.miembros?.nombres || "E")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </div>
                                                <div>
                                                  <div className="text-sm font-bold">
                                                    {matricula.miembros?.nombres || "Estudiante"}
                                                  </div>
                                                  <div className="text-[11px] text-slate-400">
                                                    {matricula.miembros?.correo_electronico || "Sin correo"}
                                                  </div>
                                                </div>
                                              </div>

                                              {[
                                                ["presente", "Presente"],
                                                ["ausente", "Ausente"],
                                                ["tarde", "Tarde"],
                                                ["excusa", "Excusa"],
                                              ].map(([valor, etiqueta]) => (
                                                <div key={valor} className="text-center">
                                                  <button
                                                    type="button"
                                                    disabled={guardandoAsistencia}
                                                    onClick={() =>
                                                      guardarAsistencia(
                                                        claseSeleccionada.id,
                                                        matricula.id,
                                                        valor
                                                      )
                                                    }
                                                    className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${
                                                      estadoActual === valor
                                                        ? "bg-slate-950 text-white"
                                                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                                                    }`}
                                                  >
                                                    {etiqueta}
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* CONFIGURACIÓN */}
                    {vistaGrupo === "configuracion" && (
                      <div className="p-5 sm:p-7">
                        <div className="grid gap-5 xl:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                <Users size={18} />
                              </div>
                              <div>
                                <h3 className="font-black">Maestro responsable del grupo</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                  Este maestro queda asociado al grupo.
                                </p>
                              </div>
                            </div>
                            <select
                              value={grupoSeleccionado.docente_id || ""}
                              onChange={(evento) =>
                                actualizarMaestroGrupo(evento.target.value)
                              }
                              disabled={guardando}
                              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400"
                            >
                              <option value="">Sin maestro asignado</option>
                              {docentes.map((docente) => (
                                <option key={docente.id} value={docente.id}>
                                  {nombreDocente(docente)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="rounded-2xl border border-slate-200 p-5">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-amber-50 p-2 text-blue-600">
                                <UserPlus size={18} />
                              </div>
                              <div>
                                <h3 className="font-black">Registrar profesor CEFI</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                  Convierte un miembro existente en profesor CEFI.
                                </p>
                              </div>
                            </div>

                            <form onSubmit={convertirMiembroEnProfesor} className="mt-4 space-y-3">
                              <input
                                value={busquedaMiembro}
                                onChange={(evento) => setBusquedaMiembro(evento.target.value)}
                                placeholder="Buscar por nombre o correo..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400"
                              />
                              <select
                                value={miembroId}
                                onChange={(evento) => setMiembroId(evento.target.value)}
                                required
                                disabled={cargando || guardando}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-400"
                              >
                                <option value="">Selecciona un miembro</option>
                                {miembrosDisponibles.map((miembro) => (
                                  <option key={miembro.id} value={miembro.id}>
                                    {miembro.nombres}
                                    {miembro.correo_electronico
                                      ? ` · ${miembro.correo_electronico}`
                                      : ""}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                disabled={guardando || !miembroId}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                              >
                                <UserPlus size={17} />
                                Asignar profesor
                              </button>
                            </form>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-black">Profesores registrados</h3>
                              <p className="mt-1 text-xs text-slate-500">
                                {docentes.length} profesor{docentes.length === 1 ? "" : "es"} activo{docentes.length === 1 ? "" : "s"}.
                              </p>
                            </div>
                            <Settings2 size={19} className="text-slate-400" />
                          </div>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {docentes.map((docente) => (
                              <div
                                key={docente.id}
                                className="rounded-xl bg-slate-50 px-4 py-3"
                              >
                                <div className="font-semibold">{nombreDocente(docente)}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  Profesor CEFI
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-10 text-center">
                    <Users className="mx-auto text-slate-300" size={32} />
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      Este módulo todavía no tiene grupos.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Los grupos se crean desde la configuración de CEFI.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {matriculaResultadoPendiente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-blue-600">
                    Avance CEFI
                  </div>
                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    {matriculaResultadoPendiente.miembros?.nombres || "Estudiante"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Resultado: <strong>{resultadoNivelPendiente === "admitido" ? "Admitido" : "Terminado"}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarResultadoNivel}
                  disabled={guardandoResultado}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cerrar
                </button>
              </div>

              {(grupoSeleccionado?.cefi_grados?.orden || 0) < 4 ? (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-700">
                    Selecciona el grupo del siguiente módulo
                  </p>
                  <select
                    value={grupoSiguienteId}
                    onChange={(evento) => setGrupoSiguienteId(evento.target.value)}
                    disabled={guardandoResultado}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Selecciona un grupo</option>
                    {grupos
                      .filter(
                        (grupo) =>
                          grupo.grado_id === modulos.find((modulo) => modulo.orden === (grupoSeleccionado?.cefi_grados?.orden || 0) + 1)?.id &&
                          grupo.periodo_id === grupoSeleccionado?.periodo_id &&
                          grupo.activo
                      )
                      .map((grupo) => (
                        <option key={grupo.id} value={grupo.id}>
                          {grupo.nombre}
                          {grupo.cefi_docentes ? ` · ${nombreDocente(grupo.cefi_docentes)}` : ""}
                        </option>
                      ))}
                  </select>

                  {!grupos.some(
                    (grupo) =>
                      grupo.grado_id === modulos.find((modulo) => modulo.orden === (grupoSeleccionado?.cefi_grados?.orden || 0) + 1)?.id &&
                      grupo.periodo_id === grupoSeleccionado?.periodo_id &&
                      grupo.activo
                  ) && (
                    <p className="mt-2 rounded-xl bg-orange-50 p-3 text-xs font-semibold text-orange-700">
                      No hay grupos disponibles para el siguiente módulo en este período. Crea primero el grupo desde la configuración de CEFI.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                  Este es el último módulo. Al confirmar, el estudiante quedará con CEFI finalizado y conservará todo su historial.
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cerrarResultadoNivel}
                  disabled={guardandoResultado}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarResultadoNivel}
                  disabled={guardandoResultado || ((grupoSeleccionado?.cefi_grados?.orden || 0) < 4 && !grupoSiguienteId)}
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {guardandoResultado ? "Guardando..." : "Confirmar avance"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MateriasCefi;