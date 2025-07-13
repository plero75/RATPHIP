import { CONFIG } from "./config.js";
import { parseStop, parseJourney } from "./parser.js";

/* Appel générique avec proxy + headers */
async function call(url){
  const final = CONFIG.proxy ? CONFIG.proxy+encodeURIComponent(url) : url;
  const res   = await fetch(final,{headers:CONFIG.headers});
  if(!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

/* StopMonitoring + GeneralMessage pour une station ----------------*/
export async function fetchStation(stopRef,lineRef){
  /* 1) prochains passages */
  const stopUrl = `https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring`
                + `?MonitoringRef=${stopRef}`;
  const stopJson = await call(stopUrl);
  const departures = parseStop(stopJson);

  /* 2) perturbations éventuelles */
  let alert="";
  if(lineRef){
    const msgUrl = `https://prim.iledefrance-mobilites.fr/marketplace/general-message`
                 + `?LineRef=${lineRef}`;
    try{
      const gm   = await call(msgUrl);
      alert = gm?.Siri?.ServiceDelivery?.GeneralMessageDelivery?.[0]
              ?.InfoMessage?.[0]?.Content?.MessageText || "";
    }catch{/* silencieux */}
  }
  return {departures,alert};
}

/* Détail gares RER A pour un VehicleJourney -----------------------*/
export async function fetchJourney(journeyRef){
  const url = `https://prim.iledefrance-mobilites.fr/marketplace/vehicle-journey/${journeyRef}`;
  const json = await call(url);
  return parseJourney(json);
}
