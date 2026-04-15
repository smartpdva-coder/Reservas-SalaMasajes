import { NextResponse } from "next/server";
import { readSystemState } from "@/lib/system-store";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxL87P7KOsPWoxWGJ7oc4z60_MjwMeSci6nZH1vdpp44VBaXAXNoVm6-yKY9koPpCe7/exec";

// === POST: Guarda una nueva reserva ===
export async function POST(req) {
  try {
    const data = await req.json();
    console.log("📥 Datos recibidos en API:", data);

    // ✅ Validar si el sistema está activo o pausado
    const systemState = await readSystemState();

    if (!systemState.isOpen) {
      return NextResponse.json(
        {
          ok: false,
          message: "Las reservas están temporalmente deshabilitadas.",
        },
        { status: 423 }
      );
    }

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const text = await res.text();
    console.log("📩 Respuesta cruda del Apps Script:", text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    if (!res.ok || parsed?.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed?.message || "Error al guardar la reserva.",
          data: parsed,
        },
        { status: 500 }
      );
    }

    // ✅ En Vercel + polling YA NO usamos emitReservasUpdated

    return NextResponse.json({
      ok: true,
      message: "Reserva registrada correctamente.",
      data: parsed,
    });
  } catch (err) {
    console.error("❌ Error en POST:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

// === GET: Obtiene todas las reservas guardadas ===
export async function GET() {
  try {
    console.log("📡 Consultando reservas desde Google Script...");

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`, {
      cache: "no-store",
    });

    const text = await response.text();

    if (text.trim().startsWith("<")) {
      console.error("⚠️ HTML recibido en lugar de JSON:", text.slice(0, 200));
      throw new Error("El Apps Script no devolvió JSON. Revisa tu doGet().");
    }

    let data = [];
    try {
      data = JSON.parse(text);
    } catch {
      console.error("⚠️ No se pudo parsear el JSON, devolviendo vacío.");
      data = [];
    }

    if (!Array.isArray(data)) data = [];

    console.log(`✅ Reservas obtenidas: ${data.length} registros`);
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error en GET:", err);
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}