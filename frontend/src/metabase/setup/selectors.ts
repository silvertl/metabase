import { DatabaseData } from "metabase-types/api";
import { InviteInfo, Locale, State, UserInfo } from "metabase-types/store";
import { getSetting } from "metabase/selectors/settings";
import { COMPLETED_STEP } from "./constants";

export const getStep = (state: State): number => {
  return state.setup.step;
};

export const getLocale = (state: State): Locale | undefined => {
  return state.setup.locale;
};

export const getUser = (state: State): UserInfo | undefined => {
  return state.setup.user;
};

export const getUserEmail = (state: State): string | undefined => {
  return getUser(state)?.email;
};

export const getDatabase = (state: State): DatabaseData | undefined => {
  return state.setup.database;
};

export const getInvite = (state: State): InviteInfo | undefined => {
  return state.setup.invite;
};

export const getIsLocaleLoaded = (state: State): boolean => {
  return state.setup.isLocaleLoaded;
};

export const getIsTrackingAllowed = (state: State): boolean => {
  return state.setup.isTrackingAllowed;
};

export const getIsStepActive = (state: State, step: number): boolean => {
  return getStep(state) === step;
};

export const getIsStepCompleted = (state: State, step: number): boolean => {
  return getStep(state) > step;
};

export const getIsSetupCompleted = (state: State): boolean => {
  return getStep(state) === COMPLETED_STEP;
};

export const getDatabaseEngine = (state: State): string | undefined => {
  return getDatabase(state)?.engine || state.setup.databaseEngine;
};

export const getIsHosted = (state: State): boolean => {
  return getSetting(state, "is-hosted?");
};
