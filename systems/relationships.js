const RelationshipSystem = {
  async loadTrust(state) {
    if (!state.playerId) {
      return {};
    }

    const { data: relationships } = await SupabaseSystem.client
      .from("relationships")
      .select("npc_name, trust")
      .eq("player_id", state.playerId);

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

    if (!state.playerId) {
      return;
    }

    await SupabaseSystem.client.from("relationships").upsert({
      player_id: state.playerId,
      npc_name: npc,
      trust: state.trust[npc],
    });
  },
};
