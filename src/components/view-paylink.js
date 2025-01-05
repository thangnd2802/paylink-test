import { Button, Typography } from "@mui/material";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Web3 from 'web3'

const defaultERC20ContractABI = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          name: '',
          type: 'string',
        },
      ],
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
      ],
      name: 'allowance',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

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

    async function approveToken(tokenAddress, contractAddress, amount, tokenDecimals) {
        const web3 = new Web3(window.ethereum)
        const contract = new web3.eth.Contract(defaultERC20ContractABI, tokenAddress)
        const amountInDecimal6 = amount * tokenDecimals
  
        const gasEstimate = Number(await contract.methods.approve(contractAddress, amountInDecimal6)
          .estimateGas({ from: walletAddress.value }))
  
        const gasLimit = Math.ceil(gasEstimate * 1.5).toString()
  
        return await  contract.methods.approve(contractAddress, amountInDecimal6).send({
          from: walletAddress.value,
          gas: gasLimit,
        })
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

                if (paylink.token) {
                    
                    // const approve = await approveToken(paylink.token.address, paylink.contractAddress, amountToSend, paylink.token.decimals)
                    const decimals = paylink.token.decimals;
                    // const amountInWei = web3.utils.toWei(paylink.amount.toString(), "ether");
                    const amountInSmallestUnit = (100 * Math.pow(10, decimals)).toString();

                    const tokenContract = new web3.eth.Contract(defaultERC20ContractABI, paylink.token.address, {
                        from: walletAddress,
                    });

                    const gasEstimate = Number(await tokenContract.methods
                        .transfer(paylink.receiver, amountInSmallestUnit)
                        .estimateGas({ from: walletAddress }))
            
                      const gasLimit = Math.ceil(gasEstimate * 1.5).toString()

                    const txHash = await tokenContract.methods.transfer(paylink.receiver, amountInSmallestUnit).send({
                        from: walletAddress,
                        gas: gasLimit,
                    });
                    
                        alert('Payment sent', txHash);
                    
                }
                else {

                    const txHash = await web3.eth.sendTransaction({
                        from: walletAddress,
                        to: paylink.receiver,
                        value: amountToSend,
                    });

                    alert('Payment sent', txHash);
                }
            } catch (error) {
                console.log(error);
                alert('Failed to send payment: ', error);
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
                    {paylinkToView.amount} - {paylinkToView.token ? paylinkToView.token.symbol : paylinkToView.network.currency}
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