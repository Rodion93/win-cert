win-cert
======

[![Build Status](https://travis-ci.org/Rodion93/win-cert.svg?branch=master)](https://travis-ci.org/Rodion93/win-cert) [![Coverage Status](https://coveralls.io/repos/github/Rodion93/win-cert/badge.svg?branch=master)](https://coveralls.io/github/Rodion93/win-cert?branch=master)

win-cert - Library for obtaining certificates from the Windows certificate store.

ATTENTION - If you want to get one certificate, your certificate must be marked as exported 
and must be imported properly (the key must be stored in the right place), otherwise the method 
returns a certificate with an empty private key.

Init
===========

```bash
npm install win-cert
```
or 
```bash
yarn add win-cert
```

API
===========

### getCertificate

Returns certificate and private key in PEM format.
Options are required;

```javascript
const winCert = require('win-cert');

...

const options = {
  storeName: 'My',
  storeLocation: 'CurrentUser',
  thumbprint: '098d3.....'
};

const certAndKey = await winCert.getCertificate(options);

certAndKey.cert;
certAndKey.key;

```

### getAllCertificates

Returns all certificates as objects. Options are not required.

The returned object `certs` is a object like this:

```json
{
  "subject": "CN=hello.com, O=Internet Widgits Pty Ltd, S=Some-State, C=AU",
  "issuer": "foo bar",
  "thumbprint": "...",
  "pem": "-----BEGIN CERTIFICATE-----\nMIID9DCCAtygAwIBAgIJANWBEUdUZOlPMA0GCSqGSIb3DQEBBQUAMFkxCzAJBgNV..."
}
```

```javascript
const winCert = require('win-cert');

...

const options = {
  storeName: 'My',
  storeLocation: 'CurrentUser'
};

const certificates = await winCert.getAllCertificates(options);

certificates.forEach(cert => {
  console.log(cert);
});

```

Example application
===========

```javascript
const winCert = require('win-cert');
const express = require('express');
const https = require('https');

const main = async () => {
  const certAndKey = await winCert.getCertificate({
    storeName: 'Root',
    storeLocation: 'LocalMachine',
    thumbprint: 'Your thumbprint'
  });

  const options = {
    cert: certAndKey.cert,
    key: certAndKey.key,
    ca: certAndKey.cert,
    requestCert: true,
    rejectUnauthorized: false
  };

  const app = express();

  https
    .createServer(options, app)
    .listen(44331, () => console.log('Server started listening'));
};

main();
```

or

```javascript
const winCert = require('win-cert');

const main = async () => {
  const allCerts = await winCert.getAllCertificates({
    storeName: 'Root',
    storeLocation: 'CurrentUser'
  });

  allCerts.forEach(cert => console.log(cert));
};

main();
```

License
=======

MIT