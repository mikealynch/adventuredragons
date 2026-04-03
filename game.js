const Game = {
  state: {
    userId: "",
    personality: "",
    currentScene: "LoginScene",
    inventory: [],
    quests: {},
    trust: {},
  },

  currentScene: null,

  async setScene(scene) {
    this.state.quests = this.state.quests || {};
    this.state.trust = this.state.trust || {};
    this.currentScene = scene;
    this.state.currentScene = scene.name;

    if (scene.enter) {
      await scene.enter(this.state);
    }

    await SupabaseSystem.savePlayer(this.state);
    this.render();
  },

  render() {
    const app = document.getElementById("app");

    app.innerHTML = `
      <div class="hud">
        <div class="hud-card"><b>User</b><br>${this.state.userId || "-"}</div>
        <div class="hud-card"><b>Personality</b><br>${this.state.personality || "-"}</div>
        <div class="hud-card"><b>Inventory</b><br>${this.state.inventory.join(", ") || "Empty"}</div>
        <div class="hud-card"><b>Scene</b><br>${this.state.currentScene}</div>
      </div>

      <div class="scene">
        ${this.currentScene.render(this.state)}
      </div>
    `;
  },

  async handle(action) {
    await this.currentScene.handle(this.state, action, this);
    this.render();
  },

  async load() {
    this.state.quests = this.state.quests || {};
    this.state.trust = this.state.trust || {};
    await SupabaseSystem.loadGameState(this.state);
    this.state.quests = this.state.quests || {};
    this.state.trust = this.state.trust || {};
  },

  async addItem(item) {
    await InventorySystem.addItem(this.state, item);
  },

  async updateTrust(npc, amount) {
    await RelationshipSystem.updateTrust(this.state, npc, amount);
  },
};

(async function initGame() {
  await Game.load();

  if (Game.state.currentScene && window.Scenes[Game.state.currentScene]) {
    await Game.setScene(window.Scenes[Game.state.currentScene]);
    return;
  }

  await Game.setScene(window.Scenes.LoginScene);
})();
