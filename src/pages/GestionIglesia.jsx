import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GestionIglesia() {
  const { perfil } = useAuth();
  const navigate = useNavigate();

  const [modalModulos, setModalModulos] = useState(false);

  const tarjetas = [
    {
      titulo: "Miembros",
      descripcion:
        "Información general, ministerial y formación de los miembros.",
      icono: "👥",
      ruta: "/gestion-iglesia/miembros",
    },
    {
      titulo: "Finanzas",
      descripcion:
        "Ingresos, egresos, balance y reportes de la iglesia.",
      icono: "💰",
      ruta: "/gestion-iglesia/finanzas",
    },
    {
      titulo: "Células",
      descripcion:
        "Células, líderes, integrantes y asistencia.",
      icono: "🏠",
      ruta: "/gestion-iglesia/celulas",
    },
    {
      titulo: "Ministerios",
      descripcion:
        "Ministerios, responsables e integrantes.",
      icono: "🤝",
      ruta: "/gestion-iglesia/ministerios",
    },
    {
      titulo: "CEFI",
      descripcion:
        "Formación, matrículas, notas, exámenes, quiz y asistencia.",
      icono: "🎓",
      ruta: "/gestion-iglesia/cefi",
    },
  ];

  function abrirModulo(ruta) {
    setModalModulos(false);
    navigate(ruta);
  }

  return (
    <div className="space-y-6">

      {/* =====================================
          ENCABEZADO
      ====================================== */}

      <div
        className="
          relative overflow-hidden
          rounded-3xl
          bg-slate-900
          p-6
          text-white
          shadow-xl
          sm:p-8
        "
      >

        <div className="relative z-10">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-300">
                ⛪ Gestión Iglesia
              </p>

              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
                Administración de la Iglesia
              </h1>

              <p className="mt-2 text-slate-300">
                Bienvenido, {perfil?.nombres || "Usuario"}.
              </p>

            </div>


            {/* BOTÓN CAMBIAR MÓDULO */}

            <button
              type="button"
              onClick={() => setModalModulos(true)}
              className="
                rounded-xl
                bg-white/10
                px-5
                py-3
                font-semibold
                text-white
                backdrop-blur
                transition
                hover:bg-white/20
              "
            >
              🔄 Cambiar módulo
            </button>

          </div>

        </div>

        {/* DECORACIÓN */}

        <div
          className="
            absolute
            -right-16
            -top-16
            h-48
            w-48
            rounded-full
            bg-blue-500/10
          "
        />

        <div
          className="
            absolute
            -bottom-20
            right-24
            h-40
            w-40
            rounded-full
            bg-purple-500/10
          "
        />

      </div>


      {/* =====================================
          MÓDULOS
      ====================================== */}

      <div>

        <div className="mb-5">

          <h2 className="text-xl font-bold text-slate-800">
            Módulos de Gestión Iglesia
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Selecciona el área que deseas administrar.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {tarjetas.map((tarjeta) => (

            <button
              key={tarjeta.ruta}
              type="button"
              onClick={() => abrirModulo(tarjeta.ruta)}
              className="
                group
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                text-left
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-blue-200
                hover:shadow-xl
              "
            >

              {/* ICONO */}

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  text-3xl
                  transition
                  group-hover:bg-blue-50
                "
              >
                {tarjeta.icono}
              </div>


              {/* TÍTULO */}

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                {tarjeta.titulo}
              </h2>


              {/* DESCRIPCIÓN */}

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                {tarjeta.descripcion}
              </p>


              {/* ACCIÓN */}

              <div
                className="
                  mt-5
                  font-semibold
                  text-blue-600
                  transition
                  group-hover:text-blue-700
                "
              >
                Abrir módulo →
              </div>

            </button>

          ))}

        </div>

      </div>


      {/* =====================================
          MODAL CAMBIAR MÓDULO
      ====================================== */}

      {modalModulos && (

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
            backdrop-blur-sm
          "
          onMouseDown={(e) => {

            if (e.target === e.currentTarget) {
              setModalModulos(false);
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
              sm:p-8
            "
          >

            {/* CABECERA MODAL */}

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-blue-600">
                  ICC PALABRA DE FE
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Cambiar módulo
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Selecciona el sistema que deseas utilizar.
                </p>

              </div>


              <button
                type="button"
                onClick={() => setModalModulos(false)}
                className="
                  rounded-full
                  p-2
                  text-xl
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
                aria-label="Cerrar"
              >
                ✕
              </button>

            </div>


            {/* OPCIONES */}

            <div className="mt-6 space-y-3">

              {/* ICC PALABRA DE FE */}

              <button
                type="button"
                onClick={() => abrirModulo("/")}
                className="
                  flex
                  w-full
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-slate-200
                  p-4
                  text-left
                  transition
                  hover:border-blue-300
                  hover:bg-blue-50
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-900
                    text-2xl
                  "
                >
                  🏦
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    ICC PALABRA DE FE
                  </p>

                  <p className="text-sm text-slate-500">
                    Finanzas, aportes, préstamos y proyectos.
                  </p>

                </div>

              </button>


              {/* GESTIÓN IGLESIA */}

              <button
                type="button"
                onClick={() => setModalModulos(false)}
                className="
                  flex
                  w-full
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-blue-200
                  bg-blue-50
                  p-4
                  text-left
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-2xl
                  "
                >
                  ⛪
                </div>

                <div>

                  <p className="font-bold text-slate-800">
                    Gestión Iglesia
                  </p>

                  <p className="text-sm text-slate-500">
                    Miembros, células, ministerios y CEFI.
                  </p>

                </div>

              </button>

            </div>


            {/* CANCELAR */}

            <button
              type="button"
              onClick={() => setModalModulos(false)}
              className="
                mt-6
                w-full
                rounded-xl
                border
                border-slate-200
                px-5
                py-3
                font-medium
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              Cerrar
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default GestionIglesia;