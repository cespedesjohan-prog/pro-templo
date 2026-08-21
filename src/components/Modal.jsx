function Modal({
  abierto,
  cerrar,
  titulo,
  children,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-8 py-6">

          <h2 className="text-3xl font-bold">
            {titulo}
          </h2>

          <button
            onClick={cerrar}
            className="text-4xl leading-none hover:text-red-500"
          >
            ×
          </button>

        </div>

        {/* Body */}

        <div className="p-8">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Modal;