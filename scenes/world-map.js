(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.WorldMapScene = {
    name: "WorldMapScene",
    background: "",

    async enter(state) {
      state.currentLocation = "World Map";
      await SupabaseSystem.loadLocations(state);
    },

    render(state) {
      const markers = this.renderMapMarkers(state);

      return `
        <div class="scene-panel">
          <h1>World Map</h1>
          <p>The prophecy does not reveal a single path.<br>It reveals fragments scattered across the kingdoms.<br>Where will you go first?</p>
        </div>

        <div class="world-map-wrap">
          <img
            src="images/world-map.jpg"
            class="world-map-image"
            alt="World map"
            onerror="if(this.dataset.fallbackLoaded!=='true'){this.dataset.fallbackLoaded='true';this.src='images/map.webp';return;}this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#203554,#0b1730)';"
          >
          <div class="world-map-markers">
            ${markers}
          </div>
        </div>
      `;
    },

    renderMapMarkers(state) {
      return (state.locations || [])
        .filter((location) => location.scene && location.map_x !== null && location.map_x !== undefined && location.map_y !== null && location.map_y !== undefined)
        .map((location) => `
          <button
            class="world-map-marker"
            style="left:${location.map_x}%;top:${location.map_y}%;"
            onclick="Game.goToLocation('${String(location.id).replace(/'/g, "\\'")}')"
            title="${location.name || location.id}"
          >
            <span class="world-map-marker-dot"></span>
            <span class="world-map-marker-label">${location.name || location.id}</span>
          </button>
        `)
        .join("");
    },

    async handle() {
    },
  };
})();
