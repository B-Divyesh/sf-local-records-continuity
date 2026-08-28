import "./style.css";

const networkStrip = document.querySelector<HTMLElement>("#network-strip");
const updateNetwork = (): void => { if (networkStrip) networkStrip.hidden = navigator.onLine; };
window.addEventListener("online", updateNetwork);
window.addEventListener("offline", updateNetwork);
updateNetwork();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => { void navigator.serviceWorker.register("/sw.js"); });
}
