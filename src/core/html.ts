/** Escapes text for use inside an HTML attribute or text node. */
export function escapeAttr(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

