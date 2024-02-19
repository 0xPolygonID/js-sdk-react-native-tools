import {AppService} from './App.service';

import {
  FetchHandler,
  core,
  base64ToBytes,
  byteEncoder,
} from '@0xpolygonid/js-sdk';

const {DID} = core;

export async function approveMethod(urlParam: string) {
  const {dataStorage, authHandler, packageMgr} =
    AppService.getExtensionServiceInstance();

  const msgBytes = base64ToBytes(urlParam);
  const identities = await dataStorage.identity.getAllIdentities();
  console.log('identities');
  console.log(identities);
  let _did = null;
  if (identities?.length) {
    const [firstIdentity] = identities;
    _did = DID.parse(firstIdentity.did);
    console.log('DID read from storage');
  }
  if (!_did) {
    console.log('no did');
    return;
  }

  const authRes = await authHandler.handleAuthorizationRequest(_did, msgBytes);

  // verify token example how to use
  const tokenBytes = byteEncoder.encode(authRes.token);
  const data = await packageMgr.unpack(tokenBytes);
  console.log('tokenBytes unpack');
  console.log(data);
  // verify token example how to use end

  console.log('authRes');
  console.log(authRes);

  const url = authRes.authRequest.body.callbackUrl;
  console.log('finished preparing proof', url);

  return fetch(`${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: authRes.token,
  }).then(response => {
    if (!response.ok) {
      return Promise.reject(response);
    }
  });
}

export async function receiveMethod(urlParam: string) {
  const {packageMgr, credWallet} = AppService.getExtensionServiceInstance();
  let fetchHandler = new FetchHandler(packageMgr);

  const msgBytes = base64ToBytes(urlParam);

  const credentials = await fetchHandler.handleCredentialOffer(msgBytes);
  console.log(credentials);
  await credWallet.saveAll(credentials);
  return 'SAVED';
}
