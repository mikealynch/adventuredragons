// 🔑 Supabase
const supabaseClient = supabase.createClient(
  "https://ifepchpqcfmqdodoqrdi.supabase.co",
  "sb_publishable_PR05YQL-5y_KSwzTnHLg7w_uXoWkwqE"
);

// 🧠 GAME ENGINE
const Game = {
  state: {
    userId: "",
    personality: "",
    currentScene: "LoginScene",
    inventory: [],
    trust: {},
  },

  currentScene: null,

  async setScene(scene) {
    this.currentScene = scene;
    this.state.currentScene = scene.name;

    if (scene.enter) await scene.enter(this.state);

    await this.savePlayer();
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
    const savedUser = localStorage.getItem("dragonUser");
    if (!savedUser) return;

    this.state.userId = savedUser;

    // load player
    const { data: player } = await supabaseClient
      .from("players")
      .select("*")
      .eq("user_id", savedUser)
      .maybeSingle();

    if (player) {
      this.state.personality = player.personality;
      this.state.currentScene = player.last_scene;
    }

    // load inventory
    const { data: items } = await supabaseClient
      .from("inventory")
      .select("item_name")
      .eq("user_id", savedUser);

    if (items) {
      this.state.inventory = items.map(i => i.item_name);
    }
  },

  async savePlayer() {
    if (!this.state.userId) return;

    await supabaseClient.from("players").upsert({
      user_id: this.state.userId,
      personality: this.state.personality,
      last_scene: this.state.currentScene,
      updated_at: new Date()
    });
  },

  async addItem(item) {
    if (this.state.inventory.includes(item)) return;

    this.state.inventory.push(item);

    await supabaseClient.from("inventory").insert({
      user_id: this.state.userId,
      item_name: item
    });
  },

  async updateTrust(npc, amount) {
    const current = this.state.trust[npc] || 0;
    this.state.trust[npc] = current + amount;

    await supabaseClient.from("relationships").upsert({
      user_id: this.state.userId,
      npc_name: npc,
      trust: this.state.trust[npc]
    });
  }
};

// 📚 SCENES
const Scenes = {};

// LOGIN
Scenes.LoginScene = {
  name: "LoginScene",

  render() {
    return `
      <h1>Dragon Prophecy</h1>
      <input id="nameInput" placeholder="Dragon name"/>
      <button onclick="Game.handle('start')">Start</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "start") {
      const name = document.getElementById("nameInput").value;
      state.userId = name;
      localStorage.setItem("dragonUser", name);
      await game.setScene(Scenes.Personality);
    }
  }
};

// PERSONALITY
Scenes.Personality = {
  name: "Personality",

  render() {
    return `
      <h2>Choose Personality</h2>
      <button onclick="Game.handle('brave')">Brave</button>
      <button onclick="Game.handle('curious')">Curious</button>
    `;
  },

  async handle(state, action, game) {
    state.personality = action;
    await game.setScene(Scenes.IcePalace);
  }
};

// ICE PALACE HUB
Scenes.IcePalace = {
  name: "IcePalace",

  render() {
    return `
      <div class="scene-image-wrap">
        <img src="images/icepalace.jpg" class="scene-image">
      </div>

      <div class="scene-panel">
        <h2>Ice Palace</h2>
        <p>You stand within a frozen hall of knowledge.</p>

        <button onclick="Game.handle('lynx')">Visit Lynx</button>
        <button onclick="Game.handle('cliff')">Visit Cliff</button>
        <button onclick="Game.handle('viper')">Travel to Sand Kingdom</button>
        <button onclick="Game.handle('glacier')">Meet Ice Soldier</button>
      </div>
    `;
  },

  async handle(state, action, game) {
    if (action === "lynx") await game.setScene(Scenes.Lynx);
    if (action === "cliff") await game.setScene(Scenes.Cliff);
    if (action === "viper") await game.setScene(Scenes.Viper);
    if (action === "glacier") await game.setScene(Scenes.Glacier);
  }
};

// LYNX
Scenes.Lynx = {
  name: "Lynx",

  render() {
    return `
      <div class="scene-image-wrap">
        <img src="images/lynx-room.jpg" class="scene-image">
        <div class="npc-layer">
          <img src="images/lynx.png" class="npc right">
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
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// CLIFF
Scenes.Cliff = {
  name: "Cliff",

  render() {
    return `
      <div class="scene-image-wrap">
        <img src="images/fire-room.jpg" class="scene-image">
        <div class="npc-layer">
          <img src="images/cliff.png" class="npc left">
        </div>
      </div>

      <div class="scene-panel">
        <h2>Cliff</h2>
        <button onclick="Game.handle('train')">Train</button>
        <button onclick="Game.handle('back')">Back</button>
      </div>
    `;
  },

  async handle(state, action, game) {
    if (action === "train") {
      await game.updateTrust("cliff", 1);
      await game.addItem("hidden_flame");
      alert("You gained Hidden Flame");
    }
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🐍 VIPER (NEW)
Scenes.Viper = {
  name: "Viper",

  render() {
    return `
      <div class="scene-image-wrap">
        <img src="images/sand-kingdom.jpg" class="scene-image">
        <div class="npc-layer">
          <img src="images/viper.png" class="npc right">
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
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🧊 GLACIER (NEW)
Scenes.Glacier = {
  name: "Glacier",

  render() {
    return `
      <div class="scene-image-wrap">
        <img src="images/ice-guard.jpg" class="scene-image">
        <div class="npc-layer">
          <img src="images/glacier.png" class="npc left">
        </div>
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
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// INIT
(async function () {
  await Game.load();

  if (Game.state.currentScene && Scenes[Game.state.currentScene]) {
    Game.setScene(Scenes[Game.state.currentScene]);
  } else {
    Game.setScene(Scenes.LoginScene);
  }
})();