const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 128, 256, 512, 1024];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Read the SVG file
const svgPath = path.join(iconsDir, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  console.log('Generating PNG icons from SVG...');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Created icon-${size}.png`);
  }
  
  // Also create a default icon.png at 512px
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon.png'));
  
  console.log('✅ Created icon.png (512x512)');
  
  // Create macOS icns-compatible icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(iconsDir, 'icon-mac.png'));
  
  console.log('✅ Created icon-mac.png (1024x1024)');
  
  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
