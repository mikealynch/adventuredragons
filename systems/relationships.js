const RelationshipSystem = {
  async loadTrust(userId) {
    const { data: relationships } = await SupabaseSystem.client
      .from("relationships")
      .select("npc_name, trust")
      .eq("user_id", userId);

    if (!relationships) {
      return {};
    }

    return relationships.reduce((trustMap, relationship) => {
      trustMap[relationship.npc_name] = relationship.trust;
      return trustMap;
    }, {});
  },

  async updateTrust(state, npc, amount) {
    const current = state.trust[npc] || 0;
    state.trust[npc] = current + amount;

    if (!state.userId) {
      return;
    }

    await SupabaseSystem.client.from("relationships").upsert({
      user_id: state.userId,
      npc_name: npc,
      trust: state.trust[npc],
    });
  },
};