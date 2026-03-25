import forge from 'node-forge';
import fs from 'fs';

console.log('Generatng 2048-bit RSA Key Pair...');
// Generate RSA key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

console.log('Creating Certificate Signing Request (CSR)...');
// Create a Certification Request (CSR)
const csr = forge.pki.createCertificationRequest();
csr.publicKey = keys.publicKey;
csr.setSubject([{
  name: 'commonName',
  value: 'CrownCare iOS Distribution'
}, {
  name: 'countryName',
  value: 'US'
}, {
  name: 'organizationName',
  value: 'CrownCare'
}]);

// Sign the CSR with the private key
csr.sign(keys.privateKey);

// Convert to PEM format
const pemCsr = forge.pki.certificationRequestToPem(csr);
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

// Write to files
fs.writeFileSync('CertificateSigningRequest.certSigningRequest', pemCsr);
fs.writeFileSync('CrownCare.key', pemKey);

console.log('✅ Success! Created CertificateSigningRequest.certSigningRequest and CrownCare.key in your folder.');
