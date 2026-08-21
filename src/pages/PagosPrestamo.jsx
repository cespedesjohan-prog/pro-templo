import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import Modal from "../components/Modal";
import PagoPrestamoForm from "../components/PagoPrestamoForm";
import PagosPrestamoTable from "../components/PagosPrestamoTable";
import ConfirmDialog from "../components/ConfirmDialog";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  obtenerPagosPrestamo,
  eliminarPagoPrestamo,
} from "../services/pagosPrestamoService";

import {
  obtenerMetodosPago,
} from "../services/aportesService";

import {
  registrarPagoPrestamo,
  actualizarPagoPrestamo,
} from "../services/finanzasService";

import {
  obtenerPrestamos,
  obtenerPrestamoActivo,
} from "../services/prestamosService";

import {
  obtenerCuotasPrestamo,
} from "../services/cuotasService";

import {
  subirComprobante,
  eliminarComprobante,
} from "../services/comprobantesService";

import {
  supabase,
} from "../lib/supabase";


function PagosPrestamo() {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  // =====================================
  // ESTADOS
  // =====================================

  const [
    pagos,
    setPagos,
  ] = useState([]);


  const [
    prestamos,
    setPrestamos,
  ] = useState([]);


  const [
    prestamoActivo,
    setPrestamoActivo,
  ] = useState(null);


  const [
    cuotas,
    setCuotas,
  ] = useState([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    abrirModal,
    setAbrirModal,
  ] = useState(false);


  const [
    metodosPago,
    setMetodosPago,
  ] = useState([]);


  const [
    metodoPago,
    setMetodoPago,
  ] = useState("");


  const [
    abrirEliminar,
    setAbrirEliminar,
  ] = useState(false);


  const [
    idEliminar,
    setIdEliminar,
  ] = useState(null);


  const [
    editando,
    setEditando,
  ] = useState(false);


  const [
    idEditar,
    setIdEditar,
  ] = useState(null);


  // =====================================
  // FORMULARIO
  // =====================================

  const [
    prestamoId,
    setPrestamoId,
  ] = useState("");


  const [
    fecha,
    setFecha,
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );


  const [
    valor,
    setValor,
  ] = useState("");


  const [
    capital,
    setCapital,
  ] = useState("");


  const [
    interes,
    setInteres,
  ] = useState("");


  const [
    comprobante,
    setComprobante,
  ] = useState(null);


  const [
    saldoCalculo,
    setSaldoCalculo,
  ] = useState(0);


  const [
    tasaCalculo,
    setTasaCalculo,
  ] = useState(0);


  const [
    observacion,
    setObservacion,
  ] = useState("");


  // =====================================
  // FORMATO MONEDA
  // =====================================

  function formatoMoneda(
    numero
  ) {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(numero || 0)
    );

  }


  // =====================================
  // OBTENER CUOTAS DEL PRÉSTAMO
  // =====================================

  async function cargarCuotas(
    id
  ) {

    if (!id) {

      setCuotas([]);

      return [];

    }


    try {

      const data =
        await obtenerCuotasPrestamo(
          id
        );

      setCuotas(
        data ?? []
      );

      return data ?? [];

    } catch (error) {

      console.error(
        "Error cargando cuotas:",
        error
      );

      setCuotas([]);

      toast.error(
        "No fue posible cargar las cuotas."
      );

      return [];

    }

  }


  // =====================================
  // OBTENER PRÓXIMA CUOTA PENDIENTE
  // =====================================

  function obtenerProximaCuota(
    listaCuotas
  ) {

    if (
      !listaCuotas ||
      listaCuotas.length === 0
    ) {

      return null;

    }


    return (
      listaCuotas.find(
        (cuota) =>
          cuota.estado !==
          "Pagada"
      ) ||
      null
    );

  }


  // =====================================
  // CALCULAR APLICACIÓN DEL PAGO
  // =====================================
  //
  // Regla:
  //
  // 1. Interés pendiente
  // 2. Capital pendiente
  // 3. Si sobra, siguiente cuota
  //
  // =====================================

  function calcularAplicacionPago(
    valorPago,
    listaCuotas
  ) {

    let disponible =
      Number(
        valorPago || 0
      );


    let capitalAplicado = 0;

    let interesAplicado = 0;


    if (
      disponible <= 0 ||
      !listaCuotas?.length
    ) {

      return {
        capital: 0,
        interes: 0,
        sobrante: disponible,
      };

    }


    for (
      const cuota of listaCuotas
    ) {

      if (
        disponible <= 0
      ) {

        break;

      }


      const interesTotal =
        Number(
          cuota.interes || 0
        );


      const interesPagado =
        Number(
          cuota.intereses_pagado || 0
        );


      const capitalTotal =
        Number(
          cuota.capital || 0
        );


      const capitalPagado =
        Number(
          cuota.capital_pagado || 0
        );


      // ================================
      // INTERÉS PENDIENTE
      // ================================

      const interesPendiente =
        Math.max(
          interesTotal -
          interesPagado,
          0
        );


      const pagoInteres =
        Math.min(
          disponible,
          interesPendiente
        );


      disponible =
        Number(
          (
            disponible -
            pagoInteres
          ).toFixed(2)
        );


      interesAplicado =
        Number(
          (
            interesAplicado +
            pagoInteres
          ).toFixed(2)
        );


      // ================================
      // CAPITAL PENDIENTE
      // ================================

      const capitalPendiente =
        Math.max(
          capitalTotal -
          capitalPagado,
          0
        );


      const pagoCapital =
        Math.min(
          disponible,
          capitalPendiente
        );


      disponible =
        Number(
          (
            disponible -
            pagoCapital
          ).toFixed(2)
        );


      capitalAplicado =
        Number(
          (
            capitalAplicado +
            pagoCapital
          ).toFixed(2)
        );

    }


    return {

      capital:
        capitalAplicado,

      interes:
        interesAplicado,

      sobrante:
        disponible,

    };

  }


  // =====================================
  // CARGAR MÉTODOS DE PAGO
  // =====================================

  async function cargarMetodosPago() {

    try {

      const data =
        await obtenerMetodosPago();

      setMetodosPago(
        data ?? []
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        "No fue posible cargar los métodos de pago."
      );

    }

  }


  // =====================================
  // CARGAR PRÉSTAMOS
  // =====================================

  async function cargarPrestamos() {

    try {

      const data =
        await obtenerPrestamos();

      setPrestamos(
        data ?? []
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        "No fue posible cargar los préstamos."
      );

    }

  }


  // =====================================
  // CARGAR PRÉSTAMO ACTIVO
  // =====================================

  async function cargarPrestamoActivo() {

    try {

      const activo =
        await obtenerPrestamoActivo();

      setPrestamoActivo(
        activo ?? null
      );

      if (
        activo?.id
      ) {

        setPrestamoId(
          activo.id
        );

      }

    } catch (error) {

      console.error(
        error
      );

      setPrestamoActivo(
        null
      );

      setPrestamoId(
        ""
      );

    }

  }


  // =====================================
  // CARGAR PAGOS
  // =====================================

  async function cargarPagos() {

    try {

      setCargando(
        true
      );

      const data =
        await obtenerPagosPrestamo();

      setPagos(
        data ?? []
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        "No fue posible cargar los pagos."
      );

    } finally {

      setCargando(
        false
      );

    }

  }


  // =====================================
  // CARGA INICIAL
  // =====================================

  useEffect(() => {

    cargarPrestamos();

    cargarPrestamoActivo();

    cargarPagos();

    cargarMetodosPago();

  }, []);


  // =====================================
  // CARGAR INFORMACIÓN DEL PRÉSTAMO
  // =====================================

  useEffect(() => {

    async function cargarInformacion() {

      if (!prestamoId) {

        setSaldoCalculo(0);

        setTasaCalculo(0);

        setCuotas([]);

        setCapital("");

        setInteres("");

        return;

      }


      const prestamo =
        prestamos.find(
          (p) =>
            p.id ===
            prestamoId
        );


      if (!prestamo) {

        return;

      }


      setSaldoCalculo(
        Number(
          prestamo.saldo_actual ||
          0
        )
      );


      setTasaCalculo(
        Number(
          prestamo.tasa_interes ||
          0
        )
      );


      const listaCuotas =
        await cargarCuotas(
          prestamoId
        );


      // =================================
      // Mostrar distribución del último
      // valor escrito
      // =================================

      if (
        Number(valor) > 0
      ) {

        const aplicacion =
          calcularAplicacionPago(
            Number(valor),
            listaCuotas
          );


        setCapital(
          aplicacion.capital
            .toString()
        );


        setInteres(
          aplicacion.interes
            .toString()
        );

      }

    }


    cargarInformacion();

  }, [
    prestamoId,
    prestamos,
  ]);


  // =====================================
  // RECALCULAR AL CAMBIAR VALOR
  // =====================================

  useEffect(() => {

    if (
      !valor ||
      Number(valor) <= 0 ||
      cuotas.length === 0
    ) {

      setCapital("");

      setInteres("");

      return;

    }


    const aplicacion =
      calcularAplicacionPago(
        Number(valor),
        cuotas
      );


    setCapital(
      aplicacion.capital
        .toString()
    );


    setInteres(
      aplicacion.interes
        .toString()
    );

  }, [
    valor,
    cuotas,
  ]);


  // =====================================
  // ABRIR MODAL DESDE DASHBOARD
  // =====================================

  useEffect(() => {

    if (
      location.state?.abrirModal
    ) {

      if (
        prestamoActivo?.id
      ) {

        setPrestamoId(
          prestamoActivo.id
        );

      }

      setAbrirModal(
        true
      );

      navigate(
        location.pathname,
        {
          replace: true,
          state: null,
        }
      );

    }

  }, [
    location.state,
    location.pathname,
    navigate,
    prestamoActivo,
  ]);


  // =====================================
  // NUEVO PAGO
  // =====================================

  function nuevoPago() {

    setEditando(
      false
    );

    setIdEditar(
      null
    );

    setComprobante(
      null
    );


    if (
      prestamoActivo?.id
    ) {

      setPrestamoId(
        prestamoActivo.id
      );

    }


    setFecha(
      new Date()
        .toISOString()
        .split("T")[0]
    );


    setValor("");

    setCapital("");

    setInteres("");

    setMetodoPago("");

    setObservacion("");

    setAbrirModal(
      true
    );

  }


  // =====================================
  // EDITAR PAGO
  // =====================================

  function editarPago(
    pago
  ) {

    setEditando(
      true
    );

    setIdEditar(
      pago.id
    );


    setPrestamoId(
      pago.prestamo_id
    );


    setFecha(
      pago.fecha || ""
    );


    setValor(
      pago.valor ?? ""
    );


    setCapital(
      pago.capital ?? ""
    );


    setInteres(
      pago.interes ?? ""
    );


    setMetodoPago(
      pago.metodo_pago_id ||
      ""
    );


    setObservacion(
      pago.observacion ||
      ""
    );


    setAbrirModal(
      true
    );

  }


  // =====================================
  // CERRAR MODAL
  // =====================================

  function cerrarModal() {

    setAbrirModal(
      false
    );

  }


  // =====================================
  // ELIMINAR PAGO
  // =====================================

  function eliminarPago(
    id
  ) {

    setIdEliminar(
      id
    );

    setAbrirEliminar(
      true
    );

  }


  // =====================================
  // CONFIRMAR ELIMINACIÓN
  // =====================================

  async function confirmarEliminarPago() {

    try {

      if (
        !idEliminar
      ) {

        return;

      }


      await eliminarPagoPrestamo(
        idEliminar
      );


      toast.success(
        "Pago eliminado correctamente."
      );


      setAbrirEliminar(
        false
      );

      setIdEliminar(
        null
      );


      await cargarPagos();

      await cargarPrestamoActivo();

      await cargarPrestamos();


      if (
        prestamoId
      ) {

        await cargarCuotas(
          prestamoId
        );

      }

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        error?.message ||
        "No fue posible eliminar el pago."
      );

    }

  }


  // =====================================
  // SELECCIONAR PRÉSTAMO
  // =====================================

  async function seleccionarPrestamo(
    id
  ) {

    setPrestamoId(
      id
    );


    if (!id) {

      setSaldoCalculo(0);

      setTasaCalculo(0);

      setCuotas([]);

      setCapital("");

      setInteres("");

      setValor("");

      return;

    }


    const prestamo =
      prestamos.find(
        (p) =>
          p.id === id
      );


    if (!prestamo) {

      setSaldoCalculo(0);

      setTasaCalculo(0);

      setCuotas([]);

      setCapital("");

      setInteres("");

      setValor("");

      return;

    }


    setSaldoCalculo(
      Number(
        prestamo.saldo_actual ||
        0
      )
    );


    setTasaCalculo(
      Number(
        prestamo.tasa_interes ||
        0
      )
    );


    setCapital("");

    setInteres("");

    setValor("");


    await cargarCuotas(
      id
    );

  }


  // =====================================
  // GUARDAR PAGO
  // =====================================

  async function guardarPago(
    e
  ) {

    e.preventDefault();


    try {

      // =================================
      // VALIDACIONES
      // =================================

      if (!prestamoId) {

        throw new Error(
          "Debe seleccionar un préstamo."
        );

      }


      if (
        !valor ||
        Number(valor) <= 0
      ) {

        throw new Error(
          "Debe ingresar un valor de pago válido."
        );

      }


      if (!metodoPago) {

        throw new Error(
          "Debe seleccionar un método de pago."
        );

      }


      // =================================
      // VERIFICAR CUOTAS
      // =================================

      const cuotasActuales =
        cuotas.length > 0
          ? cuotas
          : await obtenerCuotasPrestamo(
              prestamoId
            );


      if (
        cuotasActuales.length === 0
      ) {

        throw new Error(
          "Este préstamo no tiene cuotas generadas."
        );

      }


      // =================================
      // CALCULAR DISTRIBUCIÓN
      // =================================

      const aplicacion =
        calcularAplicacionPago(
          Number(valor),
          cuotasActuales
        );


      // =================================
      // DATOS DEL PAGO
      // =================================

      const datosPago = {

        prestamo_id:
          prestamoId,

        fecha,

        valor:
          Number(valor),

        capital:
          Number(
            aplicacion.capital
          ),

        interes:
          Number(
            aplicacion.interes
          ),

        metodo_pago_id:
          metodoPago,

        observacion:
          observacion ||
          null,

      };


      // =================================
      // EDITAR
      // =================================

      if (
        editando
      ) {

        const pagoAnterior =
          pagos.find(
            (pago) =>
              pago.id ===
              idEditar
          );


        if (!pagoAnterior) {

          throw new Error(
            "No se encontró el pago que desea editar."
          );

        }


        await actualizarPagoPrestamo(
          idEditar,
          datosPago
        );


        // ===============================
        // COMPROBANTE NUEVO
        // ===============================

        if (
          comprobante &&
          comprobante instanceof File
        ) {

          const rutaNueva =
            await subirComprobante(
              comprobante,
              prestamoId
            );


          const {
            error:
              errorComprobante,
          } = await supabase

            .from(
              "pagos_prestamo"
            )

            .update({

              comprobante:
                rutaNueva,

            })

            .eq(
              "id",
              idEditar
            );


          if (
            errorComprobante
          ) {

            throw errorComprobante;

          }


          // =============================
          // ELIMINAR ANTERIOR
          // =============================

          if (
            pagoAnterior.comprobante &&
            pagoAnterior.comprobante !==
              rutaNueva
          ) {

            try {

              await eliminarComprobante(
                pagoAnterior.comprobante
              );

            } catch (
              error
            ) {

              console.error(
                "No fue posible eliminar el comprobante anterior:",
                error
              );

            }

          }

        }


        toast.success(
          "Pago actualizado correctamente."
        );

      }


      // =================================
      // NUEVO PAGO
      // =================================

      else {

        const resultado =
          await registrarPagoPrestamo(
            datosPago
          );


        // ===============================
        // COMPROBANTE
        // ===============================

        if (
          comprobante &&
          comprobante instanceof File
        ) {

          const ruta =
            await subirComprobante(
              comprobante,
              prestamoId
            );


          const {
            error:
              errorComprobante,
          } = await supabase

            .from(
              "pagos_prestamo"
            )

            .update({

              comprobante:
                ruta,

            })

            .eq(
              "id",
              resultado.pago.id
            );


          if (
            errorComprobante
          ) {

            throw errorComprobante;

          }

        }


        toast.success(
          "Pago registrado correctamente."
        );

      }


      // =================================
      // LIMPIAR FORMULARIO
      // =================================

      setPrestamoId("");

      setFecha(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      setValor("");

      setCapital("");

      setInteres("");

      setMetodoPago("");

      setComprobante(
        null
      );

      setObservacion("");

      setEditando(
        false
      );

      setIdEditar(
        null
      );


      // =================================
      // CERRAR MODAL
      // =================================

      setAbrirModal(
        false
      );


      // =================================
      // RECARGAR
      // =================================

      await cargarPagos();

      await cargarPrestamoActivo();

      await cargarPrestamos();


    } catch (
      error
    ) {

      console.error(
        "Error guardando pago:",
        error
      );

      toast.error(
        error?.message ||
        "No fue posible guardar el pago."
      );

    }

  }


  // =====================================
  // RETURN
  // =====================================

  return (

    <div className="space-y-6">


      {/* =================================
          ENCABEZADO
      ================================= */}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">


        <div>

          <h1 className="text-4xl font-bold text-gray-900">

            Pagos del préstamo

          </h1>


          <p className="mt-1 text-gray-500">

            Administración de pagos al banco

          </p>

        </div>


        {/* =================================
            RESUMEN
        ================================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 xl:max-w-4xl">


          {/* Capital */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

            <p className="text-sm text-gray-500">

              Capital del préstamo

            </p>


            <p className="text-2xl font-bold text-gray-900 mt-2">

              {formatoMoneda(
                prestamoActivo?.capital
              )}

            </p>

          </div>


          {/* Capital pagado */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

            <p className="text-sm text-gray-500">

              Capital pagado

            </p>


            <p className="text-2xl font-bold text-green-600 mt-2">

              {formatoMoneda(
                prestamoActivo?.capital_pagado
              )}

            </p>

          </div>


          {/* Saldo */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

            <p className="text-sm text-gray-500">

              Saldo pendiente

            </p>


            <p className="text-2xl font-bold text-red-600 mt-2">

              {formatoMoneda(
                prestamoActivo?.saldo_actual
              )}

            </p>

          </div>


          {/* Intereses */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

            <p className="text-sm text-gray-500">

              Intereses pagados

            </p>


            <p className="text-2xl font-bold text-blue-600 mt-2">

              {formatoMoneda(
                prestamoActivo?.intereses_pagados
              )}

            </p>

          </div>

        </div>


        {/* Botón */}

        <button
          type="button"
          onClick={
            nuevoPago
          }
          className="rounded-xl bg-blue-600 px-6 py-4 text-white font-medium shadow hover:bg-blue-700 transition"
        >

          + Nuevo pago

        </button>

      </div>


      {/* =================================
          INFORMACIÓN DEL PRÉSTAMO ACTIVO
      ================================= */}

      {prestamoActivo && (

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          <div className="flex flex-wrap items-center gap-6">


            <div>

              <p className="text-sm text-gray-500">

                Proyecto

              </p>


              <p className="font-semibold text-gray-800">

                {prestamoActivo.proyectos?.nombre ||
                  "Sin proyecto"}

              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">

                Tasa de interés

              </p>


              <p className="font-semibold text-gray-800">

                {prestamoActivo.tasa_interes ?? 0}%

              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">

                Tipo de interés

              </p>


              <p className="font-semibold text-gray-800">

                {prestamoActivo.tipo_interes ||
                  "—"}

              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">

                Plazo

              </p>


              <p className="font-semibold text-gray-800">

                {prestamoActivo.plazo_meses ?? 0}
                {" "}
                meses

              </p>

            </div>


            <div>

              <p className="text-sm text-gray-500">

                Estado

              </p>


              <p className="font-semibold text-green-600">

                🟢{" "}
                {prestamoActivo.estado}

              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================
          TABLA DE PAGOS
      ================================= */}

      <PagosPrestamoTable

        pagos={
          pagos
        }

        cargando={
          cargando
        }

        editar={
          editarPago
        }

        eliminar={
          eliminarPago
        }

      />


      {/* =================================
          MODAL
      ================================= */}

      <Modal

        abierto={
          abrirModal
        }

        cerrar={
          cerrarModal
        }

        titulo={
          editando
            ? "Editar pago"
            : "Nuevo pago"
        }

      >

        <PagoPrestamoForm

          prestamos={
            prestamos
          }

          prestamoId={
            prestamoId
          }

          setPrestamoId={
            setPrestamoId
          }

          seleccionarPrestamo={
            seleccionarPrestamo
          }

          saldoCalculo={
            saldoCalculo
          }

          tasaCalculo={
            tasaCalculo
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

          capital={
            capital
          }

          setCapital={
            setCapital
          }

          interes={
            interes
          }

          setInteres={
            setInteres
          }

          metodosPago={
            metodosPago
          }

          metodoPago={
            metodoPago
          }

          setMetodoPago={
            setMetodoPago
          }

          comprobante={
            comprobante
          }

          setComprobante={
            setComprobante
          }

          observacion={
            observacion
          }

          setObservacion={
            setObservacion
          }

          guardar={
            guardarPago
          }

          cancelar={() =>
            setAbrirModal(
              false
            )
          }

        />

      </Modal>


      {/* =================================
          CONFIRMACIÓN
      ================================= */}

      <ConfirmDialog

        abierto={
          abrirEliminar
        }

        titulo="Eliminar pago"

        mensaje="¿Está seguro de eliminar este pago? El saldo del préstamo será recalculado."

        confirmar={
          confirmarEliminarPago
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


export default PagosPrestamo;