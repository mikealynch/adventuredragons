// 🔑 Supabase
const supabaseClient = supabase.createClient(
  "https://ifepchpqcfmqdodoqrdi.supabase.co",
  "sb_publishable_PR05YQL-5y_KSwzTnHLg7w_uXoWkwqE"
);

// 🧠 GAME ENGINE
const Game = {
  state: {
    userId: "",
    trust: { luma: 0, pyra: 0 },
    clues: [],
    hasFire: true,
    prophecyComplete: false,
    currentScene: "StartMenu"
  },

  currentScene: null,

  reset(userId) {
    this.state = {
      userId,
      trust: { luma: 0, pyra: 0 },
      clues: [],
      hasFire: true,
      prophecyComplete: false,
      currentScene: "IcePalace"
    };
  },

  async setScene(scene) {
    this.currentScene = scene;
    this.state.currentScene = scene.name;

    if (scene.enter) await scene.enter(this.state);

    await this.save();
    this.render();
  },

  render() {
    const app = document.getElementById("app");

    // Add clue panel to every screen except login/start
    const showClues = this.state.userId;

    app.innerHTML = `
      ${showClues ? this.renderClues() : ""}
      ${this.currentScene.render(this.state)}
    `;
  },

  renderClues() {
    return `
      <div style="background:#1e293b;padding:10px;margin-bottom:20px;">
        <strong>Clues:</strong>
        ${this.state.clues.length === 0 ? "None yet" : this.state.clues.join(", ")}
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

    const { error } = await supabaseClient
      .from("game_saves")
      .upsert(
        {
          user_id: this.state.userId,
          game_state: this.state,
          updated_at: new Date()
        },
        { onConflict: "user_id" }
      );

    if (error) console.error("SAVE ERROR:", error);
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
        return;
      }
    }

    const local = localStorage.getItem("dragonGameSave");
    if (local) {
      this.state = JSON.parse(local);
    }
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
      await game.setScene(Scenes[state.currentScene] || Scenes.IcePalace);
    }

    if (action === "new") {
      localStorage.removeItem("dragonGameSave");
      localStorage.removeItem("dragonUser");
      await game.setScene(Scenes.LoginScene);
    }
  }
};

// 👤 LOGIN
Scenes.LoginScene = {
  name: "LoginScene",

  render() {
    return `
      <h2>Enter Your Dragon Name</h2>
      <input id="nameInput" />
      <button onclick="Game.handle('start')">Start</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "start") {
      const name = document.getElementById("nameInput").value;

      state.userId = name;
      localStorage.setItem("dragonUser", name);

      game.reset(name);
      await game.setScene(Scenes.IcePalace);
    }
  }
};

// 🏰 ICE PALACE
Scenes.IcePalace = {
  name: "IcePalace",

  render() {
    return `
      <h2>Ice Palace</h2>
      <button onclick="Game.handle('talk_luma')">Talk to Luma</button>
      <button onclick="Game.handle('talk_pyra')">Talk to Pyra</button>
      <button onclick="Game.handle('go_cave')">Go to Cave</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "talk_luma") await game.setScene(Scenes.Luma);
    if (action === "talk_pyra") await game.setScene(Scenes.Pyra);
    if (action === "go_cave") await game.setScene(Scenes.Cave);
  }
};

// 🐉 LUMA
Scenes.Luma = {
  name: "Luma",

  enter(state) {
    state.trust.luma++;
  },

  render(state) {
    let text =
      state.trust.luma === 1
        ? "Prophecies are rarely literal..."
        : "The glacier drips like frozen tears...";

    if (!state.clues.includes("frozen_tears")) {
      state.clues.push("frozen_tears");
    }

    return `
      <h3>Luma</h3>
      <p>${text}</p>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🔥 PYRA (NEW)
Scenes.Pyra = {
  name: "Pyra",

  enter(state) {
    state.trust.pyra++;
  },

  render(state) {
    if (!state.clues.includes("fire_is_key")) {
      state.clues.push("fire_is_key");
    }

    return `
      <h3>Pyra</h3>
      <p>Fire reveals what ice hides.</p>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// ❄️ CAVE
Scenes.Cave = {
  name: "Cave",

  render() {
    return `
      <h2>Frozen Cave</h2>
      <button onclick="Game.handle('use_fire')">Use Fire</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "use_fire") {
      if (state.hasFire) {
        state.prophecyComplete = true;
        await game.setScene(Scenes.Ending);
      }
    }

    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🏁 ENDING
Scenes.Ending = {
  name: "Ending",

  render() {
    return `
      <h2>Prophecy Fulfilled</h2>
      <p>The hidden truth emerges from the ice...</p>
      <button onclick="Game.handle('restart')">Restart</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "restart") {
      game.reset(state.userId);
      await game.setScene(Scenes.IcePalace);
    }
  }
};

// 🚀 INIT
(async function () {
  await Game.load();

  if (Game.state.userId) {
    Game.setScene(Scenes.StartMenu);
  } else {
    Game.setScene(Scenes.StartMenu);
  }
})();