import { useState } from "react";

function SystemSelector({ sistemaActual, cambiarSistema }) {
  const [abierto, setAbierto] = useState(false);

  const sistemas = [
    {
      id: "protemplo",
      nombre: "PRO TEMPLO",
      descripcion: "Gestión financiera",
      icono: "🏛️",
    },
    {
      id: "gestion-iglesia",
      nombre: "GESTIÓN IGLESIA",
      descripcion: "Administración integral de la iglesia",
      icono: "⛪",
    },
  ];

  const sistema = sistemas.find(
    (item) => item.id === sistemaActual
  ) || sistemas[0];

  function seleccionarSistema(id) {
    setAbierto(false);
    cambiarSistema(id);
  }

  return (
    <>
      {/* =====================================
          BOTÓN SISTEMA ACTUAL
      ====================================== */}

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="
          w-full
          rounded-2xl
          bg-slate-800
          p-4
          text-left
          transition
          hover:bg-slate-700
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700 text-2xl">
            {sistema.icono}
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Sistema actual
            </p>

            <p className="truncate text-base font-bold text-white">
              {sistema.nombre}
            </p>

            <p className="truncate text-xs text-slate-400">
              {sistema.descripcion}
            </p>

          </div>

          <div className="text-slate-400">
            ⇄
          </div>

        </div>
      </button>


      {/* =====================================
          MODAL
      ====================================== */}

      {abierto && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setAbierto(false);
            }
          }}
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-3xl
              bg-white
              p-6
              shadow-2xl
            "
          >

            {/* ENCABEZADO */}

            <div className="mb-6 flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-blue-600">
                  Selección de sistema
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  ¿Qué sistema deseas utilizar?
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Puedes cambiar de sistema sin cerrar tu sesión.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="
                  rounded-full
                  px-3
                  py-2
                  text-xl
                  text-slate-500
                  hover:bg-slate-100
                "
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>


            {/* SISTEMAS */}

            <div className="space-y-3">

              {sistemas.map((item) => {

                const seleccionado =
                  item.id === sistemaActual;

                return (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      seleccionarSistema(item.id)
                    }
                    className={`
                      w-full
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition
                      ${
                        seleccionado
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }
                    `}
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={`
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          text-3xl
                          ${
                            seleccionado
                              ? "bg-blue-600"
                              : "bg-slate-100"
                          }
                        `}
                      >
                        {item.icono}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2">

                          <h3 className="font-bold text-slate-900">
                            {item.nombre}
                          </h3>

                          {seleccionado && (

                            <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                              Actual
                            </span>

                          )}

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.descripcion}
                        </p>

                      </div>

                      <div className="text-xl text-slate-400">
                        →
                      </div>

                    </div>

                  </button>

                );
              })}

            </div>


            {/* PIE */}

            <div className="mt-6 flex justify-end">

              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="
                  rounded-xl
                  border
                  border-slate-300
                  px-5
                  py-2.5
                  font-medium
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                Cancelar
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default SystemSelector;