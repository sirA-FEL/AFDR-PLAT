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

    // Vérifier les alertes MEAL
    const { data: alertes, error } = await supabaseClient.rpc(
      "verifier_alertes_meal"
    )

    if (error) throw error

    // Créer des notifications pour chaque alerte
    for (const alerte of alertes || []) {
      // Récupérer le responsable du projet
      const { data: projet } = await supabaseClient
        .from("projets")
        .select("id_responsable")
        .eq("id", alerte.id_projet)
        .single()

      if (projet?.id_responsable) {
        await supabaseClient.from("notifications").insert({
          id_utilisateur: projet.id_responsable,
          type: "alerte",
          titre: "Alerte MEAL",
          message: alerte.message,
          lien_action: `/meal/projets/${alerte.id_projet}/activites/${alerte.id_activite}`,
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, alertes: alertes?.length || 0 }),
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


