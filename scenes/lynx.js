(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Lynx = {
    name: "Lynx",

    render() {
      return `
        <div class="scene-image-wrap">
          <img src="images/lynx-room.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#1b2d4d,#0b1730)';">
          <div class="npc-layer">
            <img src="images/lynx.png" class="npc right" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-panel">
          <h2>Lynx</h2>
          <button onclick="Game.handle('ask')">Ask about prophecy</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "ask") {
        await game.updateTrust("lynx", 1);
        await game.addItem("frozen_tears");
        alert("You gained Frozen Tears");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();
