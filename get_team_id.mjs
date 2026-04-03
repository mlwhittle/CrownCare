import fs from 'fs';
import forge from 'node-forge';

try {
  const certDer = fs.readFileSync('C:\\Users\\mlwhi\\.gemini\\antigravity\\scratch\\crowncare\\ios_distribution.cer');
  const certDerBytes = certDer.toString('binary');
  const certAsn1 = forge.asn1.fromDer(certDerBytes);
  const cert = forge.pki.certificateFromAsn1(certAsn1);
  
  const ou = cert.subject.getField('OU').value;
  console.log('TEAM_ID=' + ou);
} catch(e) {
  console.error(e);
}
