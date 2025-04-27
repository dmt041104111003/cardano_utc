const adaUsdRate = parseFloat(import.meta.env.VITE_ADA_USD_EXCHANGE_RATE);

export function convertUsdToAda(usdAmount) {
    if (!adaUsdRate) {
        throw new Error("Exchange rate not found");
    }
    return usdAmount / adaUsdRate;
}
