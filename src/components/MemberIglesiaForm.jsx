function MemberForm({
  nombres,
  setNombres,

  telefonoMovil,
  setTelefonoMovil,

  correoElectronico,
  setCorreoElectronico,

  estado,
  setEstado,

  fechaNacimiento,
  setFechaNacimiento,

  numeroIdentificacion,
  setNumeroIdentificacion,

  direccion,
  setDireccion,

  nivelCefi,
  setNivelCefi,

  estadoCivil,
  setEstadoCivil,

  fechaBautismo,
  setFechaBautismo,

  ministerio,
  setMinisterio,

  celula,
  setCelula,

  liderCelula,
  setLiderCelula,

  observaciones,
  setObservaciones,

  activo,
  setActivo,

  editando,

  guardar,
  cancelar,
}) {
  return (
    <form
      onSubmit={guardar}
      className="space-y-5"
    >

      {/* =====================================
          INFORMACIÓN PERSONAL
      ====================================== */}

      <div>
        <label className="block font-medium mb-2">
          Nombre completo
        </label>

        <input
          type="text"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Johan Céspedes"
          required
        />
      </div>


      <div>
        <label className="block font-medium mb-2">
          Teléfono
        </label>

        <input
          type="text"
          value={telefonoMovil}
          onChange={(e) => setTelefonoMovil(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="3001234567"
        />
      </div>


      <div>
        <label className="block font-medium mb-2">
          Correo electrónico
        </label>

        <input
          type="email"
          value={correoElectronico}
          onChange={(e) => setCorreoElectronico(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="correo@gmail.com"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block font-medium mb-2">
            Fecha de nacimiento
          </label>

          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>


        <div>
          <label className="block font-medium mb-2">
            Número de identificación
          </label>

          <input
            type="text"
            value={numeroIdentificacion}
            onChange={(e) =>
              setNumeroIdentificacion(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Número de documento"
          />
        </div>

      </div>


      <div>
        <label className="block font-medium mb-2">
          Dirección
        </label>

        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Dirección de residencia"
        />
      </div>


      <div>
        <label className="block font-medium mb-2">
          Estado civil
        </label>

        <select
          value={estadoCivil}
          onChange={(e) => setEstadoCivil(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar</option>
          <option value="Soltero">Soltero</option>
          <option value="Casado">Casado</option>
          <option value="Unión libre">Unión libre</option>
          <option value="Divorciado">Divorciado</option>
          <option value="Viudo">Viudo</option>
        </select>
      </div>


      {/* =====================================
          INFORMACIÓN DE IGLESIA
      ====================================== */}

      <div className="border-t pt-5">

        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Información de Iglesia
        </h3>


        <div>
          <label className="block font-medium mb-2">
            Estado espiritual
          </label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="No bautizado">
              No bautizado
            </option>

            <option value="Bautizado">
              Bautizado
            </option>
          </select>
        </div>


        {estado === "Bautizado" && (
          <div className="mt-5">

            <label className="block font-medium mb-2">
              Fecha de bautismo
            </label>

            <input
              type="date"
              value={fechaBautismo}
              onChange={(e) => setFechaBautismo(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>
        )}


        <div className="mt-5">
          <label className="block font-medium mb-2">
            Ministerio
          </label>

          <input
            type="text"
            value={ministerio}
            onChange={(e) => setMinisterio(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Alabanza, Jóvenes, Evangelismo..."
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

          <div>
            <label className="block font-medium mb-2">
              Célula
            </label>

            <input
              type="text"
              value={celula}
              onChange={(e) => setCelula(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre o código de célula"
            />
          </div>


          <div>
            <label className="block font-medium mb-2">
              Líder de célula
            </label>

            <input
              type="text"
              value={liderCelula}
              onChange={(e) => setLiderCelula(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del líder"
            />
          </div>

        </div>


        <div className="mt-5">
          <label className="block font-medium mb-2">
            Nivel CEFI
          </label>

          <input
            type="text"
            value={nivelCefi}
            onChange={(e) => setNivelCefi(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Nivel 1"
          />
        </div>


        <div className="mt-5">
          <label className="block font-medium mb-2">
            Observaciones
          </label>

          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows="3"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Información adicional del miembro..."
          />
        </div>

      </div>


      {/* =====================================
          ESTADO DEL MIEMBRO
      ====================================== */}

      <div className="border-t pt-5">

        <label className="flex items-center gap-3 cursor-pointer">

          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-5 w-5"
          />

          <span className="font-medium">
            Miembro activo
          </span>

        </label>

        <p className="text-xs text-gray-500 mt-1 ml-8">
          Permite identificar si el miembro continúa activo en la iglesia.
        </p>

      </div>


      {/* =====================================
          BOTONES
      ====================================== */}

      <div className="flex justify-end gap-3 pt-5">

        <button
          type="button"
          onClick={cancelar}
          className="rounded-xl border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Cancelar
        </button>


        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
        >
          {editando
            ? "Actualizar miembro"
            : "Crear miembro"}
        </button>

      </div>

    </form>
  );
}

export default MemberForm;