import { Button, Typography } from "@mui/material";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Web3 from 'web3'

export function ViewPaylink(props) {
    const { paylinkToView, setNetworkId, networkId, walletAddress, connectWallet } = props;

    async function switchNetwork(network) {
        if (network.chainIdDecimal.toString().toLowerCase() === networkId.toString().toLowerCase()) {
          return true
        }
        if (window.ethereum) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: network.chainId }],
            })
            setNetworkId(network.chainId)
            return true
          }
          catch (switchError) {
            //This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              
              
                try {
                    const addNetworkParam = {
                    chainId: network.chainId,
                    chainName: network.nameAdd,
                    nativeCurrency:  {
                        name: network.currency,
                        symbol: network.currency,
                        decimals: 18
                    },
                    rpcUrls: [network.rpc],
                    //   blockExplorerUrls: network.blockExplorersUrls.map(x => x.toString()),
                    }
                        await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [addNetworkParam],
                        })
                        await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: network.chainId }],
                        })
                        setNetworkId(network.chainId)
                        
                        return true
                    }
                    catch {
                        alert('Failed to switch network');
                        return false
                    }
            }
            else {
              return false
            }
          }
        }
        else {
          return false
        }
    }
    const pay = async (paylink) => {
        if (!walletAddress) {
            alert('Please Connect wallet');
            return;
        }
        const switchNetworkResult = await switchNetwork(paylink.network);
        if (switchNetworkResult) {
            try {
                const web3 = new Web3(window.ethereum)
                const amountToSend = web3.utils.toWei("0.01", "ether");
                const txHash = await web3.eth.sendTransaction({
                    from: walletAddress,
                    to: paylink.receiver,
                    value: amountToSend,
                });
                alert('Payment sent', txHash);
            } catch {
                alert('Failed to send payment');
            }
        }
        else {
            alert('Failed to switch network');
            }
    
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {
                !walletAddress && <Button variant="contained" disableElevation sx={{ marginLeft: '20px' }} onClick={connectWallet}>
                                Connect Wallet
                              </Button>
            }
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #ccc', padding: '40px 20px', borderRadius: '5px', width: '500px' }}>
                <Typography variant="caption" gutterBottom sx={{ display: 'block', fontSize: '1.5rem' }}>
                    {paylinkToView.title}
                </Typography>
                <Typography variant="overline" gutterBottom sx={{ display: 'block', fontSize: '.85rem' }}>
                    to
                </Typography>
                <Typography variant="button" gutterBottom sx={{ display: 'block', fontSize: '1rem' }}>
                    {paylinkToView.receiver}
                </Typography>
                <Typography variant="overline" gutterBottom sx={{ display: 'block', fontSize: '2rem' }}>
                    {paylinkToView.amount} - {paylinkToView.network.currency}
                </Typography>
                <div>
                    <Typography variant="body2">
                        Fake QR Code
                    </Typography>
                    <QrCodeScannerIcon sx={{ width: '150px', height: '150px' }} />
                </div>
                <Button variant="contained" size="medium" color="primary" onClick={() => pay(paylinkToView)}>
                    Pay
                </Button>
            </div>
        </div>
    );
}