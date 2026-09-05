import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function MiembrosIglesia() {
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ======================================
  // BUSCADOR
  // ======================================

  const [busqueda, setBusqueda] = useState("");

  // ======================================
  // FILTROS
  // ======================================

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [filtroCefi, setFiltroCefi] = useState("todos");
  const [filtroMinisterio, setFiltroMinisterio] = useState("todos");
  const [filtroCelula, setFiltroCelula] = useState("todos");

  // ======================================
  // CARGAR MIEMBROS
  // ======================================

  async function cargarMiembros() {
    setCargando(true);

    const { data, error } = await supabase
      .from("miembros")
      .select(`
        id,
        nombres,
        telefono_movil,
        correo_electronico,
        numero_identificacion,
        direccion,
        nivel_cefi,
        ministerio,
        celula,
        notas,
        estado,
        activo
      `)
      .order("nombres", { ascending: true });

    if (error) {
      console.error("Error cargando miembros:", error);
      setMiembros([]);
    } else {
      setMiembros(data || []);
    }

    setCargando(false);
  }

  // ======================================
  // CARGAR AL INICIAR
  // ======================================

  useEffect(() => {
    cargarMiembros();
  }, []);

  // ======================================
  // OPCIONES DE FILTROS
  // ======================================

  const opcionesCefi = [
    ...new Set(
      miembros
        .map((miembro) => miembro.nivel_cefi)
        .filter(Boolean)
    ),
  ].sort();

  const opcionesMinisterio = [
    ...new Set(
      miembros
        .map((miembro) => miembro.ministerio)
        .filter(Boolean)
    ),
  ].sort();

  const opcionesCelula = [
    ...new Set(
      miembros
        .map((miembro) => miembro.celula)
        .filter(Boolean)
    ),
  ].sort();

  // ======================================
  // FILTRAR MIEMBROS
  // ======================================

  const miembrosFiltrados = miembros.filter((miembro) => {
    const texto = busqueda.toLowerCase().trim();

    // --------------------------------------
    // BUSCADOR
    // --------------------------------------

    const coincideBusqueda =
      !texto ||
      miembro.nombres?.toLowerCase().includes(texto) ||
      miembro.telefono_movil?.toLowerCase().includes(texto) ||
      miembro.numero_identificacion?.toLowerCase().includes(texto) ||
      miembro.correo_electronico?.toLowerCase().includes(texto);

    // --------------------------------------
    // ESTADO BAUTISMO
    // --------------------------------------

    const coincideEstado =
      filtroEstado === "todos" ||
      miembro.estado === filtroEstado;

    // --------------------------------------
    // ACTIVO
    // --------------------------------------

    const coincideActivo =
      filtroActivo === "todos" ||
      (filtroActivo === "activos" && miembro.activo === true) ||
      (filtroActivo === "inactivos" && miembro.activo === false);

    // --------------------------------------
    // CEFI
    // --------------------------------------

    const coincideCefi =
      filtroCefi === "todos" ||
      miembro.nivel_cefi === filtroCefi;

    // --------------------------------------
    // MINISTERIO
    // --------------------------------------

    const coincideMinisterio =
      filtroMinisterio === "todos" ||
      miembro.ministerio === filtroMinisterio;

    // --------------------------------------
    // CÉLULA
    // --------------------------------------

    const coincideCelula =
      filtroCelula === "todos" ||
      miembro.celula === filtroCelula;

    // --------------------------------------
    // RESULTADO FINAL
    // --------------------------------------

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideActivo &&
      coincideCefi &&
      coincideMinisterio &&
      coincideCelula
    );
  });

  // ======================================
  // LIMPIAR FILTROS
  // ======================================

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroActivo("todos");
    setFiltroCefi("todos");
    setFiltroMinisterio("todos");
    setFiltroCelula("todos");
  }

  const hayFiltros =
    busqueda ||
    filtroEstado !== "todos" ||
    filtroActivo !== "todos" ||
    filtroCefi !== "todos" ||
    filtroMinisterio !== "todos" ||
    filtroCelula !== "todos";

  // ======================================
  // INTERFAZ
  // ======================================

  return (
    <div className="space-y-6">

      {/* ======================================
          ENCABEZADO
      ====================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">

        <p className="text-sm font-semibold text-blue-600">
          Gestión Iglesia
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Miembros
        </h1>

        <p className="mt-2 text-gray-500">
          Control y administración de los miembros de la iglesia.
        </p>

      </div>


      {/* ======================================
          CARGANDO
      ====================================== */}

      {cargando && (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-gray-500">
            Cargando miembros...
          </p>
        </div>
      )}


      {/* ======================================
          SIN REGISTROS
      ====================================== */}

      {!cargando && miembros.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow">

          <p className="font-semibold text-gray-700">
            No hay miembros registrados.
          </p>

        </div>
      )}


      {/* ======================================
          CONTENIDO
      ====================================== */}

      {!cargando && miembros.length > 0 && (

        <div className="space-y-4">

          {/* ==================================
              BUSCADOR Y FILTROS
          ================================== */}

          <div className="rounded-2xl bg-white p-5 shadow">

            {/* BUSCADOR */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Buscar miembro
              </label>

              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, teléfono, identificación o correo..."
                className="
                  w-full
                  rounded-xl
                  border border-gray-300
                  px-4 py-3
                  text-gray-800
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-200
                "
              />

            </div>


            {/* ==================================
                FILTROS
            ================================== */}

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

              {/* ESTADO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Estado
                </label>

                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-3
                    text-gray-800
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                  "
                >

                  <option value="todos">
                    Todos
                  </option>

                  <option value="Bautizado">
                    Bautizado
                  </option>

                  <option value="No bautizado">
                    No bautizado
                  </option>

                </select>

              </div>


              {/* ACTIVO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Activo
                </label>

                <select
                  value={filtroActivo}
                  onChange={(e) => setFiltroActivo(e.target.value)}
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-3
                    text-gray-800
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                  "
                >

                  <option value="todos">
                    Todos
                  </option>

                  <option value="activos">
                    Activos
                  </option>

                  <option value="inactivos">
                    Inactivos
                  </option>

                </select>

              </div>


              {/* CEFI */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  CEFI
                </label>

                <select
                  value={filtroCefi}
                  onChange={(e) => setFiltroCefi(e.target.value)}
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-3
                    text-gray-800
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                  "
                >

                  <option value="todos">
                    Todos
                  </option>

                  {opcionesCefi.map((cefi) => (
                    <option key={cefi} value={cefi}>
                      {cefi}
                    </option>
                  ))}

                </select>

              </div>


              {/* MINISTERIO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ministerio
                </label>

                <select
                  value={filtroMinisterio}
                  onChange={(e) =>
                    setFiltroMinisterio(e.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-3
                    text-gray-800
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                  "
                >

                  <option value="todos">
                    Todos
                  </option>

                  {opcionesMinisterio.map((ministerio) => (
                    <option
                      key={ministerio}
                      value={ministerio}
                    >
                      {ministerio}
                    </option>
                  ))}

                </select>

              </div>


              {/* CÉLULA */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Célula
                </label>

                <select
                  value={filtroCelula}
                  onChange={(e) =>
                    setFiltroCelula(e.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border border-gray-300
                    bg-white
                    px-4 py-3
                    text-gray-800
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-200
                  "
                >

                  <option value="todos">
                    Todas
                  </option>

                  {opcionesCelula.map((celula) => (
                    <option
                      key={celula}
                      value={celula}
                    >
                      {celula}
                    </option>
                  ))}

                </select>

              </div>

            </div>


            {/* ==================================
                CONTADOR Y LIMPIAR
            ================================== */}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

              <p className="text-sm text-gray-500">

                Mostrando{" "}

                <span className="font-semibold text-gray-800">
                  {miembrosFiltrados.length}
                </span>{" "}

                de{" "}

                <span className="font-semibold text-gray-800">
                  {miembros.length}
                </span>{" "}

                miembros

              </p>


              {hayFiltros && (

                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="
                    rounded-xl
                    bg-gray-100
                    px-4 py-2
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-200
                  "
                >
                  Limpiar filtros
                </button>

              )}

            </div>

          </div>


          {/* ==================================
              TABLA
          ================================== */}

          <div className="overflow-hidden rounded-2xl bg-white shadow">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                {/* ENCABEZADOS */}

                <thead className="bg-slate-900 text-white">

                  <tr>

                    <th className="p-4 text-left">
                      Miembro
                    </th>

                    <th className="p-4 text-left">
                      Identificación
                    </th>

                    <th className="p-4 text-left">
                      Dirección
                    </th>

                    <th className="p-4 text-left">
                      CEFI
                    </th>

                    <th className="p-4 text-left">
                      Ministerio
                    </th>

                    <th className="p-4 text-left">
                      Célula
                    </th>

                    <th className="p-4 text-center">
                      Estado
                    </th>

                    <th className="p-4 text-center">
                      Activo
                    </th>

                  </tr>

                </thead>


                {/* CUERPO */}

                <tbody>

                  {miembrosFiltrados.map((miembro) => (

                    <tr
                      key={miembro.id}
                      className="border-t hover:bg-gray-50"
                    >

                      {/* MIEMBRO */}

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex h-10 w-10
                              shrink-0
                              items-center justify-center
                              rounded-full
                              bg-blue-600
                              font-bold
                              text-white
                            "
                          >
                            {miembro.nombres
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>

                          <div>

                            <p className="font-semibold text-gray-800">
                              {miembro.nombres || "—"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {miembro.telefono_movil || "—"}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* IDENTIFICACIÓN */}

                      <td className="p-4">
                        {miembro.numero_identificacion || "—"}
                      </td>


                      {/* DIRECCIÓN */}

                      <td className="p-4">
                        {miembro.direccion || "—"}
                      </td>


                      {/* CEFI */}

                      <td className="p-4">

                        {miembro.nivel_cefi ? (

                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-blue-100
                              px-3 py-1
                              text-sm
                              font-semibold
                              text-blue-700
                            "
                          >
                            {miembro.nivel_cefi}
                          </span>

                        ) : (
                          "—"
                        )}

                      </td>


                      {/* MINISTERIO */}

                      <td className="p-4">
                        {miembro.ministerio || "—"}
                      </td>


                      {/* CÉLULA */}

                      <td className="p-4">
                        {miembro.celula || "—"}
                      </td>


                      {/* ESTADO */}

                      <td className="p-4 text-center">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3 py-1
                            text-sm
                            font-semibold

                            ${
                              miembro.estado === "Bautizado"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {miembro.estado || "No bautizado"}
                        </span>

                      </td>


                      {/* ACTIVO */}

                      <td className="p-4 text-center">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3 py-1
                            text-sm
                            font-semibold

                            ${
                              miembro.activo
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }
                          `}
                        >
                          {miembro.activo ? "Sí" : "No"}
                        </span>

                      </td>

                    </tr>

                  ))}


                  {/* SIN RESULTADOS */}

                  {miembrosFiltrados.length === 0 && (

                    <tr>

                      <td
                        colSpan="8"
                        className="p-10 text-center"
                      >

                        <p className="font-semibold text-gray-700">
                          No encontramos miembros
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Intenta cambiar los filtros o la búsqueda.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MiembrosIglesia;