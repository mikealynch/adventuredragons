(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Personality = {
    name: "Personality",

    render() {
      return `
        <h2>Choose Personality</h2>
        <button onclick="Game.handle('brave')">Brave</button>
        <button onclick="Game.handle('curious')">Curious</button>
      `;
    },

    async handle(state, action, game) {
      state.personality = action;
      await game.setScene(Scenes.IcePalace);
    },
  };
})();