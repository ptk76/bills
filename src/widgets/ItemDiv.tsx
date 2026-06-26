import React from "react";
import style from "./ItemDiv.module.css";
import Warning from "./Warning";
import Currency from "./Currency";

function ItemDiv(props: {
  id: number;
  onClick: (id: number) => void;
  onButtonClick: (id: number) => void;
  buttonTitle: string;
  warning: boolean;
  title: string;
  subtitle: string;
  currency: string | null;
  amount: number;
}): React.JSX.Element {
  return (
    <div
      key={props.id}
      className={style.container}
      onClick={() => props.onClick(props.id)}
    >
      <div className={style.header}>
        {props.warning && <Warning />}
        <h3>{props.title}</h3>
        <div className={style.amount}>
          <Currency currency={props.currency} amount={props.amount} />
        </div>
      </div>
      <div className={style.info}>
        <div className={style.stats}>
          <span className={style.subtitle}>{props.subtitle}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onButtonClick(props.id);
          }}
          className={style.delete}
        >
          {props.buttonTitle}
        </button>
      </div>
    </div>
  );
}

export default ItemDiv;
