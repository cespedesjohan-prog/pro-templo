import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const COLORES = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

const ICONOS = ["🤝", "🎵", "👥", "🎓", "📣", "🙏", "🏠", "💰", "🎨", "⚽", "❤️", "📖"];

function MinisteriosIglesia() {
  const [ministerios, setMinisterios] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [integrantes, setIntegrantes] = useState([]);
  const [ministerioSeleccionado, setMinisterioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    descripcion: "",
    icono: "🤝",
    color: "blue",
  });

  async function cargarDatos() {
    setCargando(true);
    setError("");

    const [ministeriosRespuesta, miembrosRespuesta] = await Promise.all([
      supabase
        .from("ministerios")
        .select("id, nombre, descripcion, icono, color, activo")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("miembros")
        .select("id, nombres, telefono_movil, correo_electronico, activo")
        .eq("activo", true)
        .order("nombres"),
    ]);

    if (ministeriosRespuesta.error || miembrosRespuesta.error) {
      const errorCarga = ministeriosRespuesta.error || miembrosRespuesta.error;
      console.error("Error cargando ministerios:", errorCarga);
      setError(
        `No se pudieron cargar los ministerios: ${errorCarga.message || "error desconocido"}. Ejecuta supabase/ministerios_schema.sql en Supabase.`,
      );
      setCargando(false);
      return;
    }

    setMinisterios(ministeriosRespuesta.data || []);
    setMiembros(miembrosRespuesta.data || []);
    setMinisterioSeleccionado((actual) => (
      ministeriosRespuesta.data?.find((item) => item.id === actual?.id)
      || ministeriosRespuesta.data?.[0]
      || null
    ));
    setCargando(false);
  }

  async function cargarIntegrantes(ministerioId) {
    if (!ministerioId) {
      setIntegrantes([]);
      return;
    }

    const { data, error: integrantesError } = await supabase
      .from("ministerio_integrantes")
      .select("miembro_id, es_lider, miembros(id, nombres, telefono_movil, correo_electronico, activo)")
      .eq("ministerio_id", ministerioId);

    if (integrantesError) {
      console.error("Error cargando integrantes:", integrantesError);
      setError("No se pudieron cargar los integrantes del ministerio.");
      return;
    }

    setIntegrantes((data || []).filter((item) => item.miembros));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarIntegrantes(ministerioSeleccionado?.id);
  }, [ministerioSeleccionado?.id]);

  const idsIntegrantes = useMemo(
    () => new Set(integrantes.map((item) => item.miembro_id)),
    [integrantes],
  );

  const miembrosDisponibles = miembros.filter((miembro) => {
    const texto = busqueda.trim().toLowerCase();
    return !idsIntegrantes.has(miembro.id)
      && (!texto || miembro.nombres?.toLowerCase().includes(texto) || miembro.correo_electronico?.toLowerCase().includes(texto));
  });

  async function crearMinisterio(event) {
    event.preventDefault();
    if (!nuevo.nombre.trim()) return;

    setGuardando(true);
    setError("");
    const { data, error: crearError } = await supabase
      .from("ministerios")
      .insert({
        nombre: nuevo.nombre.trim(),
        descripcion: nuevo.descripcion.trim() || null,
        icono: nuevo.icono,
        color: nuevo.color,
      })
      .select()
      .single();

    if (crearError) {
      console.error("Error creando ministerio:", crearError);
      setError(
        crearError.code === "23505"
          ? "Ya existe un ministerio con ese nombre."
          : `No se pudo crear el ministerio: ${crearError.message || "error desconocido"}.`,
      );
      setGuardando(false);
      return;
    }

    setMinisterios((actuales) => [...actuales, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setMinisterioSeleccionado(data);
    setNuevo({ nombre: "", descripcion: "", icono: "🤝", color: "blue" });
    setModalCrear(false);
    setGuardando(false);
  }

  async function agregarIntegrante(miembroId) {
    if (!ministerioSeleccionado) return;
    setGuardando(true);
    const { error: agregarError } = await supabase
      .from("ministerio_integrantes")
      .insert({ ministerio_id: ministerioSeleccionado.id, miembro_id: miembroId });

    if (agregarError) {
      console.error("Error agregando integrante:", agregarError);
      setError("No se pudo agregar el integrante.");
    } else {
      await cargarIntegrantes(ministerioSeleccionado.id);
    }
    setGuardando(false);
  }

  async function quitarIntegrante(miembroId) {
    if (!ministerioSeleccionado) return;
    setGuardando(true);
    const { error: quitarError } = await supabase
      .from("ministerio_integrantes")
      .delete()
      .eq("ministerio_id", ministerioSeleccionado.id)
      .eq("miembro_id", miembroId);

    if (quitarError) {
      console.error("Error quitando integrante:", quitarError);
      setError("No se pudo quitar el integrante.");
    } else {
      setIntegrantes((actuales) => actuales.filter((item) => item.miembro_id !== miembroId));
    }
    setGuardando(false);
  }

  async function asignarLider(miembroId) {
    if (!ministerioSeleccionado) return;
    setGuardando(true);
    setError("");

    const { error: quitarLiderError } = await supabase
      .from("ministerio_integrantes")
      .update({ es_lider: false })
      .eq("ministerio_id", ministerioSeleccionado.id);

    if (!quitarLiderError) {
      const { error: asignarLiderError } = await supabase
        .from("ministerio_integrantes")
        .update({ es_lider: true })
        .eq("ministerio_id", ministerioSeleccionado.id)
        .eq("miembro_id", miembroId);

      if (asignarLiderError) {
        console.error("Error asignando líder:", asignarLiderError);
        setError(`No se pudo asignar el líder: ${asignarLiderError.message}`);
      } else {
        await cargarIntegrantes(ministerioSeleccionado.id);
      }
    } else {
      console.error("Error actualizando líder:", quitarLiderError);
      setError(`No se pudo actualizar el líder: ${quitarLiderError.message}`);
    }

    setGuardando(false);
  }

  async function eliminarMinisterio() {
    if (!ministerioSeleccionado) return;

    const confirmado = window.confirm(
      `¿Eliminar el ministerio "${ministerioSeleccionado.nombre}"? También se quitarán sus integrantes de este ministerio.`,
    );

    if (!confirmado) return;

    setGuardando(true);
    setError("");
    const { error: eliminarError } = await supabase
      .from("ministerios")
      .delete()
      .eq("id", ministerioSeleccionado.id);

    if (eliminarError) {
      console.error("Error eliminando ministerio:", eliminarError);
      setError(`No se pudo eliminar el ministerio: ${eliminarError.message}`);
    } else {
      const restantes = ministerios.filter((item) => item.id !== ministerioSeleccionado.id);
      setMinisterios(restantes);
      setMinisterioSeleccionado(restantes[0] || null);
      setIntegrantes([]);
    }

    setGuardando(false);
  }

  const colorSeleccionado = COLORES[ministerioSeleccionado?.color] || COLORES.blue;
  const liderAsignado = integrantes.some((item) => item.es_lider);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Gestión Iglesia</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Ministerios</h1>
            <p className="mt-2 text-slate-300">Organiza equipos y consulta sus integrantes.</p>
          </div>
          <button type="button" onClick={() => setModalCrear(true)} className="rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500">
            + Crear ministerio
          </button>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {cargando ? (
        <div className="rounded-3xl bg-white p-12 text-center text-slate-500 shadow-sm">Cargando ministerios...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-900">Equipos ministeriales</h2>
              <p className="mt-1 text-sm text-slate-500">Haz clic en un ministerio para ver sus integrantes.</p>
            </div>
            {ministerios.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Aún no hay ministerios creados.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {ministerios.map((ministerio) => (
                  <button
                    key={ministerio.id}
                    type="button"
                    onClick={() => setMinisterioSeleccionado(ministerio)}
                    className={`group rounded-xl p-3 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${COLORES[ministerio.color] || COLORES.blue} ${ministerio.id === ministerioSeleccionado?.id ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{ministerio.icono}</span>
                      <span className="text-lg">›</span>
                    </div>
                    <h3 className="mt-2 truncate text-sm font-black uppercase">{ministerio.nombre}</h3>
                    <p className="mt-1 truncate text-xs opacity-80">{ministerio.descripcion || "Sin descripción"}</p>
                    <p className="mt-3 text-[11px] font-bold">{ministerio.id === ministerioSeleccionado?.id ? integrantes.length : "Ver"} integrantes</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {ministerioSeleccionado ? (
              <>
                <div className={`rounded-2xl p-4 ring-1 ${colorSeleccionado}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{ministerioSeleccionado.icono}</span>
                      <div>
                        <h2 className="text-xl font-black">{ministerioSeleccionado.nombre}</h2>
                        <p className="text-sm opacity-80">{integrantes.length} integrantes</p>
                      </div>
                    </div>
                    <button type="button" disabled={guardando} onClick={eliminarMinisterio} className="rounded-lg px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50">Eliminar</button>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-slate-900">Integrantes</h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{integrantes.length}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {integrantes.map((item) => (
                      <div
                        key={item.miembro_id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                          item.es_lider
                            ? "border-amber-300 bg-amber-50 shadow-sm shadow-amber-100"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {item.es_lider && <span aria-label="Líder del ministerio" title="Líder del ministerio" className="text-base">👑</span>}
                            <p className="truncate text-sm font-bold text-slate-800">{item.miembros.nombres}</p>
                            {item.es_lider && <span className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">Líder</span>}
                          </div>
                          <p className="truncate text-xs text-slate-500">{item.miembros.correo_electronico || item.miembros.telefono_movil || "Sin contacto"}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {!liderAsignado && !item.es_lider && <button type="button" disabled={guardando} onClick={() => asignarLider(item.miembro_id)} className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Asignar líder</button>}
                          <button type="button" disabled={guardando} onClick={() => quitarIntegrante(item.miembro_id)} className="text-xs font-bold text-rose-600 hover:text-rose-800">Quitar</button>
                        </div>
                      </div>
                    ))}
                    {integrantes.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">Este ministerio aún no tiene integrantes.</p>}
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="font-black text-slate-900">Agregar integrante</h3>
                  <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar miembro..." className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                  <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                    {miembrosDisponibles.slice(0, 8).map((miembro) => (
                      <button key={miembro.id} type="button" disabled={guardando} onClick={() => agregarIntegrante(miembro.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-blue-50">
                        <span className="truncate font-medium text-slate-700">{miembro.nombres}</span>
                        <span className="text-xs font-bold text-blue-600">Agregar</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-80 items-center justify-center text-center text-slate-500">Selecciona un ministerio para ver sus integrantes.</div>
            )}
          </aside>
        </div>
      )}

      {modalCrear && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => event.target === event.currentTarget && setModalCrear(false)}>
          <form
            onSubmit={crearMinisterio}
            className="ministerio-form-modal rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Gestión Iglesia</p><h2 className="mt-1 text-xl font-black text-slate-900">Crear ministerio</h2></div>
              <button type="button" onClick={() => setModalCrear(false)} className="text-xl text-slate-400">×</button>
            </div>
            <div className="mt-4 space-y-3">
              <input required value={nuevo.nombre} onChange={(event) => setNuevo({ ...nuevo, nombre: event.target.value })} placeholder="Nombre, por ejemplo Alabanza" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              <textarea value={nuevo.descripcion} onChange={(event) => setNuevo({ ...nuevo, descripcion: event.target.value })} placeholder="Descripción breve" rows="2" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-700">Icono</p>
                <div className="flex flex-wrap gap-2">
                  {ICONOS.map((icono) => (
                    <button
                      key={icono}
                      type="button"
                      onClick={() => setNuevo({ ...nuevo, icono })}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition ${nuevo.icono === icono ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 hover:bg-slate-50"}`}
                    >
                      {icono}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-700">Color</p>
                <select value={nuevo.color} onChange={(event) => setNuevo({ ...nuevo, color: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  {Object.keys(COLORES).map((color) => <option key={color} value={color}>{color}</option>)}
                </select>
              </div>
            </div>
            <button disabled={guardando} type="submit" className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{guardando ? "Guardando..." : "Crear ministerio"}</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MinisteriosIglesia;
