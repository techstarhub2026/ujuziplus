"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Download, Maximize2, X } from "lucide-react";

type Props = {
  url: string;
  title?: string;
  defaultExpanded?: boolean;
  /** Renders as a fixed full-screen panel (below the app topbar) with no
   * header — just the PDF, filling the available space. No page scrolling
   * involved — the PDF's own viewer handles scrolling internally. */
  fullBleed?: boolean;
};

export function PdfViewer({ url, title, defaultExpanded = true, fullBleed = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fullscreen, setFullscreen] = useState(false);

  const fileName = title ?? url.split("/").pop()?.split("?")[0] ?? "Document";
  const src = `${url}#toolbar=1&navpanes=0&scrollbar=0&view=FitH`;

  if (fullBleed || fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        {fullscreen && (
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            title="Close"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <iframe src={src} title={fileName} className="h-full w-full border-0" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <a
            href={url}
            download
            title="Download PDF"
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            title="Fullscreen"
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse" : "Expand"}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      {expanded && (
        <iframe
          src={src}
          title={fileName}
          className="w-full border-0"
          style={{ height: "calc(100vh - 220px)", minHeight: 500 }}
        />
      )}

      {/* Collapsed state */}
      {!expanded && (
        <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
          <span>PDF collapsed —</span>
          <button type="button" className="text-brand hover:underline" onClick={() => setExpanded(true)}>
            click to expand
          </button>
        </div>
      )}
    </div>
  );
}
