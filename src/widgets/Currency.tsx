import React from "react";
import style from "./Currency.module.css";

export const regionToCurrency = {
  US: "USD",
  GB: "GBP",
  EU: "EUR",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  PL: "PLN",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  BR: "BRL",
  MX: "MXN",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  NZ: "NZD",
  ZA: "ZAR",
  RU: "RUB",
  // add more as needed
};
type RegionType = keyof typeof regionToCurrency;

function getAmountWithCurrency(amount: number, currency: string | null) {
  try {
    if (currency)
      return amount.toLocaleString(navigator.language, {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
  } catch (e) {}

  return (
    amount.toLocaleString(navigator.language, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }) +
    " " +
    (currency === null ? "" : currency)
  );

  // // Use a region-to-currency map as the source of truth
  // const region = new Intl.Locale(navigator.language).maximize().region;
  // const regionCurrency =
  //   region && region in regionToCurrency
  //     ? regionToCurrency[region as RegionType]
  //     : regionToCurrency.EU;

  // const tmp = new Intl.NumberFormat(navigator.language, {
  //   style: "currency",
  //   currency: regionCurrency,
  // });
  // return tmp.format(amount);
}

function Currency(props: {
  currency: string | null;
  amount: number;
}): React.JSX.Element {
  return <>{getAmountWithCurrency(props.amount, props.currency)}</>;
}

export function CurrencyDropdown(props: {
  currency: string | null;
  onChange: (currency: string | null) => void;
}): React.JSX.Element {
  const getRegionCurrency = () => {
    // Use a region-to-currency map as the source of truth
    const region = new Intl.Locale(navigator.language).maximize().region;
    const regionCurrency =
      region && region in regionToCurrency
        ? regionToCurrency[region as RegionType]
        : null;
    return regionCurrency;
  };
  const getDefault = () => {
    const savedCurrency = localStorage.getItem("default_currency");
    if (!savedCurrency) return getRegionCurrency();
    return savedCurrency;
  };
  const setDefault = (currency: string | null) => {
    if (typeof currency === "string")
      localStorage.setItem("default_currency", currency);
  };
  const buildOptions = () => {
    const result = [];
    const currency = props.currency ? props.currency : getDefault();
    const currencies = Array.from(new Set(Object.values(regionToCurrency)));
    for (const curr of currencies) {
      result.push(
        <option key={curr} value={curr} selected={currency === curr}>
          {curr}
        </option>,
      );
    }
    return result;
  };
  return (
    <select
      onChange={(e) => {
        const value = e.target.value;
        const newCurrency = value === "null" ? null : value;
        setDefault(newCurrency);
        props.onChange(newCurrency);
      }}
      className={style.option}
    >
      <option value="null">None</option>
      {buildOptions()}
    </select>
  );
}

export default Currency;
