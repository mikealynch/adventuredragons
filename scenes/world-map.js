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
      const mapConfig = [
        { classes: "world-map-ice", scene: "IcePalace", fallbackId: "ice_palace", action: "go_ice" },
        { classes: "world-map-sky", scene: "Cliff", fallbackId: "cliff_area", action: "go_sky" },
        { classes: "world-map-sand", scene: "Viper", fallbackId: "sand", action: "go_sand" },
        { classes: "world-map-sea", scene: "Sea", fallbackId: "sea", action: "go_sea", aliases: ["SeaKingdom"] },
        { classes: "world-map-rain", scene: "Rain", fallbackId: "rainforest", action: "go_rain", aliases: ["RainforestKingdom"] },
      ];

      const buttons = mapConfig.map((config) => {
        const location = (state.locations || []).find((entry) => {
          const sceneNames = [config.scene].concat(config.aliases || []);
          return sceneNames.includes(entry.scene) || entry.id === config.fallbackId;
        });
        const label = location && location.name ? location.name : config.scene.replace(/([A-Z])/g, " $1").trim();
        return `<button class="world-map-button ${config.classes}" onclick="Game.handle('${config.action}')">Enter ${label}</button>`;
      }).join("");

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
          ${buttons}
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
        state.activeLocation = await SupabaseSystem.getLocationByScene("Sea") || await SupabaseSystem.getLocationByScene("SeaKingdom") || await SupabaseSystem.getLocationById("sea");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Sea Kingdom";
        await game.setScene(Scenes.Sea);
      }

      if (action === "go_rain") {
        game.applyTimeCost(state, 25);
        state.activeLocation = await SupabaseSystem.getLocationByScene("Rain") || await SupabaseSystem.getLocationByScene("RainforestKingdom") || await SupabaseSystem.getLocationById("rainforest");
        state.currentLocation = state.activeLocation && state.activeLocation.name ? state.activeLocation.name : "Rainforest Kingdom";
        await game.setScene(Scenes.Rain);
      }
    },
  };
})();
