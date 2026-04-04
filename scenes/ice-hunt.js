(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.IceHunt = {
    name: "IceHunt",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("IceHunt") || await SupabaseSystem.getLocationById("ice_hunt");
      if (state.activeLocation && state.activeLocation.name) {
        state.currentLocation = state.activeLocation.name;
      }
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Ice Kingdom Hunting Grounds";
      const locationDescription = location.description || "Frozen tracks and sharp winds mark the hunting grounds of the Ice Kingdom.";
      const locationImage = location.image || "images/icewing-hunting-grounds.jpg";

      return `
        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#21466b,#0b1730)';">
        </div>

        <div class="scene-panel">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
          <button onclick="Game.handle('hunt')">Hunt</button>
          <button onclick="Game.handle('return_map')">Return to Map</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "hunt") {
        await game.startHunt(state);
      }

      if (action === "return_map") {
        state.activeLocation = null;
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
