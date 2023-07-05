import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { fromBase64 } from '@cosmjs/encoding';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StdFee, defaultRegistryTypes as defaultStargateTypes } from '@cosmjs/stargate';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Int53 } from '@cosmjs/math';
import {
  coins,
  encodePubkey,
  GeneratedType,
  makeAuthInfoBytes,
  makeSignDoc,
  Registry,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing';
import { encodeSecp256k1Pubkey } from '@cosmjs/amino';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { BasicAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/feegrant';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { MsgGrantAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';
import { AccountKMS } from './kms.types';
import KMSService from './kms.service';

const KMS_ACCESS_KEY_ID = 'KMS_ACCESS_KEY_ID';
const KMS_SECRET_ACCESS_KEY = 'KMS_SECRET_ACCESS_KEY';
const KMS_REGION = 'KMS_REGION';
const KMS_API_VERSION = 'KMS_API_VERSION';
const kms = new KMSService(KMS_ACCESS_KEY_ID, KMS_SECRET_ACCESS_KEY, KMS_REGION, KMS_API_VERSION);

async function sign(signer: string, signDoc: SignDoc) {
  return kms.signWithKMS(signer, signDoc);
}

async function getClient(endpoint: string) {
  return CosmWasmClient.connect(endpoint);
}

const kmsService = async () => {
  const alias = 'kms_test';
  const client = await getClient('https://rpc.dev.aura.network/');
  const wasmTypes: ReadonlyArray<[string, GeneratedType]> = [
    ['/cosmos.feegrant.v1beta1.MsgGrantAllowance', MsgGrantAllowance],
  ];
  try {
    const createRs = await kms.createAlias(alias);
    console.log('createRs', createRs);
    const accountKMS = (await kms.connectKMS(alias)) as AccountKMS;
    if (accountKMS) {
      // create spendLimit
      const spendLimit: Coin[] = [
        {
          denom: 'uaura',
          amount: '10000',
        },
      ];
      const allowance: Any = {
        typeUrl: '/cosmos.feegrant.v1beta1.BasicAllowance',
        value: Uint8Array.from(
          BasicAllowance.encode({
            spendLimit,
          }).finish()
        ),
      };
      const messages = [
        {
          typeUrl: '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
          value: MsgGrantAllowance.fromPartial({
            granter: accountKMS.systemAddress,
            grantee: 'some-address',
            allowance,
          }),
        },
      ];
      const { accountNumber, sequence } = await client.getSequence(accountKMS.systemAddress);
      const chainId = await client.getChainId();

      const encodePublicKey = accountKMS.encodePubkey;
      const txBody: TxBodyEncodeObject = {
        typeUrl: '/cosmos.tx.v1beta1.TxBody',
        value: {
          messages,
          memo: '',
        },
      };
      const fee: StdFee = {
        amount: coins(1000000, 'uaura'),
        gas: '10000000',
      };

      const registry: Registry = new Registry([...defaultStargateTypes, ...wasmTypes]);
      const txBodyBytes = registry.encode(txBody);
      const gasLimit = Int53.fromString(fee.gas).toNumber();

      const pubkey = encodePubkey(encodeSecp256k1Pubkey(fromBase64(encodePublicKey)));
      const authInfoBytes = makeAuthInfoBytes([{ pubkey, sequence }], fee.amount, gasLimit, undefined, undefined);

      const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);
      const signature = await sign(alias, signDoc);
      console.log(signature);
    }
  } catch (error) {
    console.error(error);
  }
};

kmsService();
