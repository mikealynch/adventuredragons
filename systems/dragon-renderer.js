(function () {
  const DEFAULT_LAYER_ORDER = ["body", "wings", "head", "horns", "pattern"];
  const DEFAULT_PARTS = {
    body: "body1",
    wings: "wings1",
    head: "head1",
    horns: "horns1",
    pattern: "pattern1",
  };
  const DEFAULT_COLORS = {
    primary: "#6ec1ff",
    secondary: "#2a4fff",
    eyes: "#f2e8a0",
  };
  const DEFAULT_OPTIONS = {
    imageRoot: "images/dragons",
    partFolders: {
      body: "body",
      wings: "wings",
      head: "head",
      horns: "horns",
      pattern: "pattern",
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeConfig(config) {
    const safeConfig = config || {};
    const safeParts = Object.assign({}, DEFAULT_PARTS, safeConfig.parts || {});
    const safeColors = Object.assign({}, DEFAULT_COLORS, safeConfig.colors || {});

    return {
      name: safeConfig.name || "Unnamed Dragon",
      tribe: safeConfig.tribe || "Unknown Tribe",
      parts: safeParts,
      colors: safeColors,
    };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toKebabCase(value) {
    return String(value || "")
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }

  function resolvePartFolder(partName, options) {
    const folderMap = options && options.partFolders ? options.partFolders : {};
    const folder = folderMap[partName] || DEFAULT_OPTIONS.partFolders[partName] || partName;

    if (partName === "body" && folder === "body") {
      return ["body", "base"];
    }

    return [folder];
  }

  function buildLayerPath(partName, variantName, options) {
    const imageRoot = (options && options.imageRoot) || DEFAULT_OPTIONS.imageRoot;
    const folders = resolvePartFolder(partName, options);
    return folders.map((folder) => `${imageRoot}/${folder}/${variantName}.png`);
  }

  function applyLayerColor(layerElement, partName, colors) {
    const tint = layerElement.querySelector(".dragon-layer-tint");
    if (!tint) {
      return;
    }

    const colorMap = {
      body: colors.primary,
      wings: colors.secondary,
      head: colors.primary,
      horns: colors.secondary,
      pattern: colors.eyes,
    };

    tint.style.background = colorMap[partName] || colors.primary;
  }

  function createLayer(partName, variantName, colors, index, options) {
    const layer = document.createElement("div");
    layer.className = `dragon-layer dragon-layer-${partName}`;
    layer.style.zIndex = String(index + 1);
    layer.dataset.part = partName;

    const img = document.createElement("img");
    img.className = "dragon-part";
    img.alt = `${partName} layer`;
    img.loading = "lazy";
    img.decoding = "async";

    const sources = buildLayerPath(partName, variantName, options);
    let sourceIndex = 0;
    img.src = sources[sourceIndex];

    img.onerror = function handleLayerError() {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        img.src = sources[sourceIndex];
        return;
      }

      layer.remove();
    };

    const tint = document.createElement("div");
    tint.className = "dragon-layer-tint";

    layer.appendChild(img);
    layer.appendChild(tint);

    img.onload = function handleLayerLoad() {
      tint.style.webkitMaskImage = `url("${img.currentSrc || img.src}")`;
      tint.style.maskImage = `url("${img.currentSrc || img.src}")`;
      applyLayerColor(layer, partName, colors);
      layer.classList.add("is-ready");
    };

    return layer;
  }

  function createShadow() {
    const shadow = document.createElement("div");
    shadow.className = "dragon-shadow";
    return shadow;
  }

  function createMeta(config) {
    const meta = document.createElement("div");
    meta.className = "dragon-meta";
    meta.innerHTML = `
      <div class="dragon-name">${escapeHtml(config.name)}</div>
      <div class="dragon-tribe">${escapeHtml(config.tribe)}</div>
    `;
    return meta;
  }

  function createWrapper(config) {
    const wrapper = document.createElement("div");
    wrapper.className = "dragon dragon-fade-in";
    wrapper.style.setProperty("--dragon-primary", config.colors.primary);
    wrapper.style.setProperty("--dragon-secondary", config.colors.secondary);
    wrapper.style.setProperty("--dragon-eyes", config.colors.eyes);
    return wrapper;
  }

  function clearContainer(containerElement) {
    if (!containerElement) {
      return;
    }

    containerElement.innerHTML = "";
  }

  function renderDragon(config, containerElement, options) {
    if (!containerElement) {
      throw new Error("renderDragon requires a container element.");
    }

    const normalizedConfig = normalizeConfig(config);
    const mergedOptions = Object.assign({}, clone(DEFAULT_OPTIONS), options || {});

    clearContainer(containerElement);

    const wrapper = createWrapper(normalizedConfig);
    wrapper.appendChild(createShadow());

    DEFAULT_LAYER_ORDER.forEach(function renderLayer(partName, index) {
      const variantName = normalizedConfig.parts[partName];
      if (!variantName) {
        return;
      }

      const layer = createLayer(partName, variantName, normalizedConfig.colors, index, mergedOptions);
      wrapper.appendChild(layer);
    });

    wrapper.appendChild(createMeta(normalizedConfig));
    containerElement.appendChild(wrapper);

    containerElement._dragonConfig = clone(normalizedConfig);
    containerElement._dragonOptions = clone(mergedOptions);
    containerElement._dragonWrapper = wrapper;

    return wrapper;
  }

  function updateDragon(config, containerElement, options) {
    const baseConfig = containerElement && containerElement._dragonConfig
      ? clone(containerElement._dragonConfig)
      : {};
    const nextConfig = Object.assign({}, baseConfig, config || {});

    nextConfig.parts = Object.assign({}, baseConfig.parts || {}, config && config.parts ? config.parts : {});
    nextConfig.colors = Object.assign({}, baseConfig.colors || {}, config && config.colors ? config.colors : {});

    const nextOptions = Object.assign(
      {},
      containerElement && containerElement._dragonOptions ? containerElement._dragonOptions : {},
      options || {}
    );

    return renderDragon(nextConfig, containerElement, nextOptions);
  }

  window.renderDragon = renderDragon;
  window.updateDragon = updateDragon;
  window.DragonRenderer = {
    renderDragon: renderDragon,
    updateDragon: updateDragon,
    normalizeConfig: normalizeConfig,
    layerOrder: DEFAULT_LAYER_ORDER.slice(),
    toKebabCase: toKebabCase,
  };
})();
