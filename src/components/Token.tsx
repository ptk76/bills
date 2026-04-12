import React from "react";
import styles from "./Token.module.css";
import { useAppContext } from "../context/AppContext";

function Token(): React.JSX.Element {
  const { token } = useAppContext();
  return <div className={styles.container}>{token}</div>;
}

export default Token;
