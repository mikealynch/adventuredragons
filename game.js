const supabaseClient = supabase.createClient(
  "https://ifepchpqcfmqdodoqrdi.supabase.co",
  "sb_publishable_PR05YQL-5y_KSwzTnHLg7w_uXoWkwqE"
);

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

    if (scene.enter) {
      await scene.enter(this.state);
    }

    await this.save();
    this.render();
  },

  render() {
    const app = document.getElementById("app");
    const showHud = !!this.state.userId && this.currentScene.name !== "LoginScene";

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
          <div>${this.escapeHtml(this.state.userId)}</div>
        </div>
        <div class="hud-card">
          <span class="hud-label">Personality</span>
          <div>${this.escapeHtml(this.state.personality || "none")}</div>
        </div>
        <div class="hud-card">
          <span class="hud-label">Clues</span>
          <div>${this.state.clues.length ? this.state.clues.map(this.prettyClue).join(", ") : "None yet"}</div>
        </div>
        <div class="hud-card">
          <span class="hud-label">Trust</span>
          <div>Lynx ${this.state.trust.lynx} | Cliff ${this.state.trust.cliff}</div>
        </div>
      </div>
    `;
  },

  prettyClue(clue) {
    if (clue === "frozen_tears") return "Frozen Tears";
    if (clue === "fire_is_key") return "Hidden Flame";
    return clue;
  },

  renderSceneWithImage({
    background,
    title,
    description,
    buttons,
    characterImage = "",
    characterSide = "right",
    extraHtml = ""
  }) {
    const npcHtml = characterImage
      ? `<img class="npc-overlay npc-${characterSide}" src="${characterImage}" alt="" />`
      : "";

    return `
      <div class="scene-image-wrap">
        <img class="scene-image" src="${background}" alt="${this.escapeHtml(title)}" />
        <div class="scene-overlay"></div>
        ${npcHtml}
      </div>

      <div class="scene-panel">
        <h2>${title}</h2>
        <p>${description}</p>
        ${extraHtml}
        <div class="button-group">
          ${buttons}
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

    const { error } = await supabaseClient
      .from("game_saves")
      .upsert(
        {
          user_id: this.state.userId,
          game_state: this.state,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("SAVE ERROR:", error);
    }
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

      if (error) {
        console.error("LOAD ERROR:", error);
      }

      if (data && data.game_state) {
        this.state = data.game_state;
        return;
      }
    }

    const local = localStorage.getItem("dragonGameSave");
    if (local) {
      this.state = JSON.parse(local);
    }
  },

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  notify(message) {
    alert(message);
  }
};

const Scenes = {};

Scenes.StartMenu = {
  name: "StartMenu",

  render() {
    const savedUser = localStorage.getItem("dragonUser");

    return `
      <div class="scene-panel">
        <h1>Dragon Prophecy</h1>
        <p>
          A story-driven dragon adventure of clues, trust, and ancient meanings hidden beneath ice.
        </p>
        <div class="button-group">
          ${savedUser ? `<button onclick="Game.handle('continue')">Continue</button>` : ""}
          <button onclick="Game.handle('new')">New Game</button>
        </div>
      </div>
    `;
  },

  async handle(state, action, game) {
    if (action === "continue") {
      await game.load();
      await game.setScene(Scenes[state.currentScene] || Scenes.IcePalace);
      return;
    }

    if (action === "new") {
      localStorage.removeItem("dragonGameSave");
      localStorage.removeItem("dragonUser");
      game.state = {
        userId: "",
        personality: "",
        trust: { lynx: 0, cliff: 0 },
        clues: [],
        hasFire: true,
        prophecyComplete: false,
        correctInterpretation: false,
        currentScene: "LoginScene"
      };
      await game.setScene(Scenes.LoginScene);
    }
  }
};

Scenes.LoginScene = {
  name: "LoginScene",

  render() {
    return `
      <div class="scene-panel">
        <h2>Create Your Dragon</h2>
        <p>Choose a name and the kind of dragon you want to be in conversation.</p>

        <input id="nameInput" placeholder="Dragon name" />

        <div class="choice-row">
          <button onclick="Game.handle('curious')">Curious</button>
          <button onclick="Game.handle('aggressive')">Aggressive</button>
        </div>
      </div>
    `;
  },

  async handle(state, action, game) {
    if (action !== "curious" && action !== "aggressive") return;

    const input = document.getElementById("nameInput");
    const name = input ? input.value.trim() : "";

    if (!name) {
      game.notify("Please enter your dragon's name first.");
      return;
    }

    localStorage.setItem("dragonUser", name);
    game.reset(name, action);
    await game.setScene(Scenes.IcePalace);
  }
};

Scenes.IcePalace = {
  name: "IcePalace",

  render() {
    return Game.renderSceneWithImage({
      background: "images/ice-palace.jpg",
      title: "Ice Palace Chamber",
      description:
        "You step into a quiet chamber deep within the Ice Palace. Frost patterns spread across the walls like frozen constellations, and beyond the tall window a storm sweeps across the mountains. A table of careful objects suggests thought, history, and secrets. This is a place of study, not ceremony.",
      buttons: `
        <button onclick="Game.handle('go_lynx')">Go to Lynx's Study</button>
        <button onclick="Game.handle('go_cliff')">Go to Training Grounds</button>
        <button onclick="Game.handle('prophecy')">Study Prophecy</button>
        <button onclick="Game.handle('go_cave')">Go to Frozen Cave</button>
      `
    });
  },

  async handle(state, action, game) {
    if (action === "go_lynx") {
      await game.setScene(Scenes.LynxRoom);
      return;
    }

    if (action === "go_cliff") {
      await game.setScene(Scenes.CliffArea);
      return;
    }

    if (action === "prophecy") {
      await game.setScene(Scenes.Prophecy);
      return;
    }

    if (action === "go_cave") {
      await game.setScene(Scenes.Cave);
    }
  }
};

Scenes.LynxRoom = {
  name: "LynxRoom",

  render() {
    return Game.renderSceneWithImage({
      background: "images/lynx-room.jpg",
      characterImage: "images/lynx.png",
      characterSide: "right",
      title: "Lynx's Study",
      description:
        "The chamber is quiet and exacting. Frost-work climbs the walls in delicate patterns, and old objects rest on a small table as if they are waiting to be understood. Lynx stands here in her element, surrounded by cold beauty and careful thought.",
      extraHtml: `<p class="quote">"What do you seek?"</p>`,
      buttons: `
        <button onclick="Game.handle('ask')">Ask politely about the prophecy</button>
        <button onclick="Game.handle('demand')">Demand answers</button>
        <button class="button-secondary" onclick="Game.handle('back')">Back to Ice Palace</button>
      `
    });
  },

  async handle(state, action, game) {
    if (action === "ask") {
      state.trust.lynx += 1;

      if (!state.clues.includes("frozen_tears")) {
        state.clues.push("frozen_tears");
      }

      game.notify("Lynx lowers her voice. 'The glacier weeps. Remember the frozen tears.'");
      await game.setScene(Scenes.IcePalace);
      return;
    }

    if (action === "demand") {
      if (state.personality === "aggressive") {
        state.trust.lynx += 1;

        if (!state.clues.includes("frozen_tears")) {
          state.clues.push("frozen_tears");
        }

        game.notify("Lynx stiffens, then answers. 'Very well. Frozen tears mark the place.'");
      } else {
        game.notify("Lynx withdraws from you. That approach does not earn trust.");
      }

      await game.setScene(Scenes.IcePalace);
      return;
    }

    if (action === "back") {
      await game.setScene(Scenes.IcePalace);
    }
  }
};

Scenes.CliffArea = {
  name: "CliffArea",

  render() {
    return Game.renderSceneWithImage({
      background: "images/cliff-area.jpg",
      characterImage: "images/cliff.png",
      characterSide: "left",
      title: "Training Grounds",
      description:
        "The air here is sharper, roughened by wind and the memory of movement. Ice and stone meet in a place built for practice, challenge, and testing strength. Cliff watches you with restless focus, as if every word ought to prove something.",
      extraHtml: `<p class="quote">"Say it fast."</p>`,
      buttons: `
        <button onclick="Game.handle('respect')">Speak respectfully</button>
        <button onclick="Game.handle('challenge')">Challenge him</button>
        <button class="button-secondary" onclick="Game.handle('back')">Back to Ice Palace</button>
      `
    });
  },

  async handle(state, action, game) {
    if (action === "respect") {
      state.trust.cliff += 1;

      if (!state.clues.includes("fire_is_key")) {
        state.clues.push("fire_is_key");
      }

      game.notify("Cliff nods once. 'Fire reveals what the ice is hiding.'");
      await game.setScene(Scenes.IcePalace);
      return;
    }

    if (action === "challenge") {
      if (state.personality === "aggressive") {
        state.trust.cliff += 1;

        if (!state.clues.includes("fire_is_key")) {
          state.clues.push("fire_is_key");
        }

        game.notify("Cliff grins. 'Good. Then hear this: hidden flame is the key.'");
      } else {
        game.notify("Cliff dismisses you. That did not impress him.");
      }

      await game.setScene(Scenes.IcePalace);
      return;
    }

    if (action === "back") {
      await game.setScene(Scenes.IcePalace);
    }
  }
};

Scenes.Prophecy = {
  name: "Prophecy",

  render() {
    return Game.renderSceneWithImage({
      background: "images/prophecy.jpg",
      title: "The Prophecy",
      description:
        "A slab of ancient ice glows from within. Frost and runes conceal part of its meaning, but two ideas stand out again and again in your thoughts: frozen tears, and hidden flame.",
      extraHtml: `
        <p class="quote">
          "Where frozen tears meet hidden flame,<br>
          truth awakens without a name."
        </p>
        <p class="tiny-note">What do you think the prophecy is asking you to do?</p>
      `,
      buttons: `
        <button onclick="Game.handle('guess_correct')">Use fire where the ice itself weeps</button>
        <button onclick="Game.handle('guess_wrong_1')">Wait for the prophecy to reveal itself</button>
        <button onclick="Game.handle('guess_wrong_2')">Search for another dragon first</button>
        <button class="button-secondary" onclick="Game.handle('back')">Back to Ice Palace</button>
      `
    });
  },

  async handle(state, action, game) {
    if (action === "guess_correct") {
      state.correctInterpretation = true;
      game.notify("That feels right. The meaning sharpens in your mind.");
      await game.setScene(Scenes.IcePalace);
      return;
    }

    if (action === "guess_wrong_1") {
      game.notify("No. Prophecies are fulfilled by dragons who act.");
      return;
    }

    if (action === "guess_wrong_2") {
      game.notify("You may still need others, but that is not the answer itself.");
      return;
    }

    if (action === "back") {
      await game.setScene(Scenes.IcePalace);
    }
  }
};

Scenes.Cave = {
  name: "Cave",

  render() {
    return Game.renderSceneWithImage({
      background: "images/cave.jpg",
      title: "Frozen Cave",
      description:
        "Cold air moves through the cavern in long, quiet breaths. The ice walls shimmer faintly, as if something beneath them is waiting for the right moment to surface.",
      buttons: `
        <button onclick="Game.handle('use_fire')">Use Fire</button>
        <button class="button-secondary" onclick="Game.handle('back')">Back to Ice Palace</button>
      `
    });
  },

  async handle(state, action, game) {
    if (action === "use_fire") {
      if (!state.correctInterpretation) {
        game.notify("You feel like you're missing something important.");
        return;
      }

      if (!state.clues.includes("frozen_tears") || !state.clues.includes("fire_is_key")) {
        game.notify("You don't understand the prophecy well enough yet.");
        return;
      }

      state.prophecyComplete = true;
      await game.setScene(Scenes.Ending);
      return;
    }

    if (action === "back") {
      await game.setScene(Scenes.IcePalace);
    }
  }
};

Scenes.Ending = {
  name: "Ending",

  render() {
    return `
      <div class="scene-panel">
        <h2>Prophecy Fulfilled</h2>
        <p>
          The hidden truth emerges from the ice. What was once sealed away has answered your choices, your trust, and your understanding.
        </p>
        <div class="button-group">
          <button onclick="Game.handle('restart')">Restart</button>
          <button class="button-secondary" onclick="Game.handle('menu')">Main Menu</button>
        </div>
      </div>
    `;
  },

  async handle(state, action, game) {
    if (action === "restart") {
      game.reset(state.userId, state.personality || "curious");
      await game.setScene(Scenes.IcePalace);
      return;
    }

    if (action === "menu") {
      await game.setScene(Scenes.StartMenu);
    }
  }
};

(async function init() {
  await Game.load();
  await Game.setScene(Scenes.StartMenu);
})();