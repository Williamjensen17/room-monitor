(containerId) => {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <canvas id="btc-chart" height="120"></canvas>
    <div>
      <button onclick="btcRange(1)">1h</button>
      <button onclick="btcRange(6)">6h</button>
      <button onclick="btcRange(12)">12h</button>
      <button onclick="btcRange(24)">24h</button>
    </div>`;
  
  let data = [];
  let labels = [];
  const ctx = document.getElementById("btc-chart").getContext("2d");
  let chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label:"BTC", data, borderColor:"#f7931a" }] },
    options: { responsive:true, scales:{x:{},y:{}} }
  });

  window.btcRange = async (hours) => {
    const res = await fetch('/api/crypto');
    const json = await res.json();
    const now = Date.now();
    const cutoff = now - hours*3600*1000;
    const points = json.history.timestamps
      .map((t,i) => ({t,price:json.history.bitcoin[i]}))
      .filter(p => p.t > cutoff);
    chart.data.labels = points.map(p => new Date(p.t).toLocaleTimeString());
    chart.data.datasets[0].data = points.map(p => p.price);
    chart.update();
  }

  btcRange(1); // default 1h
}
