// main.js (corrigé : noms de lignes, directions, arrêts à venir, statuts, visuels)

const stops = [
  {
    name: "Joinville-le-Pont",
    id: "STIF:StopArea:SP:43135:",
    lines: [
      "line:IDFM:C01742", "line:IDFM:C02251", "line:IDFM:C01130",
      "line:IDFM:C01135", "line:IDFM:C01137", "line:IDFM:C01139",
      "line:IDFM:C01141", "line:IDFM:C01219", "line:IDFM:C01260",
      "line:IDFM:C01399"
    ],
  },
  {
    name: "Hippodrome de Vincennes",
    id: "STIF:StopArea:SP:463641:",
    lines: ["line:IDFM:C02251"],
  },
  {
    name: "École du Breuil",
    id: "STIF:StopArea:SP:463644:",
    lines: ["line:IDFM:C01219"],
  },
];

const proxyBase = "https://ratp-proxy.hippodrome-proxy42.workers.dev/?url=";
const primBase = "https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef=";
const journeyBase = "https://prim.iledefrance-mobilites.fr/marketplace/vehicle-journey/";

async function fetchDepartures(stopId) {
  const url = proxyBase + encodeURIComponent(primBase + stopId);
  const res = await fetch(url);
  const json = await res.json();
  const visits = json?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit || [];

  const departures = await Promise.all(visits.map(async v => {
    const mvj = v.MonitoredVehicleJourney;
    const mc = mvj.MonitoredCall;
    const journeyId = mvj?.FramedVehicleJourneyRef?.DatedVehicleJourneyRef;
    const expected = mc?.ExpectedDepartureTime;
    const scheduled = mc?.AimedDepartureTime;

    let stops = [];
    try {
      const stopsUrl = proxyBase + encodeURIComponent(journeyBase + journeyId);
      const stopsRes = await fetch(stopsUrl);
      const stopsJson = await stopsRes.json();
      stops = stopsJson?.journey?.calls?.map(call => call.stop_name).slice(0, 10) || [];
    } catch (e) {
      console.warn("Erreur chargement arrêts:", e);
    }

    const now = new Date();
    const next = new Date(expected);
    const minutes = Math.round((next - now) / 60000);

    let status = "🟢 À l'heure";
    if (mc?.DepartureStatus === "cancelled") status = "❌ Supprimé";
    else if (minutes < 1) status = "🟢 Imminent";
    else if (minutes > 0 && scheduled && expected !== scheduled) {
      const delay = Math.round((new Date(expected) - new Date(scheduled)) / 60000);
      status = `⚠️ Retard +${delay} min`;
    }

    return {
      line: mvj?.PublishedLineName || mvj?.LineRef || "?",
      destination: mc?.DestinationDisplay?.FrontText || mc?.DestinationDisplay || "?",
      expected,
      minutes,
      status,
      stops,
      direction: mvj?.DirectionName || "?",
    };
  }));

  const byDirection = {};
  for (const dep of departures) {
    const dir = dep.destination;
    if (!byDirection[dir]) byDirection[dir] = [];
    if (byDirection[dir].length < 4) {
      byDirection[dir].push(dep);
    }
  }

  return byDirection;
}

function createStationBlock(name, groupedDepartures) {
  const section = document.createElement("section");
  section.className = "station";

  const title = document.createElement("h2");
  title.className = "station-title";
  title.textContent = name;
  section.appendChild(title);

  for (const direction in groupedDepartures) {
    const block = document.createElement("div");
    block.className = "line-block";

    const head = document.createElement("div");
    head.className = "line-header";
    const lineName = groupedDepartures[direction][0]?.line || "";
    head.innerHTML = `<span class='line-name'>${lineName}</span> → <span class='direction'>${direction}</span>`;
    block.appendChild(head);

    const details = document.createElement("ul");
    details.className = "departures";

    groupedDepartures[direction].forEach(dep => {
      const li = document.createElement("li");
      li.innerHTML = `
        🕐 ${new Date(dep.expected).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        <span class="countdown">⏳ ${dep.minutes} min</span>
        <span class="status">${dep.status}</span><br>
        <small class="stops">Arrêts : ${dep.stops.join(" → ")}</small>
      `;
      details.appendChild(li);
    });

    block.appendChild(details);
    section.appendChild(block);
  }

  return section;
}

async function renderDashboard() {
  const main = document.getElementById("dashboard");
  for (const stop of stops) {
    const deps = await fetchDepartures(stop.id);
    const bloc = createStationBlock(stop.name, deps);
    main.appendChild(bloc);
  }
}

document.addEventListener("DOMContentLoaded", renderDashboard);
