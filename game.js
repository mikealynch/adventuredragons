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
    clues: [],
    correctInterpretation: false,
    currentScene: "StartMenu"
  },

  currentScene: null,
  inventoryCache: [],

  // =========================
  // INVENTORY (DB)
  // =========================

  async fetchInventory() {
    if (!this.state.userId) return [];

    const { data, error } = await supabaseClient
      .from("inventory")
      .select("item_name")
      .eq("user_id", this.state.userId);

    if (error) {
      console.error("Inventory fetch error:", error);
      return [];
    }

    return data.map(i => i.item_name);
  },

  async addItem(itemName) {
    const { error } = await supabaseClient
      .from("inventory")
      .upsert({
        user_id: this.state.userId,
        item_name: itemName
      });

    if (error) console.error("Inventory insert error:", error);
  },

  // =========================
  // CORE ENGINE
  // =========================

  reset(userId, personality) {
    this.state = {
      userId,
      personality,
      clues: [],
      correctInterpretation: false,
      currentScene: "Map"
    };
  },

  async setScene(scene) {
    this.currentScene = scene;
    this.state.currentScene = scene.name;

    await this.save();
    await this.render();
  },

  async render() {
    const app = document.getElementById("app");

    // 🔥 load inventory from DB
    this.inventoryCache = await this.fetchInventory();

    const showHud =
      this.state.userId && this.currentScene.name !== "LoginScene";

    app.innerHTML = `
      <div class="game-shell">
        ${showHud ? this.renderHud() : ""}
        <div class="scene">
          ${this.currentScene.render(this.state)}
        </div>
      </div>
    `;
  },

  renderHud() {
    return `
      <div class="hud">
        <div class="hud-card">
          <span class="hud-label">Dragon</span>
          <div>${this.state.userId}</div>
        </div>

        <div class="hud-card">
          <span class="hud-label">Personality</span>
          <div>${this.state.personality}</div>
        </div>

        <div class="hud-card">
          <span class="hud-label">Inventory</span>
          <div>${this.inventoryCache.length ? this.inventoryCache.join(", ") : "Empty"}</div>
        </div>

        <div class="hud-card">
          <span class="hud-label">Clues</span>
          <div>${this.state.clues.length ? this.state.clues.join(", ") : "None"}</div>
        </div>
      </div>
    `;
  },

  async handle(action) {
    await this.currentScene.handle(this.state, action, this);
    await this.save();
    await this.render();
  },

  async save() {
    if (!this.state.userId) return;

    localStorage.setItem("dragonGameSave", JSON.stringify(this.state));
    localStorage.setItem("dragonUser", this.state.userId);

    await supabaseClient.from("game_saves").upsert({
      user_id: this.state.userId,
      game_state: this.state,
      updated_at: new Date().toISOString()
    });
  },

  async load() {
    const savedUser = localStorage.getItem("dragonUser");

    if (savedUser) {
      this.state.userId = savedUser;

      const { data } = await supabaseClient
        .from("game_saves")
        .select("game_state")
        .eq("user_id", savedUser)
        .maybeSingle();

      if (data && data.game_state) {
        this.state = data.game_state;
      }
    }

    const local = localStorage.getItem("dragonGameSave");
    if (local) {
      this.state = JSON.parse(local);
    }

    // safety defaults
    this.state.clues = this.state.clues || [];
  }
};

// =========================
// SCENES
// =========================

const Scenes = {};

// 🟢 START MENU
Scenes.StartMenu = {
  name: "StartMenu",

  render() {
    const savedUser = localStorage.getItem("dragonUser");

    return `
      <h1>Dragon Prophecy</h1>
      ${savedUser ? `<button onclick="Game.handle('continue')">Continue</button>` : ""}
      <button onclick="Game.handle('new')">New Game</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "continue") {
      await game.load();

      if (state.currentScene && Scenes[state.currentScene]) {
        await game.setScene(Scenes[state.currentScene]);
      } else {
        await game.setScene(Scenes.Map);
      }
    }

    if (action === "new") {
      localStorage.clear();
      await game.setScene(Scenes.LoginScene);
    }
  }
};

// 👤 LOGIN
Scenes.LoginScene = {
  name: "LoginScene",

  render() {
    return `
      <h2>Create Your Dragon</h2>
      <input id="nameInput" placeholder="Dragon name"/>

      <button onclick="Game.handle('curious')">Curious</button>
      <button onclick="Game.handle('aggressive')">Aggressive</button>
    `;
  },

  async handle(state, action, game) {
    const name = document.getElementById("nameInput").value;
    if (!name) return alert("Enter a name");

    game.reset(name, action);
    await game.setScene(Scenes.Map);
  }
};

// 🗺️ MAP
Scenes.Map = {
  name: "Map",

  render() {
    return `
      <h2>World Map</h2>
      <button onclick="Game.handle('ice')">Ice Kingdom</button>
      <button onclick="Game.handle('sky')">Sky Kingdom</button>
      <button onclick="Game.handle('cave')">Cave</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "ice") await game.setScene(Scenes.IcePalace);
    if (action === "sky") await game.setScene(Scenes.CliffArea);
    if (action === "cave") await game.setScene(Scenes.Cave);
  }
};

// 🧊 ICE
Scenes.IcePalace = {
  name: "IcePalace",

  render() {
    return `
      <img src="images/ice-palace.jpg" style="width:100%">
      <h2>Ice Palace</h2>

      <button onclick="Game.handle('lynx')">Visit Lynx</button>
      <button onclick="Game.handle('prophecy')">Prophecy</button>
      <button onclick="Game.handle('map')">Map</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "lynx") await game.setScene(Scenes.LynxRoom);
    if (action === "prophecy") await game.setScene(Scenes.Prophecy);
    if (action === "map") await game.setScene(Scenes.Map);
  }
};

// 🐉 LYNX
Scenes.LynxRoom = {
  name: "LynxRoom",

  render() {
    return `
      <img src="images/lynx-room.jpg" style="width:100%">
      <img src="images/lynx.png" style="position:absolute;right:40px;width:180px">

      <h3>Lynx</h3>

      <button onclick="Game.handle('ask')">Ask</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "ask") {
      await game.addItem("Ice Crystal");

      if (!state.clues.includes("frozen_tears")) {
        state.clues.push("frozen_tears");
      }

      alert("You received Ice Crystal");
      await game.setScene(Scenes.IcePalace);
    }

    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🔥 CLIFF
Scenes.CliffArea = {
  name: "CliffArea",

  render() {
    return `
      <img src="images/cliff-area.jpg" style="width:100%">
      <img src="images/cliff.png" style="position:absolute;left:40px;width:180px">

      <h3>Cliff</h3>

      <button onclick="Game.handle('talk')">Talk</button>
      <button onclick="Game.handle('map')">Map</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "talk") {
      await game.addItem("Flame Shard");

      if (!state.clues.includes("fire_is_key")) {
        state.clues.push("fire_is_key");
      }

      alert("You received Flame Shard");
    }

    if (action === "map") await game.setScene(Scenes.Map);
  }
};

// 🔮 PROPHECY
Scenes.Prophecy = {
  name: "Prophecy",

  render() {
    return `
      <img src="images/prophecy.jpg" style="width:100%">
      <h2>Prophecy</h2>

      <button onclick="Game.handle('correct')">Interpret</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "correct") {
      state.correctInterpretation = true;
      alert("You understand...");
      await game.setScene(Scenes.Map);
    }

    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// ❄️ CAVE
Scenes.Cave = {
  name: "Cave",

  render() {
    return `
      <img src="images/cave.jpg" style="width:100%">
      <h2>Cave</h2>

      <button onclick="Game.handle('fire')">Use Fire</button>
      <button onclick="Game.handle('map')">Map</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "fire") {
      const inventory = await game.fetchInventory();

      if (!state.correctInterpretation) {
        return alert("You don't understand yet");
      }

      if (!inventory.includes("Flame Shard")) {
        return alert("You need fire");
      }

      await game.setScene(Scenes.Ending);
    }

    if (action === "map") await game.setScene(Scenes.Map);
  }
};

// 🏁 END
Scenes.Ending = {
  name: "Ending",

  render() {
    return `
      <h2>Prophecy Complete</h2>
      <button onclick="Game.handle('restart')">Restart</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "restart") {
      game.reset(state.userId, state.personality);
      await game.setScene(Scenes.Map);
    }
  }
};

// 🚀 INIT (fixed continue behavior)
(async function () {
  await Game.load();

  const savedUser = localStorage.getItem("dragonUser");

  if (savedUser && Game.state.currentScene && Scenes[Game.state.currentScene]) {
    await Game.setScene(Scenes[Game.state.currentScene]);
  } else {
    await Game.setScene(Scenes.StartMenu);
  }
})();