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
    location: "map",

    trust: { lynx: 0, cliff: 0 },
    clues: [],
    inventory: [],

    hasFire: true,
    prophecyComplete: false,
    correctInterpretation: false,

    currentScene: "StartMenu"
  },

  currentScene: null,

  reset(userId, personality = "curious") {
    this.state = {
      userId,
      personality,
      location: "map",

      trust: { lynx: 0, cliff: 0 },
      clues: [],
      inventory: [],

      hasFire: true,
      prophecyComplete: false,
      correctInterpretation: false,

      currentScene: "Map"
    };
  },

  async setScene(scene) {
    this.currentScene = scene;
    this.state.currentScene = scene.name;

    await this.save();
    this.render();
  },

  render() {
    const app = document.getElementById("app");

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
    const inventory = this.state.inventory || [];
    const clues = this.state.clues || [];

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
          <div>${inventory.length ? inventory.join(", ") : "Empty"}</div>
        </div>

        <div class="hud-card">
          <span class="hud-label">Clues</span>
          <div>${clues.length ? clues.join(", ") : "None"}</div>
        </div>
      </div>
    `;
  },

  async handle(action) {
    await this.currentScene.handle(this.state, action, this);
    await this.save();
    this.render();
  },

  async save() {
    if (!this.state.userId) return;

    localStorage.setItem("dragonGameSave", JSON.stringify(this.state));
    localStorage.setItem("dragonUser", this.state.userId);

    await supabaseClient.from("game_saves").upsert(
      {
        user_id: this.state.userId,
        game_state: this.state,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );
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

    // ✅ SAFETY DEFAULTS (fixes your crash)
    this.state.inventory = this.state.inventory || [];
    this.state.clues = this.state.clues || [];
    this.state.trust = this.state.trust || { lynx: 0, cliff: 0 };
  }
};

// 📚 SCENES
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

      const sceneName = game.state.currentScene;

      if (sceneName && Scenes[sceneName]) {
        await game.setScene(Scenes[sceneName]);
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

      <p>Choose personality:</p>
      <button onclick="Game.handle('curious')">Curious</button>
      <button onclick="Game.handle('aggressive')">Aggressive</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "curious" || action === "aggressive") {
      const name = document.getElementById("nameInput").value;
      if (!name) return alert("Enter a name");

      game.reset(name, action);
      await game.setScene(Scenes.Map);
    }
  }
};


// 🗺️ MAP
Scenes.Map = {
  name: "Map",

  render() {
    return `
      <h2>World Map</h2>
      <p>Where will you go?</p>

      <button onclick="Game.handle('ice')">Ice Kingdom</button>
      <button onclick="Game.handle('sky')">Sky Kingdom</button>
      <button onclick="Game.handle('cave')">Mysterious Cave</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "ice") await game.setScene(Scenes.IcePalace);
    if (action === "sky") await game.setScene(Scenes.CliffArea);
    if (action === "cave") await game.setScene(Scenes.Cave);
  }
};


// 🧊 ICE PALACE
Scenes.IcePalace = {
  name: "IcePalace",

  render() {
    return `
      <img src="images/ice-palace.jpg" style="width:100%;border-radius:12px;" />

      <h2>Ice Palace</h2>
      <p>The frozen halls shimmer with ancient magic.</p>

      <button onclick="Game.handle('lynx')">Visit Lynx</button>
      <button onclick="Game.handle('prophecy')">Study Prophecy</button>
      <button onclick="Game.handle('map')">Back to Map</button>
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
      <img src="images/lynx-room.jpg" style="width:100%;border-radius:12px;" />
      <img src="images/lynx.png" style="width:180px;position:absolute;right:40px;bottom:60px;" />

      <h3>Lynx</h3>

      <button onclick="Game.handle('ask')">Ask About Prophecy</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "ask") {
      if (!state.inventory.includes("Ice Crystal")) {
        state.inventory.push("Ice Crystal");
      }

      if (!state.clues.includes("frozen_tears")) {
        state.clues.push("frozen_tears");
      }

      alert("You receive an Ice Crystal.");
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
      <img src="images/cliff-area.jpg" style="width:100%;border-radius:12px;" />
      <img src="images/cliff.png" style="width:180px;position:absolute;left:40px;bottom:60px;" />

      <h3>Cliff</h3>

      <button onclick="Game.handle('talk')">Talk</button>
      <button onclick="Game.handle('map')">Back to Map</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "talk") {
      if (!state.inventory.includes("Flame Shard")) {
        state.inventory.push("Flame Shard");
      }

      if (!state.clues.includes("fire_is_key")) {
        state.clues.push("fire_is_key");
      }

      alert("You receive a Flame Shard.");
    }

    if (action === "map") await game.setScene(Scenes.Map);
  }
};


// 🔮 PROPHECY
Scenes.Prophecy = {
  name: "Prophecy",

  render() {
    return `
      <img src="images/prophecy.jpg" style="width:100%;border-radius:12px;" />

      <h2>Prophecy</h2>

      <button onclick="Game.handle('correct')">Interpret Prophecy</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "correct") {
      state.correctInterpretation = true;
      alert("You begin to understand...");
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
      <img src="images/cave.jpg" style="width:100%;border-radius:12px;" />

      <h2>Frozen Cave</h2>

      <button onclick="Game.handle('fire')">Use Fire</button>
      <button onclick="Game.handle('map')">Back to Map</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "fire") {
      if (!state.correctInterpretation) return alert("You don't understand the prophecy yet...");
      if (!state.inventory.includes("Flame Shard")) return alert("You need fire...");

      await game.setScene(Scenes.Ending);
    }

    if (action === "map") await game.setScene(Scenes.Map);
  }
};


// 🏁 ENDING
Scenes.Ending = {
  name: "Ending",

  render() {
    return `
      <h2>Prophecy Fulfilled</h2>
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


// 🚀 INIT
(async function () {
  await Game.load();
  await Game.setScene(Scenes.StartMenu);
})();