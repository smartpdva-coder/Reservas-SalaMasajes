const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
const EDGE_CONFIG_TOKEN = process.env.EDGE_CONFIG_TOKEN;

export async function writeSystemState(isOpen) {
  const url = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${EDGE_CONFIG_TOKEN}`,
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