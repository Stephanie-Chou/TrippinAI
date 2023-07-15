export default function ShareButton({ setAlert }) {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function onShare(event) {
    event.preventDefault();
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setAlert(`Copied URL to Clipboard`);

    await delay(3000);
    setAlert(null);
  }

  return (
    <button onClick={onShare}>
      <div>
        <span className="material-symbols-outlined">share</span>
      </div>
    </button>
  )
}