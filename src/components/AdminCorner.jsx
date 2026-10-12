"use client";

import { useState } from "react";
import {
  IconShield,
  IconX,
  IconLock,
  IconLockOpen,
  IconLogout,
  IconCheckCircle,
  IconAlertCircle,
  IconSpinner,
} from "./Icons";

export default function AdminCorner({
  estadoSistema,
  adminAuth,
  refrescarEstado,
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("exito");

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      setTipoMensaje("exito");
      setMensaje("Sesión iniciada");
      setPassword("");
      await refrescarEstado();
    } catch (error) {
      console.error("Error login:", error);
      setTipoMensaje("error");
      setMensaje("Credenciales inválidas");
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = async () => {
    setCargando(true);
    setMensaje("");

    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Error al cerrar sesión");
      }

      setTipoMensaje("exito");
      setMensaje("Sesión cerrada");
      setUsername("");
      setPassword("");
      await refrescarEstado();
      setOpen(false);
    } catch (error) {
      console.error("Error logout:", error);
      setTipoMensaje("error");
      setMensaje("No se pudo cerrar sesión");
    } finally {
      setCargando(false);
    }
  };

  const toggleSistema = async () => {
    setCargando(true);
    setMensaje("");

    try {
      const res = await fetch("/api/admin-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !estadoSistema.isOpen }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || "Error al cambiar estado");
      }

      setTipoMensaje("exito");
      setMensaje(data.state?.isOpen ? "Sistema activado" : "Sistema pausado");

      await refrescarEstado();
    } catch (error) {
      console.error("Error toggle:", error);
      setTipoMensaje("error");
      setMensaje("No se pudo cambiar el estado");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-corner">
      {!open && (
        <button
          type="button"
          className="admin-fab"
          onClick={() => setOpen(true)}
          aria-label="Panel de administración"
        >
          <IconShield />
          {adminAuth ? "Panel Admin" : "Admin"}
        </button>
      )}

      {open && (
        <div className="admin-panel">
          <div className="admin-header">
            <strong>
              <IconShield /> Administración
            </strong>
            <button
              type="button"
              className="admin-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel"
            >
              <IconX />
            </button>
          </div>

          {!adminAuth ? (
            <form onSubmit={handleLogin} className="admin-form">
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={cargando}
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
              />

              <button type="submit" disabled={cargando}>
                {cargando ? (
                  <>
                    <IconSpinner className="spin" /> Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>
          ) : (
            <div className="admin-actions">
              <div
                className={`estado-badge ${
                  estadoSistema.isOpen ? "activo" : "inactivo"
                }`}
              >
                {estadoSistema.isOpen ? (
                  <>
                    <IconLockOpen /> Sistema ACTIVO
                  </>
                ) : (
                  <>
                    <IconLock /> Sistema PAUSADO
                  </>
                )}
              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={toggleSistema}
                disabled={cargando}
              >
                {cargando ? (
                  <IconSpinner className="spin" />
                ) : estadoSistema.isOpen ? (
                  <IconLock />
                ) : (
                  <IconLockOpen />
                )}
                {cargando
                  ? "Procesando..."
                  : estadoSistema.isOpen
                  ? "Pausar reservas"
                  : "Activar reservas"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleLogout}
                disabled={cargando}
              >
                <IconLogout /> Cerrar sesión
              </button>
            </div>
          )}

          {mensaje && (
            <p className={`admin-message ${tipoMensaje}`}>
              {tipoMensaje === "exito" ? (
                <IconCheckCircle />
              ) : (
                <IconAlertCircle />
              )}
              {mensaje}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
