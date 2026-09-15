import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ProyectoForm from "../components/ProyectoForm";
import ProyectosTable from "../components/ProyectosTable";
import PrestamoForm from "../components/PrestamoForm";
import { useAuth } from "../context/AuthContext";
import {
  obtenerProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto as eliminarProyectoService,
} from "../services/proyectosService";

import {
  crearPrestamo,
} from "../services/prestamosService";

import {
  generarCuotasPrestamo,
} from "../services/cuotasService";

function Proyectos() {

  const { perfil } = useAuth();

  const esAdministrador =
    perfil?.rol === "Administrador";

  const esTesorero =
    perfil?.rol === "Tesorero";

  const puedeAdministrarProyectos =
    esAdministrador || esTesorero;
  // =====================================
  // Estados
  // =====================================

  const [buscar, setBuscar] = useState("");

  const [proyectos, setProyectos] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [abrirModal, setAbrirModal] = useState(false);

  const [editando, setEditando] = useState(false);

  const [idEditar, setIdEditar] = useState(null);

  const [abrirEliminar, setAbrirEliminar] = useState(false);

  const [idEliminar, setIdEliminar] = useState(null);
  const [aportes, setAportes] = useState([]);
  // =====================================
// Préstamo
// =====================================

const [abrirPrestamo, setAbrirPrestamo] = useState(false);

const [proyectoPrestamo, setProyectoPrestamo] = useState(null);

const [capital, setCapital] = useState("");

const [tasaInteres, setTasaInteres] = useState("");

const [tipoInteres, setTipoInteres] = useState("Mensual");

const [plazoMeses, setPlazoMeses] = useState("");

const [fechaInicioPrestamo, setFechaInicioPrestamo] =
  useState(
    new Date().toISOString().split("T")[0]
  );

const [cuotaCapital, setCuotaCapital] = useState("");

const [cuotaInteres, setCuotaInteres] = useState("");

const [estadoPrestamo, setEstadoPrestamo] =
  useState("Activo");

  // =====================================
  // Formulario
  // =====================================

  const [nombre, setNombre] = useState("");

const [descripcion, setDescripcion] = useState("");

const [fechaInicio, setFechaInicio] = useState("");

const [fechaFin, setFechaFin] = useState("");

const [meta, setMeta] = useState("");

const [presupuesto, setPresupuesto] = useState("");

const [estado, setEstado] = useState("Activo");

  // =====================================
  // Cargar proyectos
  // =====================================

  async function cargarProyectos() {

    try {

      setCargando(true);

      const data = await obtenerProyectos();

      setProyectos(data ?? []);

    } catch (error) {

      console.error(error);

      toast.error(
        "No fue posible cargar los proyectos."
      );

    } finally {

      setCargando(false);

    }

  }

  useEffect(() => {

  cargarProyectos();

  cargarAportes();

}, []);
  // =====================================
// Cargar aportes
// =====================================

async function cargarAportes() {

  try {

    const {
      data,
      error,
    } = await supabase

      .from("aportes")

      .select(`
        id,
        proyecto_id,
        valor,
        estado
      `);

    if (error) {
      throw error;
    }

    setAportes(data ?? []);

  } catch (error) {

    console.error(error);

    toast.error(
      "No fue posible cargar los aportes."
    );

  }

}
    // =====================================
  // Limpiar formulario
  // =====================================

  function limpiarFormulario() {

    setNombre("");

    setDescripcion("");

    setFechaInicio("");

    setFechaFin("");

    setMeta("");

     setPresupuesto("");

    setEstado("Activo");

    setEditando(false);

    setIdEditar(null);

  }

  // =====================================
  // Nuevo proyecto
  // =====================================

  function nuevoProyecto() {

    limpiarFormulario();

    setAbrirModal(true);

  }

  // =====================================
  // Guardar
  // =====================================

  async function guardarProyecto(e) {

    e.preventDefault();

    try {

     const proyecto = {

  nombre,

  descripcion,

  fecha_inicio: fechaInicio,

  fecha_fin: fechaFin || null,

  meta:
    meta === ""
      ? null
      : Number(meta),

  presupuesto:
    presupuesto === ""
      ? null
      : Number(presupuesto),

  estado,

};

      if (editando) {

        await actualizarProyecto(
          idEditar,
          proyecto
        );

        toast.success(
          "Proyecto actualizado"
        );

      } else {

        await crearProyecto(proyecto);

        toast.success(
          "Proyecto registrado"
        );

      }

      limpiarFormulario();

      setAbrirModal(false);

      await cargarProyectos();

    } catch (error) {

      console.error(error);

      toast.error(error.message);

    }

  }

  // =====================================
  // Editar
  // =====================================

  function editarProyecto(proyecto) {

    setEditando(true);

    setIdEditar(proyecto.id);

    setNombre(proyecto.nombre);

    setDescripcion(
      proyecto.descripcion ?? ""
    );

    setFechaInicio(
      proyecto.fecha_inicio ?? ""
    );

    setFechaFin(
      proyecto.fecha_fin ?? ""
    );
setMeta(
  proyecto.meta ?? ""
);

setPresupuesto(
  proyecto.presupuesto ?? ""
);
    setEstado(
      proyecto.estado ?? "Activo"
    );

    setAbrirModal(true);

  }

  // =====================================
  // Eliminar
  // =====================================

  function eliminarProyecto(id) {

    setIdEliminar(id);

    setAbrirEliminar(true);

  }

  async function confirmarEliminar() {
  try {
    if (!idEliminar) {
      throw new Error("No se identificó el proyecto.");
    }

    // =====================================
    // VERIFICAR PRÉSTAMOS ASOCIADOS
    // =====================================

    const { data: prestamos, error: errorPrestamos } =
      await supabase
        .from("prestamos")
        .select("id")
        .eq("proyecto_id", idEliminar);

    if (errorPrestamos) {
      throw errorPrestamos;
    }

    // =====================================
    // NO PERMITIR ELIMINAR SI TIENE PRÉSTAMOS
    // =====================================

    if (prestamos && prestamos.length > 0) {
      toast.error(
        "No se puede eliminar este proyecto porque tiene préstamos asociados."
      );

      setAbrirEliminar(false);
      setIdEliminar(null);

      return;
    }

    // =====================================
    // ELIMINAR PROYECTO
    // =====================================

    await eliminarProyectoService(idEliminar);

    toast.success("Proyecto eliminado correctamente.");

    setAbrirEliminar(false);
    setIdEliminar(null);

    await cargarProyectos();

  } catch (error) {
    console.error(
      "Error eliminando proyecto:",
      error
    );

    toast.error(
      error?.message ||
      "No se pudo eliminar el proyecto."
    );
  }
}
// =====================================
// Configurar préstamo
// =====================================

function abrirConfiguracionPrestamo(proyecto) {

  setProyectoPrestamo(proyecto);

  setCapital("");

  setTasaInteres("");

  setTipoInteres("Mensual");

  setPlazoMeses("");

  setFechaInicioPrestamo(
    proyecto.fecha_inicio ||
    new Date().toISOString().split("T")[0]
  );

  setCuotaCapital("");

  setCuotaInteres("");

  setEstadoPrestamo("Activo");

  setAbrirPrestamo(true);

}
// =====================================
// GUARDAR PRÉSTAMO + GENERAR CUOTAS
// =====================================

async function guardarPrestamo(e) {

  e.preventDefault();

  try {

    // ===================================
    // VALIDACIONES
    // ===================================

    if (!proyectoPrestamo?.id) {

      throw new Error(
        "No se pudo identificar el proyecto."
      );

    }

    const capitalNumerico =
      Number(capital);

    const tasaNumerica =
      Number(tasaInteres);

    const plazoNumerico =
      Number(plazoMeses);


    if (capitalNumerico <= 0) {

      throw new Error(
        "El capital debe ser mayor que cero."
      );

    }


    if (tasaNumerica < 0) {

      throw new Error(
        "La tasa de interés no puede ser negativa."
      );

    }


    if (plazoNumerico <= 0) {

      throw new Error(
        "El plazo debe ser mayor que cero."
      );

    }


    if (!fechaInicioPrestamo) {

      throw new Error(
        "Debe indicar la fecha de inicio."
      );

    }


    // ===================================
    // CAPITAL POR CUOTA
    // ===================================

    const capitalPorCuota =
      capitalNumerico /
      plazoNumerico;


    // ===================================
    // INTERÉS DE LA PRIMERA CUOTA
    // ===================================

    const interesPrimeraCuota =
      capitalNumerico *
      (tasaNumerica / 100);


    // ===================================
    // CREAR PRÉSTAMO
    // ===================================

    const nuevoPrestamo = {

      proyecto_id:
        proyectoPrestamo.id,

      capital:
        capitalNumerico,

      tasa_interes:
        tasaNumerica,

      tipo_interes:
        tipoInteres,

      plazo_meses:
        plazoNumerico,

      fecha_inicio:
        fechaInicioPrestamo,

      // Primera cuota
      cuota_capital:
        Number(
          capitalPorCuota.toFixed(2)
        ),

      cuota_interes:
        Number(
          interesPrimeraCuota.toFixed(2)
        ),

      capital_pagado:
        0,

      intereses_pagados:
        0,

      saldo_actual:
        capitalNumerico,

      estado:
        estadoPrestamo,

    };


    // ===================================
    // GUARDAR PRÉSTAMO
    // ===================================

    const prestamoCreado =
      await crearPrestamo(
        nuevoPrestamo
      );


    // ===================================
    // GENERAR CUOTAS
    // ===================================

    await generarCuotasPrestamo(
      prestamoCreado
    );


    // ===================================
    // ACTUALIZAR INTERFAZ
    // ===================================

    toast.success(
      "Préstamo y cuotas registrados correctamente."
    );


    setAbrirPrestamo(false);

    setProyectoPrestamo(null);


    // Recargar proyectos
    await cargarProyectos();


  } catch (error) {

    console.error(
      "Error guardando préstamo:",
      error
    );

    toast.error(
      error.message ||
      "No se pudo registrar el préstamo."
    );

  }

}
  // =====================================
  // Buscar
  // =====================================

  const proyectosFiltrados = useMemo(() => {

    return proyectos.filter((p) => {

      const texto = buscar.toLowerCase();

      return (

        p.nombre
          ?.toLowerCase()
          .includes(texto)

        ||

        p.descripcion
          ?.toLowerCase()
          .includes(texto)

      );

    });

  }, [buscar, proyectos]);

  const proyectosConAportes =
  proyectosFiltrados.map((proyecto) => {

    const aportesProyecto =
      aportes.filter(
        (aporte) =>
          aporte.proyecto_id ===
          proyecto.id
      );

    const totalAportado =
      aportesProyecto.reduce(
        (total, aporte) =>
          total +
          Number(aporte.valor || 0),
        0
      );

    const meta =
      Number(proyecto.meta || 0);

    const porcentaje =
      meta > 0
        ? Math.min(
            (totalAportado / meta) * 100,
            100
          )
        : 0;

    return {

      ...proyecto,

      totalAportado,

      porcentajeAvance:
        porcentaje,

    };

  });
    // =====================================
  // RETURN
  // =====================================

  return (

    <div className="space-y-6">

      {/* Encabezado */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-gray-800">
            Proyectos
          </h1>

          <p className="mt-2 text-gray-500">
            Administración de proyectos del ICC Palabra de Fe
          </p>

        </div>

        {puedeAdministrarProyectos && (
  <button
    onClick={nuevoProyecto}
    className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
  >
    + Nuevo proyecto
  </button>
)}

      </div>

      {/* Buscar */}

      <input
        type="text"
        placeholder="Buscar proyecto..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        className="w-full md:w-96 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Tabla */}

 <ProyectosTable
  proyectos={proyectosConAportes}
  cargando={cargando}
  editar={editarProyecto}
  eliminar={eliminarProyecto}
  configurarPrestamo={abrirConfiguracionPrestamo}
  puedeAdministrar={puedeAdministrarProyectos}
/>

      {/* Modal */}

      <Modal
        abierto={abrirModal}
        cerrar={() => {

          limpiarFormulario();

          setAbrirModal(false);

        }}
        titulo={
          editando
            ? "Editar proyecto"
            : "Nuevo proyecto"
        }
      >

        <ProyectoForm

          nombre={nombre}
          setNombre={setNombre}

          descripcion={descripcion}
          setDescripcion={setDescripcion}

          fechaInicio={fechaInicio}
          setFechaInicio={setFechaInicio}

          fechaFin={fechaFin}
          setFechaFin={setFechaFin}

          meta={meta}
setMeta={setMeta}

presupuesto={presupuesto}
setPresupuesto={setPresupuesto}

          estado={estado}
          setEstado={setEstado}

          guardar={guardarProyecto}

          cancelar={() => {

            limpiarFormulario();

            setAbrirModal(false);

          }}

        />

      </Modal>

      {/* Confirmación */}
{/* Modal préstamo */}

<Modal
  abierto={abrirPrestamo}
  cerrar={() => {

    setAbrirPrestamo(false);

    setProyectoPrestamo(null);

  }}
  titulo="Configurar préstamo"
>

  <PrestamoForm

    proyecto={proyectoPrestamo}

    capital={capital}
    setCapital={setCapital}

    tasaInteres={tasaInteres}
    setTasaInteres={setTasaInteres}

    tipoInteres={tipoInteres}
    setTipoInteres={setTipoInteres}

    plazoMeses={plazoMeses}
    setPlazoMeses={setPlazoMeses}

    fechaInicio={fechaInicioPrestamo}
    setFechaInicio={setFechaInicioPrestamo}

    cuotaCapital={cuotaCapital}
    setCuotaCapital={setCuotaCapital}

    cuotaInteres={cuotaInteres}
    setCuotaInteres={setCuotaInteres}

    estado={estadoPrestamo}
    setEstado={setEstadoPrestamo}

    guardar={guardarPrestamo}

    cancelar={() => {

      setAbrirPrestamo(false);

      setProyectoPrestamo(null);

    }}

  />

</Modal>
      <ConfirmDialog
        abierto={abrirEliminar}
        titulo="Eliminar proyecto"
        mensaje="¿Desea eliminar este proyecto?"
        confirmar={confirmarEliminar}
        cancelar={() => {

          setAbrirEliminar(false);

          setIdEliminar(null);

        }}
      />

    </div>

  );

}

export default Proyectos;
