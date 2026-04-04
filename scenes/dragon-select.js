(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.DragonSelectScene = {
    name: "DragonSelectScene",
    background: "images/prophecy.jpg",

    render(state) {
      const players = state.dragons || [];
      const playerButtons = players.map((player) => `
        <button onclick="Game.handle('select:${player.id}')">${player.dragon_name || "Unknown Dragon"}${player.personality ? ` - ${player.personality}` : ""}</button>
      `).join("");

      return `
        <div class="scene-panel">
          <h1>Select Your Dragon</h1>
          <p>Choose an existing dragon to continue the prophecy, or create a new one.</p>
          ${playerButtons || "<p>No dragons found.</p>"}
          <button onclick="Game.handle('create')">+ Create New Dragon</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "create") {
        await game.setScene(Scenes.CreateDragonScene);
        return;
      }

      if (!action.startsWith("select:")) {
        return;
      }

      const playerId = action.split(":")[1];
      const selected = (state.dragons || []).find((dragon) => String(dragon.id) === String(playerId));
      if (!selected) {
        return;
      }

      state.playerId = selected.id || "";
      state.dragonName = selected.dragon_name || "";
      state.personality = selected.personality || "";
      state.currentLocation = null;
      state.userId = selected.user_id || state.userId;
      localStorage.setItem("dragonPlayer", playerId);
      await SupabaseSystem.loadPlayerCollections(state);
      await game.setScene(Scenes.WorldMapScene);
    },
  };
})();
