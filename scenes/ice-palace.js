(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.IcePalace = {
    name: "IcePalace",

    render() {
      return `
        <div class="scene-image-wrap">
          <img src="images/ice-palace.jpg" class="scene-image">
        </div>

        <div class="scene-panel">
          <h2>Ice Palace</h2>
          <p>You stand within a frozen hall of knowledge.</p>

          <button onclick="Game.handle('lynx')">Visit Lynx</button>
          <button onclick="Game.handle('cliff')">Visit Cliff</button>
          <button onclick="Game.handle('viper')">Travel to Sand Kingdom</button>
          <button onclick="Game.handle('glacier')">Meet Ice Soldier</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "lynx") {
        await game.setScene(Scenes.Lynx);
      }

      if (action === "cliff") {
        await game.setScene(Scenes.Cliff);
      }

      if (action === "viper") {
        await game.setScene(Scenes.Viper);
      }

      if (action === "glacier") {
        await game.setScene(Scenes.Glacier);
      }
    },
  };
})();