(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.CreateDragonScene = {
    name: "CreateDragonScene",
    background: "images/lynx.jpg",

    render() {
      return `
        <div class="scene-panel">
          <h1>Create Your Dragon</h1>
          <p>Give your dragon a name and choose the nature that will guide the prophecy.</p>
          <label for="dragonNameInput">Dragon name</label>
          <input id="dragonNameInput" placeholder="Enter your dragon name"/>
          <button onclick="Game.handle('brave')">Brave</button>
          <p>You act before others hesitate. Strength and courage guide your path.</p>
          <button onclick="Game.handle('curious')">Curious</button>
          <p>You question everything. Knowledge and hidden truths guide your path.</p>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (!["brave", "curious"].includes(action)) {
        return;
      }

      const dragonName = document.getElementById("dragonNameInput").value;
      if (!dragonName) {
        alert("Choose a dragon name before continuing.");
        return;
      }

      await SupabaseSystem.createPlayer(state, dragonName, action);
      await game.setScene(Scenes.WorldMapScene);
    },
  };
})();
