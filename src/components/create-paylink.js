import { Button, Divider, Grid2, List, ListItem, ListItemIcon, ListItemText, MenuItem, TextField, Typography } from "@mui/material";
import * as React from "react";
import { styled } from '@mui/material/styles';
import ReceiptIcon from '@mui/icons-material/Receipt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Web3 from 'web3'
import { networks } from '../common';

const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));
  

// const networks = [
//     {
//         name: 'celo',
//         rpc: 'alfajores-forno.celo-testnet.org',
//         chainId: '0xAEF3',
//         currency: 'CELO',
//         chainIdDecimal: 44787,
//     },
//     {
//         name: 'Binance',
//         rpc: 'bsc-testnet.drpc.org',
//         chainId: '0x61',
//         currency: 'tBNB',
//         chainIdDecimal: 97,
//     },
//     {
//         name: 'Arbitrum',
//         rpc: 'bsc-testnet.drpc.org',
//         chainId: '0xA4BA',
//         currency: 'ETH',
//         chainIdDecimal: 42170,
//     }
// ]

function CreatePaylink(props) {
    const { networkId, setNetworkId, walletAddress } = props;
    const [title, setTitle] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [network, setNetwork] = React.useState(networks[0].chainId);
    const [paylinks, setPaylinks] = React.useState([]);
    const [receiver, setReceiver] = React.useState('');

    const [paylinkToView, setPaylinkToView] = React.useState(null);

    const handleAmountChange = (event) => {
        const inputValue = event.target.value;
        // Allow only numbers with optional dot and decimal digits
        const validNumber = /^[0-9]*\.?[0-9]*$/;
        if (inputValue === "" || validNumber.test(inputValue)) {
          setAmount(inputValue);
        }
    };

    const isValidData = () => {
        return title && amount && network && receiver;
    }

    const createPaylink = () => {
        const paylink = {
            title: title,
            amount: amount,
            network: networks.find(n => n.chainId === network),
            receiver: receiver,
        }
        setPaylinks([...paylinks, paylink]);
    }

    async function switchNetwork(network) {
        console.log(network.chainId)
        console.log(networkId.toString().toLowerCase())
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
              
              
            const addNetworkParam = {
              chainId: network.chainId,
              chainName: network.name,
              nativeCurrency: network.currency,
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
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10rem'}}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '1rem' }}>
                    <TextField
                        sx={{ width: '70%' }}
                        required
                        id="outlined-required"
                        label="Title"
                        onChange={(e) => setTitle(e.target.value)}
                        defaultValue={title}
                    />
                    <TextField
                        label="Amount"
                        variant="outlined"
                        value={amount}
                        onChange={handleAmountChange}
                        slotProps={{ inputMode: "decimal", pattern: "[0-9]*.?[0-9]*" }}
                    />
                </div>
                <TextField
                        required
                        id="outlined-required"
                        label="Receiver"
                        onChange={(e) => setReceiver(e.target.value)}
                        defaultValue={receiver}
                    />
                <TextField
                    id="outlined-select-currency"
                    select
                    value={network}
                    label="Network"
                    onChange={(e) => setNetwork(e.target.value)}
                >
                {networks.map((option) => (
                    <MenuItem key={option.chainId} value={option.chainId}>
                        {option.name} - {option.currency}
                    </MenuItem>
                ))}
                </TextField>
                <Button variant="contained" size="medium" color="primary" disabled={!isValidData()} onClick={createPaylink}>
                    Create
                </Button>
                <Divider variant="inset" />
                <Grid2 xs={12} md={6}>
                    <Typography sx={{ mt: 4, mb: 2 }} variant="h6">
                        Your Paylinks
                    </Typography>
                    <Demo>
                        <List dense={false}>
                        {
                            paylinks.map((paylink, index) => (
                                <ListItem key={index} sx={{ borderRadius: '5px', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}
                                    onClick={() => setPaylinkToView(paylink)}
                                >
                                    <ListItemIcon>
                                        <ReceiptIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={paylink.title}
                                        secondary={`${paylink.amount} - ${paylink.network.currency}`}
                                    />
                                </ListItem>
                            ))
                        }
                        </List>
                    </Demo>
                </Grid2>

            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '500px' }}>
                {
                    paylinkToView && (
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #ccc', padding: '40px 20px', borderRadius: '5px' }}>
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
                    )
                }
            </div>
        </div>
    );
}

export default CreatePaylink;