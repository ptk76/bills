export interface DelimiterTokens {
  name: string;
  quantity?: string;
  unit_price?: string;
  total_price?: string;
  success: boolean;
}
export function splitLineByLastTwo(
  line: string,
  delimiter: string = ",",
): DelimiterTokens {
  const parts = line.split(delimiter).filter(Boolean);

  if (parts.length === 0) {
    return {
      name: "",
      success: false,
    };
  }

  if (parts.length === 1) {
    return {
      name: parts[0],
      success: false,
    };
  }

  if (parts.length === 2) {
    return {
      name: parts[0],
      total_price: parts[parts.length - 1],
      success: false,
    };
  }

  if (parts.length === 3) {
    const quantity = parseFloat(parts[parts.length - 2]);
    const totalPrice = parseFloat(parts[parts.length - 1]);
    const unitPrice =
      !isNaN(quantity) && !isNaN(totalPrice) ? totalPrice / quantity : NaN;

    return {
      name: parts[0],
      quantity: parts[parts.length - 2],
      unit_price: unitPrice.toString(),
      total_price: parts[parts.length - 1],
      success: !isNaN(unitPrice),
    };
  }
  const name = parts.slice(0, -3).join(delimiter);

  return {
    name: name,
    quantity: parts[parts.length - 3],
    unit_price: parts[parts.length - 2],
    total_price: parts[parts.length - 1],
    success: true,
  };
}
