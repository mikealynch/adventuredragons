const InventorySystem = {
  async loadItems(userId) {
    const { data: items } = await SupabaseSystem.client
      .from("inventory")
      .select("item_name")
      .eq("user_id", userId);

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
      user_id: state.userId,
      item_name: item,
    });

    state.inventory = await this.loadItems(state.userId);
  },
};
