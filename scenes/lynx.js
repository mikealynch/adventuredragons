(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Lynx = {
    name: "Lynx",

    async enter(state) {
      state.npcs = state.npcs || {};
      state.npcs.lynx = await SupabaseSystem.getNPC("lynx");
    },

    render(state) {
      const npc = (state.npcs && state.npcs.lynx) || {};
      const npcName = npc.name || "Lynx";
      const npcDescription = npc.description || "Keeper of the prophecy's secrets.";
      const npcImage = npc.image || "images/lynx.png";

      return `
        <div class="scene-image-wrap">
          <img src="images/lynx-room.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#1b2d4d,#0b1730)';">
          <div class="npc-layer">
            <img src="${npcImage}" class="npc right" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-panel">
          <h2>${npcName}</h2>
          <p>${npcDescription}</p>
          <button onclick="Game.handle('ask')">Ask about prophecy</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "ask") {
        await game.updateTrust("lynx", 1);
        await game.addItem("frozen_tears");
        alert("You gained Frozen Tears");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();
