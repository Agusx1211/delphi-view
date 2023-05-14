import { createContext, createEffect, createSignal } from "solid-js";

// Utility function to create a store synchronized with a URL parameter
export function createUrlSyncedStore(paramName: string) {
  // Create a store
  const [_value, _setValue] = createSignal<undefined | string>();

  // Function to update value and URL
  function setValue(value: string) {
    // Update the application state
    _setValue(value);

    // Update the URL
    const url = new URL(window.location.href);
    url.searchParams.set(paramName, value);
    window.history.pushState({}, '', url);
  }

  // Load the value from the URL when the page loads
  const urlParams = new URLSearchParams(window.location.search);
  const initialValue = urlParams.get(paramName);
  if (initialValue !== null) {
    _setValue(initialValue);
  }

  // Listen for back/forward navigation
  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newValue = urlParams.get(paramName);
    if (newValue !== null) {
      _setValue(newValue);
    } else {
      _setValue('');
    }
  });

  // Return the value signal and the setter function
  return [_value, setValue] as [typeof _value, typeof _setValue];
}

// Example usage:
const [input, setInput] = createUrlSyncedStore('input');
const [input2, setInput2] = createUrlSyncedStore('input2');

createEffect(() => {
  if (input() && input2() && input() === input2()) {
    setInput2('')
  }
})

export type Side = 1 | 2

export const SideContext = createContext<Side>();

export { input, setInput, input2, setInput2 }

export function inputFor(side?: Side) {
  return side === 1 ? input : input2
}

export function setInputFor(side?: Side) {
  return side === 1 ? setInput : setInput2
}

export function otherInput(side?: Side) {
  return side === 1 ? input2 : input
}

export function setOtherInput(side?: Side) {
  return side === 1 ? setInput2 : setInput
}
