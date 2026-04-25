import React from "react";
import style from "./Warning.module.css";

function Warning(): React.JSX.Element {
  return (
    <div className={style.container}>
      <div className={style.icon}>⚠</div>
    </div>
  );
}

export default Warning;
