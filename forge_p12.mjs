import fs from 'fs';
import forge from 'node-forge';

try {
  console.log('Reading Private Key...');
  const privateKeyPem = fs.readFileSync('C:\\Users\\mlwhi\\.gemini\\antigravity\\scratch\\crowncare\\CrownCare.key', 'utf8');
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  console.log('Reading Apple Certificate (DER format)...');
  const certDer = fs.readFileSync('C:\\Users\\mlwhi\\.gemini\\antigravity\\scratch\\crowncare\\ios_distribution.cer');
  const certDerBytes = certDer.toString('binary');
  
  let cert;
  try {
    const certAsn1 = forge.asn1.fromDer(certDerBytes);
    cert = forge.pki.certificateFromAsn1(certAsn1);
  } catch(e) {
    console.log('DER parsing failed, trying PEM...');
    cert = forge.pki.certificateFromPem(certDer.toString('utf8'));
  }

  console.log('Fusing into PKCS#12...');
  const password = 'fuelflow';
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, cert, password, {
    generateLocalKeyId: true,
    friendlyName: 'Melvin Whittle iOS Distribution'
  });

  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  fs.writeFileSync('C:\\Users\\mlwhi\\.gemini\\antigravity\\scratch\\fuelflow\\FuelFlow_Dist.p12', Buffer.from(p12Der, 'binary'));
  
  console.log('SUCCESS! Created FuelFlow_Dist.p12 successfully.');
} catch(e) {
  console.error('FATAL ERROR:', e);
}
