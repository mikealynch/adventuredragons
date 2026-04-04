(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Cliff = {
    name: "Cliff",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.cliff = await SupabaseSystem.getNPC("cliff");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.cliff) || {};
      const npcName = npc.name || "Cliff";
      const npcDescription = npc.description || "A fierce trainer with a hidden flame.";
      const npcImage = npc.image || "images/cliff.png";
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
        <div class="scene-image-wrap">
          <img src="images/cliff-area.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#5b311d,#1a1010)';">
          <div class="npc-layer">
            <img src="${npcImage}" class="npc left" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-panel">
          <h2>${npcName}</h2>
          <p>${npcDescription}</p>
          <p>${guidance}</p>
          <button onclick="Game.handle('train')">${actionLabel}</button>
          <button onclick="Game.handle('return_map')">Return to Map</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "train") {
        state.progress = state.progress || {};
        const hasTrained = !!state.progress.cliffTrainingComplete;
        const hasHiddenFlame = state.inventory.includes("Hidden Flame");

        if (!hasTrained) {
          state.progress.cliffTrainingComplete = true;
          await game.updateTrust("cliff", 1);
          alert("You complete Cliff's training regimen. Return your focus to claim your reward.");
        } else if (!hasHiddenFlame) {
          await game.addItem("Hidden Flame");
          alert("Cliff acknowledges your discipline and grants you the Hidden Flame.");
        } else {
          alert("Cliff has nothing more to grant. Keep your fire sharp.");
        }
      }

      if (action === "return_map") {
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
