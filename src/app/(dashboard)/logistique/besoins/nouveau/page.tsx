"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const demandeSchema = z.object({
  type: z.enum(["bien", "service"]),
  description: z.string().min(1, "La description est requise"),
  quantite: z.number().min(1, "La quantité doit être positive"),
  justification: z.string().min(1, "La justification est requise"),
  urgence: z.enum(["normale", "urgente", "tres_urgente"]),
  id_projet: z.string().optional(),
})

export default function NouvelleDemandePage() {
  const [projets, setProjets] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(demandeSchema),
    defaultValues: {
      type: "bien" as const,
      description: "",
      quantite: 1,
      justification: "",
      urgence: "normale" as const,
      id_projet: "",
    },
  })

  useEffect(() => {
    loadProjets()
  }, [])

  const loadProjets = async () => {
    try {
      const { data, error } = await supabase
        .from("projets")
        .select("id, nom")
        .eq("statut", "actif")

      if (error) throw error
      setProjets(data || [])
    } catch (error: any) {
      console.error("Erreur:", error)
    }
  }

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

      const { error } = await supabase
        .from("demandes_achat")
        .insert({
          id_demandeur: user.id,
          type: data.type,
          description: data.description,
          quantite: data.quantite,
          justification: data.justification,
          urgence: data.urgence,
          id_projet: data.id_projet || null,
          statut: "soumis",
        })

      if (error) throw error

      router.push("/logistique/besoins")
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle demande d'achat</h1>
        <p className="text-[#757575]">
          Soumettez une demande d'achat ou de service
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la demande</CardTitle>
          <CardDescription>
            Renseignez les détails de votre demande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-4">
              <FormField
                name="type"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select {...field}>
                      <option value="bien">Bien</option>
                      <option value="service">Service</option>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <textarea
                      {...field}
                      className="flex min-h-[80px] w-full rounded-md border border-[#2D7A32]/20 bg-white px-3 py-2 text-sm focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                      placeholder="Décrivez votre demande"
                    />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                name="quantite"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Quantité *</FormLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                name="justification"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Justification *</FormLabel>
                    <textarea
                      {...field}
                      className="flex min-h-[80px] w-full rounded-md border border-[#2D7A32]/20 bg-white px-3 py-2 text-sm focus:border-[#2D7A32] focus:ring-[#2D7A32]"
                      placeholder="Justifiez votre demande"
                    />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                name="urgence"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgence *</FormLabel>
                    <Select {...field}>
                      <option value="normale">Normale</option>
                      <option value="urgente">Urgente</option>
                      <option value="tres_urgente">Très urgente</option>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="id_projet"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Projet (optionnel)</FormLabel>
                    <Select {...field}>
                      <option value="">Aucun projet</option>
                      {projets.map((projet) => (
                        <option key={projet.id} value={projet.id}>
                          {projet.nom}
                        </option>
                      ))}
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Soumission..." : "Soumettre"}
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


