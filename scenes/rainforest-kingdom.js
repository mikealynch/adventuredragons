(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  const RainScene = {
    name: "Rain",

    async enter(state) {
      state.activeLocation = await SupabaseSystem.getLocationByScene("Rain") || await SupabaseSystem.getLocationByScene("RainforestKingdom") || await SupabaseSystem.getLocationById("rainforest");
      state.locationNPCs = await SupabaseSystem.loadNPCs(state.activeLocation && state.activeLocation.id);
    },

    render(state) {
      const location = state.activeLocation || {};
      const locationName = location.name || "Rainforest Kingdom";
      const locationDescription = location.description || "";
      const locationImage = location.image || "";
      const kale = (state.locationNPCs || []).find((npc) => (npc.name || "").toLowerCase() === "kale");
      const kaleIntro = kale
        ? `${kale.name} slips from the foliage with an easy smile, then warns that nothing in this jungle is ever exactly what it seems.`
        : "A shape moves between the vines, then stills before you can decide whether it was a dragon or the jungle playing tricks.";
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
          <p>${kaleIntro}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#335d3b,#102316)';">
        </div>

        <div class="scene-actions">
          ${npcMarkup}
          <button onclick="Game.handle('talk')">Speak with Kale (10 min, -1 hunger)</button>
          <button onclick="Game.handle('go_hunting')">Enter Hunting Grounds</button>
          <button onclick="Game.handle('go_banyan')">Visit Banyan Tree</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "talk") {
        game.applyTimeCost(state, 10);
        await game.updateTrust("kale", 1);
        game.showMessage("Kale grins and points toward a tremor in the undergrowth. In this jungle, they whisper, the honest path is rarely the safest one.");
      }

      if (action === "go_hunting") {
        game.applyTimeCost(state, 10);
        state.activeLocation = await SupabaseSystem.getLocationByScene("RainHunt") || await SupabaseSystem.getLocationByScene("RainforestHunt") || await SupabaseSystem.getLocationById("rainforest_hunt");
        await game.setScene(Scenes.RainHunt);
      }

      if (action === "go_banyan") {
        game.applyTimeCost(state, 10);
        state.activeLocation = await SupabaseSystem.getLocationByScene("Banyan") || await SupabaseSystem.getLocationById("banyan");
        await game.setScene(Scenes.Banyan);
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        state.activeLocation = null;
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };

  Scenes.Rain = RainScene;
  Scenes.RainforestKingdom = RainScene;
})();
