import { useRouter } from "next/navigation";
import { useModalStore, type ModalState } from "@/store/modalStore";
import { useAppStore } from "@/store/appStore";

/** Standard simulation actions for prototype buttons */
export function useSimulation() {
  const router = useRouter();
  const toast = useAppStore((s) => s.showToast);
  const showModal = useModalStore((s) => s.show);
  const closeModal = useModalStore((s) => s.close);

  return {
    toast,
    navigate: (href: string) => router.push(href),
    confirm: (opts: {
      title: string;
      message: string;
      confirmLabel?: string;
      onConfirm: () => void;
      successMessage?: string;
    }) => {
      showModal({
        type: "confirm",
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel || "Confirm",
        onConfirm: () => {
          opts.onConfirm();
          closeModal();
          if (opts.successMessage) toast(opts.successMessage, "success");
        },
      });
    },
    form: (opts: {
      title: string;
      fields: ModalState["fields"];
      onSubmit: (values: Record<string, string>) => void;
      successMessage?: string;
    }) => {
      showModal({
        type: "form",
        title: opts.title,
        fields: opts.fields,
        payload: { onSubmit: opts.onSubmit, successMessage: opts.successMessage },
      });
    },
    share: (url: string, title: string) => {
      showModal({ type: "share", title: "Share", payload: { url, shareTitle: title } });
    },
    receipt: (paymentId: string) => {
      showModal({ type: "receipt", title: "Payment receipt", payload: { paymentId } });
    },
    reject: (onSubmit: (reason: string) => void) => {
      showModal({
        type: "reject",
        title: "Reject with reason",
        fields: [{ name: "reason", label: "Reason", placeholder: "Explain why..." }],
        payload: { onSubmit },
      });
    },
    requestChanges: (onSubmit: (notes: string) => void) => {
      showModal({
        type: "request-changes",
        title: "Request changes",
        fields: [
          {
            name: "notes",
            label: "Notes for instructor",
            type: "textarea",
            placeholder: "What needs to change?",
          },
        ],
        payload: { onSubmit },
      });
    },
  };
}
