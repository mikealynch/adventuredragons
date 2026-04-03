const SupabaseSystem = {
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

    const { data: player } = await this.client
      .from("players")
      .select("*")
      .eq("user_id", savedUser)
      .maybeSingle();

    if (player) {
      state.personality = player.personality || "";
      state.currentScene = player.last_scene || state.currentScene;
    }

    state.inventory = await InventorySystem.loadItems(savedUser);
    state.trust = await RelationshipSystem.loadTrust(savedUser);
  },

  async savePlayer(state) {
    if (!state.userId) {
      return;
    }

    await this.client.from("players").upsert({
      user_id: state.userId,
      personality: state.personality,
      last_scene: state.currentScene,
      updated_at: new Date().toISOString(),
    });
  },
};