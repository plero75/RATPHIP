import { fetchJourney } from "./fetchers.js";

/* Couleur pastille selon minutes restantes */
const tone = (m) =>
  m <= 2 ? "vert" : m <= 10 ? "orange" : m <= 20 ? "orange" : "rouge";

/**
 * Rend une station avec trajets + gares desservies si `journeyId` dispo.
 * @param {HTMLElement} dom
 * @param {string} title
 * @param {Array} departures
 * @param {string} alert
 */
export async function render(dom, title, departures, alert = "") {
  dom.innerHTML = `<h2>${title}</h2><div class="cards"></div>`;
  const container = dom.querySelector(".cards");

  for (const dep of departures) {
    const card = document.createElement("div");
    card.className = `card ${tone(dep.minutes)}`;

    // Bloc principal : ligne, destination, temps
    card.innerHTML = `
      <div class="top">
        <span class="line">${dep.line}</span>
        <span class="dest">${dep.dest}</span>
        <span class="min">${dep.minutes === 0 ? "🚍" : dep.minutes} min</span>
      </div>
      <div class="gares">Chargement…</div>
    `;
    container.appendChild(card);

    // Si journeyId dispo → affiche les gares
    if (dep.journeyId) {
      try {
        const stops = await fetchJourney(dep.journeyId);
        card.querySelector(".gares").innerText = "➔ " + stops.join(" • ");
      } catch {
        card.querySelector(".gares").innerText = "Gares indisponibles";
      }
    } else {
      card.querySelector(".gares").remove();
    }
  }

  if (alert) {
    container.insertAdjacentHTML(
      "beforeend",
      `<div class="alert">⚠ ${alert}</div>`
    );
  }
}
