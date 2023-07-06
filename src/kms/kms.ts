/* eslint-disable import/no-extraneous-dependencies */
import { toBech32 } from '@cosmjs/encoding';
import { sha256, ripemd160, Secp256k1 } from '@cosmjs/crypto';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import asn1 from 'asn1.js';

export default class KMSSigner {
  // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
  private EcdsaPubKey = asn1.define('EcdsaPubKey', function (this: any) {
    // parsing this according to https://tools.ietf.org/html/rfc5480#section-2
    this.seq().obj(
      this.key('algo').seq().obj(this.key('a').objid(), this.key('b').objid()),
      this.key('pubKey').bitstr()
    );
  });

  private rawSecp256k1PubkeyToRawAddress(pubkeyData: Uint8Array): Uint8Array {
    if (pubkeyData.length !== 33) {
      throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
    }
    return ripemd160(sha256(pubkeyData));
  }

  getAddress(publicKey: Buffer) {
    // The public key is ASN1 encoded in a format according to
    // https://tools.ietf.org/html/rfc5480#section-2
    // I used https://lapo.it/asn1js to figure out how to parse this
    // and defined the schema in the EcdsaPubKey object
    // const res = this.EcdsaPubKey.decode(publicKey, 'der');
    const res = this.EcdsaPubKey.decode(publicKey, 'der');
    const pubKeyBuffer: Buffer = res.pubKey.data;
    // this._logger.debug(`pubKeyBuffer.length: ${pubKeyBuffer.length}`);
    const pubkey = Secp256k1.compressPubkey(pubKeyBuffer);
    const systemAddress = toBech32('aura', this.rawSecp256k1PubkeyToRawAddress(pubkey));

    return { systemAddress, pubkey };
  }
}

export { KMSSigner };