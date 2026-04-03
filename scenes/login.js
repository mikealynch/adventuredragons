(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.LoginScene = {
    name: "LoginScene",

    render() {
      return `
        <h1>Dragon Prophecy</h1>
        <input id="nameInput" placeholder="Dragon name"/>
        <button onclick="Game.handle('start')">Start</button>
      `;
    },

    async handle(state, action, game) {
      if (action !== "start") {
        return;
      }

      const name = document.getElementById("nameInput").value;
      state.userId = name;
      localStorage.setItem("dragonUser", name);
      await game.setScene(Scenes.Personality);
    },
  };
})();