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
    const { to, subject, body } = await req.json()

    // Ici, vous pouvez intégrer un service d'email comme Resend, SendGrid, etc.
    // Pour l'instant, on simule l'envoi
    console.log(`Email envoyé à ${to}: ${subject}`)

    // Exemple avec Resend (à configurer avec votre clé API)
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
    // await resend.emails.send({
    //   from: "noreply@afdr.com",
    //   to,
    //   subject,
    //   html: body,
    // })

    return new Response(
      JSON.stringify({ success: true, message: "Email envoyé" }),
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


