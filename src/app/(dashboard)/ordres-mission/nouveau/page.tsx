"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, Calendar, Upload, Save } from "lucide-react"
import Link from "next/link"

export default function NouvelOrdreMissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    destination: "",
    dateDebut: "",
    dateFin: "",
    motif: "",
    activitesPrevues: "",
    budgetEstime: "",
    documents: [] as File[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { ordresMissionService } = await import("@/lib/supabase/services")

      // Créer l'ordre de mission
      const ordre = await ordresMissionService.create({
        destination: formData.destination,
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        motif: formData.motif,
        activites_prevues: formData.activitesPrevues || undefined,
        budget_estime: formData.budgetEstime ? parseFloat(formData.budgetEstime) : undefined,
      })

      // Upload des documents si présents
      if (formData.documents.length > 0) {
        // TODO: Upload des documents vers Supabase Storage
        console.log("Documents à uploader:", formData.documents)
      }

      // Soumettre l'ordre (passe de brouillon à en_attente)
      await ordresMissionService.submit(ordre.id)

      // Redirection vers la liste
      router.push("/ordres-mission/mes-ordres")
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : (error && typeof error === "object" && "message" in error)
            ? String((error as { message: unknown }).message)
            : typeof error === "string"
              ? error
              : "Erreur lors de la création de l'ordre de mission"
      console.error("Erreur lors de la création:", message, error)
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        documents: Array.from(e.target.files),
      })
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ordres-mission">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#2D7A32]">Nouvel ordre de mission</h1>
          <p className="text-gray-600 mt-1">
            Remplissez le formulaire pour soumettre une demande d'ordre de mission
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de la mission</CardTitle>
            <CardDescription>
              Renseignez tous les champs obligatoires pour soumettre votre demande
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Ville, pays"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <Input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                    min={formData.dateDebut}
                  />
                </div>
              </div>
            </div>

            {/* Motif */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Raison de la mission"
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                required
              />
            </div>

            {/* Activités prévues */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activités prévues
              </label>
              <textarea
                placeholder="Décrivez les activités prévues lors de cette mission"
                value={formData.activitesPrevues}
                onChange={(e) =>
                  setFormData({ ...formData, activitesPrevues: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-[#2D7A32]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32] focus:border-transparent resize-none"
              />
            </div>

            {/* Budget estimé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget estimé (FCFA)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.budgetEstime}
                onChange={(e) => setFormData({ ...formData, budgetEstime: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>

            {/* Documents justificatifs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents justificatifs
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-[#2D7A32] transition-colors">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-[#2D7A32] font-medium hover:underline">
                    Cliquez pour télécharger
                  </span>
                  <span className="text-gray-500"> ou glissez-déposez les fichiers</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                {formData.documents.length > 0 && (
                  <div className="mt-4 text-sm text-gray-600">
                    {formData.documents.length} fichier(s) sélectionné(s)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/ordres-mission">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Soumettre la demande"}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
