import { commons, v2 } from "@0xsequence/core";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  IconButton,
} from "@suid/material";
import { walletContracts } from "@0xsequence/abi";
import {
  Component,
  Show,
  createSignal,
  For,
  Setter,
  createEffect,
} from "solid-js";
import { Flag } from "./commons/Flag";
import { backgroundDistinctFrom } from "../utils";
import { nameGenerator } from "../deviceNames";
import { setInput2 } from "../stores/InputStore";
import { ethers } from "ethers";
import { NETWORKS } from "../stores/NetworksStore";
import { ArrowDropDown, ArrowRight, DeleteOutline } from "@suid/icons-material";

export const SignatureRecover: Component<{
  signature:
    | v2.signature.UnrecoveredSignature
    | v2.signature.UnrecoveredChainedSignature;
  suffixSig: boolean;
  setRecovered: Setter<
    v2.signature.Signature | v2.signature.ChainedSignature | undefined
  >;
  setErrorRecover: Setter<string>;
}> = (props) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const [chain, setChain] = createSignal(0);
  const [transactions, setTransactions] = createSignal<
    commons.transaction.Transaction[]
  >([
    {
      to: "",
      value: "",
      data: "",
      revertOnError: true,
      delegateCall: false,
      gasLimit: "",
    },
  ]);
  const [digest, setDigest] = createSignal("");
  const [nonce, setNonce] = createSignal("");
  const [subdigest, setSubdigest] = createSignal("");
  const [address, setAddress] = createSignal("");
  const [recovering, setRecovering] = createSignal(false);
  const [open, setOpen] = createSignal(false);

  const mainModuleInterface = new ethers.utils.Interface(
    walletContracts.mainModule.abi
  );

  createEffect(() => {
    try {
      if (nonce() && transactions().length !== 0) {
        setDigest(
          commons.transaction.digestOfTransactions(nonce(), transactions())
        );
      }
    } catch {}
  });

  createEffect(() => {
    try {
      if (digest() && address()) {
        setSubdigest(
          commons.signature.subdigestOf({
            chainId: chain(),
            address: address(),
            digest: digest(),
          })
        );
        recover()
      }
    } catch {}
  });

  createEffect(() => {
    if (!props.suffixSig) {
      const calldata = urlParams.get("calldata");
      const chain = urlParams.get("chain");
      const wallet = urlParams.get("wallet");

      if (calldata) {
        try {
          const parsedTx = mainModuleInterface.parseTransaction({
            data: calldata,
          });
          const [txs, nonce] = parsedTx.args;
          const sequenceTxs = txs.map(
            (
              tx: commons.transaction.TransactionEncoded
            ): commons.transaction.Transaction => {
              return {
                to: tx.target,
                revertOnError: tx.revertOnError,
                delegateCall: tx.delegateCall,
                value: tx.value,
                data: tx.data,
                gasLimit: tx.gasLimit,
              };
            }
          );
          setTransactions(sequenceTxs);
          setNonce(nonce);
        } catch {}
      }

      if (
        chain &&
        typeof Number(chain) === "number" &&
        props.signature.type !== v2.signature.SignatureType.NoChainIdDynamic
      ) {
        setChain(Number(chain));
      }

      if (wallet && ethers.utils.isAddress(wallet)) {
        setAddress(wallet);
      }
    }
  });

  const handleTransactionChange = <
    K extends keyof commons.transaction.Transaction
  >(
    index: number,
    field: K,
    value: commons.transaction.Transaction[K]
  ) => {
    setTransactions((prevTxs) => {
      const newTxs = [...prevTxs];
      newTxs[index][field] = value;
      return newTxs;
    });
  };

  const handleDeleteTx = (index: number) => {
    setTransactions((prevTxs) => prevTxs.filter((_, i) => i !== index));
  };

  const handleAddTx = () => {
    setTransactions((prevTxs) =>
      prevTxs.concat({
        to: "",
        value: "",
        data: "",
        revertOnError: true,
        delegateCall: false,
        gasLimit: "",
      })
    );
  };

  const reset = () => {
    setAddress("");
    setTransactions([
      {
        to: "",
        value: "",
        data: "",
        revertOnError: true,
        delegateCall: false,
        gasLimit: "",
      },
    ]);
    setChain(0);
    setDigest("");
    setSubdigest("");
    setNonce("");
    props.setErrorRecover("")
    props.setRecovered(undefined)
  };

  const recover = async () => {
    if (!subdigest()) return;
    props.setErrorRecover("");
    setRecovering(true);
    props.setRecovered(undefined);
    try {
      if (
        v2.signature.isUnrecoveredChainedSignature(props.signature) &&
        !digest() &&
        !address()
      ) {
        throw new Error(
          "Chained signature recovery requires detailed signed payload, subdigest is not enough"
        );
      }
      let payload:
        | commons.signature.SignedPayload
        | {
            subdigest: string;
          } = v2.signature.isUnrecoveredChainedSignature(props.signature)
        ? {
            chainId: ethers.BigNumber.from(chain()),
            digest: digest(),
            address: address(),
          }
        : { subdigest: subdigest() };
      const recovered = await v2.signature.recoverSignature(
        props.signature,
        payload,
        new ethers.providers.JsonRpcProvider(
          NETWORKS.find((n) => n.chainId === chain())?.rpcUrl
        )
      );
      props.setRecovered(recovered);
      setRecovering(false);
    } catch (error) {
      props.setErrorRecover(String(error));
      setRecovering(false);
    }
  };

  return (
    <Box
      textAlign="left"
      sx={{
        "& .MuiTextField-root": { width: "100%" },
        "& .MuiFormControl-root": { width: "100%" },
        maxWidth: "565px",
      }}
    >
      <IconButton aria-label="delete" onClick={() => setOpen(!open())}>
        {open() ? <ArrowDropDown /> : <ArrowRight />}
      </IconButton>
      <Typography component="span" sx={{ fontSize: 16, fontWeight: "bold" }}>
        Recover Signature
      </Typography>
      <Show when={open()}>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{ marginBottom: "20px" }}>
            <Grid container spacing={2}>
              <For each={transactions()}>
                {(tx, index) => (
                  <>
                    <Grid item xs={12}>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
                            Transaction {index()}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDeleteTx(index())}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(index(), "to", e.target.value)
                        }
                        value={transactions()[index()].to}
                        label="To"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(
                            index(),
                            "value",
                            e.target.value
                          )
                        }
                        value={transactions()[index()].value}
                        label="Value (wei)"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(
                            index(),
                            "gasLimit",
                            e.target.value
                          )
                        }
                        value={transactions()[index()].gasLimit}
                        label="GasLimit"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(
                            index(),
                            "data",
                            e.target.value
                          )
                        }
                        value={transactions()[index()].data}
                        label="Data"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>DelegateCall</InputLabel>
                        <Select
                          label="Dropdown"
                          onChange={(e) =>
                            handleTransactionChange(
                              index(),
                              "delegateCall",
                              e.target.value === "true" ? true : false
                            )
                          }
                          value={
                            transactions()[index()].delegateCall
                              ? "true"
                              : "false"
                          }
                        >
                          <MenuItem value="true">True</MenuItem>
                          <MenuItem value="false">False</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>RevertOnError</InputLabel>
                        <Select
                          label="Dropdown"
                          onChange={(e) =>
                            handleTransactionChange(
                              index(),
                              "revertOnError",
                              e.target.value === "true" ? true : false
                            )
                          }
                          value={
                            transactions()[index()].revertOnError
                              ? "true"
                              : "false"
                          }
                        >
                          <MenuItem value="true">True</MenuItem>
                          <MenuItem value="false">False</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </For>
            </Grid>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <TextField
              onChange={(e) => setNonce(e.target.value)}
              value={nonce()}
              label="Nonce"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Button onClick={handleAddTx}>Add Transaction</Button>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: "20px" }}>
            <TextField
              onChange={(e) => setDigest(e.target.value)}
              value={digest()}
              label="Digest"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Chain</InputLabel>
              <Select
                disabled={
                  props.signature.type ===
                  v2.signature.SignatureType.NoChainIdDynamic
                }
                label="Dropdown"
                onChange={(e) => setChain(e.target.value)}
                value={chain()}
              >
                <MenuItem value={0}>no chain</MenuItem>
                <For each={NETWORKS}>
                  {(n) => <MenuItem value={n.chainId}>{n.name}</MenuItem>}
                </For>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <TextField
              onChange={(e) => setAddress(e.target.value)}
              value={address()}
              label="Wallet address"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              onChange={(e) => setSubdigest(e.target.value)}
              value={subdigest()}
              label="Subdigest"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} textAlign="left">
            <Button disabled={recovering() || !subdigest()} onClick={recover}>
              Recover
            </Button>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Button onClick={reset}>Reset</Button>
          </Grid>
        </Grid>
      </Show>
    </Box>
  );
};

export const V2SignatureView: Component<{
  signature:
    | v2.signature.UnrecoveredSignature
    | v2.signature.UnrecoveredChainedSignature;
  recovered?: v2.signature.Signature | v2.signature.ChainedSignature;
  suffixSig: boolean
}> = (props) => {
  const [recovered, setRecovered] = createSignal<
    v2.signature.Signature | v2.signature.ChainedSignature | undefined
  >();
  const [errorRecover, setErrorRecover] = createSignal("");
  const sigType = () => {
    switch (props.signature.type) {
      case v2.signature.SignatureType.Chained:
        return "Chained";
      case v2.signature.SignatureType.Legacy:
        return "Legacy";
      case v2.signature.SignatureType.NoChainIdDynamic:
        return "No ChainId";
      case v2.signature.SignatureType.Dynamic:
        return "Dynamic";
      default:
        return "Unknown";
    }
  };

  const onlyTopSig = {
    type: props.signature.type,
    version: props.signature.version,
    decoded: props.signature.decoded,
  };

  const getRecoveredSignature = (
    recovered: any,
    signature: v2.signature.UnrecoveredSignature
  ): v2.signature.Signature | null => {
    if (!recovered) {
      return null;
    }
    if (recovered.suffix) {
      for (const suffixSignature of recovered.suffix) {
        if (getRecoveredSignature(suffixSignature, signature))
          return suffixSignature;
      }
    }
    if (
      v2.signature.encodeSignature(recovered) ===
      v2.signature.encodeSignature(signature)
    ) {
      return recovered;
    }
    return null;
  };

  return (
    <>
      <Grid container spacing={2} sx={{ marginBottom: "40px" }}>
        <Flag grid label="Version" value={props.signature.version.toString()} />
        <Flag grid label="Type" value={sigType()} />
        <Grid item width="100%" sx={{ marginTop: "20px" }}>
          <SignatureRecover
            signature={props.signature}
            suffixSig={props.suffixSig}
            setRecovered={setRecovered}
            setErrorRecover={setErrorRecover}
          />
        </Grid>
        <Grid item width="100%">
          <Typography pb="1rem" pt="1rem" textAlign="left">
            Decoded / Recovered
          </Typography>
          <Show when={recovered() || props.recovered}>
            {(recovered() || props.recovered) && (
              <RecoveredSigView
                signature={getRecoveredSignature(
                  recovered() || props.recovered,
                  onlyTopSig
                )}
              />
            )}
          </Show>
          <Show when={errorRecover() && !(recovered() || props.recovered)}>
            <Box textAlign="left" sx={{ marginBottom: "20px" }}>
              <Typography color="error">{errorRecover()}</Typography>
            </Box>
          </Show>
          <Paper>
            <Box alignContent="left" textAlign="left">
              <V2UnrecoveredSignatureView
                node={
                  getRecoveredSignature(
                    recovered() || props.recovered,
                    onlyTopSig
                  )?.config.tree || props.signature.decoded.tree
                }
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {v2.signature.isUnrecoveredChainedSignature(props.signature) && (
        <>
          {props.signature.suffix.map((suffixSig) => (
            <V2SignatureView suffixSig={true} recovered={recovered()} signature={suffixSig} />
          ))}
        </>
      )}
    </>
  );
};

export const RecoveredSigView: Component<{
  signature: v2.signature.Signature | null;
}> = (props) => {
  const imageHash = props.signature
    ? v2.config.imageHash(props.signature.config)
    : undefined;
  return (
    <Show when={imageHash}>
      <Box textAlign="left" sx={{ marginBottom: "20px" }}>
        <Typography component="span" sx={{ fontSize: 14 }}>
          Image Hash: {imageHash}
        </Typography>
        <Typography variant="code" ml="0.5rem">
          <a href="#" onClick={() => setInput2(imageHash)}>
            {"[->]"}
          </a>
        </Typography>
      </Box>
    </Show>
  );
};

export const V2UnrecoveredSignatureView: Component<{
  node: v2.signature.UnrecoveredTopology | v2.config.Topology;
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
    if (v2.signature.isUnrecoveredNode(props.node)) {
      try {
        v2.config.hashNode(props.node as any);
        return { label: "Node", color: "gray" };
      } catch {}
      return { label: "Unrecovered node", color: "gray" };
    }

    if (v2.signature.isUnrecoveredSignatureLeaf(props.node)) {
      return { label: "Unrecovered signature", color: "blue" };
    }

    if (v2.config.isSignerLeaf(props.node)) {
      return { label: "Signer witness", color: "green" };
    }

    if (v2.config.isNodeLeaf(props.node)) {
      return { label: "Node witness", color: "orange" };
    }

    if (v2.config.isSubdigestLeaf(props.node)) {
      return { label: "Subdigest leaf", color: "purple" };
    }

    if (v2.config.isNestedLeaf(props.node)) {
      return { label: "Nested leaf", color: "pink" };
    }

    return { label: "Unknown", color: "red" };
  };

  const nodeHash = () => {
    if (v2.config.isLeaf(props.node)) {
      return v2.config.hashNode(props.node);
    }

    try {
      return v2.config.hashNode(props.node as any);
    } catch {}

    return "Node hash not available";
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
          {nodeHash()}
        </Typography>
      </Box>
      <Show when={open()}>
        <Show
          when={v2.config.isNestedLeaf(props.node) ? props.node : undefined}
          keyed
        >
          {(node) => (
            <Box pl="1rem">
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Thershold
              </Typography>
              <Typography variant="code">
                {node.threshold.toString()}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Weight
              </Typography>
              <Typography variant="code">{node.weight.toString()}</Typography>
              <V2UnrecoveredSignatureView
                node={node.tree}
                background={backgroundChild1()}
              />
            </Box>
          )}
        </Show>
        <Show
          when={v2.config.isNode(props.node) ? props.node : undefined}
          keyed
        >
          {(node) => (
            <Box pl="1rem">
              <V2UnrecoveredSignatureView
                node={node.left}
                background={backgroundChild1()}
              />
              <Box pt="0.5rem">
                <V2UnrecoveredSignatureView
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
              <Show when={sleaf.signature} keyed>
                {(sig) => <V2SubSignatureView signature={sig} />}
              </Show>
            </Box>
          )}
        </Show>
        <Show
          when={
            v2.signature.isUnrecoveredSignatureLeaf(props.node) &&
            !v2.config.isSignerLeaf(props.node)
              ? props.node
              : undefined
          }
          keyed
        >
          {(sleaf) => (
            <Box marginLeft="1.5rem">
              <V2SubSignatureView signature={sleaf.signature} />
            </Box>
          )}
        </Show>
      </Show>
    </Box>
  );
};

export const V2SubSignatureView: Component<{ signature: string }> = (props) => {
  // Last byte is the signature type
  const sigType = () => {
    const arr = ethers.utils.arrayify(props.signature);
    const type = arr[arr.length - 1];

    switch (type) {
      /*
        uint256 private constant SIG_TYPE_EIP712 = 1;
        uint256 private constant SIG_TYPE_ETH_SIGN = 2;
        uint256 private constant SIG_TYPE_WALLET_BYTES32 = 3;
      */
      case 1:
        return "EIP712";
      case 2:
        return "ETH_SIGN";
      case 3:
        return "EIP1271";
    }

    return "Unknown";
  };

  const showLink = () => {
    return sigType() === "EIP1271";
  };

  const signature = () => {
    const arr = ethers.utils.arrayify(props.signature);
    return ethers.utils.hexlify(arr.slice(0, arr.length - 1));
  };

  return (
    <>
      <Typography sx={{ fontSize: 14 }} color="text.secondary">
        Type
      </Typography>
      <Typography variant="code">{sigType()}</Typography>
      <Typography sx={{ fontSize: 14 }} color="text.secondary">
        Signature
      </Typography>
      <Typography variant="code">{signature()}</Typography>
      <Show when={showLink()}>
        <Typography variant="code" ml="0.5rem">
          <a href="#" onClick={() => setInput2(signature())}>
            {"[->]"}
          </a>
        </Typography>
      </Show>
    </>
  );
};
