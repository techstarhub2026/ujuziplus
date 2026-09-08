import { LabResourceEditorForm } from "@/components/lab/LabResourceEditorForm";

export default function NewLabResourcePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create lab resource</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a component, sensor, board, tool, or guide. Use rich text, images, and PDFs to give learners everything they need.
        </p>
      </div>
      <LabResourceEditorForm />
    </div>
  );
}
