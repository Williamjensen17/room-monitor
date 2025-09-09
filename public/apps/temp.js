(containerId) => {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div>🌡️ Temperature: <span id="temp-val">--</span>°C</div>
    <div>💧 Humidity: <span id="hum-val">--</span>%</div>`;
  
  async function update() {
    const res = await fetch('/api/temp');
    const d = await res.json();
    el.querySelector('#temp-val').textContent = d.temperature;
    el.querySelector('#hum-val').textContent = d.humidity;
  }
  update();
  setInterval(update, 10000);
}
