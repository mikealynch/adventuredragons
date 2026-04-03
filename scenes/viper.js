(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Viper = {
    name: "Viper",

    render() {
      return `
        <div class="scene-image-wrap">
          <img src="images/prophecy.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#6a5a2f,#23180d)';">
          <div class="npc-layer">
            <img src="images/viper.png" class="npc right" onerror="this.style.display='none';">
          </div>
        </div>

        <div class="scene-panel">
          <h2>Viper (SandWing Spy)</h2>
          <p>"Information is more valuable than gold."</p>

          <button onclick="Game.handle('spy')">Accept spy mission</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "spy") {
        await game.updateTrust("viper", 2);
        await game.addItem("secret_map");
        alert("You gained Secret Map");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();
