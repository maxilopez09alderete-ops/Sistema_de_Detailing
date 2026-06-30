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
      
      // 1. Convert all Next.js static asset references (CSS, JS, etc.)
      content = content.replace(/([\'"\\\/])\/_next\//g, `$1${prefix}_next/`);
      
      // 2. Convert all absolute page links to relative .html files (supporting query params and anchors)
      content = content.replace(/href=["']\/reservar\??([^"']*)["']/g, `href="${prefix}reservar.html?$1"`);
      content = content.replace(/href=["']\/admin\/?["']/g, `href="${prefix}admin.html"`);
      content = content.replace(/href=["']\/admin\/login\/?["']/g, `href="${prefix}admin/login.html"`);
      content = content.replace(/href=["']\/#([^"']*)["']/g, `href="${prefix}index.html#$1"`);
      content = content.replace(/href=["']\/["']/g, `href="${prefix}index.html"`);

      // 3. Convert all absolute paths inside Next.js JS script strings (for router/hydration state)
      content = content.replace(/([\'"\\\/])\/reservar\??([^\'"\\]*)/g, `$1${prefix}reservar.html?$2`);
      content = content.replace(/([\'"\\\/])\/admin\/?([^\'"\\\\])/g, `$1${prefix}admin.html$2`);
      content = content.replace(/([\'"\\\/])\/admin\/login\/?([^\'"\\\\])/g, `$1${prefix}admin/login.html$2`);
      content = content.replace(/([\'"\\\/])\/#([^\'"\\]*)/g, `$1${prefix}index.html#$2`);
      content = content.replace(/([\'"\\\/])\/([\'"\\\\])/g, `$1${prefix}index.html$2`);
      
      // 4. Format HTML output from a single line into a readable multi-line structure
      content = content.replace(/></g, '>\n<');
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

if (fs.existsSync(outDir)) {
  processDirectory(outDir);
  console.log('Post-build absolute paths converted to relative paths and formatted successfully.');
} else {
  console.error('Out directory not found.');
}
