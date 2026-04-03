const QuestSystem = {
  startQuest(state, questId) {
    state.quests = state.quests || {};
    const currentQuest = state.quests[questId] || {};

    state.quests[questId] = {
      ...currentQuest,
      started: true,
      completed: currentQuest.completed || false,
    };
  },

  completeQuest(state, questId) {
    state.quests = state.quests || {};
    const currentQuest = state.quests[questId] || {};

    state.quests[questId] = {
      ...currentQuest,
      started: true,
      completed: true,
    };
  },

  getQuestState(state, questId) {
    state.quests = state.quests || {};
    return state.quests[questId] || {
      started: false,
      completed: false,
    };
  },
};
