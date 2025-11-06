"use client";
import { useState, useEffect, useCallback } from "react";
import FormReserva from "@/components/FormReserva";
import Horarios from "@/components/Horarios";
import '../app/globals.css';


const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxL87P7KOsPWoxWGJ7oc4z60_MjwMeSci6nZH1vdpp44VBaXAXNoVm6-yKY9koPpCe7/exec";

export default function Page() {
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const fechaHoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 🔹 Función de carga reutilizable (sin mostrar loading)
  const fetchReservas = useCallback(async (mostrarCargando = false) => {
    if (mostrarCargando) setCargandoReservas(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });
      const data = await response.json();
      const reservasData = Array.isArray(data) ? data : data.reservas;

      if (Array.isArray(reservasData)) {
        const reservasHoy = reservasData
          .map((r) => {
            const parseHora = (hora) => {
              if (!hora) return "";
              const d = new Date(hora);
              return isNaN(d) ? hora : d.toTimeString().slice(0, 5);
            };
            return {
              ...r,
              fecha: new Date(r.fecha).toISOString().slice(0, 10),
              horaInicio: parseHora(r.horaInicio),
              horaFin: parseHora(r.horaFin),
            };
          })
          .filter((r) => r.fecha === fechaHoy);

        setReservas(reservasHoy);
      }
    } catch (error) {
      console.error("❌ No se pudieron cargar las reservas:", error);
    } finally {
      if (mostrarCargando) setCargandoReservas(false);
    }
  }, [fechaHoy]);

  // 🔸 Carga inicial
  useEffect(() => {
    fetchReservas(true);
  }, [fetchReservas]);

  // 🔸 Actualización automática cada 10 segundos
  useEffect(() => {
    const intervalo = setInterval(() => fetchReservas(false), 10000);
    return () => clearInterval(intervalo);
  }, [fetchReservas]);

  // 🔸 Actualización al detectar interacción del usuario
  useEffect(() => {
    let timeout;
    const handleUserInteraction = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fetchReservas(false), 500); // ligera pausa para evitar spam
    };

    const eventos = ["click", "keydown", "touchstart", "scroll"];
    eventos.forEach((ev) => window.addEventListener(ev, handleUserInteraction));

    return () => {
      eventos.forEach((ev) =>
        window.removeEventListener(ev, handleUserInteraction)
      );
      clearTimeout(timeout);
    };
  }, [fetchReservas]);

  return (
    <main style={{ padding: "2rem" }}>
      <div className="Titulo">
        <h1>Reserva de Masaje</h1> 
        </div>
         <br></br>
      
      <div className="reserva-container">
        <FormReserva
          fecha={fechaHoy}
          reservas={reservas}
          setReservas={setReservas}
          cargandoReservas={cargandoReservas}
          refrescarReservas={fetchReservas}

        />
        <Horarios reservas={reservas} cargandoReservas={cargandoReservas} />
      </div>
    </main>
  );
}
