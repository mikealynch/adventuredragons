// 🔑 Supabase
const supabaseClient = supabase.createClient(
  "https://ifepchpqcfmqdodoqrdi.supabase.co",
  "sb_publishable_PR05YQL-5y_KSwzTnHLg7w_uXoWkwqE"
);

// 🧠 Scene Engine
const Game = {
  state: {
    userId: "",
    location: "start",
    trust: { luma: 0 },
    clues: [],
    hasFire: true,
    prophecyComplete: false,
    currentScene: "LoginScene"
  },

  currentScene: null,

  async setScene(scene) {
    this.currentScene = scene;
    this.state.currentScene = scene.name;

    if (scene.enter) await scene.enter(this.state);

    await this.save();
    this.render();
  },

  render() {
    const app = document.getElementById("app");
    app.innerHTML = this.currentScene.render(this.state);
  },

  async handle(action) {
    await this.currentScene.handle(this.state, action, this);
    await this.save();
    this.render();
  },

  async save() {
    if (!this.state.userId) return;

    localStorage.setItem("dragonGameSave", JSON.stringify(this.state));

    await supabaseClient.from("game_saves").upsert({
      user_id: this.state.userId,
      game_state: this.state,
      updated_at: new Date()
    });
  },

  async load() {
    const savedUser = localStorage.getItem("dragonUser");

    if (savedUser) {
      this.state.userId = savedUser;

      const { data, error } = await supabaseClient
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
  }
};

// 📚 Scene Registry
const Scenes = {};

// 👤 LOGIN
Scenes.LoginScene = {
  name: "LoginScene",

  render() {
    return `
      <h1>Dragon Prophecy</h1>
      <p>Enter your dragon name:</p>
      <input id="nameInput" />
      <button onclick="Game.handle('start')">Start</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "start") {
      const name = document.getElementById("nameInput").value;

      state.userId = name;
      localStorage.setItem("dragonUser", name);

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
      <button onclick="Game.handle('go_cave')">Go to Cave</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "talk_luma") {
      await game.setScene(Scenes.Luma);
    }

    if (action === "go_cave") {
      await game.setScene(Scenes.Cave);
    }
  }
};

// 🐉 LUMA
Scenes.Luma = {
  name: "Luma",

  enter(state) {
    state.trust.luma++;
  },

  render(state) {
    let text = "";

    if (state.trust.luma === 1) {
      text = "Prophecies are rarely literal...";
    } else {
      text = "The glacier drips like frozen tears...";
      state.clues.push("frozen_tears");
    }

    return `
      <h3>Luma</h3>
      <p>${text}</p>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "back") {
      await game.setScene(Scenes.IcePalace);
    }
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

    if (action === "back") {
      await game.setScene(Scenes.IcePalace);
    }
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
      // reset game but keep same user
      game.state = {
        userId: state.userId,
        trust: { luma: 0 },
        clues: [],
        hasFire: true,
        prophecyComplete: false,
        currentScene: "IcePalace"
      };

      await game.setScene(Scenes.IcePalace);
    }
  }
};

// 🚀 INIT
(async function () {
  await Game.load();

  if (Game.state.currentScene && Scenes[Game.state.currentScene]) {
    Game.setScene(Scenes[Game.state.currentScene]);
  } else {
    Game.setScene(Scenes.LoginScene);
  }
})();