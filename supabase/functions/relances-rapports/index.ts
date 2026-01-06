import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const aujourdhui = new Date()
    const dans7Jours = new Date(aujourdhui)
    dans7Jours.setDate(dans7Jours.getDate() + 7)
    const dans1Jour = new Date(aujourdhui)
    dans1Jour.setDate(dans1Jour.getDate() + 1)

    // Rapports avec deadline dans 7 jours
    const { data: rapportsJ7, error: errorJ7 } = await supabaseClient
      .from("rapports")
      .select("*")
      .eq("statut", "en_attente")
      .gte("date_limite", aujourdhui.toISOString().split("T")[0])
      .lte("date_limite", dans7Jours.toISOString().split("T")[0])

    if (errorJ7) throw errorJ7

    // Rapports avec deadline dans 1 jour
    const { data: rapportsJ1, error: errorJ1 } = await supabaseClient
      .from("rapports")
      .select("*")
      .eq("statut", "en_attente")
      .gte("date_limite", aujourdhui.toISOString().split("T")[0])
      .lte("date_limite", dans1Jour.toISOString().split("T")[0])

    if (errorJ1) throw errorJ1

    // Rapports en retard
    const { data: rapportsRetard, error: errorRetard } = await supabaseClient
      .from("rapports")
      .select("*")
      .eq("statut", "en_retard")
      .lt("date_limite", aujourdhui.toISOString().split("T")[0])

    if (errorRetard) throw errorRetard

    // Créer les notifications et relances
    const relances = []

    for (const rapport of rapportsJ7 || []) {
      const typeRelance = "j_7"
      const { data: existing } = await supabaseClient
        .from("relances_rapports")
        .select("*")
        .eq("id_rapport", rapport.id)
        .eq("type_relance", typeRelance)
        .single()

      if (!existing) {
        await supabaseClient.from("notifications").insert({
          id_utilisateur: rapport.id_responsable,
          type: "alerte",
          titre: "Rapport à soumettre",
          message: `Le rapport ${rapport.type_rapport} pour la période ${rapport.periode} doit être soumis dans 7 jours.`,
          lien_action: `/rapportage`,
        })

        await supabaseClient.from("relances_rapports").insert({
          id_rapport: rapport.id,
          type_relance: typeRelance,
          envoye: true,
        })

        relances.push({ rapport: rapport.id, type: typeRelance })
      }
    }

    for (const rapport of rapportsJ1 || []) {
      const typeRelance = "j_1"
      const { data: existing } = await supabaseClient
        .from("relances_rapports")
        .select("*")
        .eq("id_rapport", rapport.id)
        .eq("type_relance", typeRelance)
        .single()

      if (!existing) {
        await supabaseClient.from("notifications").insert({
          id_utilisateur: rapport.id_responsable,
          type: "alerte",
          titre: "Rapport à soumettre URGENT",
          message: `Le rapport ${rapport.type_rapport} pour la période ${rapport.periode} doit être soumis demain.`,
          lien_action: `/rapportage`,
        })

        await supabaseClient.from("relances_rapports").insert({
          id_rapport: rapport.id,
          type_relance: typeRelance,
          envoye: true,
        })

        relances.push({ rapport: rapport.id, type: typeRelance })
      }
    }

    // Mettre à jour le statut des rapports en retard
    if (rapportsRetard && rapportsRetard.length > 0) {
      await supabaseClient.rpc("mettre_a_jour_statut_rapports_retard")

      for (const rapport of rapportsRetard) {
        const typeRelance = "quotidien"
        const aujourdhuiStr = aujourdhui.toISOString().split("T")[0]
        const { data: existing } = await supabaseClient
          .from("relances_rapports")
          .select("*")
          .eq("id_rapport", rapport.id)
          .eq("type_relance", typeRelance)
          .gte("date_relance", aujourdhuiStr)
          .single()

        if (!existing) {
          await supabaseClient.from("notifications").insert({
            id_utilisateur: rapport.id_responsable,
            type: "alerte",
            titre: "Rapport en retard",
            message: `Le rapport ${rapport.type_rapport} pour la période ${rapport.periode} est en retard.`,
            lien_action: `/rapportage`,
          })

          await supabaseClient.from("relances_rapports").insert({
            id_rapport: rapport.id,
            type_relance: typeRelance,
            envoye: true,
          })

          relances.push({ rapport: rapport.id, type: typeRelance })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, relances: relances.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    )
  }
})


