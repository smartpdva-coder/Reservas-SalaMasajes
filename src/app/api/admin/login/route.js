import { NextResponse } from "next/server";
import {
  createAdminSession,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    await createAdminSession();

    return NextResponse.json({
      ok: true,
      message: "Sesión iniciada correctamente",
    });
  } catch (error) {
    console.error("❌ Error login admin:", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo iniciar sesión" },
      { status: 500 }
    );
  }
}