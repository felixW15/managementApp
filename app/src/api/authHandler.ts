// src/api/authHandler.ts
let onUnauthorizedCallback: () => void = () => {};

export function setGlobalOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

export function getGlobalOnUnauthorized(): () => void {
  return onUnauthorizedCallback;
}