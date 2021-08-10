export async function wait(validator) {
  return new Promise((resolve) => {
    if (validator()) {
      resolve();
    } else {
      setTimeout(async () => {
        if (!validator()) {
          await wait(validator);
          resolve();
        }
      }, 200);
    }
  });
}