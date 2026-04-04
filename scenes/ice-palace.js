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

          <button onclick="Game.handle('lynx')">Visit Lynx (15 min, -2 hunger)</button>
          <button onclick="Game.handle('glacier')">Meet Ice Soldier (15 min, -2 hunger)</button>
          <button onclick="Game.handle('hunt')">Hunt (25 min, -3 hunger)</button>
          <button onclick="Game.handle('return_map')">Return to Map (25 min, -3 hunger)</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "lynx") {
        game.applyTimeCost(state, 15);
        await game.setScene(Scenes.Lynx);
      }

      if (action === "glacier") {
        game.applyTimeCost(state, 15);
        await game.setScene(Scenes.Glacier);
      }

      if (action === "hunt") {
        game.applyTimeCost(state, 25);
        if (Math.random() < 0.7) {
          game.restoreHunger(state, 30);
          await game.addItem("food");
          alert("The hunt succeeds. You recover 30 hunger and bring back food.");
        } else {
          alert("The hunt fails. You spend time and energy but catch nothing.");
        }
      }

      if (action === "return_map") {
        game.applyTimeCost(state, 25);
        await game.setScene(Scenes.WorldMapScene);
      }
    },
  };
})();
