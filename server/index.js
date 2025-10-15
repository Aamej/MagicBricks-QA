const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { CallQAAnalyzer } = require('./services/analyzer');
const { audioProcessor } = require('./services/audioProcessor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /\.(mp3|m4a|mp4|wav|webm|ogg)$/i;
        if (allowedTypes.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// Initialize analyzer (no API key needed for custom logic)
const analyzer = new CallQAAnalyzer();

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Voice Bot QA Analysis API is running'
    });
});

// Simple test endpoint for frontend connectivity
app.post('/api/test-connection', (req, res) => {
    console.log('🔗 Test connection request received');
    res.json({
        success: true,
        message: 'Connection successful!',
        timestamp: new Date().toISOString(),
        receivedData: req.body
    });
});

app.post('/api/analyze', upload.single('audioFile'), async (req, res) => {
    try {
        const { transcript, config } = req.body;
        
        console.log('📝 Received transcript type:', typeof transcript);
        console.log('📝 Transcript length:', transcript ? transcript.length : 'N/A');
        
        if (!transcript || typeof transcript !== 'string') {
            console.log('⚠️ Invalid transcript received:', transcript);
            return res.status(400).json({ 
                error: 'Valid transcript string is required',
                received: typeof transcript,
                value: transcript ? transcript.substring(0, 100) : null
            });
        }

        let audioData = null;
        let audioPath = null;

        // Handle audio file if provided
        if (req.file) {
            audioPath = req.file.path;
            console.log(`Processing audio file: ${req.file.originalname}`);
            
            try {
                audioData = await audioProcessor.processAudioFile(audioPath);
            } catch (audioError) {
                console.warn('Audio processing failed, continuing with transcript-only analysis:', audioError.message);
            }
        }

        // Parse configuration
        const analysisConfig = {
            silenceThreshold: parseFloat(config?.silenceThreshold) || 5.0,
            idealCallDurationMin: parseFloat(config?.idealCallDurationMin) || 1.0, // FIXED: Updated to 1 minute
            idealCallDurationMax: parseFloat(config?.idealCallDurationMax) || 3.5, // FIXED: Updated to 3.5 minutes
            repetitionSimilarityThreshold: parseFloat(config?.repetitionSimilarityThreshold) || 0.8
        };

        console.log('Starting analysis with config:', analysisConfig);

        // Perform analysis
        const results = await analyzer.analyzeCall(transcript, audioData, analysisConfig);

        // Clean up uploaded file
        if (audioPath && fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }

        console.log('📤 Sending response to frontend...');
        const response = {
            success: true,
            ...results,
            timestamp: new Date().toISOString()
        };

        res.json(response);
        console.log('✅ Response sent successfully!');

    } catch (error) {
        console.error('Analysis error:', error);
        
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/test-sample', async (req, res) => {
    try {
        const sampleTranscript = `Chat Bot: नमस्ते,मैं Kavya बोल रही हूँ Ghs Mastipur से. क्या मैं mahima devi से बात कर रही हूँ?
Human: Hello?
Human: Yes.
Chat Bot: अच्छा, हमने आपके school में career counseling की थी और हम आपसे school admission status के बारे में कुछ questions पूछना चाहते हैं ताकि हम आपको बेहतर support कर सकें. यह बस 2 मिनट लगेंगे.
Human: हां जी.
Chat Bot: Great. आपने कहा pass किया है, अब मुझे बताइए कि आपके Class Tenth board exams में कितने percentage आए थे?
Human: Tenth में आए थे मेरे
Chat Bot: आपके Class Tenth board exams में कितने percentage आए थे, कृपया exact percentage बताएं। For example, Seventy-Five या Eighty percent.
Human: मालूम नहीं है अभी.`;

        const config = {
            silenceThreshold: 5.0,
            idealCallDurationMin: 1.0, // FIXED: Updated to 1 minute
            idealCallDurationMax: 3.5, // FIXED: Updated to 3.5 minutes
            repetitionSimilarityThreshold: 0.8
        };

        const results = await analyzer.analyzeCall(sampleTranscript, null, config);

        res.json({
            success: true,
            ...results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sample test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
        }
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log('🌟 Voice Bot QA Analysis Server');
    console.log('=' .repeat(50));
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('✅ Custom AI logic configured (no external API needed)');
    console.log('✅ File upload configured');
    console.log('\nAvailable endpoints:');
    console.log(`  GET  /api/health - Health check`);
    console.log(`  POST /api/analyze - Analyze call with audio/transcript`);
    console.log(`  GET  /api/test-sample - Test with sample data`);
    console.log('=' .repeat(50));
});