import React from "react";
import { useAppContext } from "../context/AppContext";
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
  console.log("getAmountWithCurrency:", amount, currency, navigator.language);
  try {
    if (currency)
      return amount.toLocaleString(navigator.language, {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
  } catch (e) {}

  if (currency && currency !== "") {
    console.log("UNKNOWN currency");
    return (
      amount.toLocaleString("pl-PL", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) +
      " " +
      currency
    );
  }

  // Use a region-to-currency map as the source of truth
  const region = new Intl.Locale(navigator.language).maximize().region;
  const regionCurrency =
    region && region in regionToCurrency
      ? regionToCurrency[region as RegionType]
      : regionToCurrency.EU;

  const tmp = new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: regionCurrency,
  });
  return tmp.format(amount);
}

function Currency(props: {
  currency: string | null;
  amount: number;
}): React.JSX.Element {
  return <>{getAmountWithCurrency(props.amount, props.currency)}</>;
}

export function CurrencyDropdown(props: {
  currency: string | null;
  onChange: (currency: string) => void;
}): React.JSX.Element {
  const buildOptions = () => {
    const result = [];
    for (const region in regionToCurrency) {
      console.log(region);
      result.push(
        <option
          key={region}
          value={regionToCurrency[region as RegionType]}
          selected={props.currency === regionToCurrency[region as RegionType]}
        >
          {regionToCurrency[region as RegionType]}
        </option>,
      );
    }
    return result;
  };

  return (
    <select
      id="from-friend"
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
      className={style.option}
    >
      <option value="null">None</option>
      {buildOptions()}
    </select>
  );
}

export default Currency;
