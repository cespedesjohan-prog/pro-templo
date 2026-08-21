import { useModal as useModalContext } from "../context/ModalContext";

export default function useModal() {
  return useModalContext();
}