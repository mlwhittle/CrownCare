const https = require('https');
const fs = require('fs');
const path = require('path');

// Decode docId URL:
const docIdUrl = "https://my.microsoftpersonalcontent.com/_api/v2.0/drives/b!TK62G0b_dkCwCXC95mW6lXcPXQSbWeRPs172_sjUUstGYa8ETr17TLV4oDvvx4DE/items/01SSMOZAMCGXTYA43YQJE2MAFO47FZVFBT?tempauth=v1e.eyJzaXRlaWQiOiIxYmI2YWU0Yy1mZjQ2LTQwNzYtYjAwOS03MGJkZTY2NWJhOTUiLCJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvbXkubWljcm9zb2Z0cGVyc29uYWxjb250ZW50LmNvbUA5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJleHAiOiIxNzgwMDEyMDA5In0.pIJimtBKn0BQhqM7bXrer7glaKb3pQxS37fn5w6Eqr6Op7a9mVfH6dRMkIQgDWC0H-zsVE-BlC5X5z6lZXbqzu1mNGdQ4vVz7ieOzvZ8XkRqPR-XxzmsDPULJmjLHctAn3OCERp02J0__3HmMOUmxv-lLBzVc3p6Yt5OXs0HUC-DDRV8mx4KEmc4wisbkjYpFY6KMHoW_rGYUvuf9f3gylL2rwxP6XAQI0peyNMSeIT2YP7AIfiCMP0veLaBqT-lR2T1lx24awtNrbF8EUSioPCar2sbHI-ZEG2tjW66rirEuQypLcFgckHEtH0AHawEwBw_BMK7VbynDXE66J1dxmzjnY0nYVaptlZ5VnRsd9YAY-wQHM1dRefyzMdcHssR54AYyf4UWEiS69FqM0PhJtHedFT1Xo7rYd-zja9EyggBBOUIj82-yUlkKVNhzbsTMtlXld4ZnIPPW0-DKZCKuPQlnrFdfMBAzPL97SvZMJ20KXZInABe8j5gfjD6MMUbQuGAe8JYzhhZLebfNoLQaQe0GIDlsx-TneIMafHevkcFCIvbUNrvfkqvHvB5P2-HGikaKCqeW5-QEETp6jB0Lxw6eUU7Nc3qcMB3-96mmmg.HT6xMvXyx6m6zN8uLO-q6MdGr0Ka0dxKgRCqiZsVDAE&version=Published&VroomTakeover=1";

console.log("Fetching item metadata...");
https.get(docIdUrl, (res) => {
  let data = "";
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Item JSON Metadata:", JSON.stringify(json, null, 2));
      
      const downloadUrl = json["@content.downloadUrl"] || (json["@microsoft.graph.downloadUrl"]);
      if (downloadUrl) {
        console.log("Found direct download URL:", downloadUrl);
        
        // Download the file
        const file = fs.createWriteStream(path.join(__dirname, 'public', 'professionals_video.mp4'));
        console.log("Downloading video...");
        https.get(downloadUrl, (downloadRes) => {
          // If redirect
          if (downloadRes.statusCode >= 300 && downloadRes.statusCode < 400 && downloadRes.headers.location) {
            console.log("Following redirect to:", downloadRes.headers.location);
            https.get(downloadRes.headers.location, (redirectRes) => {
              redirectRes.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log("Download complete! Saved to public/professionals_video.mp4");
              });
            });
          } else {
            downloadRes.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log("Download complete! Saved to public/professionals_video.mp4");
            });
          }
        });
      } else {
        console.log("Download URL not found in JSON.");
      }
    } catch (e) {
      console.error("Error parsing JSON:", e.message);
      console.log("Raw response:", data);
    }
  });
}).on('error', (err) => {
  console.error("HTTP request error:", err);
});
