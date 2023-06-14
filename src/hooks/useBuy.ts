import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { checkAddressInGroup } from '../utils/gfSDK';
import { useStatus } from './useStatus';
import { useChainBalance } from './useChainBalance';
import { CROSS_CHAIN_FEE, INITIATE_LIST_FEE } from '../env';
import { MarketPlaceContract } from '../base/contract/marketPlaceContract';
import BN from 'bn.js';
import { useRelayFee } from './useRelayFee';
import { divide10Exp } from '../utils';
import { useModal } from './useModal';

export const useBuy = (
  groupName: string,
  groupOwner: string,
  price: string,
) => {
  // 0 owner
  // 1 purchase
  // 2 Waiting for purchase
  const { address } = useAccount();
  const { BscBalanceVal } = useChainBalance();
  const { status } = useStatus(groupName, groupOwner, address as string);

  const { relayFee } = useRelayFee();

  const state = useModal();

  const buy = useCallback(
    async (groupId: number) => {
      if (status === 1) {
        const totalFee = new BN(price, 10).add(new BN(relayFee, 10));
        const n = Number(divide10Exp(totalFee, 18));

        if (BscBalanceVal >= n) {
          try {
            const result = await MarketPlaceContract()
              .methods.buy(groupId, address)
              .send({
                from: address,
                value: totalFee,
              });
            state.modalDispatch({ type: 'BUY_END', buyResult: result });
            return result;
          } catch (e) {
            state.modalDispatch({ type: 'BUY_END', buyResult: e });
            return e;
          }
        } else {
          return false;
        }
      }
      return false;
    },
    [status, BscBalanceVal, price, relayFee],
  );
  return { buy, relayFee };
};
