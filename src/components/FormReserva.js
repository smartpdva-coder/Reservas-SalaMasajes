"use client";
import { useState } from "react";

const HORARIOS_DISPONIBLES = [
  "08:45 – 09:00", "09:00 – 09:15", "09:15 – 09:30", "09:30 – 09:45",
  "10:00 – 10:15", "10:15 – 10:30", "10:30 – 10:45", "10:45 – 11:00",
  "11:15 – 11:30", "11:30 – 11:45", "11:45 – 12:00", "12:00 – 12:15",
];

export default function FormReserva({ fecha, reservas, setReservas, cargandoReservas, refrescarReservas }) {
  const [participante, setParticipante] = useState("");
  const [hora, setHora] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reservaExitosa, setReservaExitosa] = useState(false);

  const yaReservado = reservas.some(
    (r) =>
      typeof r.participante === "string" &&
      r.participante.toLowerCase() === participante.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hora || !participante) {
      alert("Selecciona un horario y escribe tu nombre");
      return;
    }

    setCargando(true);
    setMensaje("");
    setReservaExitosa(false);

    const [h, m] = hora.split(":").map(Number);
    const horaFinDate = new Date();
    horaFinDate.setHours(h, m + 15);
    const horaFin = horaFinDate.toTimeString().slice(0, 5);

    const nuevaReserva = {
      id: Date.now().toString(),
      fecha,
      horaInicio: hora,
      horaFin,
      participante,
    };

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaReserva),
      });

      const data = await res.json();

      // ✅ Validación robusta (solo marca error si realmente lo hubo)
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Error al guardar reserva");
      }

      // ✅ Actualiza reservas localmente
      setReservas((prev) => [...prev, nuevaReserva]);
      setMensaje("✅ Reserva guardada con éxito");
      setReservaExitosa(true);
      setHora("");

      // 🔄 Actualiza reservas desde el servidor (multiusuario)
      await refrescarReservas();
    } catch (error) {
      console.error("⚠️ Error al guardar reserva:", error);
      setMensaje("❌ Ocurrió un error al guardar. Intenta nuevamente.");
      setReservaExitosa(false);
    } finally {
      setCargando(false);
    }
  };

  if (cargandoReservas)
    return <p className="loading">⏳ Cargando reservas...</p>;

  return (
    <form className="form-reserva" onSubmit={handleSubmit}>
      <h3>Registrar Reserva</h3>

      <label>
        Participante:
        <input
          type="text"
          value={participante}
          onChange={(e) => {
            const valor = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(valor)) setParticipante(valor);
          }}
          required
          placeholder="Tu nombre completo"
          disabled={cargando || cargandoReservas || yaReservado || reservaExitosa}
        />
      </label>

      <label>
        Hora:
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
          disabled={cargando || cargandoReservas || yaReservado || reservaExitosa}
        >
          <option value="">Selecciona horario</option>
          {HORARIOS_DISPONIBLES.map((h) => {
            const inicio = h.split(" – ")[0];
            const ocupado = reservas.some((r) => r.horaInicio === inicio);
            return (
              <option key={h} value={inicio} disabled={ocupado}>
                {h} {ocupado ? "⛔ Ocupado" : ""}
              </option>
            );
          })}
        </select>
      </label>

      <button
        type="submit"
        disabled={cargando || cargandoReservas || yaReservado || reservaExitosa}
      >
        {cargando
          ? "Guardando..."
          : reservaExitosa
          ? "Reservado ✅"
          : yaReservado
          ? "Ya reservaste"
          : "Reservar"}
      </button>

      {mensaje && (
        <p
          className={`mensaje ${
            mensaje.includes("✅") ? "exito" : "error"
          }`}
        >
          {mensaje}
        </p>
      )}
    </form>
  );
}
