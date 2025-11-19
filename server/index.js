const express = require('express');
const cors = require('cors');
const youtubedl = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Create temp directory if not exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity
        methods: ["GET", "POST"]
    }
});

// Endpoint to get video information
app.get('/info', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const output = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        const info = {
            title: output.title,
            thumbnail: output.thumbnail,
            duration: output.duration,
            channel: output.uploader,
        };

        res.json(info);
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

// Start conversion job
app.post('/convert', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const jobId = uuidv4();
    const outputPath = path.join(tempDir, `${jobId}.mp3`);
    // const outputPath = path.join(tempDir, `${jobId}.mp3`); // This line is removed

    res.json({ jobId }); // Return Job ID immediately

    console.log(`Starting job ${jobId} for ${url}`);

    try {
        console.log('ffmpegPath:', ffmpegPath);
        const process = youtubedl.exec(url, {
            output: path.join(tempDir, `${jobId}.%(ext)s`), // Changed to dynamic extension
            format: 'bestaudio',
            extractAudio: true,
            audioFormat: 'mp3',
            ffmpegLocation: ffmpegPath,
            noPlaylist: true,
        });

        process.stdout.on('data', (data) => {
            const output = data.toString();
            const lines = output.split('\n');

            lines.forEach(line => {
                // Match percentage (e.g., 45.0%)
                const match = line.match(/(\d+\.\d+)%/);
                if (match) {
                    const percent = parseFloat(match[1]);
                    // Avoid sending too many updates (e.g., only if changed by > 1% or is 100%)
                    io.emit(`progress-${jobId}`, { percent, status: 'Downloading...' });
                }

                // Check for conversion status
                if (line.includes('[ExtractAudio]')) {
                    io.emit(`progress-${jobId}`, { percent: 100, status: 'Converting to MP3...' });
                }
            });
        });

        process.stderr.on('data', (data) => {
            // yt-dlp sometimes writes progress to stderr too
            const output = data.toString();
            // Log stderr for debugging
            console.error(`[yt-dlp stderr]: ${output}`);
        });

        await process; // Wait for completion

        console.log(`Job ${jobId} completed. Searching for file...`);

        // Find file starting with jobId
        const files = fs.readdirSync(tempDir);
        const foundFile = files.find(f => f.startsWith(jobId));

        if (foundFile) {
            console.log(`File found: ${foundFile}`);
            // Rename to final expected path if needed, or just serve this
            // For simplicity, we'll just use this file for download
            // But we need to tell the client or just rename it to jobId.mp3

            const finalPath = path.join(tempDir, `${jobId}.mp3`);
            if (foundFile !== `${jobId}.mp3`) {
                fs.renameSync(path.join(tempDir, foundFile), finalPath);
            }

            io.emit(`progress-${jobId}`, { percent: 100, status: 'Completed' });
        } else {
            console.error(`File NOT found for job ${jobId}`);
            console.log('Files in temp:', files);
            io.emit(`progress-${jobId}`, { percent: 0, status: 'Failed', error: 'File creation failed' });
        }

    } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        io.emit(`progress-${jobId}`, { percent: 0, status: 'Failed', error: error.message });
    }
});

// Download completed file
app.get('/download/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const filePath = path.join(tempDir, `${jobId}.mp3`);

    if (fs.existsSync(filePath)) {
        res.download(filePath, 'audio.mp3', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            } else {
                // Optional: Delete file after download
                // fs.unlinkSync(filePath); 
                // Keeping it simple for now, maybe implement cleanup cron later
            }
        });
    } else {
        res.status(404).json({ error: 'File not found or expired' });
    }
});

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
