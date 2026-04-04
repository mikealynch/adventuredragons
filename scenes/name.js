(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.NameScene = {
    name: "NameScene",
    background: "images/lynx.jpg",

    render() {
      return `
        <div class="scene-panel">
          <h1>Name Your Dragon</h1>
          <p>The prophecy has found you, but names hold power. Speak yours and let the story remember it.</p>
          <label for="dragonNameInput">What is your name, dragon?</label>
          <input id="dragonNameInput" placeholder="Enter your dragon name"/>
          <button onclick="Game.handle('continue')">Continue</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action !== "continue") {
        return;
      }

      const dragonName = document.getElementById("dragonNameInput").value;
      state.dragonName = dragonName;
      localStorage.setItem("dragonName", dragonName);
      await game.setScene(Scenes.Personality);
    },
  };
})();
