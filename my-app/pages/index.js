import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import {useEffect, useRef, useState} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";
import { Web3Provider } from '@ethersproject/providers';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  
  const [joinedWhiteist, setJoinedWhitelist] = useState(false);

  const [loading, setLoading] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  //creating a reference to Web3 Modal (used to connect to Metamask)
  //this persists as long as page is open
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer objecting representing Ethereum
   * RPC (Remote Procedure Call, request-response) w/ or w/out the 
   * signing capabilities of metamask attached
   * 
   * A Provider is needed to interact w/ blockchain, can read txns, state, balances
   * 
   * A Signer is a special type of Provider used in case a 'write' must be made to the blockchain.
   * Connected account must make a digital signature to authorize the txn
   * 
   * @param{*} needSigner - True if you need the signer, false otherwise (default)
  */

  const getProviderOrSigner = async(needSigner = false) => {
    //connect to metamask
    //since web3modal is a reference, we need the current value

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if (chainId !== 3) {
      window.alert("Change the network to Ropsten");
      throw new Error("Change the network to Ropsten");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;

  };

  //Adding the current connected address to the whitelist

  const addAddressToWhitelist = async() => {
    try {
      //need a signer
      const signer = await getProviderOrSigner(true);

      //create new instance of Contract w/ signer
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS, 
        abi,
        signer
      );

      const tx = await whiteListContract.addAddressToWhitelist();
      setLoading(true);
      
      //wait for txn to get mined
      await tx.wait();
      setLoading(false);

      //get updated no. of addresses in whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.log(err)
    }
  };

  //gets no. of whitelisted addresses
  const getNumberOfWhitelisted = async() => {
    try {
      const provider = await getProviderOrSigner();

      const whiteListContract = new Contract (
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
    );
    const _numberOfWhiteListed = await whiteListContract.numAddressesWhitelisted();
    setNumberOfWhitelisted(_numberOfWhiteListed);
  } catch(err) {
    console.log(err)
  }
};

const checkIfAddressInWhiteList = async() => {
  try {
    //need the signer here to get user address
    const provider = await getProviderOrSigner(true);

    const whiteListContract = new Contract (
      WHITELIST_CONTRACT_ADDRESS, 
      abi, 
      provider
    );
    const address = await signer.getAddress();
    const _joinedWhiteList = await whiteListContract.whitelistedAddresses(address);
    setJoinedWhitelist(_joinedWhiteList);
  } catch (err) {
  console.log(err);
  }
};

const connectWallet = async() => {
  try {
    //Get the provider from web3Modal, which in this case is Metmamask
    //When used for first time, it prompts the user to connect wallet
    await getProviderOrSigner();
    setWalletConnected(true);

    checkIfAddressInWhiteList();
    getNumberOfWhitelisted();
  } catch (err) {
    console.log(err);
  }
}

//renderButton: Returns a button based on state of the dapp

const renderButton = () => {
  if (walletConnected) {
    if (joinedWhiteist){
      return (
        <div className={styles.description}>
          Thanks for joining the exclusive Whitelist!
        </div>
      );
    } else if (loading) {
      return <button className={styles.button}>Loading...Please Wait</button>;
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={styles.button}>
          Join the Whitelist
        </button>
      );
    }
  } else {
    return (
      <button onClick={connectWallet} className={styles.button}>
      Join the Whitelist
      </button>
    );
  }
};

//useEffects are used to react to changes in state of the website
//If array at end of function call changed, effect will trigger
//A change to "walletConnected" will trigger the effect here
useEffect(() => {

    if (!walletConnected) {

      web3ModalRef.current = new Web3Modal({
        network: "ropsten",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }

}, [walletConnected]);

return (
  <div>
    <Head>
      <title>Harry's Whitelist Dapp</title>
      <meta name="description" content="Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico"/>
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
        <div className={styles.description}>
          This is an NFT collection for my fellow Crypto developers.
        </div>
        <div className={styles.description}>
          {numberOfWhitelisted} have already joined the Whitelist!
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./crypto-devs.svg" />
      </div>
    </div>

    <footer className = {styles.footer}>
      Made with &#10084; by Crypto Devs
    </footer>
  </div>
  );
};