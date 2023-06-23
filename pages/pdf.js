import Head from "next/head";
import styles from "./pdf.module.css";

export default function PDF() {
  function handleClick() {
    var doc = new jsPDF("p", "mm", [300, 300]);
    var makePDF = document.querySelector("#generatePdf");
    // fromHTML Method
    doc.fromHTML(makePDF);
    doc.save("output.pdf");
  }
  return (
    <div>
      <Head>
        <title>Generate PDF using jsPDF Library</title>
        {/* <!--JSPDF CDN--> */}
         <script src= "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js"></script>
      </Head>

      <div className={styles.main}>
        <div className={styles.top_container}>
          <button className={styles.pdfButton} id="pdfButton" onClick={handleClick}>Generate PDF</button>
        </div>
        <div className={styles.generatePdf} id="generatePdf">
          <section className={styles.page}>
            <div className={styles.header}>
              <div className={styles.tag}>
                <div className={styles.tagHeader}>Tokyo</div>
                <div className={styles.tagSubheader}>Day 1</div>
              </div>
            </div>
            <div className={styles.container}>
              <table>
                <tbody>
                  <tr>
                    <th> Activity </th>
                    <th> Description </th>
                  </tr>
                  <tr>
                    <td>Tsukiji</td>
                    <td>World's largest fish market, with famous tuna auctions.</td>
                  </tr>
                  <tr>
                    <td> <div>Lunch</div> Sushi Dai</td>
                    <td>Tuck into some of the freshest sushi in Tokyo, made from sustainably sourced seafood.</td>
                  </tr>
                  <tr>
                    <td>Walking tour of Tsukuji</td>
                    <td>
                      <ol>
                        <li>Tsukiji Outer Market</li>
                        <li>Tsukiji Honganji Temple</li>
                        <li>Tsukiji Fish Market</li>
                      </ol>
                    </td>
                  </tr>
                  <tr>
                    <td> <div>Dinner</div> Tsukiji Sushi Sei</td>
                    <td>Choose from an array of seasonal sushi and sashimi dishes from the vast selection of the Tsukiji market.</td>
                  </tr>
                </tbody>
              </table>
              <div>Tsukiji Fish Market is the world's largest fish market, offering an incredible variety of seafood from all over the world. Don't miss the famous tuna auctions, offering the freshest catches of the day.</div>
            </div>
          </section>
          <section className={styles.page}>
            <div className={styles.header}>
              <div className={styles.tag}>
                <div className={styles.tagHeader}>Tokyo</div>
                <div className={styles.tagSubheader}>Day 1</div>
              </div>
            </div>
            <div className={styles.container}>
              <table>
                <tbody>
                  <tr>
                    <th> Activity </th>
                    <th> Description </th>
                  </tr>
                  <tr>
                    <td>Tsukiji</td>
                    <td>World's largest fish market, with famous tuna auctions.</td>
                  </tr>
                  <tr>
                    <td> <div>Lunch</div> Sushi Dai</td>
                    <td>Tuck into some of the freshest sushi in Tokyo, made from sustainably sourced seafood.</td>
                  </tr>
                  <tr>
                    <td>Walking tour of Tsukuji</td>
                    <td>
                      <ol>
                        <li>Tsukiji Outer Market</li>
                        <li>Tsukiji Honganji Temple</li>
                        <li>Tsukiji Fish Market</li>
                      </ol>
                    </td>
                  </tr>
                  <tr>
                    <td> <div>Dinner</div> Tsukiji Sushi Sei</td>
                    <td>Choose from an array of seasonal sushi and sashimi dishes from the vast selection of the Tsukiji market.</td>
                  </tr>
                </tbody>
              </table>
              <div>Tsukiji Fish Market is the world's largest fish market, offering an incredible variety of seafood from all over the world. Don't miss the famous tuna auctions, offering the freshest catches of the day.</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}