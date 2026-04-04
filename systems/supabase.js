const SupabaseSystem = {
  npcCache: {},

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
      return;
    }

    state.currentScene = "UserCheckScene";
  },

  async savePlayer(state) {
    if (!state.userId || !state.dragonName) {
      return;
    }

    await this.client.from("players").upsert({
      id: state.playerId || undefined,
      user_id: state.userId,
      dragon_name: state.dragonName,
      personality: state.personality,
      current_location: state.currentLocation,
      last_scene: state.currentScene,
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
    state.personality = player.personality || "";
    state.currentScene = player.last_scene || state.currentScene;
    state.currentLocation = player.current_location || state.currentLocation || "";

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

  async createPlayer(state, dragonName, personality) {
    state.debug = null;

    const { data: player, error } = await this.client
      .from("players")
      .insert({
        user_id: state.userId,
        dragon_name: dragonName,
        personality,
        last_scene: "WorldMapScene",
        current_location: "World Map",
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

    return locations || [];
  },

  async getNPC(name) {
    if (this.npcCache[name]) {
      return this.npcCache[name];
    }

    const { data: npc } = await this.client
      .from("npcs")
      .select("name, description, image")
      .eq("name", name)
      .maybeSingle();

    this.npcCache[name] = npc || null;
    return this.npcCache[name];
  },
};
