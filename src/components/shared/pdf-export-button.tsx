"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface PdfExportButtonProps {
  onExport: () => Promise<void>;
  label?: string;
}

export function PdfExportButton({ onExport, label = "Export PDF" }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await onExport();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} loading={loading}>
      <Download className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
}
