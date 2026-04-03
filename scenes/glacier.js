(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.Glacier = {
    name: "Glacier",

    render() {
      return `
        <div class="scene-image-wrap">
          <img src="images/glacier.jpg" class="scene-image" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(180deg,#8aa3bf,#203047)';">
        </div>

        <div class="scene-panel">
          <h2>Glacier (IceWing Soldier)</h2>
          <p>"Strength protects the prophecy."</p>

          <button onclick="Game.handle('duty')">Accept duty</button>
          <button onclick="Game.handle('back')">Back</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "duty") {
        await game.updateTrust("glacier", 2);
        await game.addItem("ice_key");
        alert("You gained Ice Key");
      }

      if (action === "back") {
        await game.setScene(Scenes.IcePalace);
      }
    },
  };
})();
