const SupabaseSystem = {
  npcCache: {},
  locationCache: {},

  client: supabase.createClient(
    "https://ifepchpqcfmqdodoqrdi.supabase.co",
    "sb_publishable_PR05YQL-5y_KSwzTnHLg7w_uXoWkwqE"
  ),

  async loadGameState(state) {
    const savedUser = localStorage.getItem("dragonUser");
    if (!savedUser) {
      return;
    }

    state.userId = savedUser;

    const savedPlayerId = localStorage.getItem("dragonPlayer");
    if (savedPlayerId) {
      await this.loadPlayerDataById(state, savedPlayerId);
      await this.loadLocations(state);
      return;
    }

    await this.loadLocations(state);
    state.currentScene = "UserCheckScene";
  },

  async savePlayer(state) {
    if (!state.playerId || !state.userId || !state.dragonName) {
      return;
    }

    await this.client.from("players").upsert({
      id: state.playerId || undefined,
      user_id: state.userId,
      dragon_name: state.dragonName,
      tribe: state.tribe,
      personality: state.personality,
      dragon_config: this.normalizeDragonConfig(state.dragonConfig),
      hunger: state.hunger,
      current_location: state.currentLocation,
      last_scene: state.currentScene,
      last_updated: new Date(),
      updated_at: new Date(),
    });
  },

  async loadPlayerData(state, userId) {
    state.debug = null;

    const { data, error } = await this.client
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      state.dragons = [];
      state.debug = {
        source: "loadPlayerData",
        message: error.message || "Unknown Supabase error",
        details: error.details || "",
        hint: error.hint || "",
        userId,
      };
      return [];
    }

    state.dragons = data || [];
    state.debug = {
      source: "loadPlayerData",
      userId,
      dragonCount: state.dragons.length,
    };
    return state.dragons;
  },

  async loadPlayerDataById(state, playerId) {
    state.debug = null;

    const { data: player, error } = await this.client
      .from("players")
      .select("*")
      .eq("id", playerId)
      .maybeSingle();

    if (error) {
      state.playerId = "";
      state.inventory = [];
      state.trust = {};
      state.debug = {
        source: "loadPlayerDataById",
        message: error.message || "Unknown Supabase error",
        details: error.details || "",
        hint: error.hint || "",
        playerId,
      };
      return null;
    }

    if (!player) {
      state.playerId = "";
      state.inventory = [];
      state.trust = {};
      state.debug = {
        source: "loadPlayerDataById",
        message: "No player row found for selected dragon.",
        playerId,
      };
      return null;
    }

    state.playerId = player.id || "";
    state.userId = player.user_id || state.userId || "";
    state.dragonName = player.dragon_name || "";
    state.tribe = player.tribe || "";
    state.personality = player.personality || "";
    state.hunger = typeof player.hunger === "number" ? player.hunger : 100;
    state.dragonConfig = this.normalizeDragonConfig(player.dragon_config);
    state.currentScene = player.last_scene || state.currentScene;
    state.currentLocation = player.current_location || state.currentLocation || "";

    await this.loadLocations(state);
    state.inventory = await InventorySystem.loadItems(state);
    state.trust = await RelationshipSystem.loadTrust(state);

    return player;
  },

  async loadPlayerCollections(state) {
    if (!state.playerId) {
      state.inventory = [];
      state.trust = {};
      return;
    }

    state.inventory = await InventorySystem.loadItems(state);
    state.trust = await RelationshipSystem.loadTrust(state);
  },

  async createPlayer(state, dragonName, tribe, personality) {
    state.debug = null;

    const { data: player, error } = await this.client
      .from("players")
      .insert({
        user_id: state.userId,
        dragon_name: dragonName,
        tribe,
        personality,
        dragon_config: this.normalizeDragonConfig(state.dragonConfig),
        hunger: 100,
        last_scene: "WorldMapScene",
        current_location: "World Map",
        last_updated: new Date(),
        updated_at: new Date(),
      })
      .select("*")
      .single();

    if (error) {
      state.debug = {
        source: "createPlayer",
        message: error.message || "Unknown Supabase error",
        details: error.details || "",
        hint: error.hint || "",
        userId: state.userId,
        dragonName,
        tribe,
      };
      return null;
    }

    if (player) {
      localStorage.setItem("dragonPlayer", player.id);
      await this.loadPlayerDataById(state, player.id);
    }

    return player || null;
  },

  async getLocations() {
    const { data: locations } = await this.client
      .from("locations")
      .select("*");

    return (locations || []).map((location) => this.normalizeLocation(location));
  },

  async loadLocations(state) {
    state.locations = await this.getLocations();
    return state.locations;
  },

  async getLocationById(id) {
    if (!id) {
      return null;
    }

    const cacheKey = `id:${id}`;
    if (Object.prototype.hasOwnProperty.call(this.locationCache, cacheKey)) {
      return this.locationCache[cacheKey];
    }

    const { data: location } = await this.client
      .from("locations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    this.locationCache[cacheKey] = this.normalizeLocation(location);
    return this.locationCache[cacheKey];
  },

  async getLocationByScene(sceneName) {
    if (!sceneName) {
      return null;
    }

    const cacheKey = `scene:${sceneName}`;
    if (Object.prototype.hasOwnProperty.call(this.locationCache, cacheKey)) {
      return this.locationCache[cacheKey];
    }

    const { data: location } = await this.client
      .from("locations")
      .select("*")
      .eq("scene", sceneName)
      .maybeSingle();

    this.locationCache[cacheKey] = this.normalizeLocation(location);
    return this.locationCache[cacheKey];
  },

  async getNPC(name) {
    if (this.npcCache[name]) {
      return this.npcCache[name];
    }

    const { data: npc } = await this.client
      .from("npcs")
      .select("name, description, image, kingdom")
      .eq("name", name)
      .maybeSingle();

    this.npcCache[name] = npc || null;
    return this.npcCache[name];
  },

  async loadNPCs(locationId) {
    if (!locationId) {
      return [];
    }

    const cacheKey = `location:${locationId}`;
    if (Object.prototype.hasOwnProperty.call(this.npcCache, cacheKey)) {
      return this.npcCache[cacheKey];
    }

    const { data, error } = await this.client
      .from("npcs")
      .select("*")
      .eq("location_id", locationId);

    if (error) {
      console.error("Error loading NPCs:", error);
      return [];
    }

    this.npcCache[cacheKey] = data || [];
    return this.npcCache[cacheKey];
  },

  async saveDragonBuilder(state, builderState) {
    if (!state.userId) {
      return null;
    }

    const config = this.normalizeDragonConfig(builderState && builderState.colors);
    const payload = {
      user_id: state.userId,
      dragon_name: builderState.name,
      tribe: builderState.tribe,
      personality: state.personality || "curious",
      dragon_config: config,
      hunger: typeof state.hunger === "number" ? state.hunger : 100,
      current_location: state.currentLocation || "World Map",
      last_scene: "WorldMapScene",
      last_updated: new Date(),
      updated_at: new Date(),
    };

    if (state.playerId) {
      payload.id = state.playerId;
    }

    const { data: player, error } = await this.client
      .from("players")
      .upsert(payload)
      .select("*")
      .single();

    if (error) {
      state.debug = {
        source: "saveDragonBuilder",
        message: error.message || "Unknown Supabase error",
        details: error.details || "",
        hint: error.hint || "",
        userId: state.userId,
      };
      return null;
    }

    state.debug = null;
    state.playerId = player.id || state.playerId || "";
    state.dragonName = player.dragon_name || builderState.name;
    state.tribe = player.tribe || builderState.tribe;
    state.personality = player.personality || state.personality || "curious";
    state.dragonConfig = this.normalizeDragonConfig(player.dragon_config);
    localStorage.setItem("dragonPlayer", state.playerId);
    return player;
  },

  normalizeLocation(location) {
    if (!location) {
      return null;
    }

    return {
      ...location,
      has_hunting: location.has_hunting ?? true,
    };
  },

  normalizeDragonConfig(config) {
    const colors = config && config.colors ? config.colors : config;
    return {
      colors: {
        body: colors && colors.body ? colors.body : "#8ed0ff",
        wings: colors && colors.wings ? colors.wings : "#5f8fd6",
        eyes: colors && colors.eyes ? colors.eyes : "#f7f4a3",
      },
    };
  },
};
