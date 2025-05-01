"use client";

import { Blockfrost, Constr, Data, Lucid, fromText } from "lucid-cardano";
import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";
import SmartcontextContext from "~/contexts/components/SmartcontractContext";
import { AppliedValidators, applyParams } from "~/utils/apply-params";
import readValidators from "~/utils/read-validators";

type Props = {
    children: ReactNode;
};

const SmartcontextProvider = function ({ children }: Props) {
    const [lucid, setLucid] = useState<Lucid | null>(null);
    const [tokenName, setTokenName] = useState<string>("");
    const [parameterizedContracts, setParameterizedContracts] =
        useState<AppliedValidators | null>(null);
    const [giftADA, setGiftADA] = useState<string | undefined>();
    const [lockTxHash, setLockTxHash] = useState<string | undefined>(undefined);
    const [waitingLockTx, setWaitingLockTx] = useState<boolean>(false);
    const [unlockTxHash, setUnlockTxHash] = useState<string | undefined>(
        undefined
    );
    const [waitingUnlockTx, setWaitingUnlockTx] = useState<boolean>(false);

    const connectWallet = async function () {
        try {
            console.log("Attempting to connect wallet...");
            
            // Use the Blockfrost API for Cardano Preprod network
            const blockfrostUrl = "https://cardano-preprod.blockfrost.io/api/v0";
            const blockfrostApiKey = "preprodySibyhnmiGCMXo6u0zvHbwYAOqWYOJD6";
            
            console.log("Initializing Lucid with Blockfrost...");
            const lucid = await Lucid.new(
                new Blockfrost(
                    blockfrostUrl,
                    blockfrostApiKey
                ),
                "Preprod"
            );

            console.log("Checking if Eternl wallet is installed...");
            if (typeof window === 'undefined' || !window.cardano || !window.cardano.eternl) {
                alert("Eternl wallet not found. Please install Eternl wallet extension.");
                console.error("Eternl wallet not found");
                return;
            }

            console.log("Enabling Eternl wallet...");
            try {
                const wallet = await window.cardano.eternl.enable();
                console.log("Eternl wallet enabled successfully");
                lucid.selectWallet(wallet);
                setLucid(lucid);
                console.log("Wallet connected successfully");
            } catch (walletError) {
                console.error("Error enabling Eternl wallet:", walletError);
                alert("Failed to enable Eternl wallet. Please make sure it's properly set up.");
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            alert("Failed to connect wallet: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    // No need for the useEffect since we're handling wallet selection directly in connectWallet

    const submitTokenName = async () => {
        try {
            console.log("Submitting token name:", tokenName);
            
            // Get wallet UTXOs
            console.log("Getting wallet UTXOs...");
            const utxos = await lucid?.wallet.getUtxos();
            
            if (!utxos || utxos.length === 0) {
                throw new Error("No UTXOs found in wallet. Please make sure your wallet has ADA.");
            }
            console.log("Found", utxos.length, "UTXOs in wallet");

            // Read validators
            console.log("Reading validators...");
            const validators = readValidators();
            console.log("Validators loaded successfully");
            
            // Use the first UTXO
            const utxo = utxos[0];
            console.log("Using UTXO:", utxo.txHash, "index", utxo.outputIndex);
            
            const outputReference = {
                txHash: utxo.txHash,
                outputIndex: utxo.outputIndex,
            };

            // Apply parameters to create contracts
            console.log("Applying parameters to contracts...");
            const contracts = applyParams(
                tokenName,
                outputReference,
                validators,
                lucid!
            );
            console.log("Contracts created successfully");

            setParameterizedContracts(contracts);
        } catch (error) {
            console.error("Error submitting token name:", error);
            alert("Failed to create contracts: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const createGiftCard = async () => {
        setWaitingLockTx(true);

        try {
            console.log("Creating gift card...");
            
            if (!giftADA || isNaN(Number(giftADA)) || Number(giftADA) <= 0) {
                throw new Error("Please enter a valid amount of ADA to lock");
            }
            
            // Calculate lovelace amount (1 ADA = 1,000,000 lovelace)
            const lovelace = Number(giftADA) * 1000000;
            console.log("Locking", lovelace, "lovelace");
            
            // Create asset name by combining policy ID and token name
            const assetName = `${parameterizedContracts!.policyId}${fromText(tokenName)}`;
            console.log("Asset name:", assetName);
            
            // Create mint redeemer
            console.log("Creating mint redeemer...");
            const mintRedeemer = Data.to(new Constr(0, []));
            
            // Get wallet UTXOs
            console.log("Getting wallet UTXOs...");
            const utxos = await lucid?.wallet.getUtxos();
            
            if (!utxos || utxos.length === 0) {
                throw new Error("No UTXOs found in wallet. Please make sure your wallet has ADA.");
            }
            console.log("Found", utxos.length, "UTXOs in wallet");
            
            // Use the first UTXO
            const utxo = utxos[0];
            console.log("Using UTXO:", utxo.txHash, "index", utxo.outputIndex);

            // Build transaction
            console.log("Building transaction...");
            const tx = await lucid!
                .newTx()
                .collectFrom([utxo])
                .attachMintingPolicy(parameterizedContracts!.giftCard)
                .mintAssets({ [assetName]: BigInt(1) }, mintRedeemer)
                .payToContract(
                    parameterizedContracts!.lockAddress,
                    { inline: Data.void() },
                    { lovelace: BigInt(lovelace) }
                )
                .complete();

            // Sign transaction
            console.log("Signing transaction...");
            const txSigned = await tx.sign().complete();

            // Submit transaction
            console.log("Submitting transaction...");
            const txHash = await txSigned.submit();
            console.log("Transaction submitted with hash:", txHash);

            // Wait for confirmation
            console.log("Waiting for transaction confirmation...");
            const success = await lucid!.awaitTx(txHash);
            console.log("Transaction confirmed:", success);
            
            setTimeout(() => {
                setWaitingLockTx(false);
                if (success) {
                    setLockTxHash(txHash);
                    console.log("Gift card created successfully");
                }
            }, 3000);
        } catch (error) {
            console.error("Error creating gift card:", error);
            alert("Failed to create gift card: " + (error instanceof Error ? error.message : String(error)));
            setWaitingLockTx(false);
        }
    };

    const redeemGiftCard = async () => {
        setWaitingUnlockTx(true);
        try {
            console.log("Redeeming gift card...");
            
            // Find UTXOs at the contract address
            console.log("Finding UTXOs at contract address:", parameterizedContracts!.lockAddress);
            const utxos = await lucid!.utxosAt(parameterizedContracts!.lockAddress);
            
            if (!utxos || utxos.length === 0) {
                throw new Error("No UTXOs found at contract address. Nothing to redeem.");
            }
            console.log("Found", utxos.length, "UTXOs at contract address");

            // Create asset name by combining policy ID and token name
            const assetName = `${parameterizedContracts!.policyId}${fromText(tokenName)}`;
            console.log("Asset name for burning:", assetName);
            
            // Create burn redeemer
            console.log("Creating burn redeemer...");
            const burnRedeemer = Data.to(new Constr(1, []));

            // Build transaction
            console.log("Building redemption transaction...");
            const tx = await lucid!
                .newTx()
                .collectFrom(utxos, Data.void())
                .attachMintingPolicy(parameterizedContracts!.giftCard)
                .attachSpendingValidator(parameterizedContracts!.redeem)
                .mintAssets({ [assetName]: BigInt(-1) }, burnRedeemer)
                .complete();

            // Sign transaction
            console.log("Signing transaction...");
            const txSigned = await tx.sign().complete();
            
            // Submit transaction
            console.log("Submitting transaction...");
            const txHash = await txSigned.submit();
            console.log("Transaction submitted with hash:", txHash);
            
            // Wait for confirmation
            console.log("Waiting for transaction confirmation...");
            const success = await lucid!.awaitTx(txHash);
            console.log("Transaction confirmed:", success);
            
            setWaitingUnlockTx(false);
            if (success) {
                setUnlockTxHash(txHash);
                console.log("Gift card redeemed successfully");
            }
        } catch (error) {
            console.error("Error redeeming gift card:", error);
            alert("Failed to redeem gift card: " + (error instanceof Error ? error.message : String(error)));
            setWaitingUnlockTx(false);
        }
    };
    return (
        <SmartcontextContext.Provider
            value={{
                waitingUnlockTx,
                lockTxHash,
                unlockTxHash,
                waitingLockTx,
                giftADA,
                setGiftADA,
                tokenName,
                setTokenName,
                redeemGiftCard,
                createGiftCard,
                lucid,
                submitTokenName,
                parameterizedContracts,
                connectWallet,
            }}
        >
            {children}
        </SmartcontextContext.Provider>
    );
};

export default SmartcontextProvider;
