(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.CreateDragonScene = {
    name: "CreateDragonScene",
    background: "images/lynx.jpg",

    render() {
      const debug = window.Game && window.Game.state ? window.Game.state.debug : null;
      const debugText = debug
        ? `<p><b>Debug:</b> ${debug.message || "No dragons were returned for this user ID."}</p>${debug.details ? `<p>${debug.details}</p>` : ""}${debug.hint ? `<p>${debug.hint}</p>` : ""}`
        : "";

      return `
        <div class="scene-panel">
          <h1>Create Your Dragon</h1>
          <p>Give your dragon a name and choose the nature that will guide the prophecy.</p>
          ${debugText}
          <label for="dragonNameInput">Dragon name</label>
          <input id="dragonNameInput" placeholder="Enter your dragon name"/>
          <label for="tribeSelect">Tribe</label>
          <select id="tribeSelect">
            <option>IceWing</option>
            <option>SkyWing</option>
            <option>SandWing</option>
            <option>SeaWing</option>
            <option>MudWing</option>
            <option>RainWing</option>
            <option>NightWing</option>
          </select>
          <button onclick="Game.handle('brave')">Brave</button>
          <p>You act before others hesitate. Strength and courage guide your path.</p>
          <button onclick="Game.handle('curious')">Curious</button>
          <p>You question everything. Knowledge and hidden truths guide your path.</p>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (!["brave", "curious"].includes(action)) {
        return;
      }

      const dragonName = document.getElementById("dragonNameInput").value.trim();
      const tribe = document.getElementById("tribeSelect").value;
      if (!dragonName) {
        game.showMessage("Choose a dragon name before continuing.");
        return;
      }

      const player = await SupabaseSystem.createPlayer(state, dragonName, tribe, action);
      if (!player) {
        game.render();
        return;
      }

      await game.setScene(Scenes.WorldMapScene);
    },
  };
})();
