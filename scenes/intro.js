(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  Scenes.IntroScene = {
    name: "IntroScene",
    background: "images/prophecy.jpg",

    render() {
      return `
        <div class="scene-panel">
          <h1>Dragon Prophecy</h1>
          <p>The world is unstable. Kingdoms fracture, ancient magic stirs, and the balance holding the dragons together is beginning to fail.</p>
          <p>A prophecy is awakening beneath the ice, and every omen now points toward a reckoning that can no longer be ignored.</p>
          <p>You are part of it, whether you are ready or not. What you choose next will decide how the story unfolds.</p>
          <button onclick="Game.handle('begin')">Begin</button>
        </div>
      `;
    },

    async handle(state, action, game) {
      if (action === "begin") {
        await game.setScene(Scenes.LoginScene);
      }
    },
  };
})();
