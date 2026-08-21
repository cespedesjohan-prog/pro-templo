import Card from "./Card";

function StatCard({ titulo, valor, icono, color }) {
  return (
    <Card>
      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-500 text-sm">
            {titulo}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {valor}
          </h2>

        </div>

        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl"
          style={{ background: color }}
        >
          {icono}
        </div>

      </div>
    </Card>
  );
}

export default StatCard;