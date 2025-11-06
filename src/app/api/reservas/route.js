import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxL87P7KOsPWoxWGJ7oc4z60_MjwMeSci6nZH1vdpp44VBaXAXNoVm6-yKY9koPpCe7/exec";

// === POST: Guarda una nueva reserva ===
export async function POST(req) {
  try {
    const data = await req.json();
    console.log("📥 Datos recibidos en API:", data);

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    console.log("📩 Respuesta cruda del Apps Script:", text);

    // Intentamos parsear por si Apps Script devuelve JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    // ✅ Siempre devolvemos un JSON limpio al frontend
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
    const response = await fetch(GOOGLE_SCRIPT_URL, { cache: "no-store" });
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
