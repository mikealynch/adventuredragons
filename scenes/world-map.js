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
          <button class="world-map-button world-map-ice" onclick="Game.handle('go_ice')">Enter Ice Kingdom</button>
          <button class="world-map-button world-map-sky" onclick="Game.handle('go_sky')">Enter Sky Kingdom</button>
          <button class="world-map-button world-map-sand" onclick="Game.handle('go_sand')">Enter Sand Kingdom</button>
          <button class="world-map-button world-map-sea" onclick="Game.handle('go_sea')">Enter Sea Kingdom</button>
          <button class="world-map-button world-map-rain" onclick="Game.handle('go_rain')">Enter Rainforest Kingdom</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "go_ice") {
        game.applyTimeCost(state, 25);
        state.activeLocation = await SupabaseSystem.getLocationById("ice_palace");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Ice Kingdom";
        await game.setScene(Scenes.IcePalace);
      }

      if (action === "go_sky") {
        game.applyTimeCost(state, 25);
        state.activeLocation = await SupabaseSystem.getLocationById("cliff_area");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Sky Kingdom";
        await game.setScene(Scenes.Cliff);
      }

      if (action === "go_sand") {
        game.applyTimeCost(state, 25);
        state.activeLocation = await SupabaseSystem.getLocationById("sand");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Sand Kingdom";
        await game.setScene(Scenes.Viper);
      }

      if (action === "go_sea") {
        game.applyTimeCost(state, 25);
        state.activeLocation = await SupabaseSystem.getLocationByScene("SeaKingdom") || await SupabaseSystem.getLocationById("sea");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Sea Kingdom";
        await game.setScene(Scenes.SeaKingdom);
      }

      if (action === "go_rain") {
        game.applyTimeCost(state, 25);
        state.activeLocation = await SupabaseSystem.getLocationByScene("RainforestKingdom") || await SupabaseSystem.getLocationById("rainforest");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Rainforest Kingdom";
        await game.setScene(Scenes.RainforestKingdom);
      }
    },
  };
})();
