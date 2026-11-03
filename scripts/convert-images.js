import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const imagesDir = './public/images';

async function convertToWebP(filePath) {
  if (!filePath.match(/\.(png|jpg|jpeg)$/i)) return;
  
  const outputPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  try {
    const info = await sharp(filePath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    const originalSize = statSync(filePath).size;
    const newSize = info.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${filePath} → ${outputPath} (${reduction}% smaller)`);
  } catch (err) {
    console.error(`✗ Failed: ${filePath}`, err.message);
  }
}

function walkDir(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.match(/\.(png|jpg|jpeg)$/i)) {
      convertToWebP(filePath);
    }
  }
}

console.log('Converting images to WebP...\n');
walkDir(imagesDir);
