export function bindCounter(button, output) {
  let value = 0;
  button.addEventListener("click", () => {
    value += 1;
    output.textContent = String(value);
  });
}
