(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.UserCheckScene = {
    name: "UserCheckScene",

    async enter(state, game) {
      const dragons = await SupabaseSystem.loadPlayerData(state, state.userId);

      if (dragons.length > 0) {
        await game.setScene(Scenes.DragonSelectScene);
        return;
      }

      await game.setScene(Scenes.DragonBuilder);
    },

    render() {
      const debug = window.Game && window.Game.state ? window.Game.state.debug : null;
      const debugText = debug
        ? `<p><b>Debug:</b> ${debug.message || `Queried user_id "${debug.userId}" and found ${debug.dragonCount || 0} dragons.`}</p>${debug.details ? `<p>${debug.details}</p>` : ""}${debug.hint ? `<p>${debug.hint}</p>` : ""}`
        : "";

      return `
        <div class="scene-panel">
          <h2>Checking Your Dragons</h2>
          <p>The archives are searching for dragons bound to your account.</p>
          ${debugText}
        </div>
      `;
    },

    async handle() {
    },
  };
})();
