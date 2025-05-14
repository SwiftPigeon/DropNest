export function storeTokens({ accessToken, remember }) {
  if (remember) {
    localStorage.setItem("accessToken", accessToken);
  } else {
    sessionStorage.setItem("accessToken", accessToken);
  }
}
