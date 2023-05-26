export {};

(async () => {
  const {initIOC} = await import("./aptero/module/axolotis/AxInit");
  await initIOC();
  console.log("Start hub");
  await import("./index.js");
  console.log("Start hub finished");
})();
