const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace CSS variables
    content = content.replace(/--rose/g, '--blue');
    content = content.replace(/--mauve/g, '--gold');
    content = content.replace(/--plum/g, '--sky');

    // Replace badge classes
    content = content.replace(/badge-rose/g, 'badge-blue');
    content = content.replace(/badge-mauve/g, 'badge-gold');
    content = content.replace(/badge-plum/g, 'badge-sky');

    fs.writeFileSync(file, content);
});
console.log('Renaming complete.');
