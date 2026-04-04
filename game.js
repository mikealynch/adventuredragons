const Game = {
  state: {
    userId: "",
    playerId: "",
    dragonName: "",
    personality: "",
    currentScene: "IntroScene",
    currentLocation: "",
    dragons: [],
    debug: null,
    inventory: [],
    quests: {},
    trust: {},
  },

  currentScene: null,

  async setScene(scene) {
    this.state.quests = this.state.quests || {};
    this.state.trust = this.state.trust || {};

    const playerOptionalScenes = {
      IntroScene: true,
      LoginScene: true,
      UserCheckScene: true,
      DragonSelectScene: true,
      CreateDragonScene: true,
    };

    if (!this.state.playerId && !playerOptionalScenes[scene.name]) {
      await this.setScene(this.state.userId ? window.Scenes.UserCheckScene : window.Scenes.LoginScene);
      return;
    }

    this.currentScene = scene;
    this.state.currentScene = scene.name;
    this.syncCurrentLocation(scene.name);

    if (scene.enter) {
      await scene.enter(this.state, this);
    }

    await SupabaseSystem.savePlayer(this.state);
    this.render();
  },

  render() {
    const app = document.getElementById("app");
    const backgroundStyle = this.currentScene.background
      ? `style="background-image:url('${this.currentScene.background}');"`
      : "";
    const sceneClass = this.currentScene.background ? "scene has-background" : "scene";

    app.innerHTML = `
      <div class="hud">
        <div class="hud-card"><b>Dragon</b><br>${this.state.dragonName || "-"}</div>
        <div class="hud-card"><b>Location</b><br>${this.state.currentLocation || "-"}</div>
        <div class="hud-card"><b>Personality</b><br>${this.state.personality || "-"}</div>
        <div class="hud-card"><b>Inventory</b><br>${this.state.inventory.join(", ") || "Empty"}</div>
        <div class="hud-card"><b>Scene</b><br>${this.state.currentScene}</div>
      </div>

      <div class="${sceneClass}">
        ${this.currentScene.background ? `<div class="scene-background" ${backgroundStyle}></div><div class="scene-overlay"></div>` : ""}
        <div class="scene-content">
          ${this.currentScene.render(this.state)}
        </div>
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

  syncCurrentLocation(sceneName) {
    const sceneLocations = {
      WorldMapScene: "World Map",
      IcePalace: "Ice Kingdom",
      Lynx: "Ice Kingdom",
      Glacier: "Ice Kingdom",
      Cliff: "Sky Kingdom",
      Viper: "Sand Kingdom",
    };

    if (sceneLocations[sceneName]) {
      this.state.currentLocation = sceneLocations[sceneName];
    }
  },
};

(async function initGame() {
  await Game.load();

  if (Game.state.currentScene && window.Scenes[Game.state.currentScene]) {
    await Game.setScene(window.Scenes[Game.state.currentScene]);
    return;
  }

  await Game.setScene(window.Scenes.IntroScene);
})();
