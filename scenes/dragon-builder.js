(function () {
  const Scenes = window.Scenes = window.Scenes || {};
  const DEFAULT_DRAGON_CONFIG = {
    name: "",
    tribe: "SkyWing",
    parts: {
      body: "body1",
      wings: "wings1",
      horns: "horns1",
      pattern: "pattern1",
    },
    colors: {
      body: "#6ec1ff",
      wings: "#2a4fff",
      eyes: "#ffffff",
    },
  };
  const dragonConfig = window.dragonConfig = window.dragonConfig || JSON.parse(JSON.stringify(DEFAULT_DRAGON_CONFIG));

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config));
  }

  function mergeDragonConfig(config) {
    const incoming = config || {};
    return {
      name: incoming.name || DEFAULT_DRAGON_CONFIG.name,
      tribe: incoming.tribe || DEFAULT_DRAGON_CONFIG.tribe,
      parts: {
        body: incoming.parts && incoming.parts.body ? incoming.parts.body : DEFAULT_DRAGON_CONFIG.parts.body,
        wings: incoming.parts && incoming.parts.wings ? incoming.parts.wings : DEFAULT_DRAGON_CONFIG.parts.wings,
        horns: incoming.parts && incoming.parts.horns ? incoming.parts.horns : DEFAULT_DRAGON_CONFIG.parts.horns,
        pattern: incoming.parts && incoming.parts.pattern ? incoming.parts.pattern : DEFAULT_DRAGON_CONFIG.parts.pattern,
      },
      colors: {
        body: incoming.colors && incoming.colors.body ? incoming.colors.body : DEFAULT_DRAGON_CONFIG.colors.body,
        wings: incoming.colors && incoming.colors.wings ? incoming.colors.wings : DEFAULT_DRAGON_CONFIG.colors.wings,
        eyes: incoming.colors && incoming.colors.eyes ? incoming.colors.eyes : DEFAULT_DRAGON_CONFIG.colors.eyes,
      },
    };
  }

  function hexToRgb(hex) {
    const clean = String(hex || "").replace("#", "").trim();
    const full = clean.length === 3
      ? clean.split("").map((char) => char + char).join("")
      : clean;
    const value = parseInt(full || "000000", 16);

    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  }

  function hexToHue(hex) {
    const rgb = hexToRgb(hex);
    const red = rgb.r / 255;
    const green = rgb.g / 255;
    const blue = rgb.b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;

    if (!delta) {
      return 0;
    }

    let hue = 0;

    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    const degrees = Math.round(hue * 60);
    return degrees < 0 ? degrees + 360 : degrees;
  }

  function buildTintFilter(hex, layerName) {
    const hue = hexToHue(hex);
    const saturation = layerName === "wings" ? 1.55 : 1.35;
    const brightness = layerName === "wings" ? 0.92 : 1.04;
    return `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`;
  }

  function getLayerSources(layerName, partValue) {
    const value = partValue || DEFAULT_DRAGON_CONFIG.parts[layerName];
    const sources = [];

    if (layerName === "body") {
      sources.push(`images/dragons/body/${value}.png`);
      sources.push(`images/dragons/base/${value}.png`);
      if (value === "body1") {
        sources.push("images/dragons/body/base1.png");
        sources.push("images/dragons/base/base1.png");
      }
      if (value === "body2") {
        sources.push("images/dragons/body/base2.png");
        sources.push("images/dragons/base/base2.png");
      }
    }

    if (layerName === "wings") {
      sources.push(`images/dragons/wings/${value}.png`);
    }

    if (layerName === "horns") {
      sources.push(`images/dragons/horns/${value}.png`);
    }

    if (layerName === "pattern") {
      sources.push(`images/dragons/patterns/${value}.png`);
      sources.push(`images/dragons/pattern/${value}.png`);
    }

    return sources.filter((entry, index, list) => list.indexOf(entry) === index);
  }

  function createLayer(layerName, partValue, filterValue) {
    const image = document.createElement("img");
    const sources = getLayerSources(layerName, partValue);
    let sourceIndex = 0;

    image.className = `dragon-layer dragon-layer-${layerName}`;
    image.alt = `${layerName} layer`;
    image.decoding = "async";
    image.loading = "lazy";

    if (filterValue) {
      image.style.filter = filterValue;
    }

    image.onerror = function handleImageError() {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        image.src = sources[sourceIndex];
        return;
      }

      image.style.display = "none";
    };

    if (sources.length > 0) {
      image.src = sources[0];
    }

    return image;
  }

  function renderDragon(config) {
    const preview = document.getElementById("dragon-preview");
    if (!preview) {
      return;
    }

    const merged = mergeDragonConfig(config);
    preview.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "dragon dragon-fade";

    const shadow = document.createElement("div");
    shadow.className = "dragon-shadow";
    wrapper.appendChild(shadow);

    wrapper.appendChild(createLayer("body", merged.parts.body, buildTintFilter(merged.colors.body, "body")));
    wrapper.appendChild(createLayer("wings", merged.parts.wings, buildTintFilter(merged.colors.wings, "wings")));
    wrapper.appendChild(createLayer("horns", merged.parts.horns, ""));
    wrapper.appendChild(createLayer("pattern", merged.parts.pattern, ""));

    preview.appendChild(wrapper);
  }

  window.hexToHue = hexToHue;
  window.renderDragon = renderDragon;

  Scenes.DragonBuilder = {
    name: "DragonBuilder",
    background: "",

    async enter(state) {
      const savedConfig = mergeDragonConfig(state.dragonConfig);
      const nextConfig = mergeDragonConfig({
        name: state.dragonName || savedConfig.name,
        tribe: state.tribe || savedConfig.tribe,
        parts: savedConfig.parts,
        colors: savedConfig.colors,
      });

      dragonConfig.name = nextConfig.name;
      dragonConfig.tribe = nextConfig.tribe;
      dragonConfig.parts = cloneConfig(nextConfig.parts);
      dragonConfig.colors = cloneConfig(nextConfig.colors);
      state.dragonBuilder = dragonConfig;
    },

    render(state) {
      const builder = mergeDragonConfig(state.dragonBuilder);

      return `
        <div class="scene-panel dragon-builder-shell">
          <div class="dragon-builder-copy">
            <h1>Dragon Builder</h1>
            <p>Shape your dragon's look and watch the preview update instantly.</p>
          </div>

          <div class="dragon-builder-grid">
            <div class="dragon-builder-form">
              <label for="dragonName">Name</label>
              <input id="dragonName" value="${escapeHtml(builder.name)}" placeholder="Enter your dragon name" oninput="Game.updateDragonBuilderField('name', this.value)">

              <label for="tribeSelect">Tribe</label>
              <select id="tribeSelect" onchange="Game.updateDragonBuilderField('tribe', this.value)">
                ${this.renderTribeOptions(builder.tribe)}
              </select>

              <label for="bodyColor">Body Color</label>
              <input id="bodyColor" type="color" value="${builder.colors.body}" oninput="Game.updateDragonBuilderColor('body', this.value)">

              <label for="bodyAsset">Body Style</label>
              <select id="bodyAsset" onchange="Game.updateDragonBuilderPart('body', this.value)">
                ${this.renderPartOptions(["body1", "body2"], builder.parts.body)}
              </select>

              <label for="wingColor">Wing Color</label>
              <input id="wingColor" type="color" value="${builder.colors.wings}" oninput="Game.updateDragonBuilderColor('wings', this.value)">

              <label for="eyeColor">Eye Color</label>
              <input id="eyeColor" type="color" value="${builder.colors.eyes}" oninput="Game.updateDragonBuilderColor('eyes', this.value)">

              <label for="patternAsset">Pattern Style</label>
              <select id="patternAsset" onchange="Game.updateDragonBuilderPart('pattern', this.value)">
                ${this.renderPartOptions(["pattern1", "pattern2"], builder.parts.pattern)}
              </select>

              <div class="scene-actions dragon-builder-actions">
                <button onclick="Game.handle('save_dragon_builder')">Save Dragon</button>
                <button onclick="Game.handle('return_from_builder')">Return</button>
              </div>
            </div>

            <div class="dragon-preview-card">
              <div class="dragon-preview-meta">
                <p class="dragon-preview-label">Live Preview</p>
                <h2 id="dragonPreviewName">${escapeHtml(builder.name || "Unnamed Dragon")}</h2>
                <p id="dragonPreviewTribe">${escapeHtml(builder.tribe)}</p>
              </div>
              <div class="dragon-preview">
                <div id="dragon-preview"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    afterRender(state) {
      const builder = mergeDragonConfig(state.dragonBuilder);
      const previewName = document.getElementById("dragonPreviewName");
      const previewTribe = document.getElementById("dragonPreviewTribe");

      if (previewName) {
        previewName.textContent = builder.name || "Unnamed Dragon";
      }

      if (previewTribe) {
        previewTribe.textContent = builder.tribe;
      }

      renderDragon(builder);
    },

    renderTribeOptions(selectedTribe) {
      const tribes = ["IceWing", "SkyWing", "SandWing", "SeaWing", "MudWing", "RainWing", "NightWing"];
      return tribes.map((tribe) => `
        <option value="${tribe}" ${tribe === selectedTribe ? "selected" : ""}>${tribe}</option>
      `).join("");
    },

    renderPartOptions(options, selectedValue) {
      return options.map((option) => `
        <option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>
      `).join("");
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

      const builder = mergeDragonConfig(state.dragonBuilder);
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
        parts: builder.parts,
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
