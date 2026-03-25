import fs from 'fs';

try {
  const p12 = fs.readFileSync('CrownCare_Dist.p12');
  const p12Base64 = p12.toString('base64');
  
  const mobileProv = fs.readFileSync('CrownCare_App_Store_Profile.mobileprovision');
  const mobileProvBase64 = mobileProv.toString('base64');
  
  // Find the AuthKey_xxx.p8 file dynamically
  const files = fs.readdirSync('.');
  const p8File = files.find(f => f.startsWith('AuthKey_') && f.endsWith('.p8'));
  let p8Base64 = '';
  if (p8File) {
    const p8 = fs.readFileSync(p8File);
    p8Base64 = p8.toString('base64');
  }

  const output = `==== COPY THESE 3 VALUES INTO GITHUB SECRETS ====

SECRET 1: BUILD_CERTIFICATE_BASE64
${p12Base64}

SECRET 2: BUILD_PROVISION_PROFILE_BASE64
${mobileProvBase64}

SECRET 3: APP_STORE_CONNECT_API_KEY_BASE64
${p8Base64}

SECRET 4: P12_PASSWORD
crowncare123

SECRET 5: APP_STORE_CONNECT_KEY_ID
CJ43AZ8K98

SECRET 6: APP_STORE_CONNECT_ISSUER_ID
824eeccb-30b9-459e-b19e-f1dd1c2a1ee0
`;

  fs.writeFileSync('GITHUB_SECRETS.txt', output);
  console.log('Successfully wrote GITHUB_SECRETS.txt!');
} catch(err) {
  console.error('Error generating secrets:', err.message);
}
