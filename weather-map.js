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
  const map = L.map('map', { zoomControl: false }).setView([6.8, 122.3], 6);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  const markers = L.layerGroup().addTo(map);
  let readings = [];
  let layer = 'rain';
  let lastUpdated = '';
  const timeFormat = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });

  function color(value) {
    if (layer === 'rain') return value >= 7.5 ? '#a01e94' : value >= 2.5 ? '#d71920' : value > 0 ? '#2382bd' : '#438c62';
    if (layer === 'wind') return value >= 50 ? '#a01e94' : value >= 30 ? '#d71920' : value >= 15 ? '#e99219' : '#438c62';
    return value >= 35 ? '#d71920' : value >= 30 ? '#e99219' : value >= 25 ? '#438c62' : '#2382bd';
  }

  function draw() {
    markers.clearLayers();
    for (const { place, current } of readings) {
      const value = layer === 'rain' ? current.precipitation : layer === 'wind' ? current.wind_speed_10m : current.temperature_2m;
      if (typeof value !== 'number') continue;
      const text = layer === 'rain' ? value.toFixed(1) : Math.round(value).toString();
      const unit = layer === 'rain' ? 'mm' : layer === 'wind' ? 'km/h' : '°C';
      const fill = color(value);
      const icon = L.divIcon({
        className: '', iconSize: [44, 44], iconAnchor: [22, 22],
        html: '<div class="weather-value" style="background:' + fill + ';color:white;border:2px solid white;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 7px #0006">' + text + '</div>',
      });
      L.marker([place.lat, place.lon], { icon }).bindPopup(
        '<b>' + place.name + '</b><br>Rain: ' + current.precipitation + ' mm<br>Wind: ' + current.wind_speed_10m + ' km/h<br>Temperature: ' + current.temperature_2m + ' °C<br>Model time: ' + lastUpdated + ' PHT'
      ).addTo(markers);
    }
  }

  async function refresh() {
    status.textContent = 'Updating weather conditions…';
    const params = new URLSearchParams({
      latitude: places.map(p => p.lat).join(','),
      longitude: places.map(p => p.lon).join(','),
      current: 'temperature_2m,precipitation,wind_speed_10m,weather_code',
      timezone: 'Asia/Manila',
    });
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
      if (!response.ok) throw new Error('Weather service unavailable');
      const data = await response.json();
      const locations = Array.isArray(data) ? data : [data];
      if (locations.length !== places.length || locations.some(x => !x.current)) throw new Error('Incomplete weather data');
      readings = locations.map((item, index) => ({ place: places[index], current: item.current }));
      const modelTime = locations[0].current.time;
      lastUpdated = modelTime ? timeFormat.format(new Date(modelTime + '+08:00')) : timeFormat.format(new Date());
      status.textContent = 'Model estimate: ' + lastUpdated + ' PHT · refreshes every 20 min · tap a location';
      draw();
    } catch (error) {
      status.textContent = readings.length ? 'Weather update failed · showing last loaded estimates' : 'Weather map unavailable · use PAGASA advisories';
    }
  }

  document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
    layer = button.dataset.layer;
    document.querySelectorAll('[data-layer]').forEach(item => item.classList.toggle('active', item === button));
    draw();
  }));
  document.getElementById('refresh').addEventListener('click', refresh);
  refresh();
  setInterval(refresh, 20 * 60 * 1000);
})();
