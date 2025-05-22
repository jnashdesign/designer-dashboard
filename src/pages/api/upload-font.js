import { createCanvas } from 'canvas';
import opentype from 'opentype.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('font');

    if (!file) {
      return res.status(400).json({ error: 'No font file provided' });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save to temp file (opentype.js works better with files)
    const tempPath = join(tmpdir(), `font-${Date.now()}.${file.name.split('.').pop()}`);
    await writeFile(tempPath, buffer);

    // Load and process the font
    const font = await opentype.load(tempPath);

    // Generate preview
    const canvas = createCanvas(400, 100);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate font size and position
    const fontSize = 48;
    const path = font.getPath('AaBbCc123', 0, 0, fontSize);
    const bbox = path.getBoundingBox();
    
    // Center the text
    const x = (canvas.width - bbox.width) / 2;
    const y = (canvas.height + bbox.height) / 2;
    
    // Draw text
    ctx.fillStyle = '#000000';
    path.translate(x, y);
    path.draw(ctx);

    // Extract metadata
    const metadata = {
      fullName: font.names.fullName?.en || font.names.postScriptName?.en || 'Unknown',
      familyName: font.names.fontFamily?.en || font.names.preferredFamily?.en || 'Unknown',
      subFamilyName: font.names.fontSubfamily?.en || font.names.preferredSubfamily?.en || 'Unknown',
      copyright: font.names.copyright?.en || '',
      version: font.names.version?.en || '1.0'
    };

    // Return the preview and metadata
    res.status(200).json({
      preview: canvas.toDataURL('image/png'),
      metadata
    });

  } catch (error) {
    console.error('Error processing font:', error);
    res.status(500).json({ error: 'Failed to process font file' });
  }
} 