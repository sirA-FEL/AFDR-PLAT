"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProfilPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("profils")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const formData = new FormData(e.currentTarget)

      const { error } = await supabase
        .from("profils")
        .update({
          nom: formData.get("nom") as string,
          prenom: formData.get("prenom") as string,
          departement: formData.get("departement") as string,
          poste: formData.get("poste") as string,
        })
        .eq("id", user.id)

      if (error) throw error

      alert("Profil mis à jour avec succès")
      loadProfile()
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData(e.currentTarget)
      const newPassword = formData.get("new_password") as string
      const confirmPassword = formData.get("confirm_password") as string

      if (newPassword !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      alert("Mot de passe modifié avec succès")
      e.currentTarget.reset()
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (!profile) {
    return <div>Profil non trouvé</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B5E20]">Mon profil</h1>
        <p className="text-[#757575]">
          Gérez vos informations personnelles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Modifiez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input
                name="nom"
                defaultValue={profile.nom}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Prénom</label>
              <Input
                name="prenom"
                defaultValue={profile.prenom || ""}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-[#F5F5F5]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Département</label>
              <Input
                name="departement"
                defaultValue={profile.departement || ""}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Poste</label>
              <Input
                name="poste"
                defaultValue={profile.poste || ""}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <CardDescription>
            Modifiez votre mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nouveau mot de passe *</label>
              <Input
                type="password"
                name="new_password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Confirmer le mot de passe *</label>
              <Input
                type="password"
                name="confirm_password"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Modification..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


