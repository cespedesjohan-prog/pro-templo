import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BarChart3, CalendarDays, ChevronRight, CircleDollarSign, GraduationCap, Landmark, RefreshCw, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const modulos = [
  { titulo: "Miembros", descripcion: "Personas y seguimiento pastoral", icono: Users, color: "sky", ruta: "/gestion-iglesia/miembros" },
  { titulo: "Finanzas", descripcion: "Ingresos, egresos y balance", icono: Landmark, color: "emerald", ruta: "/gestion-iglesia/finanzas" },
  { titulo: "Células", descripcion: "Grupos y acompañamiento", icono: Users, color: "amber", ruta: "/gestion-iglesia/celulas" },
  { titulo: "Ministerios", descripcion: "Equipos y responsables", icono: Users, color: "rose", ruta: "/gestion-iglesia/ministerios" },
  { titulo: "CEFI", descripcion: "Formación y progreso académico", icono: GraduationCap, color: "violet", ruta: "/gestion-iglesia/cefi" },
];

const colores = { sky: "bg-sky-50 text-sky-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700", violet: "bg-violet-50 text-violet-700" };

function mesActual() {
  return new Date().toISOString().slice(0, 7);
}

function DashboardIglesia() {
  const { perfil } = useAuth();
  const navigate = useNavigate();
  const [mes, setMes] = useState(mesActual);
  const [miembros, setMiembros] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargarDashboard() {
    setCargando(true);
    const inicio = `${mes}-01`;
    const fin = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0).toISOString().slice(0, 10);
    const [miembrosRespuesta, movimientosRespuesta, matriculasRespuesta] = await Promise.all([
      supabase.from("miembros").select("id, nombres, activo, celula, ministerio, nivel_cefi, creado_en").order("creado_en", { ascending: false }),
      supabase.from("movimientos_financieros_iglesia").select("id, fecha, tipo, categoria, descripcion, valor, responsable").gte("fecha", inicio).lte("fecha", fin).order("fecha", { ascending: false }),
      supabase.from("cefi_matriculas").select("id, estado").eq("estado", "activa"),
    ]);
    const error = miembrosRespuesta.error || movimientosRespuesta.error || matriculasRespuesta.error;
    if (error) toast.error(`No fue posible cargar el dashboard: ${error.message}`);
    else {
      setMiembros(miembrosRespuesta.data || []);
      setMovimientos(movimientosRespuesta.data || []);
      setMatriculas(matriculasRespuesta.data || []);
    }
    setCargando(false);
  }

  useEffect(() => { cargarDashboard(); }, [mes]);

  const miembrosActivos = miembros.filter((miembro) => miembro.activo !== false);
  const ingresos = movimientos.filter((movimiento) => movimiento.tipo === "ingreso").reduce((total, movimiento) => total + Number(movimiento.valor || 0), 0);
  const egresos = movimientos.filter((movimiento) => movimiento.tipo === "egreso").reduce((total, movimiento) => total + Number(movimiento.valor || 0), 0);
  const balance = ingresos - egresos;
  const sinCelula = miembrosActivos.filter((miembro) => !miembro.celula).length;
  const sinNivel = miembrosActivos.filter((miembro) => !miembro.nivel_cefi).length;
  const celulas = new Set(miembrosActivos.map((miembro) => miembro.celula).filter(Boolean)).size;
  const ministerios = new Set(miembrosActivos.map((miembro) => miembro.ministerio).filter(Boolean)).size;

  const movimientosPorDia = useMemo(() => {
    const dias = {};
    movimientos.forEach((movimiento) => {
      const dia = movimiento.fecha?.slice(8, 10) || "--";
      if (!dias[dia]) dias[dia] = { ingreso: 0, egreso: 0 };
      dias[dia][movimiento.tipo] = (dias[dia][movimiento.tipo] || 0) + Number(movimiento.valor || 0);
    });
    return Object.entries(dias).sort(([a], [b]) => Number(a) - Number(b)).slice(-10);
  }, [movimientos]);

  const maxDia = Math.max(...movimientosPorDia.flatMap(([, valores]) => [valores.ingreso || 0, valores.egreso || 0]), 1);
  const recientes = movimientos.slice(0, 5);
  const dinero = (valor) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

  return (
    <main className="min-h-screen bg-[#f3f6f8] px-4 py-7 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-9">
          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Panel de control · Gestión Iglesia</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Buenos días, {perfil?.nombres || "Administrador"}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Una lectura rápida de la salud operativa de tu iglesia.</p></div>
            <div className="flex flex-wrap gap-3"><label className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200"><CalendarDays size={16} className="text-amber-300" /><span>Periodo</span><input type="month" value={mes} onChange={(evento) => setMes(evento.target.value)} className="rounded-lg border-0 bg-transparent p-1 text-white outline-none [color-scheme:dark]" /></label><button type="button" onClick={cargarDashboard} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300"><RefreshCw size={16} /> Actualizar</button></div>
          </div>
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-sky-400/10" /><div className="absolute -bottom-36 right-56 h-72 w-72 rounded-full border-[34px] border-amber-300/10" />
        </section>

        {cargando ? <div className="rounded-3xl bg-white py-24 text-center text-sm text-slate-500">Cargando indicadores...</div> : <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{ label: "Miembros activos", value: miembrosActivos.length, detail: `${sinCelula} sin célula`, icon: Users, tone: "text-sky-600", path: "/gestion-iglesia/miembros" }, { label: "Ingresos del periodo", value: dinero(ingresos), detail: `${movimientos.filter((movimiento) => movimiento.tipo === "ingreso").length} movimientos`, icon: CircleDollarSign, tone: "text-emerald-600", path: "/gestion-iglesia/finanzas" }, { label: "Egresos del periodo", value: dinero(egresos), detail: `${movimientos.filter((movimiento) => movimiento.tipo === "egreso").length} movimientos`, icon: Landmark, tone: "text-rose-600", path: "/gestion-iglesia/finanzas" }, { label: "Balance neto", value: dinero(balance), detail: balance >= 0 ? "Resultado favorable" : "Revisar egresos", icon: BarChart3, tone: balance >= 0 ? "text-emerald-600" : "text-rose-600", path: "/gestion-iglesia/finanzas" }].map((kpi) => { const Icon = kpi.icon; return <button key={kpi.label} type="button" onClick={() => navigate(kpi.path)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between"><Icon size={22} className={kpi.tone} /><ArrowUpRight size={17} className="text-slate-300 transition group-hover:text-slate-700" /></div><strong className="mt-5 block truncate text-2xl font-black tracking-tight">{kpi.value}</strong><span className="mt-1 block text-sm font-semibold text-slate-700">{kpi.label}</span><span className="mt-2 block text-xs text-slate-500">{kpi.detail}</span></button>; })}
          </section>

          <section className="mb-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Movimiento financiero</p><h2 className="mt-1 text-xl font-bold">Ingresos vs. egresos</h2></div><span className="text-xs text-slate-500">{mes}</span></div><div className="mt-7 flex h-56 items-end gap-2 border-b border-l border-slate-200 px-3 pb-0 sm:gap-4">{movimientosPorDia.length ? movimientosPorDia.map(([dia, valores]) => <div key={dia} className="flex h-full flex-1 items-end justify-center gap-1"><div title={`Ingreso ${dinero(valores.ingreso || 0)}`} className="w-1/2 max-w-5 rounded-t-md bg-emerald-400 transition hover:bg-emerald-500" style={{ height: `${Math.max(4, ((valores.ingreso || 0) / maxDia) * 100)}%` }} /><div title={`Egreso ${dinero(valores.egreso || 0)}`} className="w-1/2 max-w-5 rounded-t-md bg-rose-400 transition hover:bg-rose-500" style={{ height: `${Math.max(4, ((valores.egreso || 0) / maxDia) * 100)}%` }} /><span className="absolute mt-[250px] text-[10px] text-slate-400">{dia}</span></div>) : <div className="flex w-full items-center justify-center text-sm text-slate-400">No hay movimientos en este periodo.</div>}</div><div className="mt-7 flex gap-5 text-xs text-slate-500"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />Ingresos</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />Egresos</span></div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cobertura pastoral</p><h2 className="mt-1 text-xl font-bold">Organización actual</h2><div className="mt-6 space-y-5">{[["Miembros en células", miembrosActivos.length - sinCelula, miembrosActivos.length, "bg-sky-500"], ["Con nivel CEFI", miembrosActivos.length - sinNivel, miembrosActivos.length, "bg-violet-500"], ["Miembros activos", miembrosActivos.length, miembros.length, "bg-emerald-500"]].map(([label, valor, total, color]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{label}</span><strong>{valor} <span className="font-normal text-slate-400">/ {total}</span></strong></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: `${total ? Math.min(100, (valor / total) * 100) : 0}%` }} /></div></div>)}</div><div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center"><div><strong className="block text-lg">{celulas}</strong><span className="text-[11px] text-slate-500">Células</span></div><div><strong className="block text-lg">{ministerios}</strong><span className="text-[11px] text-slate-500">Ministerios</span></div><div><strong className="block text-lg">{matriculas.length}</strong><span className="text-[11px] text-slate-500">CEFI</span></div></div></div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Actividad</p><h2 className="mt-1 text-xl font-bold">Últimos movimientos</h2></div><button type="button" onClick={() => navigate("/gestion-iglesia/finanzas")} className="text-xs font-bold text-sky-600 hover:text-sky-800">Ver finanzas <ChevronRight size={14} className="inline" /></button></div>{recientes.length ? <div className="divide-y divide-slate-100">{recientes.map((movimiento) => <div key={movimiento.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{movimiento.descripcion || movimiento.categoria || "Movimiento financiero"}</p><p className="mt-1 text-xs text-slate-500">{movimiento.fecha} · {movimiento.responsable || "Sin responsable"}</p></div><strong className={`whitespace-nowrap text-sm ${movimiento.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}`}>{movimiento.tipo === "ingreso" ? "+" : "-"}{dinero(movimiento.valor)}</strong></div>)}</div> : <p className="py-10 text-center text-sm text-slate-500">No hay actividad financiera en el periodo.</p>}</div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Accesos rápidos</p><h2 className="mt-1 text-xl font-bold">Módulos de gestión</h2><div className="mt-5 space-y-2">{modulos.map((modulo) => { const Icon = modulo.icono; return <button key={modulo.ruta} type="button" onClick={() => navigate(modulo.ruta)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${colores[modulo.color]}`}><Icon size={17} /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{modulo.titulo}</strong><span className="block truncate text-xs text-slate-500">{modulo.descripcion}</span></span><ChevronRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" /></button>; })}</div></div>
          </section>
        </>}
      </div>
    </main>
  );
}

export default DashboardIglesia;
