function Card({

  children,

  title,

  subtitle,

  className = "",

}) {

  return (

    <div
      className={`
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-gray-200
        p-6
        transition-all
        duration-300
        hover:shadow-lg
        ${className}
      `}
    >

      {(title || subtitle) && (

        <div className="mb-5">

          {title && (

            <h2 className="text-xl font-bold text-gray-800">

              {title}

            </h2>

          )}

          {subtitle && (

            <p className="mt-1 text-sm text-gray-500">

              {subtitle}

            </p>

          )}

        </div>

      )}

      {children}

    </div>

  );

}

export default Card;