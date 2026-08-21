function MemberForm({
  nombre,
  setNombre,

  telefono,
  setTelefono,

  correo,
  setCorreo,

  meta,
  setMeta,

  activo,
  setActivo,

  password,
  setPassword,

  confirmarPassword,
  setConfirmarPassword,

  editando,

  guardar,
  cancelar,
}) {
  return (
    <form
      onSubmit={guardar}
      className="space-y-5"
    >

      {/* ============================
          Nombre
      ============================ */}

      <div>

        <label className="block font-medium mb-2">
          Nombre completo
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Johan Céspedes"
          required
        />

      </div>


      {/* ============================
          Teléfono
      ============================ */}

      <div>

        <label className="block font-medium mb-2">
          Teléfono
        </label>

        <input
          type="text"
          value={telefono}
          onChange={(e) =>
            setTelefono(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="3001234567"
          required
        />

      </div>


      {/* ============================
          Correo
      ============================ */}

      <div>

        <label className="block font-medium mb-2">
          Correo electrónico
        </label>

        <input
          type="email"
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="correo@gmail.com"
          required
        />

      </div>


      {/* ============================
          CONTRASEÑA
          Solo al crear
      ============================ */}

      {!editando && (

        <>
          <div>

            <label className="block font-medium mb-2">
              Contraseña de acceso
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              required
            />

            <p className="text-xs text-gray-500 mt-1">
              Esta será la contraseña que utilizará el miembro para ingresar.
            </p>

          </div>


          {/* ============================
              CONFIRMAR CONTRASEÑA
          ============================ */}

          <div>

            <label className="block font-medium mb-2">
              Confirmar contraseña
            </label>

            <input
              type="password"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repita la contraseña"
              autoComplete="new-password"
              required
            />

          </div>
        </>

      )}


      {/* ============================
          Compromiso
      ============================ */}

      <div>

        <label className="block font-medium mb-2">
          Compromiso mensual
        </label>

        <input
          type="number"
          value={meta}
          onChange={(e) =>
            setMeta(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="100000"
          min="0"
          required
        />

      </div>


      {/* ============================
          Estado
      ============================ */}

      <div className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={activo}
          onChange={(e) =>
            setActivo(e.target.checked)
          }
        />

        <span>
          Miembro activo
        </span>

      </div>


      {/* ============================
          BOTONES
      ============================ */}

      <div className="flex justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={cancelar}
          className="rounded-xl border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          {editando
            ? "Actualizar"
            : "Crear miembro"}
        </button>

      </div>

    </form>
  );
}

export default MemberForm;