import { initializeKeypair } from "./initializeKeypair"
import * as web3 from "@solana/web3.js"
import * as token from "@solana/spl-token"

async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number,
  tokenName: string,
  tokenSymbol : string
): Promise<web3.PublicKey> {

  const tokenMint = await token.createMint(
      connection,
      payer,
      mintAuthority,
      freezeAuthority,
      decimals,
  );
  console.log(`The token mint account address is ${tokenMint}`)
  console.log(
      `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=testnet`
  );
  
  return tokenMint;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
) {
  
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      owner
  )
  
  console.log(
      `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=testnet`
  )

  return tokenAccount
}


async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number
) {
  const mintInfo = await token.getMint(connection, mint)

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=testnet`
  )
}

async function transferTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  source: web3.PublicKey,
  destination: web3.PublicKey,
  owner: web3.PublicKey,
  amount: number,
  mint: web3.PublicKey
) {
  const mintInfo = await token.getMint(connection, mint)

  const transactionSignature = await token.transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount * 10 ** mintInfo.decimals
  )

  console.log(
    `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=testnet`
  )
}

async function burnTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    account: web3.PublicKey,
    mint: web3.PublicKey,
    owner: web3.Keypair,
    amount: number
) {

    const mintInfo = await token.getMint(connection, mint)
    
    const transactionSignature = await token.burn(
        connection,
        payer,
        account,
        mint,
        owner,
        amount * 10 ** mintInfo.decimals
    )

    console.log(
        `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=testnet`
    )
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("testnet"))
  const user = await initializeKeypair(connection)
  // replace receiver pubKey with dev wallet address
  // const receiver = web3.Keypair.generate().publicKey
  //Wallet Address : 416SM7G51CadWrKpe1ZhEJ75FJYfvANEQ8drQKQ1vTkN
  //  const MY_ADDRESS = "5NtJ6Mg2ii9BrtHsow4DCij2sHSEjimtqQ7N2AfqoeqF"
  //  const me = new web3.PublicKey(MY_ADDRESS)

  console.log("PublicKey:", user.publicKey.toBase58())

  const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await _sleep(2000);

  const mint = await createNewMint(
    connection,
    user,           // We'll pay the fees
    user.publicKey, // We're the mint authority
    user.publicKey, // And the freeze authority >:)
    6,               // Only six decimals!
    "TigerDefi",
    "Tiger"
  )
  
  await _sleep(2000);

  const tokenAccount = await createTokenAccount(
    connection,     
    user,           
    mint,            
    user.publicKey   // Associating our address with the token account
  )
  // const receiverTokenAccount = await createTokenAccount(
  //   connection,
  //   user,
  //   mint,
  //   me
  // )

  // Mint 100000 tokens to our address
  await mintTokens(connection, user, mint, tokenAccount.address, user, 100000)
  // await transferTokens(
  //   connection,
  //   user,
  //   tokenAccount.address,
  //   receiverTokenAccount.address,
  //   user.publicKey,
  //   50,
  //   mint
  // )

  // await burnTokens(connection, user, tokenAccount.address, mint, user, 25)
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })