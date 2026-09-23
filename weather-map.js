(() => {
  const places = [
    { name: 'Cotabato City', lat: 7.19, lon: 124.53 },
    { name: 'Marawi City', lat: 8.00, lon: 124.29 },
    { name: 'Lamitan', lat: 6.65, lon: 122.14 },
    { name: 'Jolo', lat: 6.05, lon: 121.00 },
    { name: 'Bongao', lat: 5.03, lon: 119.77 },
    { name: 'Datu Odin Sinsuat', lat: 7.04, lon: 124.39 },
  ];
  const status = document.getElementById('status');
  const slider = document.getElementById('forecast-hour');
  const output = document.getElementById('forecast-time');
  const playButton = document.getElementById('play');
  const map = L.map('map', { zoomControl: false }).setView([6.8, 122.3], 6);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  const markers = L.layerGroup().addTo(map);
  let readings = [];
  let hours = [];
  let layer = 'rain';
  let hour = 0;
  let playTimer;
  const timeFormat = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  function timeLabel(iso) {
    return timeFormat.format(new Date(iso + '+08:00')) + ' PHT';
  }
  function color(value) {
    if (layer === 'rain') return value >= 7.5 ? '#a01e94' : value >= 2.5 ? '#d71920' : value > 0 ? '#2382bd' : '#438c62';
    if (layer === 'wind') return value >= 50 ? '#a01e94' : value >= 30 ? '#d71920' : value >= 15 ? '#e99219' : '#438c62';
    return value >= 35 ? '#d71920' : value >= 30 ? '#e99219' : value >= 25 ? '#438c62' : '#2382bd';
  }
  function draw() {
    markers.clearLayers();
    if (!hours.length) return;
    const validTime = timeLabel(hours[hour]);
    output.value = validTime;
    status.textContent = 'MODEL FORECAST · valid ' + validTime + ' · rain is the previous hour total (mm) · not observed radar';
    readings.forEach(({ place, hourly }) => {
      const rain = hourly.precipitation[hour];
      const wind = hourly.wind_speed_10m[hour];
      const temp = hourly.temperature_2m[hour];
      const chance = hourly.precipitation_probability?.[hour];
      const value = layer === 'rain' ? rain : layer === 'wind' ? wind : temp;
      if (typeof value !== 'number') return;
      const fill = color(value);
      if (layer === 'rain' && rain > 0) {
        L.circle([place.lat, place.lon], {
          radius: 45000, stroke: false, fillColor: fill, fillOpacity: Math.min(.48, .2 + rain / 45),
          interactive: false,
        }).addTo(markers);
      }
      const text = layer === 'rain' ? value.toFixed(1) : Math.round(value).toString();
      const icon = L.divIcon({
        className: '', iconSize: [44, 44], iconAnchor: [22, 22],
        html: '<div class="weather-value" style="background:' + fill + ';color:white;border:2px solid white;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 7px #0006">' + text + '</div>',
      });
      L.marker([place.lat, place.lon], { icon }).bindPopup(
        '<b>' + place.name + '</b><br>Forecast valid: ' + validTime +
        '<br>Rain: ' + rain + ' mm / previous hour' +
        (typeof chance === 'number' ? '<br>Rain chance: ' + chance + '%' : '') +
        '<br>Wind: ' + wind + ' km/h<br>Temperature: ' + temp + ' °C'
      ).addTo(markers);
    });
  }
  function stop() {
    clearInterval(playTimer);
    playTimer = undefined;
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Play forecast');
  }
  function play() {
    if (!hours.length) return;
    stop();
    playButton.textContent = '❚❚';
    playButton.setAttribute('aria-label', 'Pause forecast');
    playTimer = setInterval(() => {
      hour = (hour + 1) % hours.length;
      slider.value = hour;
      draw();
    }, 1600);
  }
  async function refresh() {
    status.textContent = 'Updating rain forecast…';
    const params = new URLSearchParams({
      latitude: places.map(p => p.lat).join(','),
      longitude: places.map(p => p.lon).join(','),
      hourly: 'precipitation,precipitation_probability,wind_speed_10m,temperature_2m',
      forecast_hours: '13',
      timezone: 'Asia/Manila',
    });
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
      if (!response.ok) throw new Error('Forecast service unavailable');
      const data = await response.json();
      const locations = Array.isArray(data) ? data : [data];
      if (locations.length !== places.length || locations.some(x => !x.hourly?.time?.length)) throw new Error('Incomplete forecast');
      readings = locations.map((item, index) => ({ place: places[index], hourly: item.hourly }));
      hours = locations[0].hourly.time;
      slider.max = hours.length - 1;
      hour = 0;
      slider.value = 0;
      draw();
    } catch (_) {
      status.textContent = readings.length ? 'Forecast update failed · showing last loaded model run' : 'Forecast unavailable · check PAGASA advisories';
    }
  }
  document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
    layer = button.dataset.layer;
    document.querySelectorAll('[data-layer]').forEach(item => item.classList.toggle('active', item === button));
    draw();
  }));
  slider.addEventListener('input', () => { hour = Number(slider.value); stop(); draw(); });
  playButton.addEventListener('click', () => playTimer ? stop() : play());
  document.getElementById('refresh').addEventListener('click', refresh);
  refresh();
  setInterval(refresh, 20 * 60 * 1000);
})();
