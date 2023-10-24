/* eslint-disable import/no-extraneous-dependencies */
import { makeSignBytes } from '@cosmjs/proto-signing';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Secp256k1Signature, sha256 } from '@cosmjs/crypto';
import { AccountKMS } from './kms.types';
import { KeyPairManagement } from './keypairManagement';
import { KMSSigner } from './kms';
import KMS from 'aws-sdk/clients/kms';
import { toBase64 } from '@cosmjs/encoding';

export default class KMSService {
  public keypairSvc;

  constructor(accessKeyId, secretAccessKey, region, apiVersion) {
    this.keypairSvc = new KeyPairManagement(accessKeyId, secretAccessKey, region, apiVersion);
  }

  kmsSigner = new KMSSigner();

  async connectKMS(alias: string): Promise<AccountKMS | Error> {
    // 1. get pubkey by alias
    const pubKey = await this.keypairSvc.getPubKeyByAliasName(alias);
    // 2. if not found > create key and alias
    if (!pubKey) return new Error('can not get PubKey By Alias Name');

    // 3. generate address by pubKey
    const { systemAddress, pubkey } = this.kmsSigner.getAddress(pubKey);
    // 4. return address
    const encodePubkey = toBase64(pubkey);
    return {
      systemAddress,
      encodePubkey,
    };
  }

  async createAlias(alias: string): Promise<AccountKMS | Error> {
    // 1. get pubkey by alias
    const pubKey = await this.keypairSvc.getPubKeyByAliasName(alias);
    // 2. if not found > create key and alias
    if (!pubKey) {
      const createResult = await this.keypairSvc.createKMSKey(alias);

      if (createResult?.alias) return new Error('can not create KMS key');
    }
    // 3. generate address by pubKey
    const { systemAddress, pubkey } = this.kmsSigner.getAddress(pubKey);
    // 4. return address
    const encodePubkey = toBase64(pubkey);
    return {
      systemAddress,
      encodePubkey,
    };
  }

  async signWithKMS(signer: string, signDoc: SignDoc): Promise<Secp256k1Signature | Error> {
    try {
      const signBytes = makeSignBytes(signDoc);
      const hashedMessage = sha256(signBytes);
      const rs = await this.keypairSvc.sign(hashedMessage, signer);
      if (rs) {
        return new Secp256k1Signature(rs.rBuff, rs.sBuff);
      }
      return new Error('can not sign by kms');
    } catch (error) {
      console.error('signWithKMS error', error);
      return error;
    }
  }

  async encrypt(KeyId: string, Plaintext: KMS.PlaintextType) {
    try {
      const rs = await this.keypairSvc.encrypt(KeyId, Plaintext);
      return rs;
    } catch (error) {
      console.error('encrypt error', error);
      return error;
    }
  }

  async decrypt(KeyId: string, CiphertextBlob: KMS.CiphertextType) {
    try {
      const rs = await this.keypairSvc.decrypt(KeyId, CiphertextBlob);
      return rs;
    } catch (error) {
      console.error('decrypt error', error);
      return error;
    }
  }
}

export { KMSService };
