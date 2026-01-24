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
import { ArrowLeft, Save } from "lucide-react"

export default function NouveauBudgetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    montant_alloue: "",
    annee: new Date().getFullYear().toString(),
    trimestre: "",
    statut: "actif" as "actif" | "cloture" | "suspendu",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { budgetsService } = await import("@/lib/supabase/services")
      await budgetsService.create({
        nom: formData.nom,
        description: formData.description || undefined,
        montant_alloue: parseFloat(formData.montant_alloue),
        annee: parseInt(formData.annee),
        trimestre: formData.trimestre ? parseInt(formData.trimestre) : undefined,
        statut: formData.statut,
      })
      router.push("/finance/budgets")
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
        <Link href="/finance/budgets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Nouveau budget</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du budget</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant alloué (€) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.montant_alloue}
                  onChange={(e) => setFormData({ ...formData, montant_alloue: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.annee}
                  onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
                <select
                  value={formData.trimestre}
                  onChange={(e) => setFormData({ ...formData, trimestre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
                >
                  <option value="">Aucun</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
              >
                <option value="actif">Actif</option>
                <option value="cloture">Clôturé</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer le budget"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
