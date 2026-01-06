"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const projetSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  code_projet: z.string().optional(),
  objectifs: z.string().optional(),
  date_debut: z.string().optional(),
  date_fin: z.string().optional(),
  budget_total: z.number().min(0, "Le budget doit être positif"),
})

export default function NouveauProjetPage() {
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(projetSchema),
    defaultValues: {
      nom: "",
      code_projet: "",
      objectifs: "",
      date_debut: "",
      date_fin: "",
      budget_total: 0,
    },
  })

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Générer un code projet si non fourni
      let codeProjet = data.code_projet
      if (!codeProjet) {
        const timestamp = Date.now().toString(36).toUpperCase()
        codeProjet = `PROJ-${timestamp}`
      }

      const { data: projet, error } = await supabase
        .from("projets")
        .insert({
          nom: data.nom,
          code_projet: codeProjet,
          objectifs: data.objectifs,
          date_debut: data.date_debut || null,
          date_fin: data.date_fin || null,
          budget_total: data.budget_total,
          id_responsable: user.id,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/meal/projets/${projet.id}`)
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau projet</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Créez un nouveau projet dans le système MEAL
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du projet</CardTitle>
          <CardDescription>
            Renseignez les informations du projet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-4">
              <FormField
                name="nom"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nom du projet *</FormLabel>
                    <Input {...field} placeholder="Nom du projet" />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                name="code_projet"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Code projet (optionnel)</FormLabel>
                    <Input {...field} placeholder="Laissez vide pour génération automatique" />
                  </FormItem>
                )}
              />

              <FormField
                name="objectifs"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectifs</FormLabel>
                    <textarea
                      {...field}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Objectifs du projet"
                    />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  name="date_debut"
                  children={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  name="date_fin"
                  children={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="budget_total"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Budget total (FCFA) *</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Création..." : "Créer le projet"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


