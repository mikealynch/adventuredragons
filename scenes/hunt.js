(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.HuntScene = {
    name: "HuntScene",

    render(state) {
      const hunt = state.huntContext || {};
      const prey = hunt.prey || {};
      const preyName = prey.name || "prey";
      const preyType = prey.type || "creature";
      const spotText = hunt.spotText || "You spot movement in the wilds ahead.";

      return `
        <div class="scene-panel">
          <h2>The Hunt</h2>
          <p>You spot movement...</p>
          <p>${spotText}</p>
          <p>A ${preyType} named ${preyName} is within reach. Choose your approach.</p>
          <button onclick="Game.handle('wait')">Wait</button>
          <button onclick="Game.handle('stalk')">Stalk</button>
          <button onclick="Game.handle('fly')">Fly</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (["wait", "stalk", "fly"].includes(action)) {
        await game.resolveHunt(state, action);
      }
    },
  };
})();
