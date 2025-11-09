export function inferEventsToLog(oldState, newState) {
  let analyticsToLog = [];

  // If a new color was added, infer level completion
  if (oldState.colors.length < newState.colors.length) {
    analyticsToLog.push({
      eventName: "new_level",
      eventInfo: {
        level: oldState.colors.length,
      },
    });
  }

  // If colors reset to 1, infer new game
  if (newState.colors.length === 1 && oldState.colors.length !== 1) {
    analyticsToLog.push({eventName: "new_game"});
  }

  return analyticsToLog;
}
