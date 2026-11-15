const WINDOW_MS = 60_000;
const MAX_REQ_PER_WINDOW = 5;

const requests = new Map<string, number[]>();

/**
 * Rate limit en memoria por IP. Suficiente para frenar abuso simple desde una
 * sola instancia; en despliegues serverless multi-instancia (Vercel) no
 * persiste entre instancias — para eso conviene un store compartido tipo
 * Upstash Redis.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Si el reloj vuelve atrás, los timestamps "del futuro" se descartan en vez
  // de dejar la IP bloqueada hasta que el reloj los alcance.
  const timestamps = (requests.get(ip) || []).filter(
    (t) => now - t >= 0 && now - t < WINDOW_MS
  );
  if (timestamps.length >= MAX_REQ_PER_WINDOW) {
    requests.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  requests.set(ip, timestamps);
  return true;
}
