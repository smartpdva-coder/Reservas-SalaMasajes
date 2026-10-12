"use client";

import { useState, useEffect, useCallback } from "react";
import FormReserva from "@/components/FormReserva";
import Horarios from "@/components/Horarios";
import AdminCorner from "@/components/AdminCorner";
import { IconLock, IconSpa, IconCpu } from "@/components/Icons";
import "../app/globals.css";

export default function Page() {
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [estadoSistema, setEstadoSistema] = useState({
    isOpen: true,
    authenticated: false,
    updatedAt: null,
  });

  const fechaHoy = new Date().toISOString().slice(0, 10);

  const normalizarFecha = (valor) => {
    if (!valor) return "";

    if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return valor;
    }

    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return "";

    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const parseHora = (hora) => {
    if (!hora) return "";

    if (typeof hora === "string" && /^\d{2}:\d{2}$/.test(hora)) {
      return hora;
    }

    const d = new Date(hora);
    if (isNaN(d.getTime())) {
      return String(hora).slice(0, 5);
    }

    return d.toTimeString().slice(0, 5);
  };

  const fetchReservas = useCallback(async (mostrarCargando = false) => {
    if (mostrarCargando) setCargandoReservas(true);

    try {
      const response = await fetch("/api/reservas?t=" + Date.now(), {
        cache: "no-store",
      });

      const data = await response.json();
      const reservasData = Array.isArray(data) ? data : [];

      // El Apps Script devuelve las cabeceras en minúsculas
      // (horainicio, horafin), no en camelCase: normalizamos aceptando
      // ambas formas para no depender de cómo venga el JSON.
      const reservasHoy = reservasData
        .map((r) => ({
          ...r,
          fecha: normalizarFecha(r.fecha ?? r.Fecha),
          horaInicio: parseHora(r.horaInicio ?? r.horainicio),
          horaFin: parseHora(r.horaFin ?? r.horafin),
          participante: r.participante ?? r.Participante ?? "",
        }))
        .filter((r) => r.fecha === fechaHoy);

      setReservas(reservasHoy);
    } catch (error) {
      console.error("❌ No se pudieron cargar las reservas:", error);
      setReservas([]);
    } finally {
      if (mostrarCargando) setCargandoReservas(false);
    }
  }, [fechaHoy]);

  const fetchEstadoSistema = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-status?t=" + Date.now(), {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.ok !== false) {
        setEstadoSistema({
          isOpen: Boolean(data.isOpen),
          authenticated: Boolean(data.authenticated),
          updatedAt: data.updatedAt || null,
        });
      }
    } catch (error) {
      console.error("❌ Error cargando estado del sistema:", error);
    }
  }, []);

  useEffect(() => {
  Promise.all([fetchReservas(true), fetchEstadoSistema()]);
}, [fetchReservas, fetchEstadoSistema]);

useEffect(() => {
  const intervalo = setInterval(() => {
    fetchReservas(false);
    fetchEstadoSistema();
  }, 2500);

  return () => clearInterval(intervalo);
}, [fetchReservas, fetchEstadoSistema]);

  return (
    <main style={{ padding: "2rem", position: "relative" }}>
      <AdminCorner
        estadoSistema={estadoSistema}
        adminAuth={estadoSistema.authenticated}
        refrescarEstado={fetchEstadoSistema}
      />

      <div className="TituloAnimado">
        <IconSpa className="titulo-icono" />
        <h1>Reserva tu Sesión de Masaje</h1>
      </div>

      {!estadoSistema.isOpen && (
        <div className="banner-bloqueado">
          <IconLock />
          Las reservas están temporalmente pausadas por administración.
        </div>
      )}

      <div className="reserva-container">
        <Horarios
          reservas={reservas}
          cargandoReservas={cargandoReservas}
          horaSeleccionada={horaSeleccionada}
          onSeleccionarHora={setHoraSeleccionada}
          sistemaActivo={estadoSistema.isOpen}
        />

        <FormReserva
          fecha={fechaHoy}
          reservas={reservas}
          setReservas={setReservas}
          cargandoReservas={cargandoReservas}
          refrescarReservas={fetchReservas}
          sistemaActivo={estadoSistema.isOpen}
          hora={horaSeleccionada}
          setHora={setHoraSeleccionada}
        />
      </div>

      <footer className="footer-ti">
        <IconCpu />
        <span>Equipo TI · 2026</span>
      </footer>
    </main>
  );
}