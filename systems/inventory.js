const InventorySystem = {
  async loadItems(state) {
    if (!state.playerId) {
      return [];
    }

    const { data: items } = await SupabaseSystem.client
      .from("inventory")
      .select("item_name")
      .eq("player_id", state.playerId);

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

    if (!state.playerId) {
      return;
    }

    await SupabaseSystem.client.from("inventory").insert({
      player_id: state.playerId,
      item_name: item,
      quantity: 1,
    });

    state.inventory = await this.loadItems(state);
  },
};
