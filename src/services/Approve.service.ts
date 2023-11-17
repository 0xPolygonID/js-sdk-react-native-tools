import {AppService} from './App.service';

import {
  AuthHandler,
  FetchHandler,
  core,
  base64ToBytes,
  byteEncoder,
} from '@0xpolygonid/js-sdk';

const {DID} = core;

export async function approveMethod(urlParam: string) {
  const {packageMgr, proofService, credWallet, dataStorage, authHandler} =
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
  // let _did = DID.parse(LocalStorageServices.getActiveAccountDid());
  if (!_did) {
    console.log('no did');
    return;
  }

  const authRes = await authHandler.handleAuthorizationRequest(_did, msgBytes);
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
  const {packageMgr, credWallet, dataStorage} =
    AppService.getExtensionServiceInstance();
  let fetchHandler = new FetchHandler(packageMgr);

  const msgBytes = base64ToBytes(urlParam);

  const credentials = await fetchHandler.handleCredentialOffer(msgBytes);
  console.log(credentials);
  await credWallet.saveAll(credentials);
  return 'SAVED';
}

//
// export async function proofMethod(urlParam) {
//   const {authHandler, credWallet} =
//     ExtensionService.getExtensionServiceInstance();
//   // const msgBytes = byteEncoder.encode(Base64.decode(urlParam));
//   const msgBytes = base64ToBytes(urlParam);
//
//   const authRequest = await authHandler.parseAuthorizationRequest(msgBytes);
//
//   const {body} = authRequest;
//   const {scope = []} = body;
//
//   if (scope.length > 1) {
//     throw new Error('not support 2 scope');
//   }
//   const [zkpReq] = scope;
//   const [firstCredential] = await credWallet.findByQuery(zkpReq.query);
//   const did = DID.parse(LocalStorageServices.getActiveAccountDid());
//   const response = await authHandler.generateAuthorizationResponse(
//     did,
//     0,
//     authRequest,
//     [
//       {
//         credential: firstCredential,
//         req: zkpReq,
//         credentialSubjectProfileNonce: 0,
//       },
//     ],
//   );
//   console.log('proof M');
//   console.log(response);
//   // var config = {
//   //   headers: {
//   //     'Content-Type': 'text/plain',
//   //   },
//   //   responseType: 'json',
//   // };
//   // return await axios
//   //   .post(`${authRequest.body.callbackUrl}`, response.token, config)
//   //   .then(response => response)
//   //   .catch(error => error.toJSON());
// }
