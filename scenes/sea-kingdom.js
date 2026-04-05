(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  const SeaScene = {
    name: "Sea",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("Sea") || await SupabaseSystem.getLocationByScene("SeaKingdom") || await SupabaseSystem.getLocationById("sea");
      state.npcs = await SupabaseSystem.loadNPCs(state.activeLocation && state.activeLocation.id);
      console.log("Loaded NPCs:", state.npcs);
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Sea Kingdom";
      const locationDescription = location.description || "";
      const locationImage = location.image || "";
      const npcMarkup = Game.renderNPCs(state);

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#1d4b63,#0b1730)';">
        </div>

        <div class="scene-actions">
          ${npcMarkup}
          <button onclick="Game.handle('hunting_soon')" disabled>Enter Hunting Grounds (Coming Soon)</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "talk_Tide") {
        game.applyTimeCost(state, 10);
        await game.updateTrust("tide", 1);
        game.showMessage("Tide murmurs that the sea carries prophecy in fragments. Some truths only surface when the storm has passed.");
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        state.activeLocation = null;
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };

  Scenes.Sea = SeaScene;
  Scenes.SeaKingdom = SeaScene;
})();
