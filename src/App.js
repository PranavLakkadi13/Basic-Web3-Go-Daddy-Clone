import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Search from './components/Search'
import Domain from './components/Domain'

// ABIs
import ETHDaddy from './abis/ETHDaddy.json'

// Config
import config from './config.json';

function App() {
  const[provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [ETHDADDY, setETHDADDY] = useState(null);
  const [domains, setDomains] = useState([]);

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const network = provider.getNetwork();
    
    const ETHDADDY = new ethers.Contract(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      ETHDaddy,
      provider
    );
    setETHDADDY(ETHDADDY);

    // const Supply = await ETHDADDY.getListedDomainsCount();
    // const listSupply = Number(Supply);
    // console.log(listSupply);

    const domains = []
    
    for (let i = 0; i < 6; i++) {
      const domain = await ETHDADDY.getDomainMapping(i.toString());
      domains.push(domain);
    }

    setDomains(domains);
    console.log(domains);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.getAddress(accounts[0]);
      setAccount(account);
    });
  }

  useEffect(() => {
    loadBlockchainData()
  },[])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className="cards__section">
        <h2 className="cards__title">Welcome to ETH Daddy</h2>
        <p className="cards__description">
          {" "}
          Own your custom username, use it across services, and be able to store
          an avatar and other profile data.
        </p>
        <hr />
        <div className="cards">
          {domains.map((domain,index) => (
            <Domain domain={domain} ethDaddy={ETHDADDY} provider={provider} id={index} key={ index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;