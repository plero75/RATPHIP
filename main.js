import { CONFIG } from "./config.js";
import { fetchStation, fetchJourney } from "./fetchers.js";
import { render } from "./renderer.js";

/* Horloge murale --------------------------------------------------*/
const clock=document.getElementById("clock");
setInterval(()=>clock.textContent=
  new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),1_000);

/* DOM cibles */
const $={
  joinville:document.getElementById("joinville"),
  hippodrome:document.getElementById("hippodrome"),
  breuil:document.getElementById("breuil")
};

/* Rafraîchissement principal -------------------------------------*/
async function loop(){
  try{
    const [j,h,b]=await Promise.all([
      fetchStation(CONFIG.stops.joinville_rer,CONFIG.lines.rerA),
      fetchStation(CONFIG.stops.hippodrome,  CONFIG.lines.bus77),
      fetchStation(CONFIG.stops.ecole_breuil,CONFIG.lines.bus201)
    ]);

    render($.joinville,"Joinville-le-Pont",       j.departures,j.alert);
    render($.hippodrome,"Hippodrome de Vincennes",h.departures,h.alert);
    render($.breuil,"École du Breuil",            b.departures,b.alert);

    /* Détail gares RER A (pour le 1ᵉʳ départ uniquement) */
    const firstJourney=j.departures.find(d=>d.journeyId);
    if(firstJourney){
      const list=await fetchJourney(firstJourney.journeyId);
      // Affiche en tooltip :
      $.joinville.querySelector("h2").title="➔ "+list.join(" · ");
    }
  }catch(e){console.error(e);}
}
loop();
setInterval(loop,CONFIG.refresh.stop);
