const {
  REACT_APP_GF_CHAIN_ID,
  REACT_APP_GF_RPC_URL,
  REACT_APP_BSC_RPC_URL,
  REACT_APP_BSC_CHAIN_ID,

  REACT_APP_MARKETPLACE_CONTRACT_ADDRESS,
  REACT_APP_GROUP_HUB_CONTRACT_ADDRESS,
  REACT_APP_MULTI_CALL_CONTRACT_ADDRESS,
  REACT_APP_CROSS_CHAIN_FEE,
  REACT_APP_INITIATE_LIST_FEE,

  REACT_APP_LIST_FEE_ON_GF,
  REACT_APP_LIST_ESTIMATE_FEE_ON_BSC,
  REACT_APP_GF_EXPLORER_URL,
  REACT_APP_BSC_EXPLORER_URL,
  REACT_APP_DCELLAR_URL,

  REACT_APP_BSC_SEND_GAS_FEE,

  REACT_APP_ERC1155_TRANSFER_CONTRACT_ADDRESS,
  REACT_APP_ERC721_TRANSFER_CONTRACT_ADDRESS,

  REACT_APP_DAPP_NAME,
  REACT_APP_NETWORK,
} = process.env;

export const GF_CHAIN_ID = Number(REACT_APP_GF_CHAIN_ID);
export const GF_RPC_URL = REACT_APP_GF_RPC_URL as string;
export const BSC_RPC_URL = REACT_APP_BSC_RPC_URL as string;
export const BSC_CHAIN_ID = Number(REACT_APP_BSC_CHAIN_ID);

export const MARKETPLACE_CONTRACT_ADDRESS =
  REACT_APP_MARKETPLACE_CONTRACT_ADDRESS as string;
export const GROUP_HUB_CONTRACT_ADDRESS =
  REACT_APP_GROUP_HUB_CONTRACT_ADDRESS as string;
export const MULTI_CALL_CONTRACT_ADDRESS =
  REACT_APP_MULTI_CALL_CONTRACT_ADDRESS as string;

export const CROSS_CHAIN_FEE = Number(REACT_APP_CROSS_CHAIN_FEE);
export const INITIATE_LIST_FEE = Number(REACT_APP_INITIATE_LIST_FEE);

export const LIST_FEE_ON_GF = Number(REACT_APP_LIST_FEE_ON_GF);
export const LIST_ESTIMATE_FEE_ON_BSC = Number(
  REACT_APP_LIST_ESTIMATE_FEE_ON_BSC,
);

export const GF_EXPLORER_URL = REACT_APP_GF_EXPLORER_URL;
export const BSC_EXPLORER_URL = REACT_APP_BSC_EXPLORER_URL;
export const DCELLAR_URL = REACT_APP_DCELLAR_URL;

export const BSC_SEND_GAS_FEE = REACT_APP_BSC_SEND_GAS_FEE;

export const ERC1155_TRANSFER_CONTRACT_ADDRESS =
  REACT_APP_ERC1155_TRANSFER_CONTRACT_ADDRESS;

export const ERC721_TRANSFER_CONTRACT_ADDRESS =
  REACT_APP_ERC721_TRANSFER_CONTRACT_ADDRESS;

export const DAPP_NAME = REACT_APP_DAPP_NAME;

export const NETWORK = REACT_APP_NETWORK;
