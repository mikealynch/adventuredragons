(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.IcePalace = {
    name: "IcePalace",

    render() {
      return `
        <div class="scene-image-wrap">
          <img src="images/ice-palace.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#223a61,#0b1730)';">
        </div>

        <div class="scene-panel">
          <h2>Ice Palace</h2>
          <p>You stand within a frozen hall of knowledge.</p>

          <button onclick="Game.handle('lynx')">Visit Lynx</button>
          <button onclick="Game.handle('glacier')">Meet Ice Soldier</button>
          <button onclick="Game.handle('return_map')">Return to Map</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "lynx") {
        await game.setScene(Scenes.Lynx);
      }

      if (action === "glacier") {
        await game.setScene(Scenes.Glacier);
      }

      if (action === "return_map") {
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
