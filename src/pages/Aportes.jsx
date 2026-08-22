import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import AporteForm from "../components/AporteForm";
import AportesTable from "../components/AportesTable";
import useModal from "../hooks/useModal";

import {
  obtenerAportes,
  crearAporte,
  actualizarAporte,
  eliminarAporte,
  obtenerMetodosPago,
  actualizarComprobanteAporte,
  aprobarAporte,
  rechazarAporte,
} from "../services/aportesService";


import {
  subirComprobanteAporte,
} from "../services/comprobantesAportesService";
import {
  obtenerMiembros,
} from "../services/miembrosService";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Aportes() {

  const { perfil, usuario } = useAuth();

  const rol = perfil?.rol;

  const esAdministrador =
    rol === "Administrador";

  const esTesorero =
    rol === "Tesorero";

  const esMiembro =
    rol === "Miembro";

  const puedeAdministrar =
    esAdministrador || esTesorero;

  // =====================================
  // Estados
  // =====================================
  // =====================================
  // Estados
  // =====================================

  const [buscar, setBuscar] = useState("");

  const [aportes, setAportes] = useState([]);

  const [miembros, setMiembros] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [abrirModal, setAbrirModal] = useState(false);

  const [editando, setEditando] = useState(false);

  const [idEditar, setIdEditar] = useState(null);

  const [abrirEliminar, setAbrirEliminar] = useState(false);

  const [idEliminar, setIdEliminar] = useState(null);

  const { modal, closeModal } = useModal();
  const location = useLocation();

  // =====================================
  // Formulario
  // =====================================
const [proyectoId, setProyectoId] = useState("");
  const [miembroId, setMiembroId] = useState("");

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [valor, setValor] = useState("");

  const [metodoPago, setMetodoPago] =
  useState("");

  const [observacion, setObservacion] =
    useState("");
    const [comprobante, setComprobante] = useState(null);
const [subiendoComprobante, setSubiendoComprobante] = useState(false);

    const [metodosPago, setMetodosPago] = useState([]);

    

  // =====================================
  // Cargar miembros
  // =====================================

  async function cargarMiembros() {

    try {

      const data = await obtenerMiembros();

      setMiembros(data ?? []);

    } catch (error) {

      console.error(error);

      toast.error(
        "No fue posible cargar los miembros."
      );

    }

  }
// =====================================
// Cargar proyectos
// =====================================

async function cargarProyectos() {

  try {

    const {
      data,
      error,
    } = await supabase

      .from("proyectos")

      .select(`
        id,
        nombre,
        estado
      `)

      .order("nombre", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    setProyectos(data ?? []);

  } catch (error) {

    console.error(error);

    toast.error(
      "No fue posible cargar los proyectos."
    );

  }

}
  // =====================================
  // Cargar aportes
  // =====================================

 async function cargarAportes() {

  try {

    setCargando(true);

    const data = await obtenerAportes();

    let datos = data ?? [];

    if (esMiembro) {

      datos = datos.filter(
        (aporte) =>
          aporte.miembro_id === perfil?.miembro_id
      );

    }

    setAportes(datos);

  } catch (error) {

    console.error(error);

    toast.error(
      "No fue posible cargar los aportes."
    );

  } finally {

    setCargando(false);

  }

}
 useEffect(() => {

  if (!perfil) return;

  cargarProyectos();
  cargarAportes();
  cargarMetodosPago();

  if (puedeAdministrar) {
    cargarMiembros();
  }

}, [perfil, puedeAdministrar]);


useEffect(() => {

  if (modal?.nombre === "aporte") {

    limpiarFormulario();

    setAbrirModal(true);

  }

}, [modal]);
useEffect(() => {

  if (location.state?.abrirModal) {

    nuevoAporte();

    window.history.replaceState({}, "");

  }

}, [location.state]);
// =====================================
// Cargar métodos de pago
// =====================================

async function cargarMetodosPago() {

  try {

    const data = await obtenerMetodosPago();

    setMetodosPago(data ?? []);

  } catch (error) {

    console.error(error);

    toast.error("Error cargando métodos de pago");

  }

}
  // =====================================
  // Limpiar formulario
  // =====================================

function limpiarFormulario() {

  setProyectoId("");

  setMiembroId(
    esMiembro
      ? perfil?.miembro_id || ""
      : ""
  );

  setFecha(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  setValor("");

  setMetodoPago("");

  setObservacion("");
  setComprobante(null);
setSubiendoComprobante(false);

  setEditando(false);

  setIdEditar(null);

}
  // =====================================
  // Nuevo aporte
  // =====================================

 function nuevoAporte() {

  limpiarFormulario();

  setAbrirModal(true);

}
// ======================================
// APROBAR APORTE
// ======================================

async function aprobarAporteRegistro(id) {

  try {

    await aprobarAporte(id);

    toast.success(
      "Aporte aprobado correctamente."
    );

    await cargarAportes();

  } catch (error) {

    console.error(
      "Error aprobando aporte:",
      error
    );

    toast.error(
      error?.message ||
      "No fue posible aprobar el aporte."
    );

  }

}


// ======================================
// RECHAZAR APORTE
// ======================================

async function rechazarAporteRegistro(id) {

  try {

    await rechazarAporte(id);

    toast.success(
      "Aporte rechazado correctamente."
    );

    await cargarAportes();

  } catch (error) {

    console.error(
      "Error rechazando aporte:",
      error
    );

    toast.error(
      error?.message ||
      "No fue posible rechazar el aporte."
    );

  }

}
  // =====================================
  // Guardar
  // =====================================

async function guardarAporte(e) {

  e.preventDefault();

  let aporteCreado = null;

  try {

    // =====================================
    // VALIDACIONES
    // =====================================

    if (!proyectoId) {

      throw new Error(
        "Debe seleccionar un proyecto."
      );

    }

    if (!valor || Number(valor) <= 0) {

      throw new Error(
        "Debe ingresar un valor válido."
      );

    }

    if (!metodoPago) {

      throw new Error(
        "Debe seleccionar un método de pago."
      );

    }


    // =====================================
    // MIEMBRO
    // =====================================

    const miembroFinal = esMiembro
      ? perfil?.miembro_id
      : miembroId;


    if (!miembroFinal) {

      throw new Error(
        "No fue posible identificar el miembro."
      );

    }


    // =====================================
    // MIEMBRO
    // COMPROBANTE OBLIGATORIO
    // =====================================

    if (
      esMiembro &&
      !editando &&
      !comprobante
    ) {

      throw new Error(
        "Debe adjuntar el comprobante de transferencia."
      );

    }


    // =====================================
    // ESTADO
    // =====================================

    const estadoFinal = esMiembro
      ? "Pendiente"
      : "Registrado";


    // =====================================
    // DATOS DEL APORTE
    // =====================================

    const aporte = {

      proyecto_id:
        proyectoId,

      miembro_id:
        miembroFinal,

      fecha,

      valor:
        Number(valor),

      metodo_pago_id:
        metodoPago,

      observacion:
        observacion || null,

      estado:
        estadoFinal,

      usuario_id:
        usuario?.id || null,

    };


    // =====================================
    // EDITAR
    // =====================================

    if (editando) {

      if (esMiembro) {

        throw new Error(
          "Los aportes enviados no pueden ser editados."
        );

      }


      await actualizarAporte(
        idEditar,
        aporte
      );


      toast.success(
        "Aporte actualizado."
      );

    }


    // =====================================
    // CREAR
    // =====================================

    else {

      // -----------------------------------
      // Crear primero el aporte
      // -----------------------------------

      aporteCreado =
        await crearAporte(
          aporte
        );


      if (!aporteCreado?.id) {

        throw new Error(
          "No fue posible crear el aporte."
        );

      }


      // -----------------------------------
      // Subir comprobante
      // -----------------------------------

      if (esMiembro && comprobante) {

        setSubiendoComprobante(true);


        const archivoSubido =
          await subirComprobanteAporte(

            comprobante,

            miembroFinal

          );


        // ---------------------------------
        // Guardar información del archivo
        // ---------------------------------

        await actualizarComprobanteAporte(

          aporteCreado.id,

          archivoSubido

        );

      }


      // -----------------------------------
      // Mensaje
      // -----------------------------------

      if (esMiembro) {

        toast.success(
          "Aporte enviado para verificación."
        );

      } else {

        toast.success(
          "Aporte registrado."
        );

      }

    }


    // =====================================
    // LIMPIAR
    // =====================================

    limpiarFormulario();

    setAbrirModal(false);

    closeModal();

    await cargarAportes();


  } catch (error) {

    console.error(
      "Error guardando aporte:",
      error
    );


    toast.error(
      error?.message ||
      "No fue posible guardar el aporte."
    );


  } finally {

    setSubiendoComprobante(false);

  }

}
  // =====================================
  // Editar
  // =====================================

 function editarAporte(aporte) {

  setEditando(true);

  setIdEditar(aporte.id);

  setProyectoId(
    aporte.proyecto_id ?? ""
  );

  setMiembroId(
    aporte.miembro_id ?? ""
  );

  setFecha(
    aporte.fecha ?? ""
  );

  setValor(
    aporte.valor ?? ""
  );

  setMetodoPago(
    aporte.metodo_pago_id ?? ""
  );

  setObservacion(
    aporte.observacion ?? ""
  );

  setAbrirModal(true);

}
  

  // =====================================
// Eliminar
// =====================================

function abrirEliminarAporte(id) {

  setIdEliminar(id);
  setAbrirEliminar(true);

}

async function confirmarEliminar() {

  if (!idEliminar) {
    toast.error("No se encontró el aporte.");
    return;
  }

  try {

   await eliminarAporte(idEliminar);

    toast.success("Aporte eliminado");

    setAbrirEliminar(false);
    setIdEliminar(null);

    await cargarAportes();

  } catch (error) {

    console.error(
      "Error eliminando aporte:",
      error
    );

    toast.error(
      error?.message ||
      "No se pudo eliminar el aporte."
    );

  }

}

  // =====================================
// Buscar
// =====================================

const aportesFiltrados = useMemo(() => {

  const texto = buscar
    .toLowerCase()
    .trim();

  return aportes.filter((a) => {

    return (

      a.miembros?.nombres
        ?.toLowerCase()
        .includes(texto) ||

      a.metodos_pago?.nombre
        ?.toLowerCase()
        .includes(texto)

    );

  });

}, [buscar, aportes]);


// =====================================
// RESUMEN FINANCIERO
// Solo cuentan aportes registrados
// =====================================

const aportesRegistrados = aportes.filter(
  (aporte) =>
    aporte.estado === "Registrado"
);


// =====================================
// TOTAL APORTADO
// =====================================

const totalAportado =
  aportesRegistrados.reduce(
    (total, aporte) =>
      total +
      Number(aporte.valor || 0),
    0
  );


// =====================================
// APORTES DEL MES
// Solo registrados
// =====================================

const ahora = new Date();

const aportesDelMes =
  aportesRegistrados.filter(
    (aporte) => {

      if (!aporte.fecha) {
        return false;
      }

      const fechaAporte =
        new Date(
          `${aporte.fecha}T00:00:00`
        );

      return (
        fechaAporte.getMonth() ===
          ahora.getMonth() &&
        fechaAporte.getFullYear() ===
          ahora.getFullYear()
      );

    }
  );


const totalMes =
  aportesDelMes.reduce(
    (total, aporte) =>
      total +
      Number(aporte.valor || 0),
    0
  );


// =====================================
// NÚMERO DE APORTES
// =====================================

const numeroAportes =
  aportesRegistrados.length;


// =====================================
// PROMEDIO POR APORTE
// =====================================

const promedioAporte =
  numeroAportes > 0
    ? totalAportado / numeroAportes
    : 0;


// =====================================
// DEBUG
// =====================================

console.log(
  "Aportes registrados:",
  aportesRegistrados
);

console.log(
  "Total aportado:",
  totalAportado
);

console.log(
  "Total del mes:",
  totalMes
);

console.log(
  "Número de aportes:",
  numeroAportes
);


// =====================================
// RETURN
// =====================================

return (

  <div className="space-y-6">

    {/* =====================================
        ENCABEZADO
    ===================================== */}

    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-4xl font-bold text-gray-800">

          {esMiembro
            ? "Mis aportes"
            : "Aportes"}

        </h1>

        <p className="mt-2 text-gray-500">

          {esMiembro
            ? "Consulta y registra tus aportes."
            : "Administración de aportes del Pro Templo"}

        </p>

      </div>


      <button
        onClick={nuevoAporte}
        className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
      >

        {esMiembro
          ? "+ Registrar mi aporte"
          : "+ Nuevo aporte"}

      </button>

    </div>


    {/* =====================================
        TARJETAS DE RESUMEN
    ===================================== */}

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">


      {/* TOTAL APORTADO */}

      <div className="rounded-2xl bg-white p-5 shadow">

        <p className="text-sm text-gray-500">
          Total aportado
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-800">

          {new Intl.NumberFormat(
            "es-CO",
            {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }
          ).format(totalAportado)}

        </p>

      </div>


      {/* APORTES DEL MES */}

      <div className="rounded-2xl bg-white p-5 shadow">

        <p className="text-sm text-gray-500">
          Aportes del mes
        </p>

        <p className="mt-2 text-2xl font-bold text-green-600">

          {new Intl.NumberFormat(
            "es-CO",
            {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }
          ).format(totalMes)}

        </p>

      </div>


      {/* NÚMERO DE APORTES */}

      <div className="rounded-2xl bg-white p-5 shadow">

        <p className="text-sm text-gray-500">
          Número de aportes
        </p>

        <p className="mt-2 text-2xl font-bold text-blue-600">

          {numeroAportes}

        </p>

      </div>


      {/* PROMEDIO */}

      <div className="rounded-2xl bg-white p-5 shadow">

        <p className="text-sm text-gray-500">
          Promedio por aporte
        </p>

        <p className="mt-2 text-2xl font-bold text-purple-600">

          {new Intl.NumberFormat(
            "es-CO",
            {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }
          ).format(promedioAporte)}

        </p>

      </div>

    </div>


    {/* =====================================
        BUSCAR
    ===================================== */}

    <input
      type="text"
      placeholder="Buscar por miembro o método..."
      value={buscar}
      onChange={(e) =>
        setBuscar(e.target.value)
      }
      className="w-full md:w-96 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    />


    {/* =====================================
        TABLA
    ===================================== */}

    <AportesTable
  aportes={aportesFiltrados}
  cargando={cargando}
  editar={editarAporte}
  eliminar={eliminarAporte}
  abrirEliminar={abrirEliminarAporte}
  puedeAdministrar={puedeAdministrar}
  aprobar={aprobarAporteRegistro}
  rechazar={rechazarAporteRegistro}
/>

    


    {/* =====================================
        MODAL
    ===================================== */}

    <Modal

      abierto={abrirModal}

      cerrar={() => {

        limpiarFormulario();

        setAbrirModal(false);

        closeModal();

      }}

      titulo={
        editando
          ? "Editar aporte"
          : esMiembro
            ? "Registrar mi aporte"
            : "Nuevo aporte"
      }

    >

      <AporteForm

        proyectos={proyectos}

        miembros={miembros}

        metodosPago={metodosPago}

        esMiembro={esMiembro}

        comprobante={comprobante}

        setComprobante={
          setComprobante
        }

        subiendoComprobante={
          subiendoComprobante
        }

        nombreMiembro={
          perfil?.nombres ||
          "Miembro"
        }

        proyectoId={
          proyectoId
        }

        setProyectoId={
          setProyectoId
        }

        miembroId={
          miembroId
        }

        setMiembroId={
          setMiembroId
        }

        fecha={
          fecha
        }

        setFecha={
          setFecha
        }

        valor={
          valor
        }

        setValor={
          setValor
        }

        metodoPago={
          metodoPago
        }

        setMetodoPago={
          setMetodoPago
        }

        observacion={
          observacion
        }

        setObservacion={
          setObservacion
        }

        guardar={
          guardarAporte
        }

        cancelar={() => {

          limpiarFormulario();

          setAbrirModal(false);

          closeModal();

        }}

      />

    </Modal>


    {/* =====================================
        CONFIRMACIÓN DE ELIMINACIÓN
    ===================================== */}

    <ConfirmDialog

      abierto={
        abrirEliminar
      }

      titulo="Eliminar aporte"

      mensaje="¿Desea eliminar este aporte?"

      confirmar={
        confirmarEliminar
      }

      cancelar={() => {

        setAbrirEliminar(false);

        setIdEliminar(null);

      }}

    />

  </div>

);

}

export default Aportes;