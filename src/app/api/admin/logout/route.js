import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearAdminSession();

    return NextResponse.json({
      ok: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("❌ Error logout admin:", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo cerrar sesión" },
      { status: 500 }
    );
  }
}