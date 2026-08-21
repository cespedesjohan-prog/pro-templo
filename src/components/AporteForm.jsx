function AporteForm({

  proyectos,
  miembros,
  metodosPago,

  esMiembro,

  comprobante,
  setComprobante,

  subiendoComprobante,

  nombreMiembro,

  proyectoId,
  setProyectoId,

  miembroId,
  setMiembroId,

  fecha,
  setFecha,

  valor,
  setValor,

  metodoPago,
  setMetodoPago,

  observacion,
  setObservacion,

  guardar,
  cancelar,

}) {

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

        <select
          value={proyectoId}
          onChange={(e) =>
            setProyectoId(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          required
        >

          <option value="">
            Seleccione un proyecto
          </option>

          {proyectos?.map((proyecto) => (

            <option
              key={proyecto.id}
              value={proyecto.id}
            >
              {proyecto.nombre}
            </option>

          ))}

        </select>

      </div>


      {/* =====================================
          MIEMBRO
      ===================================== */}

      {esMiembro ? (

        /*
         * ====================================
         * MIEMBRO AUTENTICADO
         * ====================================
         *
         * No puede seleccionar otra persona.
         * El miembro_id se determina desde
         * AuthContext.
         */

        <div>

          <label className="block font-medium mb-2">
            Miembro
          </label>

          <div className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">

                {(
                  nombreMiembro ||
                  "M"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div>

                <p className="font-semibold text-gray-800">

                  {nombreMiembro ||
                    "Miembro asociado"}

                </p>

                <p className="text-xs text-gray-500">

                  Este aporte quedará registrado
                  a su nombre.

                </p>

              </div>

            </div>

          </div>

        </div>

      ) : (

        /*
         * ====================================
         * ADMINISTRADOR / TESORERO
         * ====================================
         */

        <div>

          <label className="block font-medium mb-2">
            Miembro
          </label>

          <select
            value={miembroId}
            onChange={(e) =>
              setMiembroId(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            required
          >

            <option value="">
              Seleccione un miembro
            </option>

            {miembros?.map((m) => (

              <option
                key={m.id}
                value={m.id}
              >
                {m.nombres}
              </option>

            ))}

          </select>

        </div>

      )}


      {/* =====================================
          FECHA
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Fecha
        </label>

        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          required
        />

      </div>


      {/* =====================================
          VALOR
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Valor del aporte
        </label>

        <input
          type="number"
          min="1"
          value={valor}
          onChange={(e) =>
            setValor(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="100000"
          required
        />

        <p className="mt-1 text-sm text-gray-500">
          Ingrese el valor que desea aportar.
        </p>

      </div>


      {/* =====================================
          MÉTODO DE PAGO
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Método de pago
        </label>

        <select
          value={metodoPago}
          onChange={(e) =>
            setMetodoPago(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          required
        >

          <option value="">
            Seleccione un método
          </option>

          {metodosPago?.map((metodo) => (

            <option
              key={metodo.id}
              value={metodo.id}
            >
              {metodo.nombre}
            </option>

          ))}

        </select>

      </div>
{/* =====================================
    COMPROBANTE DE TRANSFERENCIA
===================================== */}

{/* =====================================
    COMPROBANTE DE TRANSFERENCIA
===================================== */}

<div>

  <label className="block font-medium mb-2">
    Comprobante de transferencia
  </label>

  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => {

      const archivo =
        e.target.files?.[0] || null;

      setComprobante(archivo);

    }}
    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white"
    required={esMiembro}
  />

  <p className="mt-1 text-sm text-gray-500">
    PDF, JPG o PNG. Máximo 5 MB.
  </p>

  {comprobante && (

    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">

      <p className="text-sm font-medium text-green-700">
        📎 {comprobante.name}
      </p>

      <p className="mt-1 text-xs text-green-600">
        Comprobante seleccionado correctamente.
      </p>

    </div>

  )}

</div>
      {/* =====================================
          OBSERVACIÓN
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Observación
        </label>

        <textarea
          rows={3}
          value={observacion}
          onChange={(e) =>
            setObservacion(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="Observación del aporte..."
        />

      </div>


      {/* =====================================
          AVISO PARA MIEMBRO
      ===================================== */}

      {esMiembro && (

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

          <div className="flex gap-3">

            <div className="text-xl">
              🟡
            </div>

            <div>

              <p className="font-semibold text-yellow-800">
                Aporte pendiente de verificación
              </p>

              <p className="mt-1 text-sm text-yellow-700">
                Después de enviar el aporte,
                quedará pendiente de revisión
                por el Administrador o Tesorero.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          BOTONES
      ===================================== */}

      <div className="flex justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={cancelar}
          className="rounded-xl border px-6 py-3 hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >

          {esMiembro
            ? "Enviar aporte"
            : "Guardar"}

        </button>

      </div>

    </form>

  );

}

export default AporteForm;