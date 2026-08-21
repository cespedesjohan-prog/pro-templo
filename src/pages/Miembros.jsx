import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import MemberForm from "../components/MemberForm";
import MembersTable from "../components/MembersTable";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useLocation, useNavigate } from "react-router-dom";

import {
  obtenerMiembros,
  crearMiembro,
  actualizarMiembro,
  eliminarMiembro as eliminarMiembroService,
  crearUsuarioMiembro,
} from "../services/miembrosService";

function Miembros() {

  const location = useLocation();
  const navigate = useNavigate();

  const { perfil } = useAuth();

  const rol = perfil?.rol;

  const puedeAdministrarMiembros =
    rol === "Administrador";


  // ============================
  // Estados
  // ============================

  const [buscar, setBuscar] = useState("");

  const [miembros, setMiembros] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [abrirModal, setAbrirModal] = useState(false);

  const [editando, setEditando] = useState(false);

  const [idEditar, setIdEditar] = useState(null);

  const [nombre, setNombre] = useState("");

  const [telefono, setTelefono] = useState("");

  const [correo, setCorreo] = useState("");

  const [meta, setMeta] = useState("");

  const [activo, setActivo] = useState(true);

  const [password, setPassword] = useState("");

  const [confirmarPassword, setConfirmarPassword] =
    useState("");

  const [abrirEliminar, setAbrirEliminar] =
    useState(false);

  const [idEliminar, setIdEliminar] =
    useState(null);


  // ============================
  // Cargar miembros
  // ============================

  async function cargarMiembros() {

    try {

      setCargando(true);

      const data =
        await obtenerMiembros();

      setMiembros(data ?? []);

    } catch (error) {

      console.error(error);

      toast.error(
        "Error cargando miembros."
      );

    } finally {

      setCargando(false);

    }

  }


  useEffect(() => {

    cargarMiembros();

  }, []);


  // ============================
  // Limpiar formulario
  // ============================

  function limpiarFormulario() {

    setNombre("");

    setTelefono("");

    setCorreo("");

    setMeta("");

    setActivo(true);

    setPassword("");

    setConfirmarPassword("");

    setEditando(false);

    setIdEditar(null);

  }


  // ============================
  // Nuevo miembro
  // ============================

  function nuevoMiembro() {

    limpiarFormulario();

    setAbrirModal(true);

  }


  useEffect(() => {

    if (location.state?.abrirModal) {

      nuevoMiembro();

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

    }

  }, [
    location.state,
    navigate,
  ]);


  // ============================
  // Guardar
  // ============================

  async function guardarMiembro(e) {

    e.preventDefault();

    try {

      // ==================================
      // VALIDACIONES
      // ==================================

      if (!nombre.trim()) {

        throw new Error(
          "Debe ingresar el nombre del miembro."
        );

      }


      if (!correo.trim()) {

        throw new Error(
          "Debe ingresar el correo electrónico."
        );

      }


      if (Number(meta) < 0) {

        throw new Error(
          "La meta mensual no puede ser negativa."
        );

      }


      // ==================================
      // DATOS DEL MIEMBRO
      // ==================================

      const miembro = {

        nombres:
          nombre.trim(),

        telefono_movil:
          telefono.trim(),

        correo_electronico:
          correo.trim().toLowerCase(),

        compromiso_mensual:
          Number(meta || 0),

        estado:
          activo,

      };


      // ==================================
      // EDITAR
      // ==================================

      if (editando) {

        await actualizarMiembro(
          idEditar,
          miembro
        );

        toast.success(
          "Miembro actualizado correctamente."
        );

      }


      // ==================================
      // CREAR
      // ==================================

      else {

        // --------------------------------
        // Validar contraseña
        // --------------------------------

        if (!password) {

          throw new Error(
            "Debe ingresar una contraseña."
          );

        }


        if (password.length < 6) {

          throw new Error(
            "La contraseña debe tener mínimo 6 caracteres."
          );

        }


        if (
          password !==
          confirmarPassword
        ) {

          throw new Error(
            "Las contraseñas no coinciden."
          );

        }


        // --------------------------------
        // Crear miembro
        // --------------------------------

        const resultado =
          await crearMiembro(
            miembro
          );


        const nuevoMiembro =
          resultado?.[0];


        if (!nuevoMiembro?.id) {

          throw new Error(
            "El miembro fue creado, pero no se pudo obtener su ID."
          );

        }


        // --------------------------------
        // Crear usuario de acceso
        // --------------------------------

       await crearUsuarioMiembro({
  miembroId: nuevoMiembro.id,
  correo: correo,
  password: password,
});


        toast.success(
          "Miembro y usuario creados correctamente."
        );

      }


      // ==================================
      // LIMPIAR
      // ==================================

      limpiarFormulario();

      setAbrirModal(false);

      await cargarMiembros();


    } catch (error) {

      console.error(
        "Error guardando miembro:",
        error
      );

      toast.error(
        error?.message ||
        "No fue posible guardar el miembro."
      );

    }

  }


  // ============================
  // Editar
  // ============================

  function editarMiembro(miembro) {

    setEditando(true);

    setIdEditar(
      miembro.id
    );

    setNombre(
      miembro.nombres || ""
    );

    setTelefono(
      miembro.telefono_movil || ""
    );

    setCorreo(
      miembro.correo_electronico || ""
    );

    setMeta(
      miembro.compromiso_mensual || ""
    );

    setActivo(
      miembro.estado
    );

    // No cargar contraseñas existentes.
    setPassword("");

    setConfirmarPassword("");

    setAbrirModal(true);

  }


  // ============================
  // Eliminar
  // ============================

  function eliminarMiembro(id) {

    setIdEliminar(id);

    setAbrirEliminar(true);

  }


  async function confirmarEliminar() {

    try {

      await eliminarMiembroService(
        idEliminar
      );

      toast.success(
        "Miembro eliminado."
      );

      setAbrirEliminar(false);

      setIdEliminar(null);

      await cargarMiembros();

    } catch (error) {

      console.error(error);

      toast.error(
        error?.message ||
        "No fue posible eliminar el miembro."
      );

    }

  }


  // ============================
  // Buscar
  // ============================

  const miembrosFiltrados =
    useMemo(() => {

      return miembros.filter(
        (m) => {

          const texto =
            buscar
              .toLowerCase()
              .trim();

          return (

            m.nombres
              ?.toLowerCase()
              .includes(texto)

            ||

            m.telefono_movil
              ?.toLowerCase()
              .includes(texto)

            ||

            m.correo_electronico
              ?.toLowerCase()
              .includes(texto)

          );

        }
      );

    }, [
      buscar,
      miembros,
    ]);


  // ============================
  // RETURN
  // ============================

  return (

    <div className="space-y-6">

      {/* ============================
          ENCABEZADO
      ============================ */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-gray-800">
            Miembros
          </h1>

          <p className="mt-2 text-gray-500">
            Administración de miembros del Pro Templo
          </p>

        </div>


        {puedeAdministrarMiembros && (

          <button
            onClick={nuevoMiembro}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            + Nuevo miembro
          </button>

        )}

      </div>


      {/* ============================
          BUSCAR
      ============================ */}

      <input
        type="text"
        placeholder="Buscar miembro..."
        value={buscar}
        onChange={(e) =>
          setBuscar(e.target.value)
        }
        className="w-full md:w-96 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />


      {/* ============================
          TABLA
      ============================ */}

      <MembersTable
        miembros={
          miembrosFiltrados
        }
        cargando={
          cargando
        }
        editar={
          editarMiembro
        }
        eliminar={
          eliminarMiembro
        }
        puedeAdministrar={
          puedeAdministrarMiembros
        }
      />


      {/* ============================
          MODAL
      ============================ */}

      <Modal
        abierto={
          abrirModal
        }
        cerrar={() => {

          limpiarFormulario();

          setAbrirModal(false);

        }}
        titulo={
          editando
            ? "Editar Miembro"
            : "Nuevo Miembro"
        }
      >

        <MemberForm

          nombre={
            nombre
          }

          setNombre={
            setNombre
          }


          telefono={
            telefono
          }

          setTelefono={
            setTelefono
          }


          correo={
            correo
          }

          setCorreo={
            setCorreo
          }


          meta={
            meta
          }

          setMeta={
            setMeta
          }


          activo={
            activo
          }

          setActivo={
            setActivo
          }


          password={
            password
          }

          setPassword={
            setPassword
          }


          confirmarPassword={
            confirmarPassword
          }

          setConfirmarPassword={
            setConfirmarPassword
          }


          editando={
            editando
          }


          guardar={
            guardarMiembro
          }


          cancelar={() => {

            limpiarFormulario();

            setAbrirModal(false);

          }}

        />

      </Modal>


      {/* ============================
          CONFIRMAR ELIMINACIÓN
      ============================ */}

      <ConfirmDialog

        abierto={
          abrirEliminar
        }

        titulo="Eliminar miembro"

        mensaje="¿Está seguro de eliminar este miembro?"

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


export default Miembros;