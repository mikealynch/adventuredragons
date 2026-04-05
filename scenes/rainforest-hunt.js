(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  const RainHuntScene = {
    name: "RainHunt",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("RainHunt") || await SupabaseSystem.getLocationByScene("RainforestHunt") || await SupabaseSystem.getLocationById("rainforest_hunt");
      if (state.activeLocation && state.activeLocation.name) {
        state.currentLocation = state.activeLocation.name;
      }
      state.locationNPCs = await SupabaseSystem.loadNPCs(state.activeLocation && state.activeLocation.id);
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Rainforest Hunting Grounds";
      const locationDescription = location.description || "";
      const locationImage = location.image || "";

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#335d3b,#102316)';">
        </div>

        <div class="scene-actions">
          <button onclick="Game.handle('hunt')">Hunt</button>
          <button onclick="Game.handle('return_kingdom')">Return to Kingdom</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "hunt") {
        await game.startHunt(state);
      }

      if (action === "return_kingdom") {
        state.activeLocation = await SupabaseSystem.getLocationByScene("Rain") || await SupabaseSystem.getLocationByScene("RainforestKingdom") || await SupabaseSystem.getLocationById("rainforest");
        await game.setScene(Scenes.Rain);
      }
    },
  };

  Scenes.RainHunt = RainHuntScene;
  Scenes.RainforestHunt = RainHuntScene;
})();
