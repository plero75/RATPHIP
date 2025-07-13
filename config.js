/**
 * Configuration de l’afficheur temps-réel
 * (version sans header apikey – la clé est ajoutée par le proxy Cloudflare)
 */

export const CONFIG = {
  /* Proxy CORS → garde bien “?url=” en suffixe */
  proxy: "https://ratp-proxy.hippodrome-proxy42.workers.dev/?url=",

  /* Références StopArea PRIM */
  stops: {
    joinville_rer: "STIF:StopArea:SP:43135:",
    hippodrome:    "STIF:StopArea:SP:463642:",
    ecole_breuil:  "STIF:StopArea:SP:463645:"
  },

  /* Références Line PRIM (pour les messages perturbations) */
  lines: {
    rerA:  "STIF:Line::C01742:",
    bus77: "STIF:Line::C02251:",
    bus201:"STIF:Line::C01219:"
  },

  /* Intervalles de rafraîchissement en millisecondes */
  refresh: {
    stop:    20_000,   // StopMonitoring
    journey: 60_000    // VehicleJourney
  }
};
