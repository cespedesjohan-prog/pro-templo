import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function GraficoAportesMes({ data }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">
        Aportes por mes
      </h2>

      <div className="w-full h-[240px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: -15,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fontSize: 12 }}
              width={40}
            />

            <Tooltip />

            <Bar
              dataKey="valor"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default GraficoAportesMes;