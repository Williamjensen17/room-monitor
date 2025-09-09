(containerId) => {
  const el = document.getElementById(containerId);

  // Initial HTML for graph + buttons
  el.innerHTML = `
    <canvas id="btc-chart-${containerId}" height="140"></canvas>
    <div style="margin-top:8px;">
      <button onclick="window.btcRange_${containerId}(1)">1h</button>
      <button onclick="window.btcRange_${containerId}(6)">6h</button>
      <button onclick="window.btcRange_${containerId}(12)">12h</button>
      <button onclick="window.btcRange_${containerId}(24)">24h</button>
    </div>
    <div style="margin-top:8px;">Current: <span id="btc-price-${containerId}">--</span> USD</div>
  `;

  const ctx = document.getElementById(`btc-chart-${containerId}`).getContext("2d");

  // Chart.js instance
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{ label: "BTC/USD", data: [], borderColor: "#f7931a", fill: false }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#aaa" } },
        y: { ticks: { color: "#aaa" } }
      }
    }
  });

  // Define range handler with unique name (to avoid conflicts if multiple BTC widgets ever exist)
  window[`btcRange_${containerId}`] = async (hours) => {
    try {
      const res = await fetch("/api/crypto");
      const json = await res.json();
      if (!json.history) return;

      // Current price
      document.getElementById(`btc-price-${containerId}`).textContent = json.bitcoin?.usd?.toLocaleString() || "--";

      const now = Date.now();
      const cutoff = now - hours * 3600 * 1000;

      // Filter only points within cutoff
      const points = json.history.timestamps
        .map((t, i) => ({ t, price: json.history.bitcoin[i] }))
        .filter(p => p.t >= cutoff);

      chart.data.labels = points.map(p => new Date(p.t).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}));
      chart.data.datasets[0].data = points.map(p => p.price);
      chart.update();
    } catch (e) {
      console.error("BTC widget error:", e);
    }
  };

  // Default load (1h)
  window[`btcRange_${containerId}`](1);

  // Auto refresh every minute (keeps fresh data showing)
  setInterval(() => window[`btcRange_${containerId}`](1), 60000);
}
