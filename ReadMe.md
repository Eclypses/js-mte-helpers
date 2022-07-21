# MTE Helpers

The goal of this package is to make MTE as simple and easy to use as possible.

- Instantiating MTE WASM
- Providing Sensible defaults, with overrides
- Encoding/Decoding
- Managing State
- Handles Error Checking (but not error handling)

Sections:
Quick Start section
Advanced

- Best Practices
- Core Functions
  Examples
- Elliptical Curve Diffie Helman
- Encode JSON
- Encode Files
  API Docs section
  Development section

Features:

TODO:

- [x] Pass-through mode, that does NOT encode/decode anything. Great for development.
- [ ] First-in, First-out queue for managing requests.
- [ ] MTE/MKE auto-switching, based on input size
- [ ] ECDH Helpers that are universal- Work in Browser and NodeJS, without dependencies
- [ ] Generate instantiation values (entropy public key, entropy secret function, nonce, personalization)

- What is the Web MTE Helper package?
  - It is a package with two modules:
    - Core Functions: A suite of common MTE functions that follow best practices, catch and throw errors, provide a typesafe API.
    - Managed MTE: A "batteries included" state management library that assigns each encoder/decoder a unique key, and exposes a simple API for accessing MTE functions. Supports in-memory management, and provides an storage-agnostic plugin API.
- Why make this package?
  - When using MTE, I almost always rewrite the same helpers with very little variation, often copying from project to project with no changes. I do this for both common MTE helper functions, and also for my MTE state management solution. It's tedious, and time consuming, and it's code that our clients don't need to write. I decided that I wanted to make a package where I could write useful, reusable logic, one time and then use it in any project.
- What are the Core function?
  - The Core Functions module contains a suite of functions that encapsulate a series of common MTE logic. For example, after decoding a message, checking the result status before using the result value - this logic is written every them, in every application. No more!
- What is the MAnaged MTE module?
  - The goal of the managed MTE module is to make MTE ass easy as possible to use. This includes:
    - Simple, minimal API
    - Secure Defaults
    - Follows best practices
    - Catch and throw errors appropriately
    - Provide state-management solution
    - State-management solution plug-in API
- Does every have to use this package?
  - No! MTE implementors always have the option to roll their own solution, and we have many detailed guides on how to do it. Although I hope this package can accomodate most web use cases.
