function PagoPrestamoForm({

  // ======================================
  // PRÉSTAMOS
  // ======================================

  prestamos,

  prestamoId,
  seleccionarPrestamo,

  // ======================================
  // INFORMACIÓN DEL PRÉSTAMO
  // ======================================

  saldoCalculo,
  tasaCalculo,

  // ======================================
  // FECHA
  // ======================================

  fecha,
  setFecha,

  // ======================================
  // VALOR DEL PAGO
  // ======================================

  valor,
  setValor,

  // ======================================
  // DISTRIBUCIÓN
  // ======================================

  capital,
  interes,

  // ======================================
  // MÉTODOS DE PAGO
  // ======================================

  metodosPago,
  metodoPago,
  setMetodoPago,

  // ======================================
  // COMPROBANTE
  // ======================================

  comprobante,
  setComprobante,

  // ======================================
  // OBSERVACIÓN
  // ======================================

  observacion,
  setObservacion,

  // ======================================
  // ACCIONES
  // ======================================

  guardar,
  cancelar,

}) {

  // ==================================================
  // FORMATO DE MONEDA
  // ==================================================

  function formatoMoneda(
    cantidad
  ) {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(cantidad || 0)
    );

  }


  // ==================================================
  // CAMBIAR VALOR DEL PAGO
  // ==================================================

  function cambiarValor(e) {

    const nuevoValor =
      e.target.value;

    // Evitar valores negativos

    if (
      nuevoValor === "" ||
      Number(nuevoValor) >= 0
    ) {

      setValor(
        nuevoValor
      );

    }

  }


  // ==================================================
  // VALORES NUMÉRICOS
  // ==================================================

  const valorNumerico =
    Number(valor || 0);

  const capitalNumerico =
    Number(capital || 0);

  const interesNumerico =
    Number(interes || 0);

  const saldoNumerico =
    Number(saldoCalculo || 0);


  // ==================================================
  // SALDO DESPUÉS DEL PAGO
  //
  // El saldo del préstamo disminuye únicamente
  // con el CAPITAL aplicado.
  //
  // El interés NO reduce el saldo de capital.
  // ==================================================

  const saldoDespuesPago =
    Math.max(
      saldoNumerico -
      capitalNumerico,
      0
    );


  // ==================================================
  // VALIDAR FORMULARIO
  // ==================================================

  const formularioValido =
    Boolean(
      prestamoId &&
      fecha &&
      metodoPago &&
      valorNumerico > 0
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <form
      onSubmit={guardar}
      className="space-y-5"
    >

      {/* ==================================================
          PRÉSTAMO
      ================================================== */}

      <div>

        <label
          className="block font-medium mb-2"
        >
          Préstamo
        </label>

        <select

          value={
            prestamoId || ""
          }

          onChange={(e) =>
            seleccionarPrestamo(
              e.target.value
            )
          }

          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            bg-white
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "

          required

        >

          <option value="">
            Seleccione un préstamo...
          </option>

          {Array.isArray(
            prestamos
          ) &&
            prestamos.map(
              (prestamo) => (

                <option
                  key={
                    prestamo.id
                  }
                  value={
                    prestamo.id
                  }
                >

                  {prestamo.proyectos?.nombre ||
                    "Préstamo sin proyecto"}

                </option>

              )
            )}

        </select>

      </div>


      {/* ==================================================
          INFORMACIÓN DEL PRÉSTAMO
      ================================================== */}

      {prestamoId && (

        <div
          className="
            rounded-xl
            bg-gray-50
            border
            border-gray-200
            p-4
          "
        >

          <div
            className="
              text-sm
              font-medium
              text-gray-500
            "
          >
            Información del préstamo
          </div>


          <div
            className="
              mt-3
              space-y-2
              text-sm
            "
          >

            {/* SALDO */}

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span>
                Saldo pendiente
              </span>

              <strong>
                {formatoMoneda(
                  saldoNumerico
                )}
              </strong>

            </div>


            {/* TASA */}

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span>
                Tasa mensual
              </span>

              <strong>
                {tasaCalculo || 0}%
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          FECHA
      ================================================== */}

      <div>

        <label
          className="block font-medium mb-2"
        >
          Fecha
        </label>

        <input

          type="date"

          value={
            fecha || ""
          }

          onChange={(e) =>
            setFecha(
              e.target.value
            )
          }

          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "

          required

        />

      </div>


      {/* ==================================================
          VALOR TOTAL DEL PAGO
      ================================================== */}

      <div>

        <label
          className="
            block
            font-medium
            mb-2
          "
        >
          Valor total del pago
        </label>

        <input

          type="number"

          min="1"

          step="0.01"

          value={
            valor ?? ""
          }

          onChange={
            cambiarValor
          }

          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            font-semibold
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "

          placeholder="Ej: 3000000"

          required

        />

        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Ingrese el valor total que está pagando.
          El sistema distribuirá automáticamente
          el pago entre intereses y capital.
        </p>

      </div>


      {/* ==================================================
          DISTRIBUCIÓN DEL PAGO
      ================================================== */}

      {prestamoId &&
        valorNumerico > 0 && (

        <div
          className="
            rounded-xl
            bg-blue-50
            border
            border-blue-200
            p-4
          "
        >

          <div
            className="
              text-sm
              font-semibold
              text-blue-900
            "
          >
            Distribución del pago
          </div>


          <div
            className="
              mt-3
              space-y-3
            "
          >

            {/* ============================================
                INTERÉS
            ============================================ */}

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span
                className="
                  text-gray-600
                "
              >
                Interés aplicado
              </span>

              <strong
                className="
                  text-orange-600
                "
              >
                {formatoMoneda(
                  interesNumerico
                )}
              </strong>

            </div>


            {/* ============================================
                CAPITAL
            ============================================ */}

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span
                className="
                  text-gray-600
                "
              >
                Capital aplicado
              </span>

              <strong
                className="
                  text-blue-700
                "
              >
                {formatoMoneda(
                  capitalNumerico
                )}
              </strong>

            </div>


            {/* ============================================
                TOTAL
            ============================================ */}

            <div
              className="
                border-t
                border-blue-200
                pt-3
                flex
                justify-between
                gap-4
              "
            >

              <span
                className="
                  font-semibold
                "
              >
                Total del pago
              </span>

              <strong
                className="
                  text-lg
                  text-blue-800
                "
              >
                {formatoMoneda(
                  valorNumerico
                )}
              </strong>

            </div>


            {/* ============================================
                SALDO DESPUÉS DEL PAGO
            ============================================ */}

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span
                className="
                  text-gray-600
                "
              >
                Saldo después del pago
              </span>

              <strong
                className="
                  text-green-700
                "
              >
                {formatoMoneda(
                  saldoDespuesPago
                )}
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          AVISO SI EL PAGO SUPERA EL SALDO DE CAPITAL
      ================================================== */}

      {prestamoId &&
        valorNumerico > 0 &&
        capitalNumerico >
          saldoNumerico && (

        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            text-red-700
          "
        >

          El capital aplicado no puede superar
          el saldo pendiente del préstamo.

        </div>

      )}


      {/* ==================================================
          MÉTODO DE PAGO
      ================================================== */}

      <div>

        <label
          className="
            block
            font-medium
            mb-2
          "
        >
          Método de pago
        </label>

        <select

          value={
            metodoPago || ""
          }

          onChange={(e) =>
            setMetodoPago(
              e.target.value
            )
          }

          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            bg-white
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "

          required

        >

          <option value="">
            Seleccione un método
          </option>

          {Array.isArray(
            metodosPago
          ) &&
            metodosPago.map(
              (metodo) => (

                <option
                  key={
                    metodo.id
                  }
                  value={
                    metodo.id
                  }
                >
                  {metodo.nombre}
                </option>

              )
            )}

        </select>

      </div>


      {/* ==================================================
          COMPROBANTE
      ================================================== */}

      <div>

        <label
          className="
            block
            font-medium
            mb-2
          "
        >
          Comprobante
        </label>

        <input

          type="file"

          accept="
            .pdf,
            .jpg,
            .jpeg,
            .png
          "

          onChange={(e) => {

            const archivo =
              e.target.files?.[0] ||
              null;

            // ============================================
            // VALIDAR TAMAÑO
            // Máximo 5 MB
            // ============================================

            if (
              archivo &&
              archivo.size >
                5 * 1024 * 1024
            ) {

              alert(
                "El comprobante no puede superar los 5 MB."
              );

              e.target.value =
                "";

              setComprobante(
                null
              );

              return;

            }


            // ============================================
            // GUARDAR ARCHIVO
            // ============================================

            setComprobante(
              archivo
            );

          }}

          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            bg-white
          "

        />


        <p
          className="
            mt-2
            text-sm
            text-gray-500
          "
        >
          Formatos permitidos:
          PDF, JPG y PNG.
          Máximo 5 MB.
        </p>


        {comprobante && (

          <div
            className="
              mt-2
              rounded-lg
              border
              border-green-200
              bg-green-50
              p-3
            "
          >

            <p
              className="
                text-sm
                font-medium
                text-green-700
              "
            >
              Comprobante seleccionado
            </p>

            <p
              className="
                mt-1
                text-sm
                text-green-600
                break-all
              "
            >
              {comprobante.name}
            </p>

          </div>

        )}

      </div>


      {/* ==================================================
          OBSERVACIÓN
      ================================================== */}

      <div>

        <label
          className="
            block
            font-medium
            mb-2
          "
        >
          Observación
        </label>

        <textarea

          rows={3}

          value={
            observacion || ""
          }

          onChange={(e) =>
            setObservacion(
              e.target.value
            )
          }

          className="
            w-full
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "

          placeholder="Ej: Pago cuota 1"

        />

      </div>


      {/* ==================================================
          BOTONES
      ================================================== */}

      <div
        className="
          flex
          justify-end
          gap-3
          pt-4
        "
      >

        {/* CANCELAR */}

        <button

          type="button"

          onClick={
            cancelar
          }

          className="
            rounded-xl
            border
            border-gray-300
            px-6
            py-3
            hover:bg-gray-50
          "
        >
          Cancelar
        </button>


        {/* GUARDAR */}

        <button

          type="submit"

          disabled={
            !formularioValido ||
            capitalNumerico >
              saldoNumerico
          }

          className="
            rounded-xl
            bg-blue-600
            px-6
            py-3
            text-white
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Registrar pago
        </button>

      </div>

    </form>

  );

}


export default PagoPrestamoForm;