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
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatDateLongFr(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function buildNumeroOrdre(ordre: OrdreMission): string {
  const baseDate = ordre.date_creation ?? ordre.date_debut
  const year = baseDate ? new Date(baseDate).getFullYear() : new Date().getFullYear()
  // On laisse les points de suspension comme dans le modèle (pas de séquence métier gérée ici).
  return `N° .... /${year}/AFDR/CA/DE`
}

export interface GeneratePdfOptions {
  /** Nom du demandeur principal (utilisé en complément des exécutants). */
  demandeurNom?: string
  /** URL fetchable pour l'image de signature (à utiliser quand signature_validation_url est un chemin stockage). */
  signatureImageUrl?: string
  /** Nom du validateur pour la section conformité (Validé par X le ...). */
  validateurNom?: string
}

/**
 * Génère un PDF qui reprend au plus près le modèle Word AFDR
 * transmis (logo, en-tête, bloc ORDRE DE MISSION, tableau exécutants/service/départ/destination/objet/moyen/date,
 * plus bloc Directeur Exécutif avec signature numérique si présente).
 */
export async function generateOrdreMissionPdf(ordre: OrdreMission, options?: GeneratePdfOptions): Promise<Blob> {
  const signatureUrl =
    options?.signatureImageUrl ??
    (ordre.signature_validation_url?.startsWith("http") ? ordre.signature_validation_url : undefined)

  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  let y = 20

  // ---- Logo + bloc coordination AFDR (gauche) ----
  const logoSize = 28
  const headerLeftX = margin + logoSize + 6

  try {
    const logoData = await loadImageAsDataUrl("/logo-afdr.png")
    doc.addImage(logoData, "PNG", margin, y - 4, logoSize, logoSize)
  } catch {
    // Si le logo n'est pas disponible, on affiche un bloc texte de secours.
    doc.setFillColor(45, 122, 50)
    doc.rect(margin, y - 4, logoSize, logoSize, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("AFDR", margin + logoSize / 2, y + 10, { align: "center" })
    doc.setTextColor(0, 0, 0)
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Association Formation Développement Ruralité (AFDR)", headerLeftX, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  const headerLines = [
    "BP : 394 TEL : (00226) 02 95 42 35",
    "Secteur N°11 de Ouahigouya, RN N°2, Coté OUEST du Camp CRS",
    "Site web: www.afdrburkina.org / E-mail: assofdr@yahoo.fr",
    "Récépissé N° 2001-10/MATD/HC/SG/DAAP/D   du 09 Mai 2001",
    "CHEVALIER DE L’ORDRE DE L’ETALON",
  ]
  let headerY = y + 5
  headerLines.forEach((line: string) => {
    doc.text(line, headerLeftX, headerY)
    headerY += 4
  })

  y = headerY + 4

  // ---- Lieu et date + numéro à droite ----
  const lieu = ordre.lieu_emission || "Ouahigouya"
  const dateEmissionSource = ordre.date_creation || ordre.date_debut || ordre.date_fin || new Date().toISOString()
  const dateEmission = formatDateLongFr(dateEmissionSource)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`${lieu}, le ${dateEmission}`, pageWidth - margin, y, { align: "right" })
  y += 6
  doc.text(buildNumeroOrdre(ordre), pageWidth - margin, y, { align: "right" })

  y += 12

  // Ligne séparatrice horizontale
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // ---- Bloc central : ORDRE DE MISSION + numéro ----
  const boxWidth = maxWidth * 0.7
  const boxX = (pageWidth - boxWidth) / 2
  const boxHeight = 18

  doc.setDrawColor(45, 122, 50)
  doc.setLineWidth(0.6)
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, "S")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text("ORDRE DE MISSION", boxX + boxWidth / 2, y + 7, { align: "center" })
  doc.setFontSize(11)
  doc.text(buildNumeroOrdre(ordre), boxX + boxWidth / 2, y + 13, { align: "center" })

  y += boxHeight + 12

  // ---- Tableau principal (EXECUTANTS / SERVICE / DEPART / DESTINATION / OBJET / MOYEN / DATE) ----
  const tableTop = y
  const labelX = margin + 4
  const valueX = margin + 55

  const ligneSimple = (label: string, value: string) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(label, labelX, y)
    doc.setFont("helvetica", "normal")
    const valueMaxWidth = pageWidth - valueX - margin
    const lines = doc.splitTextToSize(value || "-", valueMaxWidth)
    let localY = y
    lines.forEach((line: string) => {
      doc.text(line, valueX, localY)
      localY += 5
    })
    y = localY + 2
  }

  const executants =
    ordre.executants && ordre.executants.trim().length > 0
      ? ordre.executants
      : options?.demandeurNom || ""

  ligneSimple("EXECUTANTS :", executants)
  ligneSimple("SERVICE :", "Association Formation Développement Ruralité (AFDR)")
  ligneSimple("DEPART :", lieu)
  ligneSimple("DESTINATION :", ordre.destination)

  // OBJET sur 2 lignes possibles (comme dans le modèle)
  const objet = ordre.motif || ""
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("OBJET :", labelX, y)
  doc.setFont("helvetica", "normal")
  const objetLines = doc.splitTextToSize(objet || "-", pageWidth - valueX - margin)
  let objetY = y
  objetLines.forEach((line: string) => {
    doc.text(line, valueX, objetY)
    objetY += 5
  })
  y = objetY + 2

  ligneSimple("MOYEN DE TRANSPORT :", ordre.moyen_transport || "")

  // DATE : Départ / Retour
  const dateDepart = formatDateFr(ordre.date_debut)
  const dateRetour = formatDateFr(ordre.date_fin)
  const dateValue = `Départ : Le ${dateDepart}    Retour : Le ${dateRetour}`
  ligneSimple("DATE :", dateValue)

  const tableBottom = y + 2
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(margin, tableTop - 6, maxWidth, tableBottom - tableTop + 10)

  y = tableBottom + 18

  // ---- Activités prévues & budget (en dessous du tableau principal, optionnels) ----
  if (ordre.activites_prevues) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Activités prévues :", margin, y)
    y += 5
    doc.setFont("helvetica", "normal")
    const activitesLines = doc.splitTextToSize(ordre.activites_prevues, maxWidth)
    activitesLines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += 5
    })
    y += 4
  }

  if (ordre.budget_estime != null) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Budget estimé :", margin, y)
    doc.setFont("helvetica", "normal")
    doc.text(`${Number(ordre.budget_estime).toLocaleString("fr-FR")} FCFA`, margin + 40, y)
    y += 10
  }

  // ---- Bloc Directeur Exécutif + signature ----
  if (y > pageHeight - 60) {
    doc.addPage()
    y = 30
  }

  const sigBoxWidth = 70
  const sigBoxHeight = 38
  const sigBoxX = pageWidth - margin - sigBoxWidth
  const sigBoxY = y

  doc.setDrawColor(0, 0, 0)
  doc.rect(sigBoxX, sigBoxY, sigBoxWidth, sigBoxHeight)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Directeur Exécutif", sigBoxX + sigBoxWidth / 2, sigBoxY + 7, { align: "center" })

  // Signature manuscrite dans le bloc (si disponible)
  if (signatureUrl || ordre.signature_validation_url) {
    try {
      const urlToLoad =
        signatureUrl || (ordre.signature_validation_url!.startsWith("http") ? ordre.signature_validation_url : undefined)
      if (urlToLoad) {
        const imgData = await loadImageAsDataUrl(urlToLoad)
        const sigW = sigBoxWidth - 10
        const sigH = 16
        const sigX = sigBoxX + (sigBoxWidth - sigW) / 2
        const sigY = sigBoxY + 10
        doc.addImage(imgData, "PNG", sigX, sigY, sigW, sigH)
      }
    } catch {
      // En cas d'échec on laisse simplement le bloc vide.
    }
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Amidou OUATTARA", sigBoxX + sigBoxWidth / 2, sigBoxY + sigBoxHeight - 8, { align: "center" })
  doc.setFontSize(8)
  doc.text(
    "Chevalier de l’ordre du mérite du développement rural",
    sigBoxX + sigBoxWidth / 2,
    sigBoxY + sigBoxHeight - 3,
    { align: "center" }
  )

  y = sigBoxY + sigBoxHeight + 10

  // ---- Informations de conformité (validation numérique) ----
  const validateurNom = options?.validateurNom
  if (ordre.date_validation || ordre.signature_validation_hash || ordre.commentaire_validation || validateurNom) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = 30
    }
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Validation numérique :", margin, y)
    y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    if (ordre.date_validation && validateurNom) {
      doc.text(
        `Validé par ${validateurNom} le ${formatDateFr(ordre.date_validation)} (signature électronique).`,
        margin,
        y
      )
      y += 4
    } else if (ordre.date_validation) {
      doc.text(`Date de validation : ${formatDateFr(ordre.date_validation)}`, margin, y)
      y += 4
    }

    if (ordre.signature_validation_hash) {
      const hashLine = `Empreinte de la signature (SHA-256) : ${ordre.signature_validation_hash}`
      const hashLines = doc.splitTextToSize(hashLine, maxWidth)
      hashLines.forEach((line: string) => {
        doc.text(line, margin, y)
        y += 4
      })
    }

    if (ordre.commentaire_validation) {
      doc.text("Commentaire du valideur :", margin, y)
      y += 4
      const commLines = doc.splitTextToSize(ordre.commentaire_validation, maxWidth)
      commLines.forEach((line: string) => {
        doc.text(line, margin, y)
        y += 4
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
