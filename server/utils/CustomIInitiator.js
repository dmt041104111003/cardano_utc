class CustomInitiator {
    constructor(changeAddress, collateral = [], utxos = []) {
        this.changeAddress = changeAddress;
        this.collateral = collateral;
        this.utxos = utxos;
    }

    async getChangeAddress() {
        return this.changeAddress;
    }

    async getCollateral() {
        return this.collateral;
    }

    async getUtxos() {
        return this.utxos;
    }
}
export default CustomInitiator;