const LEONARDO_API_KEY = "935bbf29-f07a-44d1-ac9d-a4f4e03272fc";
const META_USER_ACCESS_TOKEN = "EAAaNyYE4qE8BRNo8Hl0ikX8KCHLTtO4ZCJYLuUpdliEVzaMkrrWBDEkRCzqW9fpeVJlJQAdFwrMKkuaZAHU6AerKjEb8ivc5LTbrBwvb72Hwl8dzMyCVzVKwfHJM7EmCmJ0fWWVSzHZAKvycdGtvywZA2tuytggrHuZAxcfdEEcf0RrQgQR7n3HMgOt7xBZC6kJcuG8HTpZBQZDZD";
const TARGET_PAGE_ID = "955839617620959"; // Melvin's Social Studio

async function testPipeline() {
    console.log("🚀 INITIALIZING AUTONOMOUS MARKETING ENGINE (TEST RUN) 🚀");
    try {
        const caption = "Discover the ultimate in Clinical Luxury Haircare & Alopecia Solutions! 🚀 Hit the link in the bio to join the CrownCare family! ✨🌿 #CrownCare #HealthyHair #Regrowth";
        const prompt = "A stunning, hyper-realistic high-fashion portrait of a confident woman with beautiful natural hair in a luxury clinic, extreme detail, cinematic lighting, 8k resolution, photorealistic.";
        
        console.log(`\n🔑 [OAUTH HANDSHAKE]: Retrieving secure Page Access Token from Meta Graph API...`);
        const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${META_USER_ACCESS_TOKEN}`);
        const accountsData = await accountsRes.json();
        
        const targetPage = accountsData?.data?.find(p => p.id === TARGET_PAGE_ID);
        if (!targetPage || !targetPage.access_token) {
            throw new Error("Could not extract Page Access Token. Ensure the user token has pages_show_list permissions.");
        }
        const PAGE_ACCESS_TOKEN = targetPage.access_token;
        console.log(`✅ Extracted Page Token for: ${targetPage.name}`);

        console.log(`\n1️⃣ [GENERATION PHASE]: Sending visual prompt to Leonardo AI...`);
        console.log(`Prompt: "${prompt}"`);

        // 1. Init Leonardo Generation
        const initRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${LEONARDO_API_KEY}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                alchemy: true,
                height: 1024,
                width: 1024,
                num_images: 1,
                prompt: prompt,
                modelId: "e316348f-7773-490e-adcd-46757c738eb7", 
                presetStyle: "CINEMATIC"
            })
        });

        const generationData = await initRes.json();
        const generationId = generationData.sdGenerationJob?.generationId;
        console.log(`🟢 Leonardo Rendering Initialized (Job: ${generationId}). Waiting 15 seconds...`);

        // 2. Wait for rendering
        await new Promise(r => setTimeout(r, 15000));

        // 3. Fetch Image URL
        const resultRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'authorization': `Bearer ${LEONARDO_API_KEY}`
            }
        });

        const resultData = await resultRes.json();
        const imageUrl = resultData?.generations_by_pk?.generated_images?.[0]?.url;

        if (!imageUrl) {
            throw new Error("Leonardo AI failed to compile the image or timed out.");
        }

        console.log(`\n2️⃣ [MEDIA COMPILED]: Successfully rendered high-fidelity asset!`);
        console.log(`\n3️⃣ [PUBLISHING PHASE]: Dispatching asset & caption to Melvin's Social Studio Graph API Endpoint...`);

        // 4. Push to Facebook Page
        const fbUrl = `https://graph.facebook.com/v19.0/${TARGET_PAGE_ID}/photos`;
        const fbRes = await fetch(fbUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl, message: caption, access_token: PAGE_ACCESS_TOKEN })
        });

        const fbData = await fbRes.json();
        if (fbData.error) {
            console.error('\n==== FACEBOOK GRAPH API ERROR ====');
            console.error(JSON.stringify(fbData.error, null, 2));
            console.error('==================================\n');
            throw new Error(`Meta Graph API Rejected Payload.`);
        }

        console.log(`\n✅ [MISSION COMPLETE]: Asset successfully broadcast to Facebook Feed!`);
        console.log(`Graph API Post ID: ${fbData.id}`);
        console.log(`\nCheck your Melvin's Social Studio Facebook Page NOW!`);

    } catch (e) {
        console.error("\n❌ FATAL PIPELINE ERROR:", e.message);
    }
}

testPipeline();
