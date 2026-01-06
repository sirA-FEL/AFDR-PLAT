"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function EmployesPage() {
  const [employes, setEmployes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadEmployes()
  }, [])

  const loadEmployes = async () => {
    try {
      const { data, error } = await supabase
        .from("employes")
        .select(`
          *,
          profils:id_utilisateur (
            nom,
            prenom,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEmployes(data || [])
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
          <h1 className="text-3xl font-bold text-[#1B5E20]">Employés</h1>
          <p className="text-[#757575]">
            Gérez les fiches des employés
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel employé
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date embauche</TableHead>
                <TableHead>Type contrat</TableHead>
                <TableHead>Solde congés</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#757575]">
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                employes.map((employe) => (
                  <TableRow key={employe.id}>
                    <TableCell className="font-medium">
                      {employe.profils?.nom} {employe.profils?.prenom}
                    </TableCell>
                    <TableCell>{employe.profils?.email}</TableCell>
                    <TableCell>
                      {new Date(employe.date_embauche).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{employe.type_contrat}</TableCell>
                    <TableCell>{employe.solde_conges} jours</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
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


