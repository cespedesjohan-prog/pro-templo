function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  confirmar,
  cancelar,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        <div className="p-6">

          <h2 className="text-2xl font-bold text-gray-800">
            {titulo}
          </h2>

          <p className="mt-4 text-gray-600">
            {mensaje}
          </p>

          <div className="flex justify-end gap-3 mt-8">

            <button
              onClick={cancelar}
              className="px-5 py-3 rounded-xl border"
            >
              Cancelar
            </button>

            <button
              onClick={confirmar}
              className="px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ConfirmDialog;