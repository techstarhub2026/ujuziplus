import { create } from "zustand";

export type ModalType =
  | "confirm"
  | "form"
  | "view"
  | "success"
  | "share"
  | "receipt"
  | "reject"
  | "request-changes";

export interface ModalState {
  open: boolean;
  type: ModalType | null;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  fields?: { name: string; label: string; type?: string; placeholder?: string }[];
  onConfirm?: () => void;
  payload?: Record<string, unknown>;
}

interface ModalStore extends ModalState {
  show: (modal: Omit<ModalState, "open"> & { onConfirm?: () => void }) => void;
  close: () => void;
}

const initial: ModalState = {
  open: false,
  type: null,
  title: "",
};

export const useModalStore = create<ModalStore>((set) => ({
  ...initial,
  show: (modal) => set({ ...modal, open: true }),
  close: () => set({ ...initial, open: false }),
}));
