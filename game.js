const Game = {
  state: {
    userId: "",
    playerId: "",
    dragonName: "",
    tribe: "",
    personality: "",
    currentScene: "IntroScene",
    currentLocation: "",
    activeLocation: null,
    dragons: [],
    debug: null,
    hunger: 100,
    inventory: [],
    huntContext: null,
    currentObjective: "",
    quests: {},
    trust: {},
  },

  currentScene: null,

  async setScene(scene) {
    this.state.quests = this.state.quests || {};
    this.state.trust = this.state.trust || {};
    this.state.message = "";

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

    this.refreshObjective(this.state);
    await SupabaseSystem.savePlayer(this.state);
    this.render();
  },

  render() {
    const app = document.getElementById("app");
    const backgroundStyle = this.currentScene.background
      ? `style="background-image:url('${this.currentScene.background}');"`
      : "";
    const sceneClass = this.currentScene.background ? "scene has-background fade-in" : "scene fade-in";

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
          <div class="objective-box"><b>Objective</b><br>${this.state.currentObjective || "Follow the prophecy wherever it leads."}</div>
          <div id="message-box" class="message-box">${this.state.message || "The prophecy waits for your next choice."}</div>
          ${this.currentScene.render(this.state)}
        </div>
      </div>
    `;
  },

  async handle(action) {
    await this.currentScene.handle(this.state, action, this);
    this.refreshObjective(this.state);
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
    this.showToast(`+${amount} hunger`);
  },

  getSceneByName(name) {
    return name && window.Scenes ? window.Scenes[name] : null;
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

  refreshObjective(state) {
    if ((typeof state.hunger === "number" ? state.hunger : 100) <= 35) {
      state.currentObjective = "You are hungry. Reach hunting grounds and restore your strength.";
      return;
    }

    const questState = window.QuestSystem && typeof QuestSystem.getQuestState === "function"
      ? QuestSystem.getQuestState(state, "viper_spy_mission")
      : { started: false, completed: false };

    const hasFrozenTear = Array.isArray(state.inventory) && state.inventory.includes("Frozen Tear");
    const hasHiddenFlame = Array.isArray(state.inventory) && state.inventory.includes("Hidden Flame");

    const sceneObjectives = {
      IntroScene: "Begin the prophecy and step into the story.",
      LoginScene: "Enter your user ID to find your dragons.",
      UserCheckScene: "Wait while the archives search for your dragons.",
      DragonSelectScene: "Choose a dragon to continue the prophecy.",
      CreateDragonScene: "Name your dragon and choose the nature that will guide them.",
      WorldMapScene: "Choose a kingdom to investigate next.",
      IcePalace: hasFrozenTear ? "Carry the prophecy onward and seek the hidden flame in the Sky Kingdom." : "Speak to Lynx.",
      Lynx: hasFrozenTear ? "Return to the Ice Palace, then seek the hidden flame in the Sky Kingdom." : "Earn Lynx's trust and uncover the Frozen Tear.",
      Glacier: questState.started && !questState.completed ? "Complete Viper's spy mission with Glacier." : "Accept Viper's mission before asking Glacier for help.",
      Cliff: hasHiddenFlame ? "Return to the world map and decide which kingdom to visit next." : "Seek the hidden flame in the Sky Kingdom.",
      Viper: questState.completed ? "The spy mission is complete. Choose your next kingdom." : "Hear Viper's offer and decide whether to accept the spy mission.",
      IceHunt: "Choose your prey carefully and restore your hunger.",
      SkyHunt: "Choose your prey carefully and restore your hunger.",
      SandHunt: "Choose your prey carefully and restore your hunger.",
      SeaKingdom: "Listen to Tide and learn what the tides have carried in.",
      RainforestKingdom: "Speak with Kale and discover what the rainforest is hiding.",
      HuntScene: "Choose the right hunting approach for the prey in front of you.",
    };

    state.currentObjective = sceneObjectives[state.currentScene] || "Follow the next thread of the prophecy.";
  },

  getLocationKingdom(state) {
    const rawKingdom = state.activeLocation && state.activeLocation.kingdom
      ? state.activeLocation.kingdom
      : state.currentLocation;
    const value = (rawKingdom || "").toLowerCase();

    if (value.includes("sand")) {
      return "sand";
    }

    if (value.includes("sky")) {
      return "sky";
    }

    if (value.includes("sea")) {
      return "sea";
    }

    if (value.includes("rain")) {
      return "rain";
    }

    return "ice";
  },

  buildPreyPool(kingdom) {
    const preyByKingdom = {
      sand: [
        { name: "Sand Runner", type: "lizard", weakTo: "stalk", bonusTribes: ["SandWing"] },
        { name: "Dune Hare", type: "hare", weakTo: "wait", bonusTribes: ["SandWing", "NightWing"] },
        { name: "Rock Lizard", type: "lizard", weakTo: "fly", bonusTribes: ["SkyWing"] },
      ],
      sky: [
        { name: "Cliff Goat", type: "goat", weakTo: "stalk", bonusTribes: ["SkyWing"] },
        { name: "Storm Gull", type: "bird", weakTo: "fly", bonusTribes: ["SkyWing", "SeaWing"] },
        { name: "Highland Rabbit", type: "hare", weakTo: "wait", bonusTribes: ["NightWing"] },
      ],
      ice: [
        { name: "Snow Hare", type: "hare", weakTo: "wait", bonusTribes: ["IceWing"] },
        { name: "Frost Elk", type: "elk", weakTo: "stalk", bonusTribes: ["IceWing", "MudWing"] },
        { name: "Ice Gull", type: "bird", weakTo: "fly", bonusTribes: ["SkyWing", "IceWing"] },
      ],
    };

    return preyByKingdom[kingdom] || preyByKingdom.ice;
  },

  describeHuntSpotting(kingdom, prey) {
    const intros = {
      sand: `Heat ripples across the dunes as a ${prey.name.toLowerCase()} breaks cover near a line of buried stone.`,
      sky: `Wind curls around the crags while a ${prey.name.toLowerCase()} moves across the open heights below.`,
      ice: `Fresh tracks cut through the frost, and a ${prey.name.toLowerCase()} stirs beyond the snowdrifts.`,
    };

    return intros[kingdom] || intros.ice;
  },

  async startHunt(state) {
    this.applyTimeCost(state, 25);
    const kingdom = this.getLocationKingdom(state);
    const preyPool = this.buildPreyPool(kingdom);
    const prey = preyPool[Math.floor(Math.random() * preyPool.length)];

    state.huntContext = {
      returnSceneName: state.currentScene,
      kingdom,
      prey,
      spotText: this.describeHuntSpotting(kingdom, prey),
    };

    await this.setScene(window.Scenes.HuntScene);
  },

  async resolveHunt(state, choice) {
    const hunt = state.huntContext;
    if (!hunt || !hunt.prey) {
      await this.setScene(this.getSceneByName("WorldMapScene"));
      return;
    }

    const prey = hunt.prey;
    const correctChoice = prey.weakTo === choice;
    const tribeBonus = Array.isArray(prey.bonusTribes) && prey.bonusTribes.includes(state.tribe);
    const successChance = 0.5 + (correctChoice ? 0.3 : 0) + (tribeBonus ? 0.2 : 0);
    const success = Math.random() < successChance;
    const resultText = success
      ? `You ${choice} at exactly the right moment and bring down the ${prey.name}.\n\nThe hunt restores your strength.`
      : `You try to ${choice}, but the ${prey.name} escapes into the ${hunt.kingdom} wilds.\n\nYou return empty-clawed this time.`;
    const returnScene = this.getSceneByName(hunt.returnSceneName) || this.getSceneByName("WorldMapScene");

    if (success) {
      this.restoreHunger(state, 30);
      await this.addItem("food");
    }

    state.huntContext = null;
    await this.setScene(returnScene);
    this.showMessage(resultText);
  },

  syncCurrentLocation(sceneName) {
    const sceneLocations = {
      WorldMapScene: "World Map",
      IcePalace: "Ice Kingdom",
      IceHunt: "Ice Kingdom Hunting Grounds",
      Lynx: "Ice Kingdom",
      Glacier: "Ice Kingdom",
      Cliff: "Sky Kingdom",
      SkyHunt: "Sky Kingdom Hunting Grounds",
      Viper: "Sand Kingdom",
      SandHunt: "Sand Kingdom Hunting Grounds",
      SeaKingdom: "Sea Kingdom",
      RainforestKingdom: "Rainforest Kingdom",
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
