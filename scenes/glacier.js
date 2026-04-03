(function () {
  const Scenes = window.Scenes = window.Scenes || {};
  const VIPER_QUEST_ID = "viper_spy_mission";

  Scenes.Glacier = {
    name: "Glacier",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.glacier = await SupabaseSystem.getNPC("glacier");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.glacier) || {};
      const npcName = npc.name || "Glacier";
      const npcDescription = npc.description || "Strength protects the prophecy.";
      const npcImage = npc.image || "images/glacier.jpg";
      const questState = QuestSystem.getQuestState(state, VIPER_QUEST_ID);
      const canProgress = questState.started && !questState.completed;
      const questMessage = canProgress
        ? "The spy mission is active. Glacier can now secure the next step."
        : questState.completed
          ? "The spy mission has already been completed."
          : "You must accept Viper's spy mission first.";

      return `
        <div class="scene-image-wrap">
          <img src="${npcImage}" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#8aa3bf,#203047)';">
        </div>

        <div class="scene-panel">
          <h2>${npcName}</h2>
          <p>${npcDescription}</p>
          <p>${questMessage}</p>

          <button onclick="Game.handle('duty')" ${canProgress ? "" : "disabled"}>Accept duty</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "duty") {
        const questState = QuestSystem.getQuestState(state, VIPER_QUEST_ID);
        if (!questState.started || questState.completed) {
          alert("You must begin Viper's spy mission before Glacier can help.");
          return;
        }

        QuestSystem.completeQuest(state, VIPER_QUEST_ID);
        await game.updateTrust("glacier", 2);
        await game.addItem("ice_key");
        alert("Spy mission completed. You gained Ice Key");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();
