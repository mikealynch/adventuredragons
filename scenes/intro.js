(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.IntroScene = {
    name: "IntroScene",

    render() {
      return `
        <div class="scene-panel">
          <h1>Dragon Prophecy</h1>
          <p>A prophecy stirs beneath the ice: ancient powers are waking, and only a young dragon with the right allies can piece together the truth.</p>
          <p>You have been summoned to the Ice Palace to learn why the kingdom is unraveling and what role you must play in the trials ahead.</p>
          <button onclick="Game.handle('begin')">Enter the Palace</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "begin") {
        await game.setScene(Scenes.LoginScene);
      }
    },
  };
})();
