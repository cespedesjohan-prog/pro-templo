import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {

  const [modal, setModal] = useState(null);

  const openModal = (nombre, data = null) => {

    setModal({
      nombre,
      data,
    });

  };

  const closeModal = () => {

    setModal(null);

  };

  return (

    <ModalContext.Provider
      value={{
        modal,
        openModal,
        closeModal,
      }}
    >

      {children}

    </ModalContext.Provider>

  );

}

export function useModal() {

  return useContext(ModalContext);

}