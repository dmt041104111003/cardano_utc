/**
 * Custom initiator class for MeshSDK transactions
 */
class CustomInitiator {
    constructor(address, collateral, utxos) {
        this.address = address;
        this.collateral = collateral;
        this.utxos = utxos;
    }

    getUsedAddress() {
        return this.address;
    }

    getChangeAddress() {
        return this.address; // Use same address for change
    }

    getUtxos() {
        return this.utxos;
    }

    getCollateral() {
        return this.collateral;
    }

    // Required by MeshSDK
    getBalance() {
        if (!this.utxos || this.utxos.length === 0) return '0';
        return this.utxos.reduce((sum, utxo) => sum + (utxo.output.amount.lovelace || 0), 0).toString();
    }

    // Required by MeshSDK
    getNetwork() {
        return 0; // 0 for testnet, 1 for mainnet
    }
}

export default CustomInitiator;
