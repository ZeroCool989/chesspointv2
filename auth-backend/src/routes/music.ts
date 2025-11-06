import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Proxy route for Google Drive music files
 * Fetches files from Google Drive and streams them with proper CORS headers
 * This bypasses CORS restrictions that prevent direct audio playback
 * 
 * GET /music/:fileId - Stream audio file from Google Drive
 */
router.get('/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId || fileId === 'YOUR_FILE_ID_2' || fileId === 'YOUR_FILE_ID_3' || fileId === 'YOUR_FILE_ID_4') {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    console.log(`[Music Proxy] Fetching file: ${fileId}`);

    // Google Drive direct download URL
    // For large files (>25MB), Google Drive may require virus scan bypass
    // Try multiple URL formats to handle large files
    const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    const altDriveUrl = `https://drive.google.com/u/0/uc?export=download&id=${fileId}&confirm=t`;
    // Alternative for large files: use the view URL and extract download link
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    console.log(`[Music Proxy] Google Drive URL: ${driveUrl}`);

    // Fetch the file from Google Drive
    let response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow', // Follow redirects
    });

    console.log(`[Music Proxy] Response status: ${response.status} ${response.statusText}`);
    console.log(`[Music Proxy] Content-Type: ${response.headers.get('content-type')}`);
    console.log(`[Music Proxy] Content-Length: ${response.headers.get('content-length')}`);

    // Get content type from response
    let contentType = response.headers.get('content-type') || '';
    
    // Check if Google Drive returned HTML instead of audio (virus scan warning for large files)
    if (contentType.includes('text/html')) {
      // For large files (>25MB), Google Drive shows a virus scan warning page
      // We need to extract the download confirmation token and make a second request
      const responseClone = response.clone();
      const html = await responseClone.text().catch(() => 'Unable to read response');
      
      console.log(`[Music Proxy] Google Drive returned HTML (likely virus scan warning for large file)`);
      console.log(`[Music Proxy] Response preview: ${html.substring(0, 500)}`);
      
      // Extract download confirmation token from HTML
      // Google Drive virus scan warning page contains a form with download link
      const downloadMatch = html.match(/href="([^"]*uc[^"]*export=download[^"]*confirm=[^"]*)"/);
      const tokenMatch = html.match(/name="download_warning_token" value="([^"]*)"/);
      
      if (downloadMatch || tokenMatch) {
        // Try to extract the direct download link from the HTML
        // Sometimes the HTML contains a redirect to the actual download
        const directDownloadMatch = html.match(/window\.location\.href\s*=\s*["']([^"']*uc[^"']*export=download[^"']*)["']/);
        
        if (directDownloadMatch) {
          const actualDownloadUrl = directDownloadMatch[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
          console.log(`[Music Proxy] Found direct download link in HTML, retrying...`);
          
          // Make second request with the extracted download URL
          response = await fetch(actualDownloadUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            redirect: 'follow',
          });
          
          contentType = response.headers.get('content-type') || '';
          console.log(`[Music Proxy] Second request status: ${response.status}`);
          console.log(`[Music Proxy] Second request Content-Type: ${contentType}`);
        } else if (tokenMatch) {
          // Build URL with confirmation token
          const confirmToken = tokenMatch[1];
          const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
          console.log(`[Music Proxy] Found confirmation token, retrying with token...`);
          
          response = await fetch(confirmUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            redirect: 'follow',
          });
          
          contentType = response.headers.get('content-type') || '';
          console.log(`[Music Proxy] Confirmed download status: ${response.status}`);
          console.log(`[Music Proxy] Confirmed download Content-Type: ${contentType}`);
        }
      }
      
      // If still HTML after retry, it's likely an access issue
      if (contentType.includes('text/html')) {
        const finalCheck = await response.clone().text().catch(() => '');
        if (finalCheck.includes('<html') || finalCheck.includes('Access denied') || finalCheck.includes('Sign in')) {
          console.error(`[Music Proxy] Still getting HTML after retry - file may not be accessible`);
          return res.status(403).json({ 
            error: 'File not accessible or requires virus scan',
            fileId: fileId,
            message: 'This file may not be publicly shared or Google Drive is blocking access. For large files (>25MB), Google Drive may require manual virus scan confirmation. Please check the file sharing settings in Google Drive and make sure it\'s set to "Anyone with the link can view".',
          });
        }
      }
    }

    if (!response.ok) {
      console.error(`[Music Proxy] Failed to fetch from Google Drive: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`[Music Proxy] Error response: ${errorText.substring(0, 500)}`);
      return res.status(response.status).json({ 
        error: 'Failed to fetch file from Google Drive',
        status: response.status,
        fileId: fileId,
        details: errorText.substring(0, 200),
      });
    }
    
    // Validate Content-Type is actually audio
    if (!contentType.includes('audio/') && !contentType.includes('application/octet-stream') && !contentType.includes('video/')) {
      console.error(`[Music Proxy] Invalid Content-Type: ${contentType} for file: ${fileId}`);
      // Try to peek at response to see what we got
      const responseClone = response.clone();
      const preview = await responseClone.text().catch(() => 'Unable to read').then(t => t.substring(0, 200));
      console.error(`[Music Proxy] Response preview: ${preview}`);
      return res.status(500).json({ 
        error: 'Invalid file type - expected audio',
        fileId: fileId,
        contentType: contentType,
        message: 'Google Drive returned an unexpected file type. The file may not be publicly accessible or may be a different format.',
      });
    }
    
    // Use the content type or default to audio/mpeg
    const finalContentType = contentType || 'audio/mpeg';

    // Set CORS headers to allow audio playback
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    
    // Set content type for audio streaming
    res.setHeader('Content-Type', finalContentType);
    
    // Enable range requests for seeking
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // Stream the file to the client
    // For Node.js 18+, fetch returns a ReadableStream
    // Convert it to a Node.js stream for Express
    if (!response.body) {
      return res.status(500).json({ error: 'No response body from Google Drive' });
    }

    // Handle range requests (for seeking in audio player)
    const range = req.headers.range;
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength, 10) - 1;
      const chunkSize = (end - start) + 1;

      res.status(206); // Partial Content
      res.setHeader('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      res.setHeader('Content-Length', chunkSize.toString());
      
      // For range requests, we need to fetch with Range header
      // Re-fetch with range header from Google Drive
      const rangeResponse = await fetch(driveUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Range': `bytes=${start}-${end}`,
        },
      });

      if (rangeResponse.ok && rangeResponse.body) {
        const { Readable } = require('stream');
        const reader = rangeResponse.body.getReader();
        
        const nodeStream = new Readable({
          read() {
            reader.read().then(({ done, value }) => {
              if (done) {
                this.push(null);
              } else {
                this.push(Buffer.from(value));
              }
            }).catch((err) => {
              this.destroy(err);
            });
          }
        });
        
        nodeStream.pipe(res);
        return;
      }
    }

    // No range request - stream full file
    const { Readable } = require('stream');
    const reader = response.body.getReader();
    
    const nodeStream = new Readable({
      read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            this.push(null);
          } else {
            this.push(Buffer.from(value));
          }
        }).catch((err) => {
          this.destroy(err);
        });
      }
    });
    
    nodeStream.pipe(res);
  } catch (error) {
    console.error('Error proxying music file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

