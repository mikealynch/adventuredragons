const InventorySystem = {
  async loadItems(state) {
    if (!state.playerId && !state.userId) {
      return [];
    }

    let query = SupabaseSystem.client
      .from("inventory")
      .select("item_name");

    query = state.playerId
      ? query.eq("player_id", state.playerId)
      : query.eq("user_id", state.userId);

    const { data: items } = await query;

    if (!items) {
      return [];
    }

    return [...new Set(items.map((item) => item.item_name))];
  },

  async addItem(state, item) {
    if (state.inventory.includes(item)) {
      return;
    }

    state.inventory.push(item);

    if (!state.userId) {
      return;
    }

    await SupabaseSystem.client.from("inventory").insert({
      player_id: state.playerId || null,
      user_id: state.userId,
      item_name: item,
    });

    state.inventory = await this.loadItems(state);
  },
};
