(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Banyan = {
    name: "Banyan",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("Banyan") || await SupabaseSystem.getLocationById("banyan");
      state.locationNPCs = await SupabaseSystem.loadNPCs(state.activeLocation && state.activeLocation.id);
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Banyan Tree";
      const locationDescription = location.description || "";
      const locationImage = location.image || "";
      const npcMarkup = (state.locationNPCs || []).map((npc) => `
        <div class="npc-card">
          ${npc.image ? `<img src="${npc.image}" class="character-image npc-inline" onerror="this.style.display='none';">` : ""}
          <p><b>${npc.name}</b></p>
          <p>${npc.description || ""}</p>
        </div>
      `).join("");

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
          <p>The roots twist like old promises. Whatever waits here feels older than the prophecy and patient enough to outlive it.</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#2d4f34,#0f2013)';">
        </div>

        <div class="scene-actions">
          ${npcMarkup}
          <button onclick="Game.handle('listen')">Listen at the Roots (10 min, -1 hunger)</button>
          <button onclick="Game.handle('return_rain')">Return to Rainforest</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "listen") {
        game.applyTimeCost(state, 10);
        game.showMessage("The Banyan Tree gives nothing away directly, but the hush beneath its branches feels like the beginning of a future quest.");
      }

      if (action === "return_rain") {
        state.activeLocation = await SupabaseSystem.getLocationByScene("Rain") || await SupabaseSystem.getLocationByScene("RainforestKingdom") || await SupabaseSystem.getLocationById("rainforest");
        await game.setScene(Scenes.Rain);
      }
    },
  };
})();
