(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.IcePalace = {
    name: "IcePalace",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("IcePalace") || await SupabaseSystem.getLocationById("ice_palace");
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Ice Palace";
      const locationDescription = location.description || "You stand within a frozen hall of knowledge.";
      const locationImage = location.image || "images/ice-palace.jpg";
      const hasHunting = location.has_hunting !== false;

      return `
        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#223a61,#0b1730)';">
        </div>

        <div class="scene-panel">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>

          <button onclick="Game.handle('lynx')">Visit Lynx (15 min, -2 hunger)</button>
          <button onclick="Game.handle('glacier')">Meet Ice Soldier (15 min, -2 hunger)</button>
          ${hasHunting ? `<button onclick="Game.handle('hunt')">Hunt (25 min, -3 hunger)</button>` : ""}
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "lynx") {
        game.applyTimeCost(state, 15);
        await game.setScene(Scenes.Lynx);
      }

      if (action === "glacier") {
        game.applyTimeCost(state, 15);
        await game.setScene(Scenes.Glacier);
      }

      if (action === "hunt") {
        await game.startHunt(state);
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
