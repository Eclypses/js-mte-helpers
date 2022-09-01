# Client and Server MTE Pairing Guide

This guide details the recommended steps for pairing encoders and decoders on the client with their counterparts on the server. The process can be described in three stages:

1. Creating Initialization values
   - ECDH is used to create an entropy value
2. Exchanging values between the client and server
3. Creating encoder/decoder pairs

## Introduction

To create an encoder/decoder pairing, we need to generate matching initialization values on the client and the server. Additionally, since encoder/decoder pairs are one-directional, we need to create two pairs of encoders/decoder, in order to facilitate request and response pathways.

<br/>
<center>
  <img src="./images/round-trip.png">
</center>
<br/>

## Create initialization Values

To do this, we recommend having the client create two personalization values, and the server create two nonce values. Then, both the client and server create two sets of ECDH key pairs. Finally, exchange all values in a single API request/response.

You can create Personalization Strings and Nonces however you like, but below are two functions you can use to create a GUID for a personalization string and a psuedo-random number for a nonce.

```js
/**
 * Use Javascript to create a v4 uuid.
 * https://stackoverflow.com/a/2117523/4927236
 */
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

/**
 * Generate a random number
 */
function makeNonce() {
  return Math.floor(Math.random() * 1e15).toString();
}
```

For entropy, please consult the [Elliptical-Curve Diffie-Helman (ECDH) guide](./ecdh-entropy-guide.md) to learn how to use public/private key pairs to securely generate matching entropy values on the client and server.

## Exchange Initialization Values

<br/>
<center>
  <img src="./images/exchange-init-values.png">
</center>
<br/>
