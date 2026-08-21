function ProyectoForm({

  nombre,
  setNombre,

  descripcion,
  setDescripcion,

  fechaInicio,
  setFechaInicio,

  fechaFin,
  setFechaFin,

  meta,
  setMeta,

  presupuesto,
  setPresupuesto,

  estado,
  setEstado,

  guardar,
  cancelar,

}) {

  function formatoMoneda(valor) {

    if (!valor) {
      return "";
    }

    return Number(valor).toLocaleString(
      "es-CO"
    );

  }

  return (

    <form
      onSubmit={guardar}
      className="space-y-5"
    >

      {/* =====================================
          Nombre
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Nombre del proyecto
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="Construcción del templo"
          required
        />

      </div>


      {/* =====================================
          Descripción
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Descripción
        </label>

        <textarea
          rows={4}
          value={descripcion}
          onChange={(e) =>
            setDescripcion(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="Descripción del proyecto"
        />

      </div>


      {/* =====================================
          Meta
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Meta de recaudo
        </label>

        <input
          type="number"
          min="0"
          value={meta}
          onChange={(e) =>
            setMeta(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="10000000"
        />

        <p className="mt-1 text-sm text-gray-500">
          Valor que se espera recaudar para el proyecto.
        </p>

      </div>


      {/* =====================================
          Presupuesto
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Presupuesto
        </label>

        <input
          type="number"
          min="0"
          value={presupuesto}
          onChange={(e) =>
            setPresupuesto(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          placeholder="15000000"
        />

        <p className="mt-1 text-sm text-gray-500">
          Presupuesto estimado del proyecto.
        </p>

      </div>


      {/* =====================================
          Fecha Inicio
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Fecha inicio
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
          Fecha Fin
      ===================================== */}

      <div>

        <label className="block font-medium mb-2">
          Fecha fin
        </label>

        <input
          type="date"
          value={fechaFin}
          onChange={(e) =>
            setFechaFin(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

      </div>


      {/* =====================================
          Estado
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

          <option value="Suspendido">
            Suspendido
          </option>

          <option value="Finalizado">
            Finalizado
          </option>

        </select>

      </div>


      {/* =====================================
          Botones
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
          Guardar
        </button>

      </div>

    </form>

  );

}

export default ProyectoForm;