# MTE Helpers

The goal of this package is to make MTE as simple and easy to use as possible.

- Instantiating MTE WASM
- Providing Sensible defaults, with overrides
- Encoding/Decoding
- Managing State
- Handles Error Checking (but not error handling)

Features:

TODO:

- [ ] Pass-through mode, that does NOT encode/decode anything. Great for development.
- [ ] MTE/MKE auto-switching, based on input size
- [ ] Keep alive, default timeout to keep an encoder in memory for, each encode/decode call can override this option
- [ ] ECDH helpers that are universal
- [ ] Generate instantiation values (entropy public key, entropy secret function, nonce, personalization)
