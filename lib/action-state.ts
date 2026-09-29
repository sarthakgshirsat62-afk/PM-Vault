export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Arbitrary data an action can hand back to its form (e.g. duplicates). */
  data?: Record<string, unknown>;
};

export const INITIAL_ACTION_STATE: ActionState = { ok: false };

export function actionError(message: string, errors?: Record<string, string>, data?: Record<string, unknown>): ActionState {
  return { ok: false, message, errors, data };
}

export function actionOk(message: string, data?: Record<string, unknown>): ActionState {
  return { ok: true, message, data };
}
