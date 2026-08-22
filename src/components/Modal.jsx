function Modal({
  abierto,
  cerrar,
  titulo,
  children,
}) {

  if (!abierto) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-3
        sm:p-4
      "
    >

      <div
        className="
          flex
          w-full
          max-w-2xl
          max-h-[95vh]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* =========================
            HEADER
        ========================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            px-5
            py-4
            sm:px-8
            sm:py-6
          "
        >

          <h2
            className="
              min-w-0
              text-xl
              font-bold
              sm:text-2xl
              lg:text-3xl
            "
          >
            {titulo}
          </h2>

          <button
            type="button"
            onClick={cerrar}
            className="
              shrink-0
              rounded-lg
              px-2
              text-3xl
              leading-none
              text-gray-500
              hover:bg-gray-100
              hover:text-red-500
              sm:text-4xl
            "
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>


        {/* =========================
            BODY
        ========================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            p-5
            sm:p-6
            lg:p-8
          "
        >

          {children}

        </div>

      </div>

    </div>

  );
}

export default Modal;