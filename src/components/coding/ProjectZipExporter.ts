import JSZip from 'jszip';
import { FullStackProject } from '../../types/index.ts';

/**
 * Packages all project files into a structured ZIP archive matching the Laravel-like architecture
 * and triggers an automatic browser download.
 */
export async function exportProjectAsZip(project: FullStackProject): Promise<void> {
  const zip = new JSZip();

  // Add project metadata and documentation
  project.files.forEach((file) => {
    const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
    zip.file(cleanPath, file.content);
  });

  // Add .env.example if missing
  const hasEnv = project.files.some((f) => f.path.includes('.env'));
  if (!hasEnv) {
    zip.file(
      '.env.example',
      `PORT=3000\nNODE_ENV=production\nDATABASE_URL=postgresql://postgres:secret@localhost:5432/${project.slug}\nJWT_SECRET=super_secret_key\n`
    );
  }

  // Generate the ZIP file as a blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Trigger client download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${project.slug || 'good-learning-project'}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
