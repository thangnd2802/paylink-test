import './App.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import * as React from 'react';
import { Button, Typography } from '@mui/material';
import CreatePaylink from './components/create-paylink';
import PropTypes from 'prop-types';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function App() {
  const [value, setValue] = React.useState(0);
  const [isWalletConnected, setIsWalletConnected] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState('');
  const [networkId, setNetworkId] = React.useState('');
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setWalletAddress(addressArray[0]);
        setIsWalletConnected(true);

        const _networkId = await window.ethereum.request({ method: 'net_version' })
        setNetworkId(_networkId)
        // const networkIdHex = `0x${Number.parseInt(networkId, 10).toString(16)}`
        // currentNetworkChainId.value = networkIdHex
        // const network = networkStore.networks.find(x => x.chainId.toLowerCase() === networkIdHex.toLowerCase())
        // if (network) {
        //   currentNetwork.value = networkStore.networks.find(x => x.chainId.toLowerCase() === networkIdHex.toLowerCase())
        //   shouldWarningNetwork.value = false
        // }
      }
      catch {
        
      }
    }
    else {
      alert('Get MetaMask!')
    }
  }

  async function getCurrentWalletConnected() {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: 'eth_accounts',
        })
        if (addressArray.length > 0) {
          setWalletAddress(addressArray[0])
          setIsWalletConnected(true)

          // const networkId = await window.ethereum.request({ method: 'net_version' })
          // const networkIdHex = `0x${Number.parseInt(networkId, 10).toString(16)}`
          // currentNetworkChainId.value = networkIdHex
          // const network = networkStore.networks.find(x => x.chainId.toLowerCase() === networkIdHex.toLowerCase())
          // if (network) {
          //   currentNetwork.value = networkStore.networks.find(x => x.chainId.toLowerCase() === networkIdHex.toLowerCase())
          //   shouldWarningNetwork.value = false
          // }
        }
      }
      catch (err) {
        // return false
      }
    }
    // return false
  }

  function disconnectWallet() {
    setIsWalletConnected(false)
    setWalletAddress('')
  }

  // React.useEffect(() => {
  //   async function init() {
  //     await getCurrentWalletConnected()
  //     // if (!response)
  //     //   await connectWallet()
  //   }
  //   init();
  // },[]);


  return (
    <div className="App">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '20px' }}>
        <Typography variant="button" gutterBottom sx={{ display: 'block', fontSize: '1rem' }} >
          Wallet:&nbsp;
        </Typography>
        <Typography variant="caption" gutterBottom sx={{ display: 'block', fontSize: '.875rem', lineHeight: '1.25rem', fontWeight: '600' }}>
          {isWalletConnected ? walletAddress : 'Not Connected'}
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '5px 0 20px 0' }}>
        {
          isWalletConnected ?
          <Button variant="contained" disableElevation sx={{ marginLeft: '20px', bgcolor: 'grey' }} onClick={disconnectWallet}>
            Disconnect
          </Button>
          :
          <Button variant="contained" disableElevation sx={{ marginLeft: '20px' }} onClick={connectWallet}>
            Connect Wallet
          </Button>
        }
      </div>
      { walletAddress || isWalletConnected ?
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
          >
            <Tab label="Create Paylink"  />
            <Tab label="View Paylink" />
            <Tab label="Item Three" />
          </Tabs>
          <TabPanel value={value} index={0}>
            <CreatePaylink networkId={networkId} setNetworkId={setNetworkId} walletAddress={walletAddress} />
          </TabPanel>
        </Box>
        :
        <Typography variant="caption" gutterBottom sx={{ display: 'block', fontSize: '1rem' }}>
          Connect your wallet to create paylinks
        </Typography>
  }
    </div>
  );
}

export default App;
