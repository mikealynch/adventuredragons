(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.SkyHunt = {
    name: "SkyHunt",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("SkyHunt") || await SupabaseSystem.getLocationById("sky_hunt");
      if (state.activeLocation && state.activeLocation.name) {
        state.currentLocation = state.activeLocation.name;
      }
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Sky Kingdom Hunting Grounds";
      const locationDescription = location.description || "Updrafts and sheer cliffs make every hunt in the Sky Kingdom a contest of timing.";
      const locationImage = location.image || "images/skywing-hunting-grounds.jpg";

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#3a5879,#111b2e)';">
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
        state.activeLocation = await SupabaseSystem.getLocationByScene("Cliff") || await SupabaseSystem.getLocationById("cliff_area");
        await game.setScene(Scenes.Cliff);
      }
    },
  };
})();
