import styles from "./downloadModal.module.css";

export default function DownloadModal(props){
  return (
    <div className={styles.modal}>
      <div className={styles.heading}>
        <div></div>
        <p>Tip Jar</p>
        <div><button onClick={props.onClose}>X</button></div>
        
      </div>
      <div className={styles.container}>
        <h4>Support Trippin</h4>
        <p>OpenAI tokens are not free. Help Trippin keep the travel inspiration going by donating to the project.</p>
        <div className={styles.formWrapper}>

          <form action="https://www.paypal.com/donate" method="post" target="_blank">
          <input type="hidden" name="business" value="BBT5A3RU9SWZJ" />
          <input type="hidden" name="no_recurring" value="0" />
          <input type="hidden" name="item_name" value="Trippin - Spread the Travel Inspiration" />
          <input type="hidden" name="currency_code" value="USD" />
          <input type="image" src="https://pics.paypal.com/00/s/OThlYzA5MmQtYTdjMy00MzIzLTg5MGQtZTU1MmY5MDYyNDNh/file.PNG" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
          <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
          </form>

        </div>
    

      </div>
    </div>

  )
}