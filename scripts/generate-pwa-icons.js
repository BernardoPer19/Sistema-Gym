/**
 * Script para generar iconos de PWA usando sharp
 * Genera iconos básicos con el logo de GYM PRO
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Tamaños de iconos necesarios para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Función para crear un icono SVG
function createIconSVG(size) {
  const fontSize = Math.floor(size * 0.25);
  const padding = Math.floor(size * 0.1);
  
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">GYM</text>
  <text x="50%" y="${50 + fontSize * 0.4}%" font-family="Arial, sans-serif" font-size="${Math.floor(fontSize * 0.6)}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PRO</text>
</svg>`;
}

async function generateIcons() {
  const publicDir = path.join(process.cwd(), "public");
  
  console.log("Generando iconos PWA...");
  
  for (const size of sizes) {
    try {
      const svg = createIconSVG(size);
      const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(iconPath);
      
      console.log(`✓ Generado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error generando icono ${size}x${size}:`, error);
    }
  }
  
  // Crear también favicon.ico
  try {
    const faviconSvg = createIconSVG(32);
    const faviconPath = path.join(publicDir, "favicon.ico");
    
    await sharp(Buffer.from(faviconSvg))
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace(".ico", ".png"));
    
    console.log("✓ Generado: favicon.png");
  } catch (error) {
    console.error("Error generando favicon:", error);
  }
  
  console.log("\n✅ Iconos PWA generados exitosamente!");
  console.log("NOTA: Puedes reemplazar estos iconos con diseños personalizados más adelante.");
}

generateIcons().catch(console.error);

