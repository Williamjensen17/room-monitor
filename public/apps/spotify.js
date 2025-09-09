(containerId) => {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div>🎵 <span id="track">No track</span> - <span id="artist">—</span></div>
    <div>
      <button onclick="spotifyPrev()">⏮️</button>
      <button onclick="spotifyPlayPause()">⏯️</button>
      <button onclick="spotifyNext()">⏭️</button>
    </div>`;
  
  async function update() {
    const res = await fetch('/api/spotify');
    const d = await res.json();
    el.querySelector('#track').textContent = d.track;
    el.querySelector('#artist').textContent = d.artist;
  }
  
  window.spotifyPlayPause = () => alert("Would toggle playback");
  window.spotifyPrev = () => alert("Would go prev track");
  window.spotifyNext = () => alert("Would go next track");

  update();
  setInterval(update, 10000);
}
