import Card from "./Card";

function StatCard({

  title,

  value,

  icon,

  color = "blue",

  subtitle = "",

}) {

  const colors = {

    blue: "bg-blue-100 text-blue-600",

    green: "bg-green-100 text-green-600",

    red: "bg-red-100 text-red-600",

    yellow: "bg-yellow-100 text-yellow-600",

    purple: "bg-purple-100 text-purple-600",

    indigo: "bg-indigo-100 text-indigo-600",

  };

  return (

    <Card>

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">

            {title}

          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">

            {value}

          </h2>

          {subtitle && (

            <p className="mt-2 text-sm text-gray-500">

              {subtitle}

            </p>

          )}

        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colors[color]}`}
        >

          <span className="text-3xl">

            {icon}

          </span>

        </div>

      </div>

    </Card>

  );

}

export default StatCard;