(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.WorldMapScene = {
    name: "WorldMapScene",
    background: "",

    async enter(state) {
      state.currentLocation = "World Map";
    },

    render() {
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
          <button class="world-map-button world-map-ice" onclick="Game.handle('go_ice')">Ice Kingdom (25 min, -3 hunger)</button>
          <button class="world-map-button world-map-sky" onclick="Game.handle('go_sky')">Sky Kingdom (25 min, -3 hunger)</button>
          <button class="world-map-button world-map-sand" onclick="Game.handle('go_sand')">Sand Kingdom (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "go_ice") {
        game.applyTimeCost(state, 25);
        state.currentLocation = "Ice Kingdom";
        await game.setScene(Scenes.IcePalace);
      }

      if (action === "go_sky") {
        game.applyTimeCost(state, 25);
        state.currentLocation = "Sky Kingdom";
        await game.setScene(Scenes.Cliff);
      }

      if (action === "go_sand") {
        game.applyTimeCost(state, 25);
        state.currentLocation = "Sand Kingdom";
        await game.setScene(Scenes.Viper);
      }
    },
  };
})();
