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

export default function Horarios({
  reservas,
  cargandoReservas,
  horaSeleccionada,
  onSeleccionarHora,
  sistemaActivo,
}) {
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

  const horariosOcupados = new Set(
    reservas
      .map((r) => (typeof r.horaInicio === "string" ? r.horaInicio : null))
      .filter(Boolean)
  );

  const libres = HORARIOS.length - horariosOcupados.size;

  return (
    <div className="horarios">
      <div className="horarios-header">
        <h3>Horarios del Día</h3>
        <span className="horarios-contador">{libres} libres</span>
      </div>
      <p className="horarios-ayuda">Toca un horario disponible para seleccionarlo.</p>

      <div className="grid-horarios">
        {HORARIOS.map((h) => {
          const inicio = h.split(" – ")[0];
          const ocupado = horariosOcupados.has(inicio);
          const seleccionado = horaSeleccionada === inicio;
          const deshabilitado = ocupado || !sistemaActivo;

          return (
            <button
              type="button"
              key={h}
              disabled={deshabilitado}
              onClick={() => onSeleccionarHora(inicio)}
              className={`horario ${ocupado ? "ocupado" : "libre"} ${
                seleccionado ? "seleccionado" : ""
              }`}
            >
              {ocupado ? <IconLock /> : <IconCheckCircle />}
              <span>{h}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
