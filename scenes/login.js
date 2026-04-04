(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.LoginScene = {
    name: "LoginScene",
    background: "images/cave.jpg",

    render() {
      return `
        <div class="scene-panel">
          <h1>Dragon Prophecy</h1>
          <p>Your choices will shape the prophecy.</p>
          <label for="nameInput">Enter your user ID</label>
          <input id="nameInput" placeholder="Enter your user ID"/>
          <button onclick="Game.handle('start')">Continue</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action !== "start") {
        return;
      }

      const userId = document.getElementById("nameInput").value;
      state.userId = userId;
      localStorage.setItem("dragonUser", userId);

      await SupabaseSystem.loadPlayerData(state, userId);

      if (!state.dragonName) {
        await game.setScene(Scenes.NameScene);
        return;
      }

      if (!state.personality) {
        await game.setScene(Scenes.Personality);
        return;
      }

      if (state.currentScene && Scenes[state.currentScene] && !["IntroScene", "LoginScene", "NameScene"].includes(state.currentScene)) {
        await game.setScene(Scenes[state.currentScene]);
        return;
      }

      await game.setScene(Scenes.IcePalace);
    },
  };
})();
