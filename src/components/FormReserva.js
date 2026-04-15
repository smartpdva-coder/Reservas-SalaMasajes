"use client";
import { useState } from "react";

const HORARIOS_DISPONIBLES = [
  "08:45 – 09:00",
  "09:00 – 09:15",
  "09:15 – 09:30",
  "09:30 – 09:45",
  "10:00 – 10:15",
  "10:15 – 10:30",
  "10:30 – 10:45",
  "10:45 – 11:00",
  "11:15 – 11:30",
  "11:30 – 11:45",
  "11:45 – 12:00",
  "12:00 – 12:15",
];

function normalizarNombre(valor = "") {
  return valor.trim().replace(/\s+/g, " ").toLowerCase();
}

export default function FormReserva({
  fecha,
  reservas,
  setReservas,
  cargandoReservas,
  refrescarReservas,
  sistemaActivo,
}) {
  const [participante, setParticipante] = useState("");
  const [hora, setHora] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reservaExitosa, setReservaExitosa] = useState(false);

  const participanteNormalizado = normalizarNombre(participante);

  const yaReservado =
    participanteNormalizado &&
    reservas.some(
      (r) =>
        typeof r.participante === "string" &&
        normalizarNombre(r.participante) === participanteNormalizado
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sistemaActivo) {
      setMensaje("⛔ Las reservas están temporalmente deshabilitadas.");
      return;
    }

    if (!hora || !participante.trim()) {
      setMensaje("⚠️ Selecciona un horario y escribe tu nombre");
      return;
    }

    setCargando(true);
    setMensaje("");
    setReservaExitosa(false);

    const [h, m] = hora.split(":").map(Number);
    const horaFinDate = new Date();
    horaFinDate.setHours(h, m + 15, 0, 0);
    const horaFin = horaFinDate.toTimeString().slice(0, 5);

    const nuevaReserva = {
      id: Date.now().toString(),
      fecha,
      horaInicio: hora,
      horaFin,
      participante: participante.trim(),
    };

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaReserva),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Error al guardar reserva");
      }

      setReservas((prev) => [...prev, nuevaReserva]);
      setMensaje("✅ Reserva guardada con éxito");
      setReservaExitosa(true);
      setHora("");

      await refrescarReservas(false);
    } catch (error) {
      console.error("⚠️ Error al guardar reserva:", error);
      setMensaje(error.message || "❌ Ocurrió un error al guardar.");
      setReservaExitosa(false);
    } finally {
      setCargando(false);
    }
  };

  if (cargandoReservas) {
    return <p className="loading">⏳ Cargando reservas...</p>;
  }

  return (
    <form className="form-reserva" onSubmit={handleSubmit}>
      <h3>Registrar Reserva</h3>

      {!sistemaActivo && (
        <p className="mensaje error">
          ⛔ Reservas pausadas por administración
        </p>
      )}

      <label>
        Participante:
        <input
          type="text"
          value={participante}
          onChange={(e) => {
            const valor = e.target.value;
            if (/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/.test(valor)) {
              setParticipante(valor);
            }
          }}
          required
          placeholder="Tu nombre completo"
          disabled={
            cargando ||
            cargandoReservas ||
            yaReservado ||
            reservaExitosa ||
            !sistemaActivo
          }
        />
      </label>

      <label>
        Hora:
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
          disabled={
            cargando ||
            cargandoReservas ||
            yaReservado ||
            reservaExitosa ||
            !sistemaActivo
          }
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
        disabled={
          cargando ||
          cargandoReservas ||
          yaReservado ||
          reservaExitosa ||
          !sistemaActivo
        }
      >
        {cargando
          ? "Guardando..."
          : !sistemaActivo
          ? "Reservas cerradas"
          : reservaExitosa
          ? "Reservado ✅"
          : yaReservado
          ? "Ya reservaste"
          : "Reservar"}
      </button>

      {mensaje && (
        <p className={`mensaje ${mensaje.includes("✅") ? "exito" : "error"}`}>
          {mensaje}
        </p>
      )}
    </form>
  );
}