import { LocalStorage } from "@raycast/api";
import { GameState, INITIAL_STATE } from "./types";

const GAME_STATE_KEY = "idle-clicker-state";

export async function loadGameState(): Promise<GameState> {
  try {
    const json = await LocalStorage.getItem(GAME_STATE_KEY);
    if (typeof json !== "string") return { ...INITIAL_STATE };

    const savedState = JSON.parse(json) as Partial<GameState>;
    const now = Date.now();

    // Ensure prestige upgrades object exists
    const prestige = {
      ...INITIAL_STATE.prestige,
      ...(savedState.prestige || {}),
      upgrades: {
        ...INITIAL_STATE.prestige.upgrades,
        ...(savedState.prestige?.upgrades || {}),
      },
    };

    // Ensure settings object exists
    const settings = {
      ...INITIAL_STATE.settings,
      ...(savedState.settings || {}),
    };

    return {
      ...INITIAL_STATE,
      ...savedState,
      prestige,
      settings,
      // Important: Do NOT accrue offline progress here; handled centrally in useGameState
      currency: savedState.currency || 0,
      lastUpdate: now,
    };
  } catch (error) {
    console.error("Error loading game state:", error);
    return { ...INITIAL_STATE };
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    const stateToSave = { ...state, lastUpdate: Date.now() };
    await LocalStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

export async function resetGameState(): Promise<GameState> {
  const newState = { ...INITIAL_STATE };
  await saveGameState(newState);
  return newState;
}
