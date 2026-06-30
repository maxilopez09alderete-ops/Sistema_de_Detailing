const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Calculate relative depth to outDir to add correct relative path
      const relativeDepth = path.relative(directory, outDir);
      const prefix = relativeDepth === '' ? './' : relativeDepth.replace(/\\/g, '/') + '/';
      
      console.log(`Processing relative paths for ${filePath} with prefix: ${prefix}`);
      
      // Replace absolute next assets with relative paths
      content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
      content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);
      
      // Also in next initial state JSON-like script blocks
      content = content.replace(/"\/_next\//g, `"${prefix}_next/`);
      
      // Replace page link absolute paths with relative .html files
      content = content.replace(/href="\/reservar"/g, `href="${prefix}reservar.html"`);
      content = content.replace(/href="\/admin"/g, `href="${prefix}admin.html"`);
      content = content.replace(/href="\/admin\/login"/g, `href="${prefix}admin/login.html"`);
      content = content.replace(/href="\/"/g, `href="${prefix}index.html"`);
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

if (fs.existsSync(outDir)) {
  processDirectory(outDir);
  console.log('Post-build absolute paths converted to relative paths successfully.');
} else {
  console.error('Out directory not found.');
}
