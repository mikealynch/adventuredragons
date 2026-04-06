(function () {
  const Scenes = window.Scenes = window.Scenes || {};

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  Scenes.DragonBuilder = {
    name: "DragonBuilder",
    background: "",

    async enter(state) {
      const baseConfig = SupabaseSystem.normalizeDragonConfig(state.dragonConfig);
      state.dragonBuilder = {
        name: state.dragonName || "",
        tribe: state.tribe || "IceWing",
        colors: {
          body: baseConfig.colors.body,
          wings: baseConfig.colors.wings,
          eyes: baseConfig.colors.eyes,
        },
      };
    },

    render(state) {
      const builder = state.dragonBuilder || {
        name: "",
        tribe: state.tribe || "IceWing",
        colors: SupabaseSystem.normalizeDragonConfig(state.dragonConfig).colors,
      };
      const tribe = builder.tribe || "IceWing";
      const tribeAccent = this.getTribeAccent(tribe);
      const dragonName = escapeHtml(builder.name || "Unnamed Dragon");

      return `
        <div class="scene-panel dragon-builder-shell">
          <div class="dragon-builder-copy">
            <h1>Dragon Builder</h1>
            <p>Shape your dragon's look, watch the preview react instantly, then save it to your adventure profile.</p>
          </div>

          <div class="dragon-builder-grid">
            <div class="dragon-builder-form">
              <label for="builderNameInput">Name</label>
              <input id="builderNameInput" value="${escapeHtml(builder.name)}" placeholder="Enter your dragon name" oninput="Game.updateDragonBuilderField('name', this.value)">

              <label for="builderTribeSelect">Tribe</label>
              <select id="builderTribeSelect" onchange="Game.updateDragonBuilderField('tribe', this.value)">
                ${this.renderTribeOptions(tribe)}
              </select>

              <label for="builderBodyColor">Body Color</label>
              <input id="builderBodyColor" type="color" value="${builder.colors.body}" oninput="Game.updateDragonBuilderColor('body', this.value)">

              <label for="builderWingColor">Wing Color</label>
              <input id="builderWingColor" type="color" value="${builder.colors.wings}" oninput="Game.updateDragonBuilderColor('wings', this.value)">

              <label for="builderEyeColor">Eye Color</label>
              <input id="builderEyeColor" type="color" value="${builder.colors.eyes}" oninput="Game.updateDragonBuilderColor('eyes', this.value)">

              <div class="scene-actions dragon-builder-actions">
                <button onclick="Game.handle('save_dragon_builder')">Save Dragon</button>
                <button onclick="Game.handle('return_from_builder')">Return</button>
              </div>
            </div>

            <div class="dragon-preview-card">
              <div class="dragon-preview-meta">
                <p class="dragon-preview-label">Live Preview</p>
                <h2 id="dragonPreviewName">${dragonName}</h2>
                <p id="dragonPreviewTribe">${escapeHtml(tribe)}</p>
              </div>
              <div class="dragon-preview" style="--tribe-accent:${tribeAccent};">
                ${this.renderPreviewSvg(builder, tribeAccent)}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    renderTribeOptions(selectedTribe) {
      const tribes = ["IceWing", "SkyWing", "SandWing", "SeaWing", "MudWing", "RainWing", "NightWing"];
      return tribes.map((tribe) => `
        <option value="${tribe}" ${tribe === selectedTribe ? "selected" : ""}>${tribe}</option>
      `).join("");
    },

    renderPreviewSvg(builder, tribeAccent) {
      const colors = builder.colors;
      return `
        <svg viewBox="0 0 420 280" class="dragon-preview-svg" role="img" aria-label="Dragon preview">
          <defs>
            <linearGradient id="builderSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#18365e"></stop>
              <stop offset="100%" stop-color="#0b1730"></stop>
            </linearGradient>
          </defs>
          <rect width="420" height="280" rx="24" fill="url(#builderSky)"></rect>
          <ellipse cx="210" cy="220" rx="116" ry="24" fill="rgba(4,8,18,.38)"></ellipse>
          <path id="dragonWingBack" d="M126 150 C84 90, 98 54, 176 70 C196 96, 200 134, 184 172 Z" fill="${colors.wings}" opacity="0.82"></path>
          <path id="dragonWingFront" d="M232 144 C282 88, 340 78, 356 126 C318 142, 282 168, 238 182 Z" fill="${colors.wings}"></path>
          <ellipse id="dragonBody" cx="202" cy="164" rx="86" ry="52" fill="${colors.body}"></ellipse>
          <path id="dragonNeck" d="M248 138 C274 118, 306 118, 324 140 C326 164, 308 178, 286 182 C266 176, 252 162, 248 138 Z" fill="${colors.body}"></path>
          <ellipse id="dragonHead" cx="323" cy="140" rx="34" ry="28" fill="${colors.body}"></ellipse>
          <path id="dragonTail" d="M116 166 C80 172, 60 188, 64 202 C92 202, 126 192, 144 176 Z" fill="${colors.body}"></path>
          <path id="dragonSpines" d="M136 120 L152 92 L170 120 L192 84 L208 122 L230 86 L250 122 L272 100 L294 132" fill="none" stroke="${tribeAccent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"></path>
          <path id="dragonHorn" d="M338 110 L352 80 L330 102" fill="none" stroke="${tribeAccent}" stroke-width="8" stroke-linecap="round"></path>
          <circle id="dragonEye" cx="334" cy="138" r="7" fill="${colors.eyes}"></circle>
          <circle cx="336" cy="138" r="2.5" fill="#08101d"></circle>
          <path d="M316 150 C324 156, 334 156, 342 150" fill="none" stroke="#08101d" stroke-width="3" stroke-linecap="round"></path>
          <path d="M162 200 L148 236" stroke="#08101d" stroke-width="8" stroke-linecap="round"></path>
          <path d="M228 202 L214 238" stroke="#08101d" stroke-width="8" stroke-linecap="round"></path>
          <path d="M270 196 L260 234" stroke="#08101d" stroke-width="8" stroke-linecap="round"></path>
        </svg>
      `;
    },

    getTribeAccent(tribe) {
      const accents = {
        IceWing: "#dff6ff",
        SkyWing: "#ffb36b",
        SandWing: "#e7cf77",
        SeaWing: "#5de0d1",
        MudWing: "#9d7344",
        RainWing: "#79ef88",
        NightWing: "#9d8dff",
      };
      return accents[tribe] || accents.IceWing;
    },

    async handle(state, action, game) {
      if (action === "return_from_builder") {
        if (state.playerId) {
          await game.setScene(Scenes.WorldMapScene);
          return;
        }

        await game.setScene(Scenes.DragonSelectScene);
        return;
      }

      if (action !== "save_dragon_builder") {
        return;
      }

      const builder = state.dragonBuilder || {};
      const dragonName = String(builder.name || "").trim();
      if (!dragonName) {
        game.showMessage("Choose a dragon name before saving.");
        return;
      }

      if (!builder.tribe) {
        game.showMessage("Choose a tribe before saving.");
        return;
      }

      const player = await SupabaseSystem.saveDragonBuilder(state, {
        name: dragonName,
        tribe: builder.tribe,
        colors: builder.colors,
      });

      if (!player) {
        game.showMessage("Your dragon could not be saved right now.");
        game.render();
        return;
      }

      game.showToast("Dragon saved.");
      await game.setScene(Scenes.WorldMapScene);
    },
  };
})();
