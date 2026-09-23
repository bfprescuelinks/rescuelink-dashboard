(() => {
  const format = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  let clock;
  function update() {
    if (!clock || !clock.isConnected) return;
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = format.format(now);
  }

  function mount() {
    const summary = document.querySelector('aside .summary');
    if (!summary) return;
    const existing = document.querySelector('aside .pht-clock');
    if (existing) {
      clock = existing.querySelector('time');
      return;
    }
    const banner = document.createElement('div');
    banner.className = 'pht-clock';
    const label = document.createElement('span');
    label.textContent = 'PHILIPPINE TIME (PHT)';
    clock = document.createElement('time');
    banner.append(label, clock);
    summary.parentNode.insertBefore(banner, summary);
    update();
  }

  const style = document.createElement('style');
  style.textContent = '.pht-clock{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px;background:#24272d;color:#fff;padding:10px 22px;font-size:14px;font-weight:800}.pht-clock span{color:#f4b400;font-size:10px;letter-spacing:1px}.pht-clock time{font-variant-numeric:tabular-nums}@media(max-width:700px){.pht-clock{padding:9px 18px;font-size:13px}}';
  document.head.appendChild(style);

  const observer = new MutationObserver(() => {
    if (!document.querySelector('aside .pht-clock')) mount();
  });
  observer.observe(document.getElementById('root'), { childList: true, subtree: true });
  mount();
  setInterval(() => { mount(); update(); }, 1000);
})();
