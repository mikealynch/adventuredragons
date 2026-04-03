(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Cliff = {
    name: "Cliff",

    render() {
      return `
        <div class="scene-image-wrap">
          <img src="images/cliff-area.jpg" class="scene-image">
          <div class="npc-layer">
            <img src="images/cliff.png" class="npc left">
          </div>
        </div>

        <div class="scene-panel">
          <h2>Cliff</h2>
          <button onclick="Game.handle('train')">Train</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "train") {
        await game.updateTrust("cliff", 1);
        await game.addItem("hidden_flame");
        alert("You gained Hidden Flame");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();