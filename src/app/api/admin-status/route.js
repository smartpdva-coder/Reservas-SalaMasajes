import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readSystemState, writeSystemState } from "@/lib/system-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await readSystemState();
    const authenticated = await isAdminAuthenticated();

    return NextResponse.json({
      ok: true,
      isOpen: state.isOpen,
      updatedAt: state.updatedAt,
      authenticated,
    });
  } catch (error) {
    console.error("❌ Error leyendo admin-status:", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo leer el estado del sistema" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authenticated = await isAdminAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const nextState = await writeSystemState(Boolean(body.isOpen));

    return NextResponse.json({
      ok: true,
      state: nextState,
    });
  } catch (error) {
    console.error("❌ Error actualizando admin-status:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "No se pudo actualizar el estado" },
      { status: 500 }
    );
  }
}