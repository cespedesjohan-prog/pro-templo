import useModal from "../hooks/useModal";

function ModalHost() {

  const { modal, closeModal } = useModal();

  if (!modal) return null;

  switch (modal.nombre) {

    case "aporte":
      return (
        <div>
          Aquí irá el formulario de Aportes
        </div>
      );

    case "miembro":
      return (
        <div>
          Aquí irá el formulario de Miembros
        </div>
      );

    case "prestamo":
      return (
        <div>
          Aquí irá el formulario del Pago del préstamo
        </div>
      );

    default:
      return null;

  }

}

export default ModalHost;