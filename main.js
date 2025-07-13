import {
  fetchJoinville,
  fetchHippodrome,
  fetchEcoleBreuil
} from "./fetchers.js";
import { CONFIG } from "./config.js";
import { renderStation } from "./renderer.js";

const els = {
  clock: document.getElementById("clock"),
  joinville: document.getElementById("joinville"),
  hippodrome: document.getElementById("hippodrome"),
  breuil: document.getElementById("breuil")
};

function updateClock() {
  const now = new Date();
  els.clock.textContent = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
updateClock();
setInterval(updateClock, 1_000);

async function refresh() {
  try {
    const [j, h, b] = await Promise.all([
      fetchJoinville(),
      fetchHippodrome(),
      fetchEcoleBreuil()
    ]);

    renderStation(els.joinville, "Joinville-le-Pont", j);
    renderStation(els.hippodrome, "Hippodrome de Vincennes", h);
    renderStation(els.breuil, "École du Breuil", b);
  } catch (err) {
    console.error(err);
  }
}

refresh();
setInterval(refresh, CONFIG.refresh.leon); // 20 s
