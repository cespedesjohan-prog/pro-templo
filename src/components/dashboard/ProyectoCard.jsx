function ProyectoCard({

  proyecto,

  totalRecaudado,

}) {

  if (!proyecto) {

    return (

      <div className="bg-white rounded-2xl shadow p-8">

        <h2 className="text-2xl font-bold">

          Proyecto

        </h2>

        <p className="text-gray-500 mt-4">

          No existe un proyecto activo.

        </p>

      </div>

    );

  }

  const meta = Number(proyecto.meta || 0);

  const porcentaje =
    meta > 0
      ? (totalRecaudado / meta) * 100
      : 0;

  const restante =
    Math.max(meta - totalRecaudado, 0);

  return (

    <div className="bg-white rounded-2xl shadow p-8">

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-3xl font-bold">

            {proyecto.icono} {proyecto.nombre}

          </h2>

          <p className="text-gray-500 mt-2">

            {proyecto.descripcion}

          </p>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">

        <div>

          <p className="text-gray-500">

            Meta

          </p>

          <h3 className="text-2xl font-bold">

            {meta.toLocaleString(
              "es-CO",
              {
                style: "currency",
                currency: "COP",
              }
            )}

          </h3>

        </div>

        <div>

          <p className="text-gray-500">

            Recaudado

          </p>

          <h3 className="text-2xl font-bold text-green-600">

            {totalRecaudado.toLocaleString(
              "es-CO",
              {
                style: "currency",
                currency: "COP",
              }
            )}

          </h3>

        </div>

        <div>

          <p className="text-gray-500">

            Falta

          </p>

          <h3 className="text-2xl font-bold text-red-600">

            {restante.toLocaleString(
              "es-CO",
              {
                style: "currency",
                currency: "COP",
              }
            )}

          </h3>

        </div>

      </div>

      <div className="mt-8">

        <div className="h-5 bg-gray-200 rounded-full overflow-hidden">

          <div

            className="h-full bg-green-600"

            style={{

              width: `${Math.min(
                porcentaje,
                100
              )}%`

            }}

          />

        </div>

        <div className="mt-4 text-center">

          <span className="text-3xl font-bold">

            {porcentaje.toFixed(2)}%

          </span>

        </div>

      </div>

    </div>

  );

}

export default ProyectoCard;