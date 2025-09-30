"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DownloadContractPDF() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      // Use the browser's print functionality to generate PDF
      // This is the most reliable cross-browser solution
      window.print()
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 bg-transparent"
      onClick={handleDownload}
      disabled={isGenerating}
    >
      <Download className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Download PDF"}
    </Button>
  )
}
