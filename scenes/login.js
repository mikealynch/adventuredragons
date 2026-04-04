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
      state.playerId = "";
      state.dragonName = "";
      state.personality = "";
      state.currentLocation = "";
      state.inventory = [];
      state.trust = {};
      state.availablePlayers = [];
      localStorage.setItem("dragonUser", userId);
      localStorage.removeItem("dragonPlayer");
      await game.setScene(Scenes.UserCheckScene);
    },
  };
})();
