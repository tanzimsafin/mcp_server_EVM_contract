import * as dotenv from 'dotenv';
dotenv.config({ path: "/Users/tanzim_safin/Desktop/mcp_server_smart_contract/.env" });
import { ethers, Contract } from 'ethers';
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Set up provider and signer
const provider = new ethers.JsonRpcProvider(process.env.URL_RPC || "");
const Signer = new ethers.Wallet(process.env.PRIVATE_KEY || " ", provider);

const abi =  [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_donation_ammount",
        "type": "uint256"
      }
    ],
    "name": "donation_recieve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalDonation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "top_Donner_Donation",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const contractAddress = "0x877D405A0c80253692CD3173f47167aa0511a337";
const contract = new Contract(contractAddress, abi, Signer);

// Create MCP server
const server = new McpServer({
  name: "DonationDapp",
  version: "1.0.0"
});



// Add tool: send donation
server.tool("sendDonation",
  { amount: z.number() },
  async ({ amount }) => {
    try {
      const tx = await contract.donation_recieve(amount);
      const receipt = await tx.wait();
      return {
        content: [
          { type: "text", text: `Transaction sent: ${tx.hash}` },
          { type: "text", text: `Transaction mined in block: ${receipt.blockNumber}` }
        ]
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error sending donation: ${error instanceof Error ? error.message : String(error)}` }
        ]
      };
    }
  }
);
//see top donner
server.tool("top_Donner_Donation", {}, async () => {
  try {
    const data = await contract.top_Donner_Donation();
    return {
      content: [{ type: "text", text: `Top Donner: ${data[0]}, Donation: ${ethers.formatEther(data[1])} ETH` }],
    };
  } catch (error) {
    console.error("Error fetching total donation:", error);
    return {
      content: [{ type: "text", text: `Error fetching total donation: ${error instanceof Error ? error.message : String(error)}` }],
    };
  }
});
//withdraw
server.tool("withdraw",{},async()=>{
  try{
    const withdraw=await contract.withdraw();
    return{
      content:[{type:"text",text:`Successfully withdraw money`}]
    }
  }catch(error){
    console.error("Error fetching total donation:", error);
    return{content:[{type:"text",text:"Error fetching data"}]};
  }
    
})

//get Contract address owner balance 
server.tool('getBalance',{},async()=>{
  const balance=await contract.getBalance();
  try{
    return{content:[{type:'text',text:`The balance of owner contract is ${balance} ETH`}]};
  }catch(error){
    console.error("Error fetching Data",error);
    return {content:[{type:"text",text:"Sorry failed to fetch data try again "}]}
  }
})

// Add tool: get total donation
server.tool("getTotalDonation", {}, async () => {
  try {
    const total = await contract.getTotalDonation();
    return {
      content: [{ type: "text", text: `Total donation: ${ethers.formatEther(total)} ETH` }],
    };
  } catch (error) {
    console.error("Error fetching total donation:", error);
    return {
      content: [{ type: "text", text: `Error fetching total donation: ${error instanceof Error ? error.message : String(error)}` }],
    };
  }
});

// Connect to transport (stdin/stdout)
const transport = new StdioServerTransport();
(async () => {
  await server.connect(transport);
})();
