export const round = (value: number, decimalPlaces: number) => {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(value * factorOfTen) / factorOfTen;
};