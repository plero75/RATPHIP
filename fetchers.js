import { CONFIG } from "./config.js";
import { parseStop, parseJourney } from "./parser.js";

/* ------------------------------------------------------------------
 *  Wrapper fetch commun : ajoute le proxy + encode l’URL cible
 *  (aucun header apikey n’est ajouté, le proxy s’en charge)
 * -----------------------------------------------------------------*/
async function call(targetUrl) {
  const url = CONFIG.proxy
    ? CONFIG.proxy + encodeURIComponent(targetUrl)
    : targetUrl;

  const resp = await fetch(url);          // ← pas de headers
  if (!resp.ok) throw new Error(`HTTP ${resp.status} sur ${targetUrl}`);
  return resp.json();
}

/* ------------------------------------------------------------------
 *  Récupère les prochains passages + éventuelle alerte perturbation
 * -----------------------------------------------------------------*/
export async function fetchStation(stopRef, lineRef) {
  /* 1) Prochains départs (StopMonitoring) */
  const stopUrl =
    "https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring" +
    `?MonitoringRef=${stopRef}`;

  const stopJson   = await call(stopUrl);
  const departures = parseStop(stopJson);

  /* 2) Message perturbation (GeneralMessage) */
  let alert = "";
  if (lineRef) {
    const gmUrl =
      "https://prim.iledefrance-mobilites.fr/marketplace/general-message" +
      `?LineRef=${lineRef}`;

    try {
      const gmJson = await call(gmUrl);
      alert =
        gmJson?.Siri?.ServiceDelivery?.GeneralMessageDelivery?.[0]
          ?.InfoMessage?.[0]?.Content?.MessageText || "";
    } catch {
      /* Pas de message ➜ on ignore silencieusement */
    }
  }

  return { departures, alert };
}

/* ------------------------------------------------------------------
 *  Détail des gares restantes pour un VehicleJourney (RER A…)
 * -----------------------------------------------------------------*/
export async function fetchJourney(journeyRef) {
  const url =
    "https://prim.iledefrance-mobilites.fr/marketplace/vehicle-journey/" +
    journeyRef;

  const json = await call(url);
  return parseJourney(json);
}
