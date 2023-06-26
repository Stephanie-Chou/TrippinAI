import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import * as stub from "../utils/stubData"

export default function Home() {
  const [result, setResult] = useState();

  async function downloadTxtFile(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/createPDF", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...stub.sampleData})
      });

      const responseData = await response.json();
      if (response.status !== 200) {
        throw responseData.error || new Error(`Request failed with status ${response.status}`);
      }
      let arr= new Uint8Array(responseData.result.data);
      let buffer = arr.buffer
      console.log(responseData.result);

      let blob=new Blob([buffer], {type: "application/pdf"});
      const href = URL.createObjectURL(blob);
 
      // Creating new object of PDF file
      // Setting various property values
      let alink = document.createElement('a');
      document.body.appendChild(alink); // Required for this to work in FireFox
      alink.href = href;
      alink.download = "Trippin_Itinerary.pdf"
      alink.target = "_blank";
      alink.click();
        
      
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  } 

  return (
    <div>
      <Head>
        <title>PDF generation</title>
      </Head>
      <main className={styles.main}>
        <h3>test pdf download</h3>
        <div className="btnDiv">
            <button id="downloadBtn" value="download" onClick={downloadTxtFile} >Download</button>
        </div>
        <div>{result}</div>
      </main>
    </div>
  );
}
