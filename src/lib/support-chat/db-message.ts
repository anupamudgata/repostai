import type { UIMessage } from "ai";

export function textFromUIMessageParts(parts: UIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function dbRowToUIMessage(row: {
  id: string;
  role: string;
  content: string;
  parts: unknown;
}): UIMessage | null {
  if (row.role !== "user" && row.role !== "assistant") return null;
  const role = row.role as "user" | "assistant";
  if (Array.isArray(row.parts) && row.parts.length > 0) {
    return { id: row.id, role, parts: row.parts as UIMessage["parts"] };
  }
  return {
    id: row.id,
    role,
    parts: [{ type: "text", text: row.content ?? "" }],
  };
}
