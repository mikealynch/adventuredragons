(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.UserCheckScene = {
    name: "UserCheckScene",

    async enter(state, game) {
      const players = await SupabaseSystem.loadPlayerData(state, state.userId);
      state.availablePlayers = players;

      if (players.length > 0) {
        await game.setScene(Scenes.DragonSelectScene);
        return;
      }

      await game.setScene(Scenes.CreateDragonScene);
    },

    render() {
      return `
        <div class="scene-panel">
          <h2>Checking Your Dragons</h2>
          <p>The archives are searching for dragons bound to your account.</p>
        </div>
      `;
    },

    async handle() {
    },
  };
})();
