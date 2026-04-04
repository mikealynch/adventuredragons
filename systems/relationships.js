const RelationshipSystem = {
  async loadTrust(state) {
    if (!state.playerId && !state.userId) {
      return {};
    }

    let query = SupabaseSystem.client
      .from("relationships")
      .select("npc_name, trust");

    query = state.playerId
      ? query.eq("player_id", state.playerId)
      : query.eq("user_id", state.userId);

    const { data: relationships } = await query;

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
      player_id: state.playerId || null,
      user_id: state.userId,
      npc_name: npc,
      trust: state.trust[npc],
    });
  },
};
