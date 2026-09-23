(() => {
  function mount() {
    const summary = document.querySelector('aside .summary');
    if (!summary || document.querySelector('aside .weather-panel')) return;

    const panel = document.createElement('section');
    panel.className = 'weather-panel';
    panel.setAttribute('aria-label', 'Live weather map monitoring');
    panel.innerHTML = `
      <div class="weather-panel-head">
        <div><strong>LIVE WEATHER MAP</strong><small>BARMM · current conditions</small></div>
        <button type="button" aria-label="Expand weather map">Expand</button>
      </div>
      <iframe title="BARMM live weather map" src="./weather-map.html" loading="lazy"></iframe>
      <div class="weather-panel-foot">Model estimates by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · <a href="https://www.pagasa.dost.gov.ph/" target="_blank" rel="noopener noreferrer">PAGASA advisories</a></div>`;
    const button = panel.querySelector('button');
    button.addEventListener('click', () => {
      const expanded = panel.classList.toggle('expanded');
      button.textContent = expanded ? 'Close' : 'Expand';
      button.setAttribute('aria-label', expanded ? 'Close expanded weather map' : 'Expand weather map');
    });
    summary.insertAdjacentElement('afterend', panel);
  }

  const style = document.createElement('style');
  style.textContent = `.weather-panel{background:#fff;border-bottom:1px solid #d9dce3;box-shadow:0 2px 8px #0001}.weather-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px}.weather-panel-head strong{display:block;color:#8d0b13;font-size:12px;letter-spacing:1px}.weather-panel-head small{display:block;color:#59616c;font-size:11px;margin-top:2px}.weather-panel-head button{border:1px solid #a40e18;border-radius:7px;background:#fff;color:#8d0b13;font-weight:800;padding:6px 10px;cursor:pointer}.weather-panel iframe{width:100%;height:260px;border:0;display:block}.weather-panel-foot{padding:7px 16px;font-size:10px;color:#59616c}.weather-panel-foot a{color:#8d0b13}.weather-panel.expanded{position:fixed;inset:3vh 3vw;z-index:5000;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;box-shadow:0 18px 60px #0008}.weather-panel.expanded iframe{flex:1;min-height:0;height:auto}@media(max-width:700px){.weather-panel iframe{height:230px}.weather-panel.expanded{inset:2vh 2vw}}`;
  document.head.appendChild(style);
  const root = document.getElementById('root');
  new MutationObserver(() => {
    if (!document.querySelector('aside .weather-panel')) mount();
  }).observe(root, { childList: true, subtree: true });
  mount();
})();
