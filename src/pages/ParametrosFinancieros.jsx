import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  obtenerParametros,
  actualizarParametro,
} from "../services/parametrosService";

function ParametrosFinancieros() {

  const [parametros, setParametros] = useState([]);

  async function cargarParametros() {

    try {

      const data = await obtenerParametros();

      setParametros(data);

    } catch (error) {

      console.error(error);

      toast.error("No fue posible cargar los parámetros.");

    }

  }

  useEffect(() => {

    cargarParametros();

  }, []);

  async function guardar(parametro) {

    try {

      await actualizarParametro(

        parametro.id,

        parametro.valor

      );

      toast.success("Parámetro actualizado.");

    } catch (error) {

      toast.error(error.message);

    }

  }

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-4xl font-bold">

          Parámetros Financieros

        </h1>

        <p className="text-gray-500">

          Configuración general del sistema.

        </p>

      </div>

      <div className="bg-white rounded-xl shadow">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="p-4 text-left">

                Código

              </th>

              <th className="p-4 text-left">

                Nombre

              </th>

              <th className="p-4 text-left">

                Valor

              </th>

              <th className="p-4">

                Acción

              </th>

            </tr>

          </thead>

          <tbody>

            {parametros.map((p) => (

              <tr key={p.id} className="border-b">

                <td className="p-4">

                  {p.codigo}

                </td>

                <td className="p-4">

                  {p.nombre}

                </td>

                <td className="p-4">

                  <input

                    value={p.valor}

                    onChange={(e) => {

                      setParametros((old) =>

                        old.map((item) =>

                          item.id === p.id

                            ? {

                                ...item,

                                valor: e.target.value,

                              }

                            : item

                        )

                      );

                    }}

                    className="border rounded-lg px-3 py-2 w-40"

                  />

                </td>

                <td className="p-4">

                  <button

                    onClick={() => guardar(p)}

                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"

                  >

                    Guardar

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default ParametrosFinancieros;