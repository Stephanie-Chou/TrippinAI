import { ReactElement } from "react";
import styles from "./tipjarmodal.module.css";

export default function TipJarModal({ onClose }): ReactElement {
  return (
    <div className={styles.modal}>
      <div className={styles.heading}>
        <div></div>
        <p>Buy me a Tea</p>
        <div><button onClick={onClose}>X</button></div>

      </div>
      <div className={styles.container}>
        <h4>Support Trippin</h4>
        <p>OpenAI tokens are not free. Help Trippin keep the travel inspiration going by donating to the project.</p>
        <div className={styles.formWrapper}>
          <a href="https://account.venmo.com/u/choustephanie" target="_blank" >Buy me a tea &#10084;</a>
        </div>
      </div>
    </div>

  )
}