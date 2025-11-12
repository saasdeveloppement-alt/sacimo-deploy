import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const demoRequestSchema = z.object({
  fullName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone invalide").max(30).optional().or(z.literal("")),
  company: z.string().min(2, "Entreprise requise"),
  companySize: z.string().optional(),
  role: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  message: z.string().max(1000).optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parseResult = demoRequestSchema.safeParse(json)

    if (!parseResult.success) {
      const errorMessage =
        parseResult.error.issues[0]?.message ?? "Champs invalides, merci de vérifier le formulaire."
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { objectives, phone, ...data } = parseResult.data

    await prisma.demoRequest.create({
      data: {
        ...data,
        phone: phone || null,
        objectives: objectives?.length ? objectives.join(", ") : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Demo request error", error)
    return NextResponse.json(
      { error: "Une erreur est survenue. Merci de réessayer plus tard." },
      { status: 500 },
    )
  }
}




