import { STORAGE_CONFIG } from "@/config/storage.config";
import type { AuthCredential } from "@/types/auth";
import { getLocalStorageData, setLocalStorageData } from "./utils";

/**
 * Get stored auth information from local storage
 */
const getAuth = (): AuthCredential | undefined => {
  try {
    const auth = getLocalStorageData(STORAGE_CONFIG.authLocalStorageKey) as
      | AuthCredential
      | undefined;
    return auth;
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};

/**
 * Save auth information to local storage
 */
const setAuth = (auth: AuthCredential) => {
  setLocalStorageData(STORAGE_CONFIG.authLocalStorageKey, auth);
};

/**
 * Remove auth information from local storage
 */
const removeAuth = () => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_CONFIG.authLocalStorageKey);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
  }
};

export { getAuth, removeAuth, setAuth };
