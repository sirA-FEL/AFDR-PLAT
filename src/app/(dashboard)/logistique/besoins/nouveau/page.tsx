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

export default function NouveauBesoinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    objet: "",
    description: "",
    montant_estime: "",
    urgence: "normale" as "faible" | "normale" | "elevee" | "critique",
    date_besoin: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { demandesAchatService } = await import("@/lib/supabase/services")
      await demandesAchatService.create({
        objet: formData.objet,
        description: formData.description || undefined,
        montant_estime: formData.montant_estime ? parseFloat(formData.montant_estime) : undefined,
        urgence: formData.urgence,
        date_besoin: formData.date_besoin || undefined,
      })
      router.push("/logistique/besoins")
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
        <Link href="/logistique/besoins">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Nouvelle demande d'achat</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la demande</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objet <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant estimé (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.montant_estime}
                  onChange={(e) => setFormData({ ...formData, montant_estime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgence</label>
                <select
                  value={formData.urgence}
                  onChange={(e) => setFormData({ ...formData, urgence: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
                >
                  <option value="faible">Faible</option>
                  <option value="normale">Normale</option>
                  <option value="elevee">Élevée</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de besoin</label>
              <Input
                type="date"
                value={formData.date_besoin}
                onChange={(e) => setFormData({ ...formData, date_besoin: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer la demande"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
