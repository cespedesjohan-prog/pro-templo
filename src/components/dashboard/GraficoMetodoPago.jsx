import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

function GraficoMetodoPago({ data }) {

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-semibold mb-5">

        Aportes por método de pago

      </h2>

      <ResponsiveContainer width="100%" height={320}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label
          >

            {data.map((entry, index) => (

              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />

            ))}

          </Pie>

          <Tooltip
            formatter={(value) =>
              Number(value).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })
            }
          />

          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>

  );

}

export default GraficoMetodoPago;