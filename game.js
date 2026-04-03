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
    trust: { lynx: 0, cliff: 0 },
    clues: [],
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
      trust: { lynx: 0, cliff: 0 },
      clues: [],
      hasFire: true,
      prophecyComplete: false,
      correctInterpretation: false,
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

    const showHud =
      this.state.userId && this.currentScene.name !== "LoginScene";

    app.innerHTML = `
      ${showHud ? this.renderHud() : ""}
      ${this.currentScene.render(this.state)}
    `;
  },

  renderHud() {
    return `
      <div class="hud">
        <div><strong>${this.state.userId}</strong> (${this.state.personality})</div>
        <div>Clues: ${this.state.clues.length ? this.state.clues.join(", ") : "None"}</div>
        <div>Trust → Lynx ${this.state.trust.lynx} | Cliff ${this.state.trust.cliff}</div>
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
      <p>A Wings-inspired dragon adventure.</p>

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
      await game.setScene(Scenes.IcePalace);
    }
  }
};

// 🏰 ICE PALACE
Scenes.IcePalace = {
  name: "IcePalace",

  render() {
    return `
      <img src="images/ice-palace.jpg" style="width:100%;border-radius:12px;margin-bottom:15px;" />

      <h2>Ice Palace</h2>
      <p>
        The frozen halls shimmer with ancient magic. Ice pillars rise like
        silent guardians, and somewhere within these walls, a prophecy waits
        to be understood.
      </p>

      <button onclick="Game.handle('talk_lynx')">Talk to Lynx</button>
      <button onclick="Game.handle('talk_cliff')">Talk to Cliff</button>
      <button onclick="Game.handle('prophecy')">Study Prophecy</button>
      <button onclick="Game.handle('go_cave')">Go to Cave</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "talk_lynx") await game.setScene(Scenes.Lynx);
    if (action === "talk_cliff") await game.setScene(Scenes.Cliff);
    if (action === "prophecy") await game.setScene(Scenes.Prophecy);
    if (action === "go_cave") await game.setScene(Scenes.Cave);
  }
};

// 🐉 LYNX
Scenes.Lynx = {
  name: "Lynx",

  render() {
    return `
      <div class="npc-card">
        <img src="images/lynx.jpg"/>
        <h3>Lynx</h3>
        <p>"What do you seek?"</p>
      </div>

      <button onclick="Game.handle('ask')">Ask politely</button>
      <button onclick="Game.handle('demand')">Demand answers</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "ask") {
      state.trust.lynx++;
      if (!state.clues.includes("frozen_tears")) state.clues.push("frozen_tears");
      alert("Lynx whispers about frozen tears...");
      await game.setScene(Scenes.IcePalace);
    }

    if (action === "demand") {
      if (state.personality === "aggressive") {
        state.trust.lynx++;
        if (!state.clues.includes("frozen_tears")) state.clues.push("frozen_tears");
        alert("Lynx reluctantly shares the truth.");
      } else {
        alert("That approach fails.");
      }
      await game.setScene(Scenes.IcePalace);
    }

    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🔥 CLIFF
Scenes.Cliff = {
  name: "Cliff",

  render() {
    return `
      <div class="npc-card">
        <img src="images/cliff.jpg"/>
        <h3>Cliff</h3>
        <p>"Say it fast."</p>
      </div>

      <button onclick="Game.handle('respect')">Be respectful</button>
      <button onclick="Game.handle('challenge')">Challenge him</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "respect") {
      state.trust.cliff++;
      if (!state.clues.includes("fire_is_key")) state.clues.push("fire_is_key");
      alert("Cliff nods. Fire reveals truth.");
      await game.setScene(Scenes.IcePalace);
    }

    if (action === "challenge") {
      if (state.personality === "aggressive") {
        state.trust.cliff++;
        if (!state.clues.includes("fire_is_key")) state.clues.push("fire_is_key");
        alert("Cliff respects your strength.");
      } else {
        alert("Cliff ignores you.");
      }
      await game.setScene(Scenes.IcePalace);
    }

    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// 🔮 PROPHECY
Scenes.Prophecy = {
  name: "Prophecy",

  render() {
    return `
      <img src="images/prophecy.jpg" style="width:100%;border-radius:12px;margin-bottom:15px;" />

      <h2>The Prophecy</h2>
      <p>
        Ancient symbols glow faintly in the ice.
      </p>

      <p>"Where frozen tears meet hidden flame..."</p>

      <button onclick="Game.handle('correct')">Use fire in cave</button>
      <button onclick="Game.handle('wrong')">Wait</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "correct") {
      state.correctInterpretation = true;
      alert("That feels right...");
      await game.setScene(Scenes.IcePalace);
    }

    if (action === "wrong") alert("That doesn’t feel right...");
    if (action === "back") await game.setScene(Scenes.IcePalace);
  }
};

// ❄️ CAVE
Scenes.Cave = {
  name: "Cave",

  render() {
    return `
      <img src="images/cave.jpg" style="width:100%;border-radius:12px;margin-bottom:15px;" />

      <h2>Frozen Cave</h2>
      <p>
        The cave breathes cold air. The ice walls shimmer faintly,
        as if hiding something beneath their surface.
      </p>

      <button onclick="Game.handle('fire')">Use Fire</button>
      <button onclick="Game.handle('back')">Back</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "fire") {
      if (!state.correctInterpretation) return alert("Something is missing...");
      if (!state.clues.includes("frozen_tears") || !state.clues.includes("fire_is_key")) {
        return alert("You don't fully understand...");
      }
      await game.setScene(Scenes.Ending);
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
      <p>The truth hidden in the ice is revealed.</p>
      <button onclick="Game.handle('restart')">Restart</button>
    `;
  },

  async handle(state, action, game) {
    if (action === "restart") {
      game.reset(state.userId, state.personality);
      await game.setScene(Scenes.IcePalace);
    }
  }
};

// 🚀 INIT
(async function () {
  await Game.load();
  await Game.setScene(Scenes.StartMenu);
})();