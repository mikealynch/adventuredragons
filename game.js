const Game = {
  state: {
    userId: "",
    playerId: "",
    dragonName: "",
    tribe: "",
    personality: "",
    currentScene: "IntroScene",
    currentLocation: "",
    dragons: [],
    debug: null,
    hunger: 100,
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
        <div class="hud-card"><b>Tribe</b><br>${this.state.tribe || "-"}</div>
        <div class="hud-card"><b>Hunger</b><br>${this.state.hunger}</div>
        <div class="hud-card"><b>Personality</b><br>${this.state.personality || "-"}</div>
        <div class="hud-card"><b>Inventory</b><br>${this.state.inventory.join(", ") || "Empty"}</div>
      </div>

      <div class="${sceneClass}">
        ${this.currentScene.background ? `<div class="scene-background" ${backgroundStyle}></div><div class="scene-overlay"></div>` : ""}
        <div class="scene-content">
          <div id="message-box" class="message-box">${this.state.message || "The prophecy waits for your next choice."}</div>
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
    this.state.tribe = this.state.tribe || "";
    this.state.hunger = typeof this.state.hunger === "number" ? this.state.hunger : 100;
    await SupabaseSystem.loadGameState(this.state);
    this.state.quests = this.state.quests || {};
    this.state.trust = this.state.trust || {};
    this.state.tribe = this.state.tribe || "";
    this.state.hunger = typeof this.state.hunger === "number" ? Math.max(0, Math.min(100, this.state.hunger)) : 100;
  },

  async addItem(item) {
    await InventorySystem.addItem(this.state, item);
    this.showToast(`You gained ${item}.`);
  },

  async updateTrust(npc, amount) {
    const npcData = this.state.npcs && this.state.npcs[npc];
    const bonus = this.getNPCTribe(npcData) === this.state.tribe ? 1 : 0;
    await RelationshipSystem.updateTrust(this.state, npc, amount + bonus);
    this.showToast(`Trust with ${npc} increased by ${amount + bonus}.`);
  },

  applyTimeCost(state, minutes) {
    const hungerLoss = Math.max(1, Math.ceil(minutes / 10));
    state.hunger = Math.max(0, Math.min(100, (typeof state.hunger === "number" ? state.hunger : 100) - hungerLoss));
    this.showToast(`Time passes: ${minutes} minutes, hunger -${hungerLoss}.`);
  },

  restoreHunger(state, amount) {
    state.hunger = Math.max(0, Math.min(100, (typeof state.hunger === "number" ? state.hunger : 100) + amount));
    this.showToast(`Hunger +${amount}.`);
  },

  showMessage(text) {
    this.state.message = text;
    const messageBox = document.getElementById("message-box");
    if (messageBox) {
      messageBox.textContent = text;
    }
  },

  showToast(text) {
    const container = document.getElementById("toast-container");
    if (!container) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("toast-hide");
      window.setTimeout(() => toast.remove(), 250);
    }, 2200);
  },

  getNPCTribe(npcData) {
    const kingdom = (npcData && npcData.kingdom ? npcData.kingdom : "").toLowerCase();
    const tribeMap = {
      ice: "IceWing",
      sky: "SkyWing",
      sand: "SandWing",
      sea: "SeaWing",
      mud: "MudWing",
      rain: "RainWing",
      night: "NightWing",
    };

    const match = Object.keys(tribeMap).find((key) => kingdom.includes(key));
    return match ? tribeMap[match] : "";
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
