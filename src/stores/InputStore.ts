import { createSignal } from 'solid-js';

// Create a store
export const [input, setInput] = createSignal<undefined | string>();
