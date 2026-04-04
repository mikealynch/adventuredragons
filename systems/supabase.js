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

    await this.loadPlayerData(state, savedUser);
  },

  async savePlayer(state) {
    if (!state.userId) {
      return;
    }

    await this.client.from("players").upsert({
      user_id: state.userId,
      dragon_name: state.dragonName,
      personality: state.personality,
      last_scene: state.currentScene,
      updated_at: new Date().toISOString(),
    });
  },

  async loadPlayerData(state, userId) {
    state.userId = userId;

    const { data: player } = await this.client
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (player) {
      state.dragonName = player.dragon_name || state.dragonName || "";
      state.personality = player.personality || "";
      state.currentScene = player.last_scene || state.currentScene;
    }

    state.inventory = await InventorySystem.loadItems(userId);
    state.trust = await RelationshipSystem.loadTrust(userId);

    return player || null;
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
