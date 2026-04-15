import fs from "node:fs";
import path from "node:path";
import { get } from "@vercel/edge-config";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "masajes-state.json");

const DEFAULT_STATE = {
  isOpen: true,
  updatedAt: new Date().toISOString(),
};

function ensureLocalFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), "utf8");
  }
}

function readLocalState() {
  ensureLocalFile();
  const raw = fs.readFileSync(FILE_PATH, "utf8");
  return { ...DEFAULT_STATE, ...JSON.parse(raw) };
}

function writeLocalState(isOpen) {
  ensureLocalFile();

  const nextState = {
    isOpen,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(FILE_PATH, JSON.stringify(nextState, null, 2), "utf8");
  return nextState;
}

export async function readSystemState() {
  try {
    if (process.env.NODE_ENV === "production") {
      if (!process.env.EDGE_CONFIG) {
        return {
          isOpen: true,
          updatedAt: new Date().toISOString(),
        };
      }

      const isOpen = await get("masajes_is_open");

      return {
        isOpen: typeof isOpen === "boolean" ? isOpen : true,
        updatedAt: new Date().toISOString(),
      };
    }

    return readLocalState();
  } catch (error) {
    console.error("❌ Error leyendo estado:", error);

    if (process.env.NODE_ENV === "production") {
      return {
        isOpen: true,
        updatedAt: new Date().toISOString(),
      };
    }

    return readLocalState();
  }
}

export async function writeSystemState(isOpen) {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.EDGE_CONFIG_ID || !process.env.EDGE_CONFIG_TOKEN) {
      throw new Error(
        "Falta configurar EDGE_CONFIG_ID y EDGE_CONFIG_TOKEN en Vercel"
      );
    }

    if (!process.env.EDGE_CONFIG_ID.startsWith("ecfg_")) {
      throw new Error("EDGE_CONFIG_ID inválido");
    }

    const url = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            operation: "upsert",
            key: "masajes_is_open",
            value: isOpen,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "No se pudo actualizar Edge Config");
    }

    return {
      isOpen,
      updatedAt: new Date().toISOString(),
    };
  }

  return writeLocalState(isOpen);
}