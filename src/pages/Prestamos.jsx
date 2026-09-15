import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import PrestamoForm from "../components/PrestamoForm";

import {
  obtenerPrestamos,
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo as eliminarPrestamoService,
} from "../services/prestamosService";
import {
  generarCuotasPrestamo,
} from "../services/cuotasService";
import { obtenerProyectos } from "../services/proyectosService";


function Prestamos() {

  // ======================================
  // ESTADOS
  // ======================================

  const [prestamos, setPrestamos] =
    useState([]);

  const [proyectos, setProyectos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [buscar, setBuscar] =
    useState("");

  const [abrirModal, setAbrirModal] =
    useState(false);

  const [abrirEliminar, setAbrirEliminar] =
    useState(false);

  const [editando, setEditando] =
    useState(false);

  const [idEditar, setIdEditar] =
    useState(null);

  const [idEliminar, setIdEliminar] =
    useState(null);


  // ======================================
  // FORMULARIO
  // ======================================

  const [proyecto, setProyecto] =
    useState(null);

  const [capital, setCapital] =
    useState("");

  const [tasaInteres, setTasaInteres] =
    useState("");

  const [tipoInteres, setTipoInteres] =
    useState("Mensual");

  const [plazoMeses, setPlazoMeses] =
    useState("");

  const [fechaInicio, setFechaInicio] =
    useState("");

  const [cuotaCapital, setCuotaCapital] =
    useState("");

  const [cuotaInteres, setCuotaInteres] =
    useState("");

  const [estado, setEstado] =
    useState("Activo");


  // ======================================
  // CARGAR PRÉSTAMOS
  // ======================================

  async function cargarPrestamos() {

    try {

      setCargando(true);

      const data =
        await obtenerPrestamos();

      setPrestamos(
        data ?? []
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Error cargando préstamos."
      );

    } finally {

      setCargando(false);

    }

  }


  // ======================================
  // CARGAR PROYECTOS
  // ======================================

  async function cargarProyectos() {

    try {

      const data =
        await obtenerProyectos();

      setProyectos(
        data ?? []
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Error cargando proyectos."
      );

    }

  }


  // ======================================
  // INICIO
  // ======================================

  useEffect(() => {

    cargarPrestamos();
    cargarProyectos();

  }, []);


  // ======================================
  // LIMPIAR FORMULARIO
  // ======================================

  function limpiarFormulario() {

    setProyecto(null);

    setCapital("");

    setTasaInteres("");

    setTipoInteres("Mensual");

    setPlazoMeses("");

    setFechaInicio("");

    setCuotaCapital("");

    setCuotaInteres("");

    setEstado("Activo");

    setEditando(false);

    setIdEditar(null);

  }


  // ======================================
  // NUEVO PRÉSTAMO
  // ======================================

  function nuevoPrestamo() {

    limpiarFormulario();

    setAbrirModal(true);

  }


  // ======================================
  // EDITAR
  // ======================================

  function editarPrestamo(prestamo) {

    setEditando(true);

    setIdEditar(
      prestamo.id
    );

    setProyecto(
      prestamo.proyectos ?? null
    );

    setCapital(
      prestamo.capital ?? ""
    );

    setTasaInteres(
      prestamo.tasa_interes ?? ""
    );

    setTipoInteres(
      prestamo.tipo_interes ||
      "Mensual"
    );

    setPlazoMeses(
      prestamo.plazo_meses ?? ""
    );

    setFechaInicio(
      prestamo.fecha_inicio ?? ""
    );

    setCuotaCapital(
      prestamo.cuota_capital ?? ""
    );

    setCuotaInteres(
      prestamo.cuota_interes ?? ""
    );

    setEstado(
      prestamo.estado ||
      "Activo"
    );

    setAbrirModal(true);

  }


  // ======================================
  // GUARDAR
  // ======================================

  async function guardarPrestamo(e) {

    e.preventDefault();

    try {

      if (!proyecto?.id) {

        throw new Error(
          "Debe seleccionar un proyecto."
        );

      }


      const datos = {

        proyecto_id:
          proyecto.id,

        capital:
          Number(capital),

        tasa_interes:
          Number(tasaInteres),

        tipo_interes:
          tipoInteres,

        plazo_meses:
          Number(plazoMeses),

        fecha_inicio:
          fechaInicio,

        cuota_capital:
          Number(cuotaCapital || 0),

        cuota_interes:
          Number(cuotaInteres || 0),

        estado:
          estado,

      };


      if (editando) {

        await actualizarPrestamo(
          idEditar,
          datos
        );

        toast.success(
          "Préstamo actualizado correctamente."
        );

    } else {

  const prestamoCreado =
    await crearPrestamo(
      datos
    );

  await generarCuotasPrestamo(
    prestamoCreado
  );

  toast.success(
    "Préstamo y cuotas registrados correctamente."
  );

}


      limpiarFormulario();

      setAbrirModal(false);

      await cargarPrestamos();

    } catch (error) {

      console.error(error);

      toast.error(
        error.message ||
        "No se pudo guardar el préstamo."
      );

    }

  }


  // ======================================
  // ELIMINAR
  // ======================================

  function eliminarPrestamo(id) {

    setIdEliminar(id);

    setAbrirEliminar(true);

  }


  async function confirmarEliminar() {

    try {

      await eliminarPrestamoService(
        idEliminar
      );

      toast.success(
        "Préstamo eliminado correctamente."
      );

      setAbrirEliminar(false);

      setIdEliminar(null);

      await cargarPrestamos();

    } catch (error) {

      console.error(error);

      toast.error(
        error.message ||
        "No se pudo eliminar el préstamo."
      );

    }

  }


  // ======================================
  // BUSCAR
  // ======================================

  const prestamosFiltrados =
    useMemo(() => {

      const texto =
        buscar
          .toLowerCase()
          .trim();

      if (!texto) {

        return prestamos;

      }

      return prestamos.filter(
        (prestamo) => {

          return (

            prestamo.proyectos?.nombre
              ?.toLowerCase()
              .includes(texto)

            ||

            prestamo.estado
              ?.toLowerCase()
              .includes(texto)

          );

        }
      );

    }, [
      buscar,
      prestamos,
    ]);


  // ======================================
  // RESUMEN
  // ======================================

  const totalCapital =
    prestamos.reduce(
      (total, prestamo) =>
        total +
        Number(
          prestamo.capital || 0
        ),
      0
    );


  const saldoTotal =
    prestamos.reduce(
      (total, prestamo) =>
        total +
        Number(
          prestamo.saldo_actual || 0
        ),
      0
    );


  const prestamosActivos =
    prestamos.filter(
      (prestamo) =>
        prestamo.estado === "Activo"
    ).length;


  // ======================================
  // FORMATO MONEDA
  // ======================================

  function formatoMoneda(valor) {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(valor || 0)
    );

  }


  // ======================================
  // ESTADO VISUAL
  // ======================================

  function estadoClase(estado) {

    if (estado === "Activo") {

      return "bg-green-100 text-green-700";

    }

    if (estado === "Finalizado") {

      return "bg-blue-100 text-blue-700";

    }

    if (estado === "Anulado") {

      return "bg-red-100 text-red-700";

    }

    return "bg-gray-100 text-gray-700";

  }


  // ======================================
  // RETURN
  // ======================================

  return (

    <div className="space-y-6">


      {/* ==================================
          ENCABEZADO
      ================================== */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-gray-800">

            Préstamos

          </h1>

          <p className="mt-2 text-gray-500">

            Administración de préstamos del ICC Palabra de Fe

          </p>

        </div>


        <button
          type="button"
          onClick={nuevoPrestamo}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
        >

          + Nuevo préstamo

        </button>

      </div>


      {/* ==================================
          TARJETAS
      ================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


        {/* Capital */}

        <div className="rounded-2xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">

            Capital prestado

          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">

            {formatoMoneda(
              totalCapital
            )}

          </p>

        </div>


        {/* Saldo */}

        <div className="rounded-2xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">

            Saldo pendiente

          </p>

          <p className="mt-2 text-2xl font-bold text-orange-600">

            {formatoMoneda(
              saldoTotal
            )}

          </p>

        </div>


        {/* Activos */}

        <div className="rounded-2xl bg-white p-5 shadow">

          <p className="text-sm text-gray-500">

            Préstamos activos

          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">

            {prestamosActivos}

          </p>

        </div>

      </div>


      {/* ==================================
          BUSCAR
      ================================== */}

      <input
        type="text"
        placeholder="Buscar por proyecto o estado..."
        value={buscar}
        onChange={(e) =>
          setBuscar(
            e.target.value
          )
        }
        className="w-full md:w-96 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />


      {/* ==================================
          TABLA
      ================================== */}

      <div className="overflow-hidden rounded-2xl bg-white shadow">

        {cargando ? (

          <div className="p-10 text-center">

            Cargando préstamos...

          </div>

        ) : prestamosFiltrados.length === 0 ? (

          <div className="p-10 text-center text-gray-500">

            No hay préstamos registrados.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-4 text-left">
                    Fecha
                  </th>

                  <th className="p-4 text-left">
                    Proyecto
                  </th>

                  <th className="p-4 text-right">
                    Capital
                  </th>

                  <th className="p-4 text-center">
                    Tasa
                  </th>

                  <th className="p-4 text-center">
                    Plazo
                  </th>

                  <th className="p-4 text-right">
                    Cuota
                  </th>

                  <th className="p-4 text-right">
                    Saldo
                  </th>

                  <th className="p-4 text-center">
                    Estado
                  </th>

                  <th className="p-4 text-center">
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {prestamosFiltrados.map(
                  (prestamo) => (

                    <tr
                      key={
                        prestamo.id
                      }
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 whitespace-nowrap">

                        {prestamo.fecha_inicio
                          ? new Date(
                              `${prestamo.fecha_inicio}T00:00:00`
                            ).toLocaleDateString(
                              "es-CO"
                            )
                          : "—"}

                      </td>


                      <td className="p-4 font-semibold">

                        {prestamo.proyectos?.nombre ||
                          "—"}

                      </td>


                      <td className="p-4 text-right font-semibold whitespace-nowrap">

                        {formatoMoneda(
                          prestamo.capital
                        )}

                      </td>


                      <td className="p-4 text-center">

                        {prestamo.tasa_interes}%

                      </td>


                      <td className="p-4 text-center">

                        {prestamo.plazo_meses} meses

                      </td>


                      <td className="p-4 text-right whitespace-nowrap">

                        {formatoMoneda(
                          Number(
                            prestamo.cuota_capital || 0
                          ) +
                          Number(
                            prestamo.cuota_interes || 0
                          )
                        )}

                      </td>


                      <td className="p-4 text-right font-semibold whitespace-nowrap">

                        {formatoMoneda(
                          prestamo.saldo_actual
                        )}

                      </td>


                      <td className="p-4 text-center">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${estadoClase(
                            prestamo.estado
                          )}`}
                        >

                          {prestamo.estado}

                        </span>

                      </td>


                      <td className="p-4">

                        <div className="flex justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              editarPrestamo(
                                prestamo
                              )
                            }
                            className="rounded-lg bg-yellow-400 px-3 py-2 hover:bg-yellow-500"
                            title="Editar préstamo"
                          >

                            ✏️

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              eliminarPrestamo(
                                prestamo.id
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                            title="Eliminar préstamo"
                          >

                            🗑️

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ==================================
          MODAL
      ================================== */}

      <Modal
        abierto={abrirModal}
        cerrar={() => {

          limpiarFormulario();

          setAbrirModal(false);

        }}
        titulo={
          editando
            ? "Editar préstamo"
            : "Nuevo préstamo"
        }
      >

        <PrestamoForm

          proyecto={
            proyecto
          }

          capital={
            capital
          }
          setCapital={
            setCapital
          }

          tasaInteres={
            tasaInteres
          }
          setTasaInteres={
            setTasaInteres
          }

          tipoInteres={
            tipoInteres
          }
          setTipoInteres={
            setTipoInteres
          }

          plazoMeses={
            plazoMeses
          }
          setPlazoMeses={
            setPlazoMeses
          }

          fechaInicio={
            fechaInicio
          }
          setFechaInicio={
            setFechaInicio
          }

          cuotaCapital={
            cuotaCapital
          }
          setCuotaCapital={
            setCuotaCapital
          }

          cuotaInteres={
            cuotaInteres
          }
          setCuotaInteres={
            setCuotaInteres
          }

          estado={
            estado
          }
          setEstado={
            setEstado
          }

          guardar={
            guardarPrestamo
          }

          cancelar={() => {

            limpiarFormulario();

            setAbrirModal(false);

          }}

        />

      </Modal>


      {/* ==================================
          CONFIRMACIÓN ELIMINAR
      ================================== */}

      <ConfirmDialog

        abierto={
          abrirEliminar
        }

        titulo="Eliminar préstamo"

        mensaje="¿Está seguro de eliminar este préstamo?"

        confirmar={
          confirmarEliminar
        }

        cancelar={() => {

          setAbrirEliminar(
            false
          );

          setIdEliminar(
            null
          );

        }}

      />

    </div>

  );

}


export default Prestamos;