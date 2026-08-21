function TesoreriaForm({

  proyectos,

  fecha,
  setFecha,

  tipo,
  setTipo,

  categoria,
  setCategoria,

  valor,
  setValor,

  proyectoId,
  setProyectoId,

  descripcion,
  setDescripcion,

  guardar,
  cancelar,

}) {

  return (

    <form
      onSubmit={guardar}
      className="space-y-5"
    >

      {/* Fecha */}

      <div>

        <label className="block font-medium mb-2">

          Fecha

        </label>

        <input

          type="date"

          value={fecha}

          onChange={(e)=>setFecha(e.target.value)}

          className="w-full rounded-xl border border-gray-300 px-4 py-3"

          required

        />

      </div>

      {/* Tipo */}

      <div>

        <label className="block font-medium mb-2">

          Tipo

        </label>

        <select

          value={tipo}

          onChange={(e)=>setTipo(e.target.value)}

          className="w-full rounded-xl border border-gray-300 px-4 py-3"

        >

          <option value="Ingreso">

            Ingreso

          </option>

          <option value="Egreso">

            Egreso

          </option>

        </select>

      </div>

      {/* Categoría */}

      <div>

        <label className="block font-medium mb-2">

          Categoría

        </label>

        <input

          type="text"

          value={categoria}

          onChange={(e)=>setCategoria(e.target.value)}

          className="w-full rounded-xl border border-gray-300 px-4 py-3"

          placeholder="Ej: Aportes, Materiales..."

          required

        />

      </div>

      {/* Valor */}

      <div>

        <label className="block font-medium mb-2">

          Valor

        </label>

        <input

          type="number"

          value={valor}

          onChange={(e)=>setValor(e.target.value)}

          className="w-full rounded-xl border border-gray-300 px-4 py-3"

          required

        />

      </div>

      {/* Proyecto */}

      <div>

        <label className="block font-medium mb-2">

          Proyecto

        </label>

        <select

          value={proyectoId}

          onChange={(e)=>setProyectoId(e.target.value)}

          className="w-full rounded-xl border border-gray-300 px-4 py-3"

        >

          <option value="">

            Sin proyecto

          </option>

          {proyectos.map((p)=>(

            <option

              key={p.id}

              value={p.id}

            >

              {p.nombre}

            </option>

          ))}

        </select>

      </div>

      {/* Descripción */}

      <div>

        <label className="block font-medium mb-2">

          Descripción

        </label>

        <textarea

          rows={3}

          value={descripcion}

          onChange={(e)=>setDescripcion(e.target.value)}

          className="w-full rounded-xl border border-gray-300 px-4 py-3"

        />

      </div>

      {/* Botones */}

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

          Guardar

        </button>

      </div>

    </form>

  );

}

export default TesoreriaForm;