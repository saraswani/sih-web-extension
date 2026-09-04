/**
 * PrivacyShield - Automated Production Packaging Tool
 * Generates store-compliant, zero-bloat .zip archives for Chrome Web Store and Firefox Add-ons.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Lightweight pure-Node.js ZIP generator (No external dependencies required)
class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(relativePath, fileBuffer) {
    this.files.push({
      name: relativePath.replace(/\\/g, '/'),
      data: fileBuffer
    });
  }

  // Calculate standard CRC32
  crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      crc = (crc >>> 8) ^ this.table[(crc ^ byte) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  get table() {
    if (!this._table) {
      this._table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        this._table[i] = c >>> 0;
      }
    }
    return this._table;
  }

  build() {
    const fileHeaders = [];
    const centralDirectoryHeaders = [];
    let offset = 0;

    for (const file of this.files) {
      const nameBuf = Buffer.from(file.name, 'utf8');
      const uncompressedData = file.data;
      const compressedData = zlib.deflateRawSync(uncompressedData);
      const crc = this.crc32(uncompressedData);

      // Local File Header
      const header = Buffer.alloc(30);
      header.writeUInt32LE(0x04034b50, 0); // Signature
      header.writeUInt16LE(20, 4);         // Version needed (2.0)
      header.writeUInt16LE(0, 6);          // General purpose bit flag
      header.writeUInt16LE(8, 8);          // Compression method (8 = Deflate)
      header.writeUInt16LE(0, 10);         // Mod time
      header.writeUInt16LE(0, 12);         // Mod date
      header.writeUInt32LE(crc, 14);       // CRC32
      header.writeUInt32LE(compressedData.length, 18);   // Compressed size
      header.writeUInt32LE(uncompressedData.length, 22); // Uncompressed size
      header.writeUInt16LE(nameBuf.length, 26);          // File name length
      header.writeUInt16LE(0, 28);                       // Extra field length

      fileHeaders.push(header, nameBuf, compressedData);

      // Central Directory File Header
      const cdHeader = Buffer.alloc(46);
      cdHeader.writeUInt32LE(0x02014b50, 0); // Signature
      cdHeader.writeUInt16LE(20, 4);          // Version made by
      cdHeader.writeUInt16LE(20, 6);          // Version needed
      cdHeader.writeUInt16LE(0, 8);           // General purpose bit flag
      cdHeader.writeUInt16LE(8, 10);          // Compression method (8 = Deflate)
      cdHeader.writeUInt16LE(0, 12);          // Mod time
      cdHeader.writeUInt16LE(0, 14);          // Mod date
      cdHeader.writeUInt32LE(crc, 16);        // CRC32
      cdHeader.writeUInt32LE(compressedData.length, 20);   // Compressed size
      cdHeader.writeUInt32LE(uncompressedData.length, 24); // Uncompressed size
      cdHeader.writeUInt16LE(nameBuf.length, 28);          // File name length
      cdHeader.writeUInt16LE(0, 30);                       // Extra field length
      cdHeader.writeUInt16LE(0, 32);                       // File comment length
      cdHeader.writeUInt16LE(0, 34);                       // Disk number start
      cdHeader.writeUInt16LE(0, 36);                       // Internal file attributes
      cdHeader.writeUInt32LE(0, 38);                       // External file attributes
      cdHeader.writeUInt32LE(offset, 42);                  // Relative offset of local header

      centralDirectoryHeaders.push(cdHeader, nameBuf);

      offset += header.length + nameBuf.length + compressedData.length;
    }

    const cdStart = offset;
    let cdSize = 0;
    for (const buf of centralDirectoryHeaders) {
      cdSize += buf.length;
    }

    // End of Central Directory Record
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);                 // Signature
    eocd.writeUInt16LE(0, 4);                          // Disk number
    eocd.writeUInt16LE(0, 6);                          // Disk where central directory starts
    eocd.writeUInt16LE(this.files.length, 8);          // Number of central directory records on this disk
    eocd.writeUInt16LE(this.files.length, 10);         // Total number of central directory records
    eocd.writeUInt32LE(cdSize, 12);                    // Size of central directory
    eocd.writeUInt32LE(cdStart, 16);                   // Offset of start of central directory
    eocd.writeUInt16LE(0, 20);                         // Comment length

    return Buffer.concat([...fileHeaders, ...centralDirectoryHeaders, eocd]);
  }
}

// Function to gather all extension files recursively
function gatherFiles(rootDir) {
  const allowedExts = ['.js', '.json', '.html', '.css', '.png', '.svg', '.txt'];
  const allowedDirs = ['icons', 'lib', 'options', 'popup', 'styles', 'test'];
  const rootAllowedFiles = ['manifest.json', 'config.js', 'background.js', 'content.js'];

  const results = [];

  function walk(currentDir, relativeDir = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

      if (entry.isDirectory()) {
        // Skip node_modules, .git, server, dist, and other non-extension folders
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'server' || entry.name === 'dist') {
          continue;
        }
        if (!relativeDir && !allowedDirs.includes(entry.name)) {
          continue;
        }
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!relativeDir) {
          if (rootAllowedFiles.includes(entry.name)) {
            results.push({ fullPath, relPath });
          }
        } else {
          if (allowedExts.includes(ext)) {
            results.push({ fullPath, relPath });
          }
        }
      }
    }
  }

  walk(rootDir);
  return results;
}

function packageExtension() {
  const rootDir = __dirname;
  const distDir = path.join(rootDir, 'dist');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  console.log('========================================================================');
  console.log('📦 PrivacyShield - Building Production Extension Packages (Manifest V3)');
  console.log('========================================================================\n');

  const files = gatherFiles(rootDir);
  console.log(`Found ${files.length} extension production assets:`);

  // 1. Build Chrome Web Store Package
  const chromeZip = new SimpleZip();
  let totalRawBytes = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.fullPath);
    totalRawBytes += data.length;
    console.log(`  + [${(data.length / 1024).toFixed(1)} KB] ${file.relPath}`);
    chromeZip.addFile(file.relPath, data);
  }

  const chromeZipBuf = chromeZip.build();
  const chromeZipPath = path.join(distDir, 'privacyshield-chrome-v1.0.0.zip');
  fs.writeFileSync(chromeZipPath, chromeZipBuf);

  // 2. Build Firefox AMO Package
  const firefoxZip = new SimpleZip();
  for (const file of files) {
    const data = fs.readFileSync(file.fullPath);
    firefoxZip.addFile(file.relPath, data);
  }
  const firefoxZipBuf = firefoxZip.build();
  const firefoxZipPath = path.join(distDir, 'privacyshield-firefox-v1.0.0.zip');
  fs.writeFileSync(firefoxZipPath, firefoxZipBuf);

  console.log('\n------------------------------------------------------------------------');
  console.log('🎉 Production Packages Successfully Built:');
  console.log(`• Chrome Web Store:  dist/privacyshield-chrome-v1.0.0.zip (${(chromeZipBuf.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`• Firefox AMO:       dist/privacyshield-firefox-v1.0.0.zip (${(firefoxZipBuf.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`• Raw Assets Size:   ${(totalRawBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('========================================================================\n');
}

packageExtension();
