import { z } from "zod"

export const ordreMissionSchema = z.object({
  destination: z.string().min(1, "La destination est requise"),
  date_debut: z.string().min(1, "La date de début est requise"),
  date_fin: z.string().min(1, "La date de fin est requise"),
  motif: z.string().min(1, "Le motif est requis"),
  activites_prevues: z.string().optional(),
  budget_estime: z.number().min(0, "Le budget doit être positif").optional(),
}).refine((data) => {
  const dateDebut = new Date(data.date_debut)
  const dateFin = new Date(data.date_fin)
  return dateFin >= dateDebut
}, {
  message: "La date de fin doit être postérieure ou égale à la date de début",
  path: ["date_fin"],
})

export type OrdreMissionFormData = z.infer<typeof ordreMissionSchema>


