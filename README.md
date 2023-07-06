# aura-kms

Service support to using kms for sign message on aura net work.

## Installation

Using npm:
```
$ npm i -g npm
$ npm i --save @aura-nw/aura-kms
```

## Usage/Examples

import aura-kms package:

```
import {KMSService} from '@aura-nw/aura-kms';
```

Init and using KMSService to get signature on message:

```
const kms = new KMSService(KMS_ACCESS_KEY_ID, KMS_SECRET_ACCESS_KEY, KMS_REGION, KMS_API_VERSION);

async function sign(signer: string, signDoc: SignDoc) {
  return kms.signWithKMS(signer, signDoc);
}
.....
const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId,accountNumber);
const signature = await sign(alias, signDoc);
...

```

Detail and demo using: [example file](https://github.com/aura-nw/aura-kms/blob/main/src/example/example.ts)

## License
This package is part of the aura-nw repository, licensed under the Apache License 2.0 (see NOTICE and LICENSE).
