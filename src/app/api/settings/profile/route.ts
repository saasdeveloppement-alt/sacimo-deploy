import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).nullish(),
  contactRole: z.string().max(120).nullish(),
  agency: z.string().min(2).max(150),
  companySize: z.string().max(100).nullish(),
  objectives: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
  }

  return NextResponse.json({
    fullName: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    contactRole: user.agency?.primaryRole ?? "",
    agency: user.agency?.name ?? "",
    companySize: user.agency?.companySize ?? "",
    objectives: user.agency?.objectives ? user.agency.objectives.split(",").map((item) => item.trim()).filter(Boolean) : [],
    notes: user.agency?.notes ?? "",
  })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const json = await request.json()
  const parsed = updateSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Champs invalides" },
      { status: 400 },
    )
  }

  const { fullName, email, phone, contactRole, agency, companySize, objectives, notes } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        name: fullName,
        email,
        phone: phone ?? null,
      },
    })

    if (user.agency) {
      await tx.agency.update({
        where: { id: user.agency.id },
        data: {
          name: agency,
          companySize: companySize ?? null,
          objectives: objectives?.length ? objectives.join(", ") : null,
          notes: notes ?? null,
          phone: phone ?? user.agency.phone,
          primaryRole: contactRole ?? user.agency.primaryRole,
        },
      })
    } else {
      await tx.agency.create({
        data: {
          name: agency,
          companySize: companySize ?? null,
          objectives: objectives?.length ? objectives.join(", ") : null,
          notes: notes ?? null,
          phone: phone ?? null,
          primaryRole: contactRole ?? null,
          users: {
            connect: { id: user.id },
          },
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}

