import type { OrdreMission } from "@/lib/supabase/services"

async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function formatDateFr(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return dateStr
  }
}

export interface GeneratePdfOptions {
  demandeurNom?: string
  /** URL fetchable pour l'image de signature (à utiliser quand signature_validation_url est un chemin stockage). */
  signatureImageUrl?: string
  /** Nom du validateur pour la section conformité (Validé par X le ...). */
  validateurNom?: string
}

/**
 * Génère un PDF professionnel d'un ordre de mission (consultable, exportable).
 * Inclut la section Validation (signature + date) si présente.
 */
export async function generateOrdreMissionPdf(ordre: OrdreMission, options?: GeneratePdfOptions): Promise<Blob> {
  const signatureUrl = options?.signatureImageUrl ?? (ordre.signature_validation_url?.startsWith("http") ? ordre.signature_validation_url : undefined)
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 22
  const maxWidth = pageWidth - margin * 2
  let y = 22

  // ---- Bandeau en-tête ----
  doc.setFillColor(45, 122, 50) // #2D7A32
  doc.rect(0, 0, pageWidth, 36, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("ORDRE DE MISSION", margin, 16)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Plateforme AFDR • Document officiel", margin, 26)
  doc.setTextColor(0, 0, 0)
  y = 44

  // ---- Bloc Référence ----
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(margin, y, maxWidth, 16, "S")
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  const refDate = ordre.date_creation ? formatDateFr(ordre.date_creation) : "-"
  doc.text(`Référence : ${ordre.id.slice(0, 8).toUpperCase()} • Date d'émission : ${refDate}`, margin + 4, y + 11)
  y += 22

  // ---- Section 1. Mission (cadre) ----
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(45, 122, 50)
  doc.text("1. DÉTAILS DE LA MISSION", margin, y)
  y += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  doc.setDrawColor(220, 220, 220)
  doc.rect(margin, y, maxWidth, 72, "S")
  const boxY = y
  y += 7

  doc.setFont("helvetica", "bold")
  doc.text("Destination :", margin + 4, y)
  doc.setFont("helvetica", "normal")
  doc.text(ordre.destination, margin + 42, y)
  y += 8

  doc.setFont("helvetica", "bold")
  doc.text("Période :", margin + 4, y)
  doc.setFont("helvetica", "normal")
  doc.text(`du ${formatDateFr(ordre.date_debut)} au ${formatDateFr(ordre.date_fin)}`, margin + 42, y)
  y += 8

  if (options?.demandeurNom) {
    doc.setFont("helvetica", "bold")
    doc.text("Demandeur :", margin + 4, y)
    doc.setFont("helvetica", "normal")
    doc.text(options.demandeurNom, margin + 42, y)
    y += 8
  }

  doc.setFont("helvetica", "bold")
  doc.text("Motif :", margin + 4, y)
  doc.setFont("helvetica", "normal")
  y += 6
  const motifLines = doc.splitTextToSize(ordre.motif, maxWidth - 12)
  motifLines.forEach((line: string) => {
    doc.text(line, margin + 4, y)
    y += 6
  })
  y = boxY + 72 + 10

  // ---- Activités prévues ----
  if (ordre.activites_prevues) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Activités prévues", margin, y)
    y += 7
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const activitesLines = doc.splitTextToSize(ordre.activites_prevues, maxWidth)
    activitesLines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += 6
    })
    y += 6
  }

  // ---- Budget ----
  if (ordre.budget_estime != null) {
    doc.setFont("helvetica", "bold")
    doc.text("Budget estimé :", margin, y)
    doc.setFont("helvetica", "normal")
    doc.text(`${Number(ordre.budget_estime).toLocaleString("fr-FR")} FCFA`, margin + 42, y)
    y += 10
  } else {
    y += 4
  }

  // ---- Section Validation (si présente) ----
  const validateurNom = options?.validateurNom
  if (ordre.signature_validation_url || ordre.date_validation) {
    if (y > pageHeight - 70) {
      doc.addPage()
      y = 22
    }
    y += 6
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(45, 122, 50)
    doc.text("2. VALIDATION", margin, y)
    y += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    if (validateurNom && ordre.date_validation) {
      doc.text(`Validé par ${validateurNom} le ${formatDateFr(ordre.date_validation)}.`, margin, y)
      y += 8
    } else if (ordre.date_validation) {
      doc.text(`Date de validation : ${formatDateFr(ordre.date_validation)}`, margin, y)
      y += 8
    }
    if (ordre.signature_validation_hash) {
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 80)
      const hashLine = `Empreinte signature : SHA-256: ${ordre.signature_validation_hash}`
      const hashLines = doc.splitTextToSize(hashLine, maxWidth)
      hashLines.forEach((line: string) => {
        doc.text(line, margin, y)
        y += 5
      })
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      y += 4
    }
    if (signatureUrl || ordre.signature_validation_url) {
      try {
        const urlToLoad = signatureUrl || (ordre.signature_validation_url!.startsWith("http") ? ordre.signature_validation_url : undefined)
        if (!urlToLoad) {
          doc.text("(Signature non disponible)", margin, y)
          y += 7
        } else {
          const imgData = await loadImageAsDataUrl(urlToLoad)
          const sigW = 50
          const sigH = 22
          if (y + sigH > 270) {
            doc.addPage()
            y = 20
          }
          doc.addImage(imgData, "PNG", margin, y, sigW, sigH)
          y += sigH + 6
        }
      } catch {
        doc.text("(Signature non disponible)", margin, y)
        y += 7
      }
    }
    if (ordre.commentaire_validation) {
      doc.text("Commentaire :", margin, y)
      y += 5
      const commLines = doc.splitTextToSize(ordre.commentaire_validation, maxWidth)
      commLines.forEach((line: string) => {
        doc.text(line, margin, y)
        y += 5
      })
    }
  }

  // ---- Pied de page (sur chaque page) ----
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `Document généré par la plateforme AFDR • Page ${p}/${totalPages} • Réf. ${ordre.id.slice(0, 8).toUpperCase()}`,
      margin,
      pageHeight - 8
    )
  }

  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" })
}
