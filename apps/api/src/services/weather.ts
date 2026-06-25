/**
 * Ambient temperature lookup via Open-Meteo (free, no API key).
 * Feeds the time-based auxiliary/AC term of the Tier-2 energy model.
 *
 * Returns null on any failure (offline, timeout, bad response) so callers fall
 * back to the model's baseline temperature rather than erroring the request.
 */
export async function getTemperatureC(
  lat: number,
  lng: number,
  timeoutMs = 3000,
): Promise<number | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
    `&longitude=${lng}&current=temperature_2m`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number };
    };
    const t = data.current?.temperature_2m;
    return typeof t === "number" ? t : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
