
declare const window;

export function virtualKeyboard(hbButtons,hyperbeamExit,hbProperties) {
  // Create a virtual input to activate the keyboard on focus
  const virtualInput = document.createElement("input");

  // Virtual input to activate the keyboard on focus
  virtualInput.type = "text";
  virtualInput.style.position = 'absolute';
  virtualInput.style.opacity = '0';
  virtualInput.style.pointerEvents = 'none';
  virtualInput.maxLength = 20;
  document.body.appendChild(virtualInput);
  
  // The button
  const hbPopupButton4 = document.createElement("button");
  hbPopupButton4.innerHTML = "Keyboard";
  hbButtons.appendChild(hbPopupButton4);


  document.addEventListener('input', function(event) {
    // Use a type assertion to tell TypeScript that event.target is an HTMLInputElement
    const input = event.target as HTMLInputElement;
  });


  // Event listener for virtual keyboard input
  let previousValue = '__________________';
  virtualInput.value = '__________________'; 
  virtualInput.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const currentValue = target.value;
    //console.log("currentValue",currentValue);

    if (currentValue.length < previousValue.length) {
        // Backspace was pressed
        sendKeyWithDelay('Backspace');
        //console.log("BACKSPACE")
    } else {
        // New character added, send the last character
        sendKeyWithDelay(currentValue.charAt(currentValue.length - 1));
    }

    // Update the previous value and clear the input
    previousValue = '__________________';
    target.value = '__________________';
    virtualInput.setSelectionRange(20, 20);
  });
  
  function sendKeyWithDelay(key) {
    // Send keydown event
    if (!window.hyperbeam_hb) {return;}
    window.hyperbeam_hb.sendEvent({
      type: 'keydown',
      key: key,
      ctrlKey: false,
      metaKey: false,
    });

    // Send keyup event after a short delay
    setTimeout(() => {
      window.hyperbeam_hb.sendEvent({
        type: 'keyup',
        key: key,
        ctrlKey: false,
        metaKey: false,
      });
      // Update the previous value and clear the input
      previousValue = '__________________'; 
      virtualInput.value = '__________________'; 
      virtualInput.setSelectionRange(20, 20);
    }, 100);
  }

  let isKeyboardActive = false; // State to track if keyboard is active

  // Event listener to toggle the focus on the virtual input when the button is clicked
  hbPopupButton4.addEventListener("click", () => {
      isKeyboardActive = !isKeyboardActive; // Toggle the state
      if (isKeyboardActive) {
          virtualInput.focus();
      } else {
          virtualInput.blur();
      }
  });
}
