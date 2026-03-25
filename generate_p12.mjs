import fs from 'fs';
import forge from 'node-forge';

try {
  console.log('Reading ios_distribution.cer and CrownCare.key...');
  const cerDer = fs.readFileSync('ios_distribution.cer', 'binary');
  const asn1 = forge.asn1.fromDer(cerDer);
  const cert = forge.pki.certificateFromAsn1(asn1);

  const pemKey = fs.readFileSync('CrownCare.key', 'utf8');
  const privateKey = forge.pki.privateKeyFromPem(pemKey);

  console.log('Building encrypted PKCS#12 bundle (.p12)...');
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
    privateKey, 
    cert, 
    'crowncare123', // Strong default password for CI/CD
    { generateLocalKeyId: true, friendlyName: 'CrownCare App Store Dist' }
  );

  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  fs.writeFileSync('CrownCare_Dist.p12', p12Der, 'binary');

  console.log('✅ Success! Created CrownCare_Dist.p12 (Password: crowncare123)');
} catch (error) {
  console.error('❌ Failed to create .p12:', error.message);
}
