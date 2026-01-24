"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { slideUp, transitionNormal } from "@/lib/utils/motion-variants"
import { ArrowLeft, Upload, Save } from "lucide-react"

export default function NouveauTDRPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titre: "",
    type_tdr: "consultant" as "consultant" | "prestation",
    budget: "",
    delai_jours: "",
    id_projet: "",
  })
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { tdrService } = await import("@/lib/supabase/services")
      
      // Upload document
      if (!documentFile) {
        alert("Veuillez sélectionner un document")
        return
      }
      const documentUrl = await tdrService.uploadDocument(documentFile)

      // Créer le TdR
      await tdrService.create({
        titre: formData.titre,
        type_tdr: formData.type_tdr,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        delai_jours: formData.delai_jours ? parseInt(formData.delai_jours) : undefined,
        id_projet: formData.id_projet || undefined,
        chemin_document: documentUrl,
      })

      router.push("/tdr")
    } catch (error: any) {
      console.error("Erreur:", error)
      alert(error.message || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={slideUp}
      transition={transitionNormal}
      className="p-6 space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/tdr">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Nouveau TdR</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du TdR</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type_tdr}
                onChange={(e) => setFormData({ ...formData, type_tdr: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
                required
              >
                <option value="consultant">Consultant</option>
                <option value="prestation">Prestation</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Délai (jours)</label>
                <Input
                  type="number"
                  value={formData.delai_jours}
                  onChange={(e) => setFormData({ ...formData, delai_jours: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document TdR <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  required
                />
                {documentFile && (
                  <span className="text-sm text-gray-600">{documentFile.name}</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer le TdR"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
