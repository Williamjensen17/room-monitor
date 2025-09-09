(containerId) => {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <canvas id="eth-chart" height="120"></canvas>
    <div>
      <button onclick="ethRange(1)">1h</button>
      <button onclick="ethRange(6)">6h</button>
      <button onclick="ethRange(12)">12h</button>
      <button onclick="ethRange(24)">24h</button>
    </div>`;
  
  let data = [];
  let labels = [];
  const ctx = document.getElementById("eth-chart").getContext("2d");
  let chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label:"ETH", data, borderColor:"#627eea" }] },
    options: { responsive:true, scales:{x:{},y:{}} }
  });

  window.ethRange = async (hours) => {
    const res = await fetch('/api/crypto');
    const json = await res.json();
    const now = Date.now();
    const cutoff = now - hours*3600*1000;
    const points = json.history.timestamps
      .map((t,i) => ({t,price:json.history.ethereum[i]}))
      .filter(p => p.t > cutoff);
    chart.data.labels = points.map(p => new Date(p.t).toLocaleTimeString());
    chart.data.datasets[0].data = points.map(p => p.price);
    chart.update();
  }

  ethRange(1);
}
