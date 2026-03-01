import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ users: [], message: "Admin users API – à implémenter" })
}

export async function POST() {
  return NextResponse.json(
    { error: "Non implémenté" },
    { status: 501 }
  )
}
