"use client";

export default function Horarios({ reservas, cargandoReservas }) {
  if (cargandoReservas) return <p>⏳ Cargando horarios...</p>;

  const horariosOcupados = reservas
    .map((r) => (typeof r.horaInicio === "string" ? r.horaInicio : null))
    .filter(Boolean);

  console.log("📊 Horarios ocupados para hoy:", horariosOcupados);

  const HORARIOS = [
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

  return (
    <div className="horarios">
      <h3>Horarios del Día</h3>
      <div className="grid-horarios">
        {HORARIOS.map((h) => {
          const inicio = h.split(" – ")[0];
          const ocupado = horariosOcupados.includes(inicio);
          if (ocupado) console.log(`🔴 Horario ocupado mostrado: ${inicio}`);
          return (
            <div key={h} className={`horario ${ocupado ? "ocupado" : "libre"}`}>
              {h} {ocupado && "⛔"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
