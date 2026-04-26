const TOKEN_KEY = "agro_token";
const USER_KEY  = "agro_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();
export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
};
export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Чистим историю агронома, чтобы следующий пользователь на этом устройстве её не увидел
  localStorage.removeItem("agro_history");
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith("agro_history_")) localStorage.removeItem(k);
  }
}
export const authFetch = (url, opts = {}) =>
  fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers, Authorization: `Bearer ${getToken()}` },
  });
