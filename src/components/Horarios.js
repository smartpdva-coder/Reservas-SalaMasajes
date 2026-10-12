"use client";

import { IconCheckCircle, IconLock, IconSpinner } from "./Icons";

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

export default function Horarios({ reservas, cargandoReservas }) {
  if (cargandoReservas) {
    return (
      <div className="horarios">
        <p className="loading">
          <IconSpinner className="spin" />
          Cargando horarios...
        </p>
      </div>
    );
  }

  const horariosOcupados = reservas
    .map((r) => (typeof r.horaInicio === "string" ? r.horaInicio : null))
    .filter(Boolean);

  const libres = HORARIOS.length - horariosOcupados.length;

  return (
    <div className="horarios">
      <div className="horarios-header">
        <h3>Horarios del Día</h3>
        <span className="horarios-contador">{libres} libres</span>
      </div>

      <div className="grid-horarios">
        {HORARIOS.map((h) => {
          const inicio = h.split(" – ")[0];
          const ocupado = horariosOcupados.includes(inicio);

          return (
            <div key={h} className={`horario ${ocupado ? "ocupado" : "libre"}`}>
              {ocupado ? <IconLock /> : <IconCheckCircle />}
              <span>{h}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
