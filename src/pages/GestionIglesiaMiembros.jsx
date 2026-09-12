import { useEffect, useState } from "react";

import {
  obtenerMiembros,
  crearMiembro,
  actualizarMiembro,
  eliminarMiembro,
} from "../services/miembrosService";

function GestionIglesiaMiembros() {

  // ======================================
  // ESTADO
  // ======================================

  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);

  // ======================================
  // FORMULARIO
  // ======================================

  const [nombres, setNombres] = useState("");
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefonoMovil, setTelefonoMovil] = useState("");
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [direccion, setDireccion] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");

  const [estado, setEstado] = useState("No bautizado");
  const [fechaBautismo, setFechaBautismo] = useState("");

  const [nivelCefi, setNivelCefi] = useState("");
  const [ministerio, setMinisterio] = useState("");
  const [celula, setCelula] = useState("");
  const [liderCelula, setLiderCelula] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [activo, setActivo] = useState(true);


  // ======================================
  // CARGAR MIEMBROS
  // ======================================

  async function cargarMiembros() {

    try {

      setCargando(true);
      setError("");

      const data = await obtenerMiembros();

      setMiembros(data || []);

    } catch (err) {

      console.error(err);

      setError(
        err?.message ||
        "No fue posible cargar los miembros."
      );

    } finally {

      setCargando(false);

    }

  }


  useEffect(() => {

    cargarMiembros();

  }, []);


  // ======================================
  // LIMPIAR FORMULARIO
  // ======================================

  function limpiarFormulario() {

    setNombres("");
    setNumeroIdentificacion("");
    setFechaNacimiento("");
    setTelefonoMovil("");
    setCorreoElectronico("");
    setDireccion("");
    setEstadoCivil("");

    setEstado("No bautizado");
    setFechaBautismo("");

    setNivelCefi("");
    setMinisterio("");
    setCelula("");
    setLiderCelula("");
    setObservaciones("");

    setActivo(true);

    setEditando(null);

  }


  // ======================================
  // ABRIR NUEVO
  // ======================================

  function abrirNuevo() {

    limpiarFormulario();

    setModalAbierto(true);

  }


  // ======================================
  // ABRIR EDICIÓN
  // ======================================

  function abrirEditar(miembro) {

    setEditando(miembro);

    setNombres(miembro.nombres || "");
    setNumeroIdentificacion(
      miembro.numero_identificacion || ""
    );

    setFechaNacimiento(
      miembro.fecha_nacimiento || ""
    );

    setTelefonoMovil(
      miembro.telefono_movil || ""
    );

    setCorreoElectronico(
      miembro.correo_electronico || ""
    );

    setDireccion(
      miembro.direccion || ""
    );

    setEstadoCivil(
      miembro.estado_civil || ""
    );

    setEstado(
      miembro.estado || "No bautizado"
    );

    setFechaBautismo(
      miembro.fecha_bautismo || ""
    );

    setNivelCefi(
      miembro.nivel_cefi || ""
    );

    setMinisterio(
      miembro.ministerio || ""
    );

    setCelula(
      miembro.celula || ""
    );

    setLiderCelula(
      miembro.lider_celula || ""
    );

    setObservaciones(
      miembro.observaciones || ""
    );

    setActivo(
      miembro.activo ?? true
    );

    setModalAbierto(true);

  }


  // ======================================
  // GUARDAR
  // ======================================

  async function guardar(e) {

    e.preventDefault();

    try {

      setError("");

      const datos = {

        nombres:
          nombres.trim(),

        numero_identificacion:
          numeroIdentificacion.trim() || null,

        fecha_nacimiento:
          fechaNacimiento || null,

        telefono_movil:
          telefonoMovil.trim() || null,

        correo_electronico:
          correoElectronico.trim() || null,

        direccion:
          direccion.trim() || null,

        estado_civil:
          estadoCivil || null,

        estado,

        fecha_bautismo:
          estado === "Bautizado"
            ? fechaBautismo || null
            : null,

        nivel_cefi:
          nivelCefi || null,

        ministerio:
          ministerio.trim() || null,

        celula:
          celula.trim() || null,

        lider_celula:
          liderCelula.trim() || null,

        observaciones:
          observaciones.trim() || null,

        activo,

      };


      if (editando) {

        await actualizarMiembro(
          editando.id,
          datos
        );

      } else {

        await crearMiembro(datos);

      }


      setModalAbierto(false);

      limpiarFormulario();

      await cargarMiembros();

    } catch (err) {

      console.error(err);

      setError(
        err?.message ||
        "No fue posible guardar el miembro."
      );

    }

  }


  // ======================================
  // ELIMINAR
  // ======================================

  async function eliminar(id) {

    const confirmar =
      window.confirm(
        "¿Seguro que deseas eliminar este miembro?"
      );

    if (!confirmar) return;

    try {

      setError("");

      await eliminarMiembro(id);

      await cargarMiembros();

    } catch (err) {

      console.error(err);

      setError(
        err?.message ||
        "No fue posible eliminar el miembro."
      );

    }

  }


  // ======================================
  // FILTRAR
  // ======================================

  const miembrosFiltrados =
    miembros.filter((miembro) => {

      const texto =
        busqueda
          .toLowerCase()
          .trim();

      if (!texto) return true;

      return (

        miembro.nombres
          ?.toLowerCase()
          .includes(texto)

        ||

        miembro.numero_identificacion
          ?.toLowerCase()
          .includes(texto)

        ||

        miembro.telefono_movil
          ?.toLowerCase()
          .includes(texto)

        ||

        miembro.correo_electronico
          ?.toLowerCase()
          .includes(texto)

      );

    });


  // ======================================
  // RENDER
  // ======================================

  return (

    <div className="space-y-6">


      {/* ==================================
          ENCABEZADO
      ================================== */}

      <div className="
        rounded-2xl
        bg-slate-900
        p-6
        text-white
        shadow
      ">

        <div className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <p className="text-sm text-slate-300">
              Gestión Iglesia
            </p>

            <h1 className="
              mt-1
              text-3xl
              font-bold
            ">
              Miembros
            </h1>

            <p className="
              mt-2
              text-slate-300
            ">
              Control y administración de los miembros de la iglesia.
            </p>

          </div>


          <button
            type="button"
            onClick={abrirNuevo}
            className="
              rounded-xl
              bg-blue-600
              px-5
              py-3
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            + Nuevo miembro
          </button>

        </div>

      </div>


      {/* ==================================
          ERROR
      ================================== */}

      {error && (

        <div className="
          rounded-xl
          border
          border-red-200
          bg-red-50
          p-4
          text-sm
          text-red-700
        ">
          {error}
        </div>

      )}


      {/* ==================================
          LISTADO
      ================================== */}

      <div className="
        rounded-2xl
        bg-white
        p-5
        shadow
      ">

        <div className="
          mb-5
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <h2 className="
              text-xl
              font-bold
              text-slate-800
            ">
              Miembros registrados
            </h2>

            <p className="
              text-sm
              text-gray-500
            ">
              {miembros.length} registrados
            </p>

          </div>


          <input
            type="search"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            placeholder="Buscar miembro..."
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
              sm:w-80
            "
          />

        </div>


        {/* ==================================
            CARGANDO
        ================================== */}

        {cargando ? (

          <div className="
            py-12
            text-center
            text-gray-500
          ">
            Cargando miembros...
          </div>

        ) : miembrosFiltrados.length === 0 ? (

          <div className="
            rounded-xl
            bg-gray-50
            py-12
            text-center
          ">

            <div className="text-4xl">
              👥
            </div>

            <p className="
              mt-3
              font-semibold
              text-gray-700
            ">
              No hay miembros registrados
            </p>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              Puedes agregar el primer miembro.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="
              w-full
              min-w-[850px]
            ">

              <thead>

                <tr className="
                  border-b
                  border-gray-200
                  text-left
                  text-sm
                  text-gray-500
                ">

                  <th className="px-4 py-3">
                    Miembro
                  </th>

                  <th className="px-4 py-3">
                    Teléfono
                  </th>

                  <th className="px-4 py-3">
                    Estado
                  </th>

                  <th className="px-4 py-3">
                    CEFI
                  </th>

                  <th className="px-4 py-3">
                    Ministerio
                  </th>

                  <th className="px-4 py-3">
                    Activo
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-right
                  ">
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {miembrosFiltrados.map(
                  (miembro) => (

                    <tr
                      key={miembro.id}
                      className="
                        border-b
                        border-gray-100
                        hover:bg-gray-50
                      "
                    >

                      <td className="
                        px-4
                        py-4
                      ">

                        <p className="
                          font-semibold
                          text-slate-800
                        ">
                          {miembro.nombres}
                        </p>

                        <p className="
                          mt-1
                          text-xs
                          text-gray-500
                        ">
                          {miembro.numero_identificacion || "Sin identificación"}
                        </p>

                      </td>


                      <td className="
                        px-4
                        py-4
                        text-gray-600
                      ">
                        {miembro.telefono_movil || "-"}
                      </td>


                      <td className="
                        px-4
                        py-4
                      ">

                        <span className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold

                          ${
                            miembro.estado === "Bautizado"

                              ? "bg-green-100 text-green-700"

                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}>
                          {miembro.estado || "No bautizado"}
                        </span>

                      </td>


                      <td className="
                        px-4
                        py-4
                        text-gray-600
                      ">
                        {miembro.nivel_cefi || "-"}
                      </td>


                      <td className="
                        px-4
                        py-4
                        text-gray-600
                      ">
                        {miembro.ministerio || "-"}
                      </td>


                      <td className="
                        px-4
                        py-4
                      ">

                        <span className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold

                          ${
                            miembro.activo
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}>
                          {miembro.activo
                            ? "Sí"
                            : "No"}
                        </span>

                      </td>


                      <td className="
                        px-4
                        py-4
                      ">

                        <div className="
                          flex
                          justify-end
                          gap-2
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              abrirEditar(miembro)
                            }
                            className="
                              rounded-lg
                              bg-blue-50
                              px-3
                              py-2
                              text-sm
                              font-semibold
                              text-blue-600
                              hover:bg-blue-100
                            "
                          >
                            Editar
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              eliminar(miembro.id)
                            }
                            className="
                              rounded-lg
                              bg-red-50
                              px-3
                              py-2
                              text-sm
                              font-semibold
                              text-red-600
                              hover:bg-red-100
                            "
                          >
                            Eliminar
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

      {modalAbierto && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setModalAbierto(false);
            }

          }}
        >

          <div className="
            max-h-[92vh]
            w-full
            max-w-2xl
            overflow-y-auto
            rounded-3xl
            bg-white
            p-6
            shadow-2xl
          ">


            {/* ==================================
                CABECERA MODAL
            ================================== */}

            <div className="
              mb-6
              flex
              items-center
              justify-between
            ">

              <div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-slate-800
                ">
                  {editando
                    ? "Editar miembro"
                    : "Nuevo miembro"}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Registra la información del miembro.
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setModalAbierto(false);
                  limpiarFormulario();
                }}
                className="
                  rounded-lg
                  p-2
                  text-xl
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={guardar}
              className="space-y-7"
            >


              {/* ==================================
                  INFORMACIÓN PERSONAL
              ================================== */}

              <section>

                <h3 className="
                  mb-4
                  border-b
                  pb-2
                  text-lg
                  font-bold
                  text-slate-800
                ">
                  Información personal
                </h3>


                <div className="
                  grid
                  gap-5
                  sm:grid-cols-2
                ">


                  <div className="sm:col-span-2">

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Nombres completos *
                    </label>

                    <input
                      type="text"
                      value={nombres}
                      onChange={(e) =>
                        setNombres(
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


                  <div>

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Número de identificación
                    </label>

                    <input
                      type="text"
                      value={
                        numeroIdentificacion
                      }
                      onChange={(e) =>
                        setNumeroIdentificacion(
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
                    />

                  </div>


                  <div>

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Fecha de nacimiento
                    </label>

                    <input
                      type="date"
                      value={
                        fechaNacimiento
                      }
                      onChange={(e) =>
                        setFechaNacimiento(
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
                    />

                  </div>


                  <div>

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Teléfono móvil
                    </label>

                    <input
                      type="text"
                      value={
                        telefonoMovil
                      }
                      onChange={(e) =>
                        setTelefonoMovil(
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
                    />

                  </div>


                  <div>

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Correo electrónico
                    </label>

                    <input
                      type="email"
                      value={
                        correoElectronico
                      }
                      onChange={(e) =>
                        setCorreoElectronico(
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
                    />

                  </div>


                  <div>

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Estado civil
                    </label>

                    <select
                      value={estadoCivil}
                      onChange={(e) =>
                        setEstadoCivil(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        bg-white
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    >

                      <option value="">
                        Seleccionar
                      </option>

                      <option value="Soltero">
                        Soltero
                      </option>

                      <option value="Casado">
                        Casado
                      </option>

                      <option value="Unión libre">
                        Unión libre
                      </option>

                      <option value="Separado">
                        Separado
                      </option>

                      <option value="Divorciado">
                        Divorciado
                      </option>

                      <option value="Viudo">
                        Viudo
                      </option>

                    </select>

                  </div>


                  <div className="sm:col-span-2">

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Dirección
                    </label>

                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) =>
                        setDireccion(
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
                    />

                  </div>

                </div>

              </section>


              {/* ==================================
                  INFORMACIÓN ESPIRITUAL
              ================================== */}

              <section>

                <h3 className="
                  mb-4
                  border-b
                  pb-2
                  text-lg
                  font-bold
                  text-slate-800
                ">
                  Información espiritual
                </h3>


                <div className="
                  grid
                  gap-5
                  sm:grid-cols-2
                ">


                  <div>

                    <label className="
                      mb-2
                      block
                      font-medium
                    ">
                      Estado de bautismo
                    </label>

                    <select
                      value={estado}
                      onChange={(e) => {

                        setEstado(
                          e.target.value
                        );

                        if (
                          e.target.value !==
                          "Bautizado"
                        ) {
                          setFechaBautismo("");
                        }

                      }}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-300
                        bg-white
                        px-4
                        py-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
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

                    <div>

                      <label className="
                        mb-2
                        block
                        font-medium
                      ">
                        Fecha de bautismo
                      </label>

                      <input
                        type="date"
                        value={
                          fechaBautismo
                        }
                        onChange={(e) =>
                          setFechaBautismo(
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
                      />

                    </div>

                  )}

                </div>

              </section>


              {/* ==================================
                  OBSERVACIONES
              ================================== */}

              <section>

                <h3 className="
                  mb-4
                  border-b
                  pb-2
                  text-lg
                  font-bold
                  text-slate-800
                ">
                  Observaciones
                </h3>

                <textarea
                  value={
                    observaciones
                  }
                  onChange={(e) =>
                    setObservaciones(
                      e.target.value
                    )
                  }
                  rows="4"
                  placeholder="Notas adicionales sobre el miembro..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </section>


              {/* ==================================
                  ESTADO DEL REGISTRO
              ================================== */}

              <label className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-gray-50
                p-4
              ">

                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) =>
                    setActivo(
                      e.target.checked
                    )
                  }
                  className="
                    h-5
                    w-5
                  "
                />

                <div>

                  <p className="
                    font-semibold
                    text-gray-800
                  ">
                    Registro activo
                  </p>

                  <p className="
                    text-xs
                    text-gray-500
                  ">
                    Permite conservar el registro sin eliminarlo.
                  </p>

                </div>

              </label>


              {/* ==================================
                  BOTONES
              ================================== */}

              <div className="
                flex
                justify-end
                gap-3
                border-t
                pt-5
              ">

                <button
                  type="button"
                  onClick={() => {

                    setModalAbierto(false);
                    limpiarFormulario();

                  }}
                  className="
                    rounded-xl
                    border
                    border-gray-300
                    px-5
                    py-3
                    font-medium
                    hover:bg-gray-50
                  "
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    font-semibold
                    text-white
                    hover:bg-blue-700
                  "
                >
                  {editando
                    ? "Actualizar miembro"
                    : "Guardar miembro"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}

export default GestionIglesiaMiembros;
