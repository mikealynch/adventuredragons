(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Personality = {
    name: "Personality",

    render() {
      return `
        <div class="scene-panel">
          <h2>Choose Your Nature</h2>
          <p>Before the prophecy can unfold...<br>you must choose the kind of dragon you will become.</p>
          <button onclick="Game.handle('brave')">Brave</button>
          <p>You act before others hesitate. Strength and courage guide your path.</p>
          <button onclick="Game.handle('curious')">Curious</button>
          <p>You question everything. Knowledge and hidden truths guide your path.</p>
        </div>
      `;
    },

    async handle(state, action, game) {
      state.personality = action;
      await game.setScene(Scenes.IcePalace);
    },
  };
})();
