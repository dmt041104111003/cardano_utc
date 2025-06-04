
class CustomInitiator {
    constructor(address, collateral = [], utxos = []) {
        this.address = address;
        this.changeAddress = address; 
        this.collateral = collateral;
        this.utxos = utxos;
    }

    getUsedAddress() {
        return this.address;
    }

    getChangeAddress() {
        return this.address; 
    }

    async getChangeAddressAsync() {
        return this.changeAddress;
    }

    getUtxos() {
        return this.utxos;
    }

    async getUtxosAsync() {
        return this.utxos;
    }

    getCollateral() {
        return this.collateral;
    }

    async getCollateralAsync() {
        return this.collateral;
    }

    getBalance() {
        if (!this.utxos || this.utxos.length === 0) return '0';
        return this.utxos.reduce((sum, utxo) => sum + (utxo.output.amount.lovelace || 0), 0).toString();
    }

    getNetwork() {
        return 0; 
    }
}

export default CustomInitiator;
