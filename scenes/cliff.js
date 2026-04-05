(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Cliff = {
    name: "Cliff",

    async enter(state) {
      state.namedNPCs = state.namedNPCs || {};
      state.namedNPCs.cliff = await SupabaseSystem.getNPC("cliff");
      state.activeLocation = await SupabaseSystem.getLocationByScene("Cliff") || await SupabaseSystem.getLocationById("cliff_area");
    },

    render(state) {
      const npc = (state.namedNPCs && state.namedNPCs.cliff) || {};
      const npcName = npc.name || "Cliff";
      const npcDescription = npc.description || "A fierce trainer with a hidden flame.";
      const npcImage = npc.image || "images/cliff.png";
      const location = state.activeLocation || {};
      const locationName = location.name || "Training Grounds";
      const locationDescription = location.description || "A fierce training ground high in the winds.";
      const locationImage = location.image || "images/cliff-area.jpg";
      state.progress = state.progress || {};
      const hasTrained = !!state.progress.cliffTrainingComplete;
      const hasHiddenFlame = state.inventory.includes("Hidden Flame");
      const actionLabel = hasTrained && !hasHiddenFlame ? "Claim Hidden Flame" : "Train";
      const guidance = hasHiddenFlame
        ? "Cliff has already granted you the Hidden Flame."
        : hasTrained
          ? "Your training is complete. Cliff is ready to reward you."
          : "Cliff wants to see your discipline before offering any relic.";

      return `
        <div class="scene-header">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
          <p><b>${npcName}:</b> ${npcDescription}</p>
          <p>${guidance}</p>
        </div>

        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#5b311d,#1a1010)';">
          <div class="npc-layer">
            <img src="${npcImage}" class="npc character-image left" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-actions">
          <button onclick="Game.handle('train')">${actionLabel} (15 min, -2 hunger)</button>
          <button onclick="Game.handle('go_hunting')">Enter Hunting Grounds</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "train") {
        game.applyTimeCost(state, 15);
        state.progress = state.progress || {};
        const hasTrained = !!state.progress.cliffTrainingComplete;
        const hasHiddenFlame = state.inventory.includes("Hidden Flame");

        if (!hasTrained) {
          state.progress.cliffTrainingComplete = true;
          await game.updateTrust("cliff", 1);
          game.showMessage("You complete Cliff's training regimen. Return your focus to claim your reward.");
        } else if (!hasHiddenFlame) {
          await game.addItem("Hidden Flame");
          game.showMessage("Cliff acknowledges your discipline and grants you the Hidden Flame.");
        } else {
          game.showMessage("Cliff has nothing more to grant. Keep your fire sharp.");
        }
      }

      if (action === "go_hunting") {
        game.applyTimeCost(state, 10);
        state.activeLocation = await SupabaseSystem.getLocationByScene("SkyHunt") || await SupabaseSystem.getLocationById("sky_hunt");
        await game.setScene(Scenes.SkyHunt);
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        state.activeLocation = null;
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
