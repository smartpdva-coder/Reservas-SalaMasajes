// ID de la hoja de cálculo (tomado de tu script original)
const SPREADSHEET_ID = "1C-79_7dYw1-xgLwKcGYS8XKBQDOlSPWPRe9jcqhbi7Q";
const SHEET_RESERVAS = "Reservas";
const SHEET_USUARIOS = "Usuarios";

// ====================================================================
// FUNCIÓN PRINCIPAL DE ESCRITURA (POST)
// (Guarda la reserva y actualiza el contador de participaciones)
// ====================================================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  const tieneLock = lock.tryLock(10000); // espera hasta 10s por el lock

  if (!tieneLock) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: "El sistema está ocupado, intenta de nuevo en unos segundos." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const props = PropertiesService.getScriptProperties();
  let keySlot, keyParticipante;
  let marcoPropiedades = false;

  try {
    const data = JSON.parse(e.postData.contents);

    const fecha = String(data.fecha).trim().slice(0, 10);
    const hora = String(data.horaInicio).trim().slice(0, 5);
    const participanteNorm = String(data.participante).trim().toLowerCase();

    keySlot = `slot_${fecha}_${hora}`;
    keyParticipante = `participante_${fecha}_${participanteNorm}`;

    // --- Candado atómico: PropertiesService es consistente de inmediato
    //     entre ejecuciones, a diferencia de leer celdas de Sheets
    //     (que puede tener retraso de propagación entre escritura y
    //     lectura de ejecuciones distintas). ---
    if (props.getProperty(keySlot)) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, message: "Ese horario ya fue reservado por otra persona. Elige otro." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (props.getProperty(keyParticipante)) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, message: "Ya tienes una reserva registrada hoy." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Marca el horario como tomado ANTES de tocar la hoja.
    props.setProperties({
      [keySlot]: data.participante,
      [keyParticipante]: "1",
    });
    marcoPropiedades = true;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetReservas = ss.getSheetByName(SHEET_RESERVAS);

    // --- 1. Guardar la nueva reserva ---
    sheetReservas.appendRow([
      data.id || new Date().getTime(),
      data.fecha,
      data.horaInicio,
      data.horaFin,
      data.participante
    ]);

    // Fuerza a confirmar la escritura en la hoja antes de seguir.
    SpreadsheetApp.flush();

    // --- 2. Contar todas las reservas del participante ---
    const allReservas = sheetReservas.getDataRange().getValues();
    const headersReservas = allReservas[0];
    const participanteIndex = headersReservas.map(h => h.trim().toLowerCase()).indexOf("participante");

    let count = 0;
    for (let i = 1; i < allReservas.length; i++) {
      if (String(allReservas[i][participanteIndex]).trim() === String(data.participante).trim()) {
        count++;
      }
    }

    // --- 3. Actualizar el contador en 'Usuarios' ---
    // No crítico: si falla aquí, la reserva ya quedó guardada y el
    // candado debe seguir puesto (no se hace rollback por esto).
    try {
      const sheetUsuarios = ss.getSheetByName(SHEET_USUARIOS);
      const usersData = sheetUsuarios.getDataRange().getValues();

      if (usersData.length > 1) {
        const headersUsuarios = usersData[0];
        const nombreIndex = headersUsuarios.map(h => h.trim().toLowerCase()).indexOf("nombre");
        const participacionesIndex = headersUsuarios.map(h => h.trim().toLowerCase()).indexOf("numeroparticipaciones");

        if (nombreIndex !== -1 && participacionesIndex !== -1) {
          for (let i = 1; i < usersData.length; i++) {
            if (String(usersData[i][nombreIndex]).trim() === String(data.participante).trim()) {
              sheetUsuarios.getRange(i + 1, participacionesIndex + 1).setValue(count);
              break;
            }
          }
        }
      }
    } catch (errContador) {
      Logger.log("No se pudo actualizar el contador de usuarios: " + errContador.message);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: "Reserva y contador actualizados con éxito." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Si ya habíamos puesto el candado pero algo falló después (guardar
    // la fila, el flush, etc.), lo liberamos para no dejar un horario
    // bloqueado fantasma sin ninguna reserva real detrás.
    if (marcoPropiedades) {
      try {
        props.deleteProperty(keySlot);
        props.deleteProperty(keyParticipante);
      } catch (errRollback) {
        Logger.log("No se pudo revertir propiedades: " + errRollback.message);
      }
    }
    Logger.log("Error en doPost: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: "Error en el servidor: " + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ====================================================================
// FUNCIÓN PRINCIPAL DE LECTURA (GET)
// (Obtiene Reservas y Usuarios)
// ====================================================================
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tz = ss.getSpreadsheetTimeZone();
    const hoy = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
    const normFecha = (v) => v instanceof Date ? Utilities.formatDate(v, tz, "yyyy-MM-dd") : String(v).trim().slice(0, 10);
    let allData = {};

    // Función auxiliar para leer y mapear una hoja
    const readSheet = (sheetName) => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        Logger.log(`Hoja ${sheetName} no encontrada.`);
        return [];
      }
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return [];
      }

      const headers = data.shift();
      return data.map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          // Se usa .toLowerCase() y .trim() para ser robusto con las cabeceras
          obj[header.trim().toLowerCase()] = row[i];
        });
        return obj;
      });
    }

    // --- 1. Obtener Reservas de HOY únicamente ---
    // El frontend solo usa las reservas del día actual (filtra por fecha
    // igual, lo hacía del lado del cliente). Filtrarlo aquí reduce el
    // tamaño de la respuesta JSON, que si no, crece sin límite a medida
    // que se acumulan reservas de meses anteriores en la hoja.
    allData.reservas = readSheet(SHEET_RESERVAS).filter(
      (r) => normFecha(r.fecha) === hoy
    );

    // La hoja "Usuarios" ya NO se lee aquí: el frontend nunca la usa, y
    // leerla en cada sondeo (cada 2.5s, por cada usuario conectado)
    // solo sumaba tiempo de ejecución y aumentaba el riesgo de que
    // Google cortara la respuesta a mitad de camino bajo carga.
    allData.usuarios = [];

    // Respuesta combinada: { reservas: [...], usuarios: [...] }
    return ContentService
      .createTextOutput(JSON.stringify(allData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error en doGet: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: "Error al leer datos: " + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====================================================================
// UTILIDAD DE MANTENIMIENTO (ejecutar manualmente una sola vez, o cada
// vez que sospeches de un "candado fantasma": un horario que la hoja
// muestra libre pero el servidor rechaza como ocupado).
// Se ejecuta a mano desde el editor: seleccionar esta función en el
// menú de arriba y presionar "Ejecutar".
// ====================================================================
function limpiarPropiedadesHuerfanas() {
  const props = PropertiesService.getScriptProperties();
  const todas = props.getProperties();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_RESERVAS);
  const filas = sheet.getDataRange().getValues();
  const headers = filas[0].map(h => String(h).trim().toLowerCase());
  const idxFecha = headers.indexOf("fecha");
  const idxHora = headers.indexOf("horainicio");
  const idxPart = headers.indexOf("participante");
  const tz = ss.getSpreadsheetTimeZone();

  const normHora = (v) => v instanceof Date ? Utilities.formatDate(v, tz, "HH:mm") : String(v).trim().slice(0, 5);
  const normFecha = (v) => v instanceof Date ? Utilities.formatDate(v, tz, "yyyy-MM-dd") : String(v).trim().slice(0, 10);

  const slotsReales = new Set();
  const participantesReales = new Set();
  for (let i = 1; i < filas.length; i++) {
    const f = normFecha(filas[i][idxFecha]);
    const h = normHora(filas[i][idxHora]);
    const p = String(filas[i][idxPart]).trim().toLowerCase();
    slotsReales.add(`slot_${f}_${h}`);
    participantesReales.add(`participante_${f}_${p}`);
  }

  let borradas = 0;
  Object.keys(todas).forEach((key) => {
    if (key.startsWith("slot_") && !slotsReales.has(key)) {
      props.deleteProperty(key);
      borradas++;
    }
    if (key.startsWith("participante_") && !participantesReales.has(key)) {
      props.deleteProperty(key);
      borradas++;
    }
  });

  Logger.log("Propiedades huérfanas borradas: " + borradas);
}
