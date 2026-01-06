"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { ordreMissionSchema, type OrdreMissionFormData } from "@/lib/validations/ordre-mission"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/forms/FileUpload"

export default function NouvelOrdreMissionPage() {
  const [saving, setSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ nom_fichier: string; chemin_fichier: string; type_fichier: string; taille_fichier: number }>>([])
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<OrdreMissionFormData>({
    resolver: zodResolver(ordreMissionSchema),
    defaultValues: {
      destination: "",
      date_debut: "",
      date_fin: "",
      motif: "",
      activites_prevues: "",
      budget_estime: undefined,
    },
  })

  const onSubmit = async (data: OrdreMissionFormData) => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Créer l'ordre de mission
      const { data: ordre, error: ordreError } = await supabase
        .from("ordres_mission")
        .insert({
          id_demandeur: user.id,
          destination: data.destination,
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          motif: data.motif,
          activites_prevues: data.activites_prevues,
          budget_estime: data.budget_estime,
          statut: "brouillon",
        })
        .select()
        .single()

      if (ordreError) throw ordreError

      // Ajouter les documents si présents
      if (uploadedFiles.length > 0 && ordre) {
        const documents = uploadedFiles.map((file) => ({
          id_ordre_mission: ordre.id,
          nom_fichier: file.nom_fichier,
          chemin_fichier: file.chemin_fichier,
          type_fichier: file.type_fichier,
          taille_fichier: file.taille_fichier,
        }))

        const { error: documentsError } = await supabase
          .from("documents_ordre_mission")
          .insert(documents)

        if (documentsError) throw documentsError
      }

      router.push("/ordres-mission/mes-ordres")
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = async () => {
    const data = form.getValues()
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
        .from("ordres_mission")
        .insert({
          id_demandeur: user.id,
          destination: data.destination || "",
          date_debut: data.date_debut || new Date().toISOString().split("T")[0],
          date_fin: data.date_fin || new Date().toISOString().split("T")[0],
          motif: data.motif || "",
          activites_prevues: data.activites_prevues,
          budget_estime: data.budget_estime,
          statut: "brouillon",
        })

      if (error) throw error

      router.push("/ordres-mission/mes-ordres")
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B5E20]">Nouvel ordre de mission</h1>
        <p className="text-[#757575]">
          Remplissez le formulaire pour soumettre une demande d'ordre de mission
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la mission</CardTitle>
          <CardDescription>
            Renseignez tous les champs obligatoires pour soumettre votre demande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-4">
              <FormField
                name="destination"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Destination *</FormLabel>
                    <Input {...field} placeholder="Ville, pays" />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  name="date_debut"
                  children={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Date de début *</FormLabel>
                      <Input type="date" {...field} />
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  name="date_fin"
                  children={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Date de fin *</FormLabel>
                      <Input type="date" {...field} />
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="motif"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Motif *</FormLabel>
                    <Input {...field} placeholder="Raison de la mission" />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                name="activites_prevues"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Activités prévues</FormLabel>
                    <textarea
                      {...field}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                      placeholder="Décrivez les activités prévues lors de cette mission"
                    />
                  </FormItem>
                )}
              />

              <FormField
                name="budget_estime"
                children={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Budget estimé (FCFA)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      placeholder="0.00"
                    />
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Documents justificatifs</FormLabel>
                <FileUpload
                  onUploadComplete={setUploadedFiles}
                  maxSize={5}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Soumission..." : "Soumettre"}
                </Button>
                <Button type="button" variant="outline" onClick={saveDraft} disabled={saving}>
                  Sauvegarder en brouillon
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}


