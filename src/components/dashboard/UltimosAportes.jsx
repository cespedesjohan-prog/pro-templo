function UltimosAportes({ aportes }) {

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-semibold mb-5">

        Últimos aportes

      </h2>

      {aportes.length === 0 ? (

        <p className="text-gray-500">

          No existen aportes registrados.

        </p>

      ) : (

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-3">

                Fecha

              </th>

              <th className="text-left py-3">

                Miembro

              </th>

              <th className="text-right py-3">

                Valor

              </th>

            </tr>

          </thead>

          <tbody>

            {aportes.map((aporte) => (

              <tr
                key={aporte.id}
                className="border-b last:border-0"
              >

                <td className="py-3">

                  {aporte.fecha}

                </td>

                <td className="py-3">

                  {aporte.miembros?.nombres}

                </td>

                <td className="py-3 text-right font-semibold">

                  {Number(aporte.valor).toLocaleString(
                    "es-CO",
                    {
                      style: "currency",
                      currency: "COP",
                    }
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}

export default UltimosAportes;