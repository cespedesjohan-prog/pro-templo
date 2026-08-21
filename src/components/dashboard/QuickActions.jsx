import { useNavigate } from "react-router-dom";

function QuickActions() {

  const navigate = useNavigate();

  const acciones = [

    {
      titulo: "Nuevo aporte",
      icono: "💰",
      ruta: "/aportes",
      color: "bg-green-500",
      abrirModal: true,
    },

    {
      titulo: "Nuevo miembro",
      icono: "👤",
      ruta: "/miembros",
      color: "bg-blue-500",
      abrirModal: true,
    },

    {
      titulo: "Proyectos",
      icono: "🏗️",
      ruta: "/proyectos",
      color: "bg-yellow-500",
      abrirModal: false,
    },

    {
      titulo: "Pagos préstamo",
      icono: "🏦",
      ruta: "/pagos-prestamo",
      color: "bg-red-500",
      abrirModal: true,
    },

  ];

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-semibold mb-5">
        Acciones rápidas
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {acciones.map((accion) => (

          <button
            key={accion.titulo}

            onClick={() =>
              navigate(accion.ruta, {
                state: {
                  abrirModal: accion.abrirModal,
                },
              })
            }

            className={`${accion.color} rounded-xl text-white p-6 hover:scale-105 transition-all`}
          >

            <div className="text-4xl">
              {accion.icono}
            </div>

            <div className="mt-3 font-semibold">
              {accion.titulo}
            </div>

          </button>

        ))}

      </div>

    </div>

  );

}

export default QuickActions;