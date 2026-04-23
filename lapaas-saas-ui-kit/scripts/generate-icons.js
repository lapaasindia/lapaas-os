const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using raw bytes (16x16 green square as placeholder)
// For production, use a proper icon generator

const sizes = [16, 32, 64, 128, 256, 512, 1024];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple HTML file that can be used to generate icons
const iconHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; }
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 20%;
    }
    .letter {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: bold;
      color: #22c55e;
    }
    .badge {
      position: absolute;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .check {
      color: white;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="icon" id="icon">
    <span class="letter">L</span>
    <div class="badge">
      <span class="check">✓</span>
    </div>
  </div>
  <script>
    const size = new URLSearchParams(window.location.search).get('size') || 512;
    const icon = document.getElementById('icon');
    icon.style.width = size + 'px';
    icon.style.height = size + 'px';
    document.querySelector('.letter').style.fontSize = (size * 0.5) + 'px';
    const badge = document.querySelector('.badge');
    badge.style.width = (size * 0.3) + 'px';
    badge.style.height = (size * 0.3) + 'px';
    badge.style.top = (size * 0.1) + 'px';
    badge.style.right = (size * 0.1) + 'px';
    document.querySelector('.check').style.fontSize = (size * 0.15) + 'px';
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(iconsDir, 'icon-generator.html'), iconHtml);

console.log('Icon generator HTML created at public/icons/icon-generator.html');
console.log('');
console.log('To generate PNG icons:');
console.log('1. Open icon-generator.html?size=512 in a browser');
console.log('2. Take a screenshot of the icon');
console.log('3. Save as icon-512.png');
console.log('');
console.log('Or use an online tool to convert the SVG to PNG');
