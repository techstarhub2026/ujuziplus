import { OpenKnowledgeEditorForm } from "@/components/knowledge/OpenKnowledgeEditorForm";

export default function NewOpenKnowledgeResourcePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create open knowledge resource</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a free tutorial, guide, toolkit, or publication to the Open Knowledge hub.
        </p>
      </div>
      <OpenKnowledgeEditorForm />
    </div>
  );
}
