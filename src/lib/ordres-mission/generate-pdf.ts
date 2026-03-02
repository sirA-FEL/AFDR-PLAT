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

  const numeroOrdre = buildNumeroOrdre(ordre)

  const GREEN = { r: 45, g: 122, b: 50 }
  const LIGHT_GREY = { r: 230, g: 230, b: 230 }

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

  // ---- Lieu et date + numéro dans des cartouches gris ----
  const lieu = ordre.lieu_emission || "Ouahigouya"
  const dateEmissionSource = ordre.date_creation || ordre.date_debut || ordre.date_fin || new Date().toISOString()
  const dateEmission = formatDateLongFr(dateEmissionSource)
  const dateText = `${lieu}, le ${dateEmission}`

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const refPaddingX = 3
  const refHeight = 7
  const numeroTexte = numeroOrdre
  const numeroWidth = doc.getTextWidth(numeroTexte) + refPaddingX * 2
  const dateWidth = doc.getTextWidth(dateText) + refPaddingX * 2
  const refY = y

  // Cartouche numéro (gauche)
  doc.setFillColor(LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b)
  doc.setDrawColor(0, 0, 0)
  doc.rect(margin, refY - refHeight + 2, numeroWidth, refHeight, "FD")
  doc.text(numeroTexte, margin + refPaddingX, refY)

  // Cartouche lieu + date (droite)
  const dateBoxX = pageWidth - margin - dateWidth
  doc.rect(dateBoxX, refY - refHeight + 2, dateWidth, refHeight, "FD")
  doc.text(dateText, dateBoxX + refPaddingX, refY)

  y += 10

  // Ligne séparatrice horizontale
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // ---- Bloc central : ORDRE DE MISSION + numéro ----
  const boxWidth = maxWidth * 0.7
  const boxX = (pageWidth - boxWidth) / 2
  const boxHeight = 18

  doc.setDrawColor(GREEN.r, GREEN.g, GREEN.b)
  doc.setFillColor(LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b)
  doc.setLineWidth(0.8)
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text("ORDRE DE MISSION", boxX + boxWidth / 2, y + 7, { align: "center" })
  doc.setFontSize(11)
  doc.text(numeroOrdre, boxX + boxWidth / 2, y + 13, { align: "center" })

  y += boxHeight + 12

  // ---- Tableau principal (EXECUTANTS / SERVICE / DEPART / DESTINATION / OBJET / MOYEN / DATE) ----
  const tableTop = y
  const labelX = margin + 4
  const valueX = margin + 55

  const ligneSimple = (label: string, value: string) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(label, labelX, y)
    // Souligneur simple sous le libellé, proche du modèle Word.
    const labelWidth = doc.getTextWidth(label)
    doc.setLineWidth(0.3)
    doc.line(labelX, y + 1, labelX + labelWidth, y + 1)
    doc.setFont("helvetica", "normal")
    const valueMaxWidth = pageWidth - valueX - margin
    const lines: string[] = doc.splitTextToSize(value || "-", valueMaxWidth) as string[]
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
  const objetLines: string[] = doc.splitTextToSize(objet || "-", pageWidth - valueX - margin) as string[]
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
  const tableHeight = tableBottom - tableTop + 10

  // Cadre principal du tableau (épais) + légère \"ombre\" à droite, pour se rapprocher du modèle.
  doc.setDrawColor(160, 160, 160)
  doc.setLineWidth(0.5)
  doc.rect(margin + 1.5, tableTop - 4, maxWidth, tableHeight, "S")

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1)
  doc.rect(margin, tableTop - 6, maxWidth, tableHeight, "S")

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

  // ---- Bloc Directeur Exécutif pleine largeur + signature ----
  if (y > pageHeight - 60) {
    doc.addPage()
    y = 30
  }

  const dirBoxWidth = maxWidth
  const dirBoxX = margin
  const dirTitleHeight = 14
  const dirTitleY = y

  // Bandeau \"Directeur Exécutif\"
  doc.setDrawColor(0, 0, 0)
  doc.setFillColor(LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b)
  doc.setLineWidth(0.8)
  doc.rect(dirBoxX, dirTitleY, dirBoxWidth, dirTitleHeight, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Directeur Exécutif", dirBoxX + dirBoxWidth / 2, dirTitleY + 9, { align: "center" })

  // Zone de signature et du nom sous le bandeau
  const signAreaHeight = 30
  const signAreaY = dirTitleY + dirTitleHeight

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.6)
  doc.rect(dirBoxX, signAreaY, dirBoxWidth, signAreaHeight, "S")

  // Signature manuscrite dans la zone centrale (si disponible)
  if (signatureUrl || ordre.signature_validation_url) {
    try {
      const urlToLoad =
        signatureUrl || (ordre.signature_validation_url!.startsWith("http") ? ordre.signature_validation_url : undefined)
      if (urlToLoad) {
        const imgData = await loadImageAsDataUrl(urlToLoad)
        const sigW = dirBoxWidth / 2
        const sigH = 14
        const sigX = dirBoxX + (dirBoxWidth - sigW) / 2
        const sigY = signAreaY + 4
        doc.addImage(imgData, "PNG", sigX, sigY, sigW, sigH)
      }
    } catch {
      // En cas d'échec on laisse simplement le bloc vide.
    }
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Amidou OUATTARA", dirBoxX + dirBoxWidth / 2, signAreaY + signAreaHeight - 9, { align: "center" })
  doc.setFontSize(8)
  doc.text(
    "Chevalier de l’ordre du mérite du développement rural",
    dirBoxX + dirBoxWidth / 2,
    signAreaY + signAreaHeight - 3,
    { align: "center" }
  )

  y = signAreaY + signAreaHeight + 10

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
      const hashLines: string[] = doc.splitTextToSize(hashLine, maxWidth) as string[]
      hashLines.forEach((line: string) => {
        doc.text(line, margin, y)
        y += 4
      })
    }

    if (ordre.commentaire_validation) {
      doc.text("Commentaire du valideur :", margin, y)
      y += 4
      const commLines: string[] = doc.splitTextToSize(ordre.commentaire_validation, maxWidth) as string[]
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
