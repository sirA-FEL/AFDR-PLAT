"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function BesoinsPage() {
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDemandes()
  }, [])

  const loadDemandes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("demandes_achat")
        .select("*")
        .eq("id_demandeur", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDemandes(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B5E20]">Demandes d'achat</h1>
          <p className="text-[#757575]">
            Gérez vos demandes d'achat
          </p>
        </div>
        <Link href="/logistique/besoins/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes demandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Urgence</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#757575]">
                    Aucune demande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                demandes.map((demande) => (
                  <TableRow key={demande.id}>
                    <TableCell>{demande.type}</TableCell>
                    <TableCell className="font-medium">{demande.description}</TableCell>
                    <TableCell>{demande.quantite}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          demande.urgence === "tres_urgente"
                            ? "destructive"
                            : demande.urgence === "urgente"
                            ? "warning"
                            : "default"
                        }
                      >
                        {demande.urgence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          demande.statut === "approuve"
                            ? "success"
                            : demande.statut === "rejete"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {demande.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


