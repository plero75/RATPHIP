/* Couleur pastille selon attente */
const tone=m=>m<=2?"vert":m<=10?"orange":"rouge";

export function render(dom,title,rows,alert=""){
  dom.innerHTML=`
    <h2>${title}</h2>
    <table>${rows.map(r=>`
      <tr class="${tone(r.minutes)}">
        <td class="code">${r.line}</td>
        <td class="dest">${r.dest}</td>
        <td class="min">${r.minutes===0?"🚍":r.minutes}</td>
      </tr>`).join("")}</table>
    ${alert?`<div class="alert">⚠︎ ${alert}</div>`:""}
  `;
}
