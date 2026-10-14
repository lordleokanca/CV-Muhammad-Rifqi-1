"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cv, type Lang } from "@/lib/cv";
import { asset } from "@/lib/utils";

/**
 * Builds the PDF in the browser from lib/cv-data.json when clicked,
 * so the downloaded CV always matches the data on the page.
 * The PDF library is loaded only on click to keep the page light.
 */
export function DownloadCv({ lang }: { lang: Lang }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const lb = cv[lang].labels;

  async function handleDownload() {
    setBusy(true);
    setError(false);
    try {
      const [{ pdf }, { CvDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./cv-pdf"),
      ]);
      const photoSrc = new URL(asset("/photo.jpg"), window.location.origin).toString();
      const blob = await pdf(<CvDocument lang={lang} photoSrc={photoSrc} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cv[lang].pdfName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {error ? lb.downloadFail : lb.downloadNote}
      </span>
      <Button onClick={handleDownload} disabled={busy} id="download-cv">
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        {lb.download}
      </Button>
    </div>
  );
}
