function Notificaciones({ dashboard }) {

  const mensajes = [];

  if (dashboard.totalAportes > 0) {

    mensajes.push({
      tipo: "success",
      texto: `Hoy se han registrado ${dashboard.totalAportes} aportes.`,
    });

  } else {

    mensajes.push({
      tipo: "warning",
      texto: "Hoy no existen aportes registrados.",
    });

  }

  if (dashboard.proyecto) {

    mensajes.push({
      tipo: "info",
      texto: `Proyecto activo: ${dashboard.proyecto.nombre}.`,
    });

  } else {

    mensajes.push({
      tipo: "danger",
      texto: "No existe un proyecto activo.",
    });

  }

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-semibold mb-5">

        🔔 Notificaciones

      </h2>

      <div className="space-y-3">

        {mensajes.map((mensaje, index) => (

          <div
            key={index}
            className="rounded-lg border p-4 bg-gray-50"
          >

            {mensaje.texto}

          </div>

        ))}

      </div>

    </div>

  );

}

export default Notificaciones;