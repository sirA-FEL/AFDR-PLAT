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

export default function NouveauRapportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type_rapport: "mensuel" as "mensuel" | "trimestriel" | "annuel" | "final",
    periode: "",
    date_limite: "",
    id_departement: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { rapportsService } = await import("@/lib/supabase/services")
      await rapportsService.create({
        type_rapport: formData.type_rapport,
        periode: formData.periode,
        date_limite: formData.date_limite,
        id_departement: formData.id_departement || undefined,
      })
      router.push("/rapportage")
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
        <Link href="/rapportage">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#2D7A32]">Nouveau rapport</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rapport <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type_rapport}
                onChange={(e) => setFormData({ ...formData, type_rapport: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D7A32]"
                required
              >
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
                <option value="final">Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.periode}
                onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                placeholder="Ex: Janvier 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date limite <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.date_limite}
                onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
              <Input
                value={formData.id_departement}
                onChange={(e) => setFormData({ ...formData, id_departement: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer le rapport"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
