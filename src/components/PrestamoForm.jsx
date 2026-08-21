import { useEffect } from "react";

import { obtenerParametro } from "../services/parametrosService";

function PrestamoForm({

  proyecto,

  capital,
  setCapital,

  tasaInteres,
  setTasaInteres,

  tipoInteres,
  setTipoInteres,

  plazoMeses,
  setPlazoMeses,

  fechaInicio,
  setFechaInicio,

  cuotaCapital,
  setCuotaCapital,

  cuotaInteres,
  setCuotaInteres,

  estado,
  setEstado,

  guardar,
  cancelar,

}) {

  // ======================================
  // CARGAR PARÁMETROS FINANCIEROS
  // ======================================

  useEffect(() => {

    async function cargarParametros() {

      try {

        const [
          parametroCapital,
          parametroTasa,
          parametroPlazo,
          parametroCuotaCapital,
        ] = await Promise.all([

          obtenerParametro("MONTO_PRESTAMO"),

          obtenerParametro("TASA_INTERES"),

          obtenerParametro("PLAZO_MESES"),

          obtenerParametro("CAPITAL_MENSUAL"),

        ]);

        // ==================================
        // Capital
        // ==================================

        if (
          !capital &&
          parametroCapital?.valor
        ) {

          setCapital(
            parametroCapital.valor
          );

        }

        // ==================================
        // Tasa
        // ==================================

        if (
          !tasaInteres &&
          parametroTasa?.valor
        ) {

          setTasaInteres(
            parametroTasa.valor
          );

        }

        // ==================================
        // Plazo
        // ==================================

        if (
          !plazoMeses &&
          parametroPlazo?.valor
        ) {

          setPlazoMeses(
            parametroPlazo.valor
          );

        }

        // ==================================
        // Cuota capital
        // ==================================

        if (
          !cuotaCapital &&
          parametroCuotaCapital?.valor
        ) {

          setCuotaCapital(
            parametroCuotaCapital.valor
          );

        }

      } catch (error) {

        console.error(
          "Error cargando parámetros:",
          error
        );

      }

    }

    cargarParametros();

  }, []);


  // ======================================
  // CALCULAR INTERÉS AUTOMÁTICAMENTE
  // ======================================

  useEffect(() => {

    const capitalNumero =
      Number(capital || 0);

    const tasaNumero =
      Number(tasaInteres || 0);

    if (
      capitalNumero > 0 &&
      tasaNumero > 0
    ) {

      const interes =
        capitalNumero *
        tasaNumero /
        100;

      setCuotaInteres(
        Math.round(interes)
      );

    } else {

      setCuotaInteres(0);

    }

  }, [
    capital,
    tasaInteres,
    setCuotaInteres,
  ]);


  return (

    <form
      onSubmit={guardar}
      className="space-y-5"
    >

      {/* =====================================
          PROYECTO
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Proyecto
        </label>

        <input
          type="text"
          value={proyecto?.nombre || ""}
          disabled
          className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3"
        />

      </div>


      {/* =====================================
          CAPITAL
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Capital del préstamo
        </label>

        <input
          type="number"
          min="0"
          value={capital}
          onChange={(e) =>
            setCapital(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="100000000"
          required
        />

        <p className="mt-1 text-sm text-gray-500">
          Valor cargado desde los parámetros financieros.
        </p>

      </div>


      {/* =====================================
          TASA
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Tasa de interés (% mensual)
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={tasaInteres}
          onChange={(e) =>
            setTasaInteres(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="3"
          required
        />

        <p className="mt-1 text-sm text-gray-500">
          Parámetro TASA_INTERES.
        </p>

      </div>


      {/* =====================================
          TIPO DE INTERÉS
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Tipo de interés
        </label>

        <select
          value={tipoInteres}
          onChange={(e) =>
            setTipoInteres(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        >

          <option value="Mensual">
            Mensual
          </option>

          <option value="Anual">
            Anual
          </option>

        </select>

      </div>


      {/* =====================================
          PLAZO
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Plazo (meses)
        </label>

        <input
          type="number"
          min="1"
          value={plazoMeses}
          onChange={(e) =>
            setPlazoMeses(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="48"
          required
        />

        <p className="mt-1 text-sm text-gray-500">
          Parámetro PLAZO_MESES.
        </p>

      </div>


      {/* =====================================
          FECHA
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Fecha de inicio
        </label>

        <input
          type="date"
          value={fechaInicio}
          onChange={(e) =>
            setFechaInicio(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          required
        />

      </div>


      {/* =====================================
          CUOTA CAPITAL
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Cuota de capital
        </label>

        <input
          type="number"
          min="0"
          value={cuotaCapital}
          onChange={(e) =>
            setCuotaCapital(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="2000000"
        />

        <p className="mt-1 text-sm text-gray-500">
          Cargada desde CAPITAL_MENSUAL.
        </p>

      </div>


      {/* =====================================
          CUOTA INTERÉS
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Cuota de interés
        </label>

        <input
          type="number"
          min="0"
          value={cuotaInteres}
          readOnly
          className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700"
        />

        <p className="mt-1 text-sm text-gray-500">
          Se calcula automáticamente: capital × tasa.
        </p>

      </div>


      {/* =====================================
          RESUMEN
      ===================================== */}

      {Number(capital) > 0 && (
        
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

          <div className="text-sm font-semibold text-gray-600 mb-3">
            Resumen del préstamo
          </div>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">

              <span>
                Capital
              </span>

              <strong>
                $
                {Number(
                  capital
                ).toLocaleString("es-CO")}
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Tasa mensual
              </span>

              <strong>
                {tasaInteres}%
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Plazo
              </span>

              <strong>
                {plazoMeses} meses
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Cuota capital
              </span>

              <strong>
                $
                {Number(
                  cuotaCapital || 0
                ).toLocaleString("es-CO")}
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Interés inicial
              </span>

              <strong>
                $
                {Number(
                  cuotaInteres || 0
                ).toLocaleString("es-CO")}
              </strong>

            </div>

            <div className="border-t pt-2 flex justify-between text-base">

              <span className="font-semibold">
                Primera cuota estimada
              </span>

              <strong className="text-blue-700">

                $
                {(
                  Number(cuotaCapital || 0) +
                  Number(cuotaInteres || 0)
                ).toLocaleString("es-CO")}

              </strong>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          ESTADO
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Estado
        </label>

        <select
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        >

          <option value="Activo">
            Activo
          </option>

          <option value="Finalizado">
            Finalizado
          </option>

        </select>

      </div>


      {/* =====================================
          BOTONES
      ===================================== */}

      <div className="flex justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={cancelar}
          className="rounded-xl border px-6 py-3"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Guardar préstamo
        </button>

      </div>

    </form>

  );

}

export default PrestamoForm;