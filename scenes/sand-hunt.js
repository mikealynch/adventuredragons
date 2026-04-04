(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.SandHunt = {
    name: "SandHunt",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("SandHunt") || await SupabaseSystem.getLocationById("sand_hunt");
      if (state.activeLocation && state.activeLocation.name) {
        state.currentLocation = state.activeLocation.name;
      }
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Sand Kingdom Hunting Grounds";
      const locationDescription = location.description || "The dunes stretch wide with prey hidden between ruined stone and wavering heat.";
      const locationImage = location.image || "images/sandwing-hunting-grounds.jpg";

      return `
        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#6a5a2f,#23180d)';">
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
