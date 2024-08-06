import { Component, For, Show, createSignal } from "solid-js";
import { commons, universal, v1, v2 } from "@0xsequence/core";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@suid/material";
import { Flag, FlagStatus } from "./commons/Flag";
import { nameGenerator } from "../deviceNames";
import { backgroundDistinctFrom } from "../utils";

export function mayBeImageHash(value: string): boolean {
  try {
    // 0x74e2070bd4d00c904ccaf6028ff89edebae5327fb6dbde77c9a1319f2d29b972
    return value.startsWith("0x") && value.length === 66;
  } catch {}
  return false;
}

export const ConfigView: Component<{
  config: commons.config.Config;
}> = (props) => {
  const imageHash = v2.config.isWalletConfig(props.config)
    ? v2.config.imageHash(props.config)
    : v1.config.ConfigCoder.imageHashOf(props.config as v1.config.WalletConfig);

  const signersOf = () => {
    const res = universal
      .genericCoderFor(props.config.version)
      .config.signersOf(props.config);
    return res.map((s) => ({ ...s, name: nameGenerator(s.address, 2) }));
  };

  return (
    <>
      <h2>Imagehash</h2>
      <Grid container spacing={2}>
        <Flag grid label="Image Hash" value={imageHash} />
        <Flag grid label="Version" value={props.config.version.toString()} />
        <Flag grid label="Signers" value={signersOf().length.toString()} />
        <Grid item width="100%">
          <Paper>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Address</TableCell>
                  <TableCell align="right">Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <For each={signersOf()}>
                  {(s) => (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {s.name}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="code">{s.address}</Typography>
                      </TableCell>
                      <TableCell align="right">{s.weight.toString()}</TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
      <Show when={v2.config.isWalletConfig(props.config)}>
        <ConfigViewV2
          config={props.config as v2.config.WalletConfig}
          imageHash={imageHash}
        />
      </Show>
      <Show when={v1.config.ConfigCoder.isWalletConfig(props.config)}>
        <ConfigViewV1
          config={props.config as v1.config.WalletConfig}
          imageHash={imageHash}
        />
      </Show>
    </>
  );
};

export const ConfigViewV2: Component<{
  config: v2.config.WalletConfig;
  imageHash: string;
}> = (props) => {
  const isComplete = () => {
    const res = v2.config.ConfigCoder.isComplete(props.config);
    return {
      value: res ? "Yes" : "No",
      status: res ? "green" : ("red" as FlagStatus),
    };
  };
  return (
    <>
      <h3>Wallet config v2</h3>
      <Grid container spacing={2}>
        <Flag
          grid
          label="Threshold"
          value={props.config.threshold.toString()}
        />
        <Flag
          grid
          label="Checkpoint"
          value={props.config.checkpoint.toString()}
        />
        <Flag grid label="Complete" {...isComplete()} />
        <Grid item width="100%">
          <Paper>
            <Box alignContent="left" textAlign="left">
              <ConfigV2NodeView node={props.config.tree} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export const ConfigV2NodeView: Component<{
  node: v2.config.Topology;
  background?: number;
}> = (props) => {
  const [open, setOpen] = createSignal(true);
  const back = () => props.background ?? 255;

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    setOpen(!open());
  };

  const backgroundChild1 = () => backgroundDistinctFrom(back(), 1);
  const backgroundChild2 = () =>
    backgroundDistinctFrom(back(), 2, backgroundChild1());

  const label = () => {
    if (v2.config.isNode(props.node)) {
      return { label: "Node", color: "gray" };
    }

    if (v2.config.isSignerLeaf(props.node)) {
      return { label: "Signer", color: "green" };
    }

    if (v2.config.isNestedLeaf(props.node)) {
      return { label: "Nested", color: "purple" };
    }

    if (v2.config.isSubdigestLeaf(props.node)) {
      return { label: "Subdigest", color: "blue" };
    }

    return { label: "Unknown", color: "red" };
  };

  return (
    <Box
      sx={{ borderRadius: "0.25rem" }}
      backgroundColor={`rgb(${back()}, ${back()}, ${back()})`}
      p="0.5rem"
    >
      <Typography
        sx={{ fontSize: 12, fontWeight: "bold" }}
        color={label().color}
      >
        {label().label}
      </Typography>
      <Box ml="0.15rem" mb="0.25rem" mr="0.15rem" mt="0.05rem">
        <a href="#" onClick={handleClick}>
          {open() ? "-" : "+"}
        </a>
        <Typography marginLeft="0.5rem" variant="code">
          {v2.config.hashNode(props.node)}
        </Typography>
      </Box>
      <Show when={open()}>
        <Show
          when={v2.config.isNode(props.node) ? props.node : undefined}
          keyed
        >
          {(node) => (
            <Box pl="1rem">
              <ConfigV2NodeView
                node={node.left}
                background={backgroundChild1()}
              />
              <Box pt="0.5rem">
                <ConfigV2NodeView
                  node={node.right}
                  background={backgroundChild2()}
                />
              </Box>
            </Box>
          )}
        </Show>
        <Show
          when={v2.config.isSignerLeaf(props.node) ? props.node : undefined}
          keyed
        >
          {(sleaf) => (
            <Box marginLeft="1.5rem">
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Name
              </Typography>
              <Typography variant="code">
                {nameGenerator(sleaf.address, 2)}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Weight
              </Typography>
              <Typography variant="code">{sleaf.weight.toString()}</Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Address
              </Typography>
              <Typography variant="code">{sleaf.address}</Typography>
            </Box>
          )}
        </Show>
        <Show
          when={v2.config.isNestedLeaf(props.node) ? props.node : undefined}
          keyed
        >
          {(sleaf) => (
            <Box marginLeft="1.5rem">
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Thershold
              </Typography>
              <Typography variant="code">
                {sleaf.threshold.toString()}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Weight
              </Typography>
              <Typography variant="code">{sleaf.weight.toString()}</Typography>
              <Box pt="0.5rem">
                <ConfigV2NodeView
                  node={sleaf.tree}
                  background={backgroundChild2()}
                />
              </Box>
            </Box>
          )}
        </Show>
        <Show
          when={v2.config.isSubdigestLeaf(props.node) ? props.node : undefined}
          keyed
        >
          {(sleaf) => (
            <Box marginLeft="1.5rem">
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Subdigest
              </Typography>
              <Typography variant="code">{sleaf.subdigest}</Typography>
            </Box>
          )}
        </Show>
      </Show>
    </Box>
  );
};

export const ConfigViewV1: Component<{
  config: v1.config.WalletConfig;
  imageHash: string;
}> = (props) => {
  return (
    <Grid container spacing={2} mt="1rem">
      <Flag grid label="Threshold" value={props.config.threshold.toString()} />
    </Grid>
  );
};