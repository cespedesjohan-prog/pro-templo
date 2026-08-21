import Card from "./Card";

function ProgressCard({

  title,

  current,

  total,

  color = "blue",

}) {

  const porcentaje =
    total > 0
      ? Math.min((current / total) * 100, 100)
      : 0;

  const colors = {

    blue: "bg-blue-600",

    green: "bg-green-600",

    red: "bg-red-600",

    yellow: "bg-yellow-500",

    purple: "bg-purple-600",

  };

  return (

    <Card title={title}>

      <div className="space-y-4">

        <div className="flex justify-between text-sm">

          <span className="font-medium">

            ${current.toLocaleString("es-CO")}

          </span>

          <span>

            ${total.toLocaleString("es-CO")}

          </span>

        </div>

        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

          <div

            className={`h-full transition-all duration-700 ${colors[color]}`}

            style={{

              width: `${porcentaje}%`,

            }}

          />

        </div>

        <div className="text-center">

          <span className="text-2xl font-bold">

            {porcentaje.toFixed(2)}%

          </span>

        </div>

      </div>

    </Card>

  );

}

export default ProgressCard;