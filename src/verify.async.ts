export {};
(async () => {
  const {initIOC} = await import("./aptero/module/axolotis/AxInit");
  await initIOC();
  console.log("Start hub");
  await import("./verify.js");
  console.log("Start hub finished");
})();
