(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.RainforestKingdom = {
    name: "RainforestKingdom",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.kale = await SupabaseSystem.getNPC("kale");
      state.activeLocation = await SupabaseSystem.getLocationByScene("RainforestKingdom") || await SupabaseSystem.getLocationById("rainforest");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.kale) || {};
      const location = state.activeLocation || {};
      const locationName = location.name || "Rainforest Kingdom";
      const locationDescription = location.description || "Vines and bright canopy shadows conceal paths that vanish when watched too closely.";
      const locationImage = location.image || "images/lynx.jpg";
      const npcName = npc.name || "Kale";
      const npcDescription = npc.description || "A curious RainWing who notices what other dragons overlook.";

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
          <p><b>${npcName}:</b> ${npcDescription}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#335d3b,#102316)';">
        </div>

        <div class="scene-actions">
          <button onclick="Game.handle('talk')">Speak with Kale (10 min, -1 hunger)</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "talk") {
        game.applyTimeCost(state, 10);
        await game.updateTrust("kale", 1);
        game.showMessage("Kale grins and points toward hidden pathways through the canopy. The prophecy, they say, thrives where no one thinks to look.");
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        state.activeLocation = null;
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
