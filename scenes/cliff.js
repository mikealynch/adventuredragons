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
          <button onclick="Game.handle('train')">Train</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "train") {
        await game.updateTrust("cliff", 1);
        await game.addItem("hidden_flame");
        alert("You gained Hidden Flame");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();
