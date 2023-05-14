import { Component } from "solid-js";
import { Flag, FlagProps, FlagStatus } from "./Flag";
import { setInput2 } from "../../stores/InputStore";

type ImageHashFlagProps = {
  grid?: boolean;
  label: string;
  value?: string;
  status?: FlagStatus;
}

export const ImageHashFlag: Component<ImageHashFlagProps> = (props) => {
  const text = '[->]'

  const onClick = (prop: FlagProps) => {
    setInput2(prop.value ?? '')
  }

  return <Flag {...props} link={{ text, onClick }} />
}
