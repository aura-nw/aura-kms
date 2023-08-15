/* eslint-disable import/no-extraneous-dependencies */
import KMS from 'aws-sdk/clients/kms';
import { bigNumberToBuffer, decodeAWSSignature } from './decode';

export default class KeyPairManagement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kms: any;

  constructor(accessKeyId, secretAccessKey, region, apiVersion) {
    this.kms = new KMS({
      accessKeyId,
      secretAccessKey,
      region,
      apiVersion,
    });
  }

  async getPubKeyByAliasName(aliasName: string) {
    try {
      const alias = this.stringToAlias(aliasName);
      const result = await this.kms
        .getPublicKey({
          KeyId: alias,
        })
        .promise();
      const pubKey = result.PublicKey as Buffer;
      return pubKey;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code && error.code === 'NotFoundException') return null;
      throw error;
    }
  }

  async createKMSKey(aliasName: string) {
    const param: KMS.CreateKeyRequest = {
      Description: 'artaverse-kms-api',
      KeySpec: 'ECC_SECG_P256K1',
      KeyUsage: 'SIGN_VERIFY',
      MultiRegion: false,
    };
    const result = await this.kms.createKey(param).promise();
    const keyId = result.KeyMetadata?.KeyId;
    if (keyId) {
      const alias = this.stringToAlias(aliasName);
      const res = await this.createAlias(alias, keyId);
      if (res) console.log(`Create alias ${alias} for KMS key ${keyId} successful! `);
      return {
        keyId,
        alias,
      };
    }
    return null;
  }

  async sign(
    // msgHash: string,
    msgHash: Uint8Array,
    aliasName: string
  ): Promise<{
    rBuff: Buffer;
    sBuff: Buffer;
  } | null> {
    const alias = this.stringToAlias(aliasName);
    const params: KMS.SignRequest = {
      // key id or 'Alias/<alias>'
      KeyId: alias,
      Message: msgHash,
      // 'ECDSA_SHA_256' is the one compatible with ECC_SECG_P256K1.
      SigningAlgorithm: 'ECDSA_SHA_256',
      MessageType: 'DIGEST',
    };
    const res = await this.kms.sign(params).promise();
    // console.log('sign KMS res', res);
    const signature = res.Signature;
    if (signature) {
      const { R, S } = await decodeAWSSignature(signature);
      const rBuff = bigNumberToBuffer(R, 32);
      const sBuff = bigNumberToBuffer(S, 32);
      return {
        rBuff,
        sBuff,
      };
    }
    return null;
  }

  async createAlias(alias: string, keyId: string) {
    const params: KMS.CreateAliasRequest = {
      AliasName: alias,
      TargetKeyId: keyId,
    };
    return this.kms.createAlias(params).promise();
  }
  
  async encrypt(KeyId: string, Plaintext: string) {
    const params: KMS.EncryptRequest = {
      KeyId,
      Plaintext
    };
    return this.kms.encrypt(params).promise();
  }
  
  async decrypt(KeyId: string, CiphertextBlob: string) {
    const params: KMS.DecryptRequest = {
      KeyId,
      CiphertextBlob
    };
    return this.kms.decrypt(params).promise();
  }

  stringToAlias(aliasName: string) {
    return `alias/${aliasName}`;
  }
}

export { KeyPairManagement };
