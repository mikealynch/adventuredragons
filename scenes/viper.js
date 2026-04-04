(function () {
  const Scenes = window.Scenes = window.Scenes || {};
  const VIPER_QUEST_ID = "viper_spy_mission";

  Scenes.Viper = {
    name: "Viper",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.viper = await SupabaseSystem.getNPC("viper");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.viper) || {};
      const npcName = npc.name || "Viper";
      const npcDescription = npc.description || "Information is more valuable than gold.";
      const npcImage = npc.image || "images/viper.png";
      const questState = QuestSystem.getQuestState(state, VIPER_QUEST_ID);
      const questText = questState.completed
        ? "Spy mission completed."
        : questState.started
          ? "Spy mission started."
          : "A covert mission awaits.";

      return `
        <div class="scene-image-wrap">
          <img src="images/prophecy.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#6a5a2f,#23180d)';">
          <div class="npc-layer">
            <img src="${npcImage}" class="npc right" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-panel">
          <h2>${npcName}</h2>
          <p>${npcDescription}</p>
          <p>${questText}</p>

          <button onclick="Game.handle('spy')">Accept spy mission</button>
          <button onclick="Game.handle('return_map')">Return to Map</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "spy") {
        QuestSystem.startQuest(state, VIPER_QUEST_ID);
        await game.updateTrust("viper", 2);
        await game.addItem("secret_map");
        alert("Spy mission started. You gained Secret Map");
      }

      if (action === "return_map") {
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
