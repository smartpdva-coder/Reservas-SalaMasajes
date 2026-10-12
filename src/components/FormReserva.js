"use client";
import { useEffect, useRef, useState } from "react";
import {
  IconUser,
  IconClock,
  IconCheckCircle,
  IconAlertCircle,
  IconLock,
  IconSpinner,
} from "./Icons";

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
  hora,
  setHora,
}) {
  const [participante, setParticipante] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("exito");
  const [reservaExitosa, setReservaExitosa] = useState(false);

  // Evita doble submit si el usuario hace doble clic o doble Enter
  // antes de que React vuelva a renderizar con `cargando = true`.
  const enVueloRef = useRef(false);

  // Si la hora seleccionada pasa a estar ocupada (p. ej. otra persona la
  // tomó mientras tanto) o el usuario la deselecciona, limpiamos el mensaje
  // de éxito previo para no confundir.
  useEffect(() => {
    if (!hora) setReservaExitosa(false);
  }, [hora]);

  const participanteNormalizado = normalizarNombre(participante);

  const yaReservado =
    participanteNormalizado &&
    reservas.some(
      (r) =>
        typeof r.participante === "string" &&
        normalizarNombre(r.participante) === participanteNormalizado
    );

  const bloqueado =
    cargando ||
    cargandoReservas ||
    yaReservado ||
    reservaExitosa ||
    !sistemaActivo;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enVueloRef.current) return;

    if (!sistemaActivo) {
      setTipoMensaje("error");
      setMensaje("Las reservas están temporalmente deshabilitadas.");
      return;
    }

    if (!hora || !participante.trim()) {
      setTipoMensaje("error");
      setMensaje("Selecciona un horario disponible y escribe tu nombre.");
      return;
    }

    enVueloRef.current = true;
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
      setTipoMensaje("exito");
      setMensaje("Reserva guardada con éxito.");
      setReservaExitosa(true);

      await refrescarReservas(false);
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      setTipoMensaje("error");
      setMensaje(error.message || "Ocurrió un error al guardar.");
      setReservaExitosa(false);
      setHora("");
      // El horario pudo haber sido tomado por otra persona: refrescamos
      // para que se pinte como ocupado de inmediato, sin esperar al poll.
      await refrescarReservas(false);
    } finally {
      setCargando(false);
      enVueloRef.current = false;
    }
  };

  if (cargandoReservas) {
    return (
      <div className="form-reserva">
        <p className="loading">
          <IconSpinner className="spin" />
          Cargando reservas...
        </p>
      </div>
    );
  }

  return (
    <form className="form-reserva" onSubmit={handleSubmit}>
      <h3>Confirmar Reserva</h3>

      {!sistemaActivo && (
        <p className="mensaje error">
          <IconLock />
          Reservas pausadas por administración
        </p>
      )}

      <div className="hora-elegida">
        <span className="label-texto">
          <IconClock /> Horario elegido
        </span>
        {hora ? (
          <div className="hora-elegida-chip">{hora}</div>
        ) : (
          <div className="hora-elegida-vacio">
            Elige un horario en la lista de la izquierda
          </div>
        )}
      </div>

      <label>
        <span className="label-texto">
          <IconUser /> Participante
        </span>
        <input
          type="text"
          value={participante}
          onChange={(e) => {
            const valor = e.target.value;
            if (/^[a-zA-ZÀ-ÿñÑ\s]*$/.test(valor)) {
              setParticipante(valor);
            }
          }}
          required
          placeholder="Tu nombre completo"
          disabled={bloqueado}
        />
      </label>

      <button type="submit" disabled={bloqueado || !hora}>
        {cargando ? (
          <>
            <IconSpinner className="spin" /> Guardando...
          </>
        ) : !sistemaActivo ? (
          <>
            <IconLock /> Reservas cerradas
          </>
        ) : reservaExitosa ? (
          <>
            <IconCheckCircle /> Reservado
          </>
        ) : yaReservado ? (
          <>
            <IconAlertCircle /> Ya reservaste
          </>
        ) : (
          "Reservar"
        )}
      </button>

      {mensaje && (
        <p className={`mensaje ${tipoMensaje}`}>
          {tipoMensaje === "exito" ? <IconCheckCircle /> : <IconAlertCircle />}
          {mensaje}
        </p>
      )}
    </form>
  );
}
