"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/modalStore";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ModalRoot() {
  const router = useRouter();
  const modal = useModalStore();
  const toast = useAppStore((s) => s.showToast);
  const [values, setValues] = useState<Record<string, string>>({});

  if (!modal.open || !modal.type) return null;

  const close = () => {
    setValues({});
    modal.close();
  };

  const handleConfirm = () => {
    if (modal.type === "confirm" && modal.onConfirm) {
      modal.onConfirm();
      return;
    }
    if (modal.type === "form" || modal.type === "reject" || modal.type === "request-changes") {
      const payload = modal.payload as {
        onSubmit?: (v: Record<string, string> | string) => void;
        successMessage?: string;
      };
      if (modal.type === "reject" || modal.type === "request-changes") {
        const key = modal.type === "reject" ? "reason" : "notes";
        payload?.onSubmit?.(values[key] || "");
      } else {
        payload?.onSubmit?.(values);
      }
      if (payload?.successMessage) toast(payload.successMessage, "success");
      close();
      return;
    }
    close();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={close} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{modal.title}</h2>
        {modal.message && <p className="mt-2 text-sm text-gray-600">{modal.message}</p>}

        {modal.type === "share" && (
          <div className="mt-4 space-y-2">
            <Input
              readOnly
              value={(modal.payload?.url as string) || ""}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              className="w-full"
              onClick={() => {
                navigator.clipboard?.writeText((modal.payload?.url as string) || "");
                toast("Link copied!", "success");
                close();
              }}
            >
              Copy link
            </Button>
          </div>
        )}

        {modal.type === "receipt" && (
          <div className="mt-4 rounded-lg border p-4 text-sm">
            <p><strong>Receipt #</strong> {(modal.payload?.paymentId as string) || "pay-1"}</p>
            <p className="mt-2">Amount: TZS 35,000</p>
            <p>Method: M-Pesa</p>
            <p>Status: Completed</p>
            <Button className="mt-4 w-full" onClick={() => { toast("PDF downloaded", "success"); close(); }}>
              Download PDF
            </Button>
          </div>
        )}

        {(modal.type === "form" || modal.type === "reject" || modal.type === "request-changes") &&
          modal.fields?.map((f) => (
            <div key={f.name} className="mt-3">
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  label={f.label}
                  className="h-24"
                  placeholder={f.placeholder}
                  value={values[f.name] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : (
                <Input
                  label={f.label}
                  placeholder={f.placeholder}
                  value={values[f.name] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
            </div>
          ))}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            {modal.cancelLabel || "Cancel"}
          </Button>
          {modal.type !== "share" && modal.type !== "receipt" && (
            <Button onClick={handleConfirm}>{modal.confirmLabel || "Confirm"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
