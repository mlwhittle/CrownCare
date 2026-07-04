const fs = require('fs');
const path = require('path');

const badgeHtml = `
<div style="position: fixed; bottom: 20px; left: 20px; z-index: 9999;">
    <a href="https://www.producthunt.com/products/crowncare?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-crowncare" target="_blank" rel="noopener noreferrer"><img alt="CrownCare - Your client just left the salon. Now what? | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1184291&amp;theme=light&amp;t=1782798121364"></a>
</div>
</body>`;

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('api.producthunt.com/widgets/embed-image')) {
        console.log(`Badge already in ${filePath}`);
        return;
    }
    // Replace the first match of </body> (case-insensitive)
    content = content.replace(/<\/body>/i, badgeHtml);
    fs.writeFileSync(filePath, content);
    console.log(`Added badge to ${filePath}`);
};

const publicDir = path.join(__dirname, '..', 'public');
const files = fs.readdirSync(publicDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        processFile(path.join(publicDir, file));
    }
});

// Also do index.html in root
processFile(path.join(__dirname, '..', 'index.html'));
