"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const activiteSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  date_debut_prevue: z.string().optional(),
  date_fin_prevue: z.string().optional(),
  indicateurs: z.string().optional(),
  budget_alloue: z.number().min(0).optional(),
})

export default function ActivitesPage() {
  const params = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(activiteSchema),
    defaultValues: {
      nom: "",
      description: "",
      date_debut_prevue: "",
      date_fin_prevue: "",
      indicateurs: "",
      budget_alloue: 0,
    },
  })

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("activites")
        .insert({
          id_projet: params.id,
          nom: data.nom,
          description: data.description,
          date_debut_prevue: data.date_debut_prevue || null,
          date_fin_prevue: data.date_fin_prevue || null,
          indicateurs: data.indicateurs,
          budget_alloue: data.budget_alloue || 0,
        })

      if (error) throw error

      router.push(`/meal/projets/${params.id}`)
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle activité</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ajoutez une nouvelle activité au projet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'activité</CardTitle>
          <CardDescription>
            Renseignez les informations de l'activité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-4">
              <FormField
                name="nom"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nom de l'activité *</FormLabel>
                    <Input {...field} placeholder="Nom de l'activité" />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <textarea
                      {...field}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Description de l'activité"
                    />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  name="date_debut_prevue"
                  children={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début prévue</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  name="date_fin_prevue"
                  children={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin prévue</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="indicateurs"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicateurs</FormLabel>
                    <textarea
                      {...field}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Indicateurs de suivi"
                    />
                  </FormItem>
                )}
              />

              <FormField
                name="budget_alloue"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget alloué (FCFA)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Création..." : "Créer l'activité"}
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


