import "./style.css";

const networkStrip = document.querySelector<HTMLElement>("#network-strip");
const updateNetwork = (online = navigator.onLine): void => {
  if (networkStrip) networkStrip.hidden = online;
  if (online) sessionStorage.removeItem("continuity-offline");
  else sessionStorage.setItem("continuity-offline", "true");
};
window.addEventListener("online", () => updateNetwork(true));
window.addEventListener("offline", () => updateNetwork(false));
updateNetwork(navigator.onLine && sessionStorage.getItem("continuity-offline") !== "true");

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => { void navigator.serviceWorker.register("/sw.js"); });
}
