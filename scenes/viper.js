(function () {
  const Scenes = window.Scenes = window.Scenes || {};
  const VIPER_QUEST_ID = "viper_spy_mission";

  Scenes.Viper = {
    name: "Viper",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.viper = await SupabaseSystem.getNPC("viper");
      state.activeLocation = await SupabaseSystem.getLocationByScene("Viper") || await SupabaseSystem.getLocationById("sand");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.viper) || {};
      const npcName = npc.name || "Viper";
      const npcDescription = npc.description || "Information is more valuable than gold.";
      const npcImage = npc.image || "images/viper.png";
      const location = state.activeLocation || {};
      const locationName = location.name || "Sand Kingdom";
      const locationDescription = location.description || "A vast desert of shifting dunes and hidden ruins.";
      const locationImage = location.image || "images/viper-area.jpg";
      const hasHunting = location.has_hunting !== false;
      const questState = QuestSystem.getQuestState(state, VIPER_QUEST_ID);
      const questText = questState.completed
        ? "Spy mission completed."
        : questState.started
          ? "Spy mission started."
          : "A covert mission awaits.";

      return `
        <div class="scene-image-wrap">
          <img src="${locationImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#6a5a2f,#23180d)';">
          <div class="npc-layer">
            <img src="${npcImage}" class="npc right" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-panel">
          <h2>${locationName}</h2>
          <p>${locationDescription}</p>
          <p><b>${npcName}:</b> ${npcDescription}</p>
          <p>${questText}</p>

          <button onclick="Game.handle('spy')">Accept spy mission (10 min, -1 hunger)</button>
          ${hasHunting ? `<button onclick="Game.handle('hunt')">Hunt (25 min, -3 hunger)</button>` : ""}
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "spy") {
        game.applyTimeCost(state, 10);
        QuestSystem.startQuest(state, VIPER_QUEST_ID);
        await game.updateTrust("viper", 2);
        await game.addItem("secret_map");
        game.showMessage("Spy mission started. You gained Secret Map.");
      }

      if (action === "hunt") {
        await game.startHunt(state);
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        state.activeLocation = null;
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
