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
      const lynxTrust = (state.trust && state.trust.lynx) || 0;
      const hasFrozenTear = state.inventory.includes("Frozen Tear");
      const guidance = hasFrozenTear
        ? "Lynx has already trusted you with the Frozen Tear."
        : lynxTrust >= 2
          ? "Lynx is ready to part with a Frozen Tear."
          : "Lynx offers clues first. Earn more trust to receive the relic.";

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
          <p>${guidance}</p>
          <button onclick="Game.handle('ask')">Ask about prophecy (10 min, -1 hunger)</button>
          <button onclick="Game.handle('hunt')">Hunt (25 min, -3 hunger)</button>
          <button onclick="Game.handle('back')">Back</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "ask") {
        game.applyTimeCost(state, 10);
        const lynxTrust = (state.trust && state.trust.lynx) || 0;
        const hasFrozenTear = state.inventory.includes("Frozen Tear");

        await game.updateTrust("lynx", 1);

        if (!hasFrozenTear && lynxTrust + 1 >= 2) {
          await game.addItem("Frozen Tear");
          game.showMessage("Lynx shares a final clue and entrusts you with a Frozen Tear.");
        } else {
          game.showMessage("Lynx reveals a clue: the prophecy answers only those who listen before they act.");
        }
      }

      if (action === "hunt") {
        game.applyTimeCost(state, 25);
        if (Math.random() < 0.7) {
          game.restoreHunger(state, 30);
          await game.addItem("food");
          game.showMessage("You return from the hunt with food and renewed strength.");
        } else {
          game.showMessage("The hunt turns up empty.");
        }
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
