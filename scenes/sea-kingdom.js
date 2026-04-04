(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.SeaKingdom = {
    name: "SeaKingdom",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.tide = await SupabaseSystem.getNPC("tide");
      state.activeLocation = await SupabaseSystem.getLocationByScene("SeaKingdom") || await SupabaseSystem.getLocationById("sea");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.tide) || {};
      const location = state.activeLocation || {};
      const locationName = location.name || "Sea Kingdom";
      const locationDescription = location.description || "Waves crash against hidden coves where old currents carry older secrets.";
      const locationImage = location.image || "images/prophecy.jpg";
      const npcName = npc.name || "Tide";
      const npcDescription = npc.description || "A calm SeaWing who listens for omens in the shifting currents.";

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
          <p><b>${npcName}:</b> ${npcDescription}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#1d4b63,#0b1730)';">
        </div>

        <div class="scene-actions">
          <button onclick="Game.handle('talk')">Speak with Tide (10 min, -1 hunger)</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "talk") {
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
})();
