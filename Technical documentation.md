# Voice Bot Call QA Analyzer - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [API Reference](#api-reference)
5. [Analysis Components](#analysis-components)
6. [Configuration](#configuration)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

## System Overview

The Voice Bot Call QA Analyzer is a comprehensive system for evaluating voice bot conversation quality. It provides automated analysis across multiple dimensions:

- **Silence Detection**: Identifies problematic pauses in conversations
- **Repetition Analysis**: Detects redundant or scripted responses
- **Intent Flow Analysis**: Maps conversation progression and quality
- **Call Duration Analysis**: Assesses call duration optimization with gradual penalties (2-4.5 min ideal range)
- **Response Latency Analysis**: Measures bot response times with industry standards (max 3 violations allowed)
- **Comprehensive Scoring**: Weighted quality metrics

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  External APIs  │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (OpenAI)      │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - Analysis      │    │ - Intent        │
│ - File Upload   │    │ - Audio Proc.   │    │   Detection     │
│ - Visualization │    │ - Scoring       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Backend:**
- Node.js with Express.js
- OpenAI API for intent detection
- FFmpeg for audio processing
- Multer for file handling

**Frontend:**
- React 18 with hooks
- Recharts for data visualization
- React Dropzone for file uploads
- Responsive CSS design

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key
- FFmpeg (automatically installed via ffmpeg-static)

### Quick Installation

```bash
# Clone repository
git clone <repository-url>
cd voice-bot-qa-system

# Run installation script (Windows)
install.bat

# Or install manually
npm install
cd server && npm install
cd ../client && npm install
```

### Environment Configuration

Create `server/.env`:
```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=5000
NODE_ENV=development
```

### Starting the Application

```bash
# Start both frontend and backend
npm run dev

# Or start separately
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm start
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Reference

### Endpoints

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Voice Bot QA Analysis API is running"
}
```

#### `POST /api/analyze`
Main analysis endpoint for processing audio and transcript.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `audioFile` (optional): Audio file (MP3, M4A, MP4, WAV, WebM, OGG)
  - `transcript` (required): Call transcript text
  - `config` (optional): JSON configuration object

**Configuration Object:**
```json
{
  "silenceThreshold": 5.0,
  "idealCallDurationMin": 2.0,
  "idealCallDurationMax": 4.0,
  "repetitionSimilarityThreshold": 0.8
}
```

**Response:**
```json
{
  "success": true,
  "overallScore": 85.5,
  "callDuration": 3.2,
  "silenceViolations": [...],
  "repetitions": [...],
  "intentFlow": [...],
  "latencyAnalysis": {...},
  "scoreBreakdown": {...},
  "visualizationData": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/test-sample`
Test endpoint with sample data for demonstration.

**Response:** Same as `/api/analyze` with sample results.

## Recent Improvements (v2.0)

### Enhanced Analysis System

#### Improved Latency Analysis
- **Dual Analysis Approach**: Separated call duration and response latency into distinct metrics
- **Realistic Penalty Scoring**: Replaced harsh cutoffs with gradual penalties
  - 8-minute calls now score 50 points instead of 0
  - 12.5 points deducted per minute over ideal range
  - Minimum score of 15 points to recognize effort
- **Industry-Standard Response Time Analysis**: 
  - 5-second maximum response time threshold
  - Maximum 3 violations allowed per conversation (updated for flexibility)
  - Severe violation tracking (>10 seconds)

#### Fixed Critical Steps Logic
- **Unique Step Counting**: Fixed "9/7" display issue by counting unique critical step types
- **Better Accuracy**: Now shows meaningful ratios like "5/7" or "6/7"
- **Improved UI**: More accurate representation of conversation coverage

#### Updated Scoring Weights
- **Repetition Avoidance**: 25% (increased from 20%)
- **Call Duration Optimization**: 10% (reduced from 25%)
- **Response Latency Optimization**: 15% (increased from 10%)
- **Intent Flow Accuracy**: 25% (reduced from 30%)
- **Better Balance**: More realistic reflection of voice agent performance

## Analysis Components

### 1. Silence Detection

**Purpose:** Identify silence periods that exceed acceptable thresholds.

**Implementation:**
```javascript
detectSilenceSegments(audioData, config) {
  // Audio processing with FFmpeg
  // Silence detection using amplitude analysis
  // Returns array of silence violations
}
```

**Output Format:**
```json
{
  "startTime": 45.2,
  "endTime": 51.8,
  "duration": 6.6,
  "speaker": "bot"
}
```

### 2. Repetition Analysis

**Purpose:** Detect similar bot responses that may indicate scripted behavior.

**Algorithm:** Levenshtein distance-based similarity calculation.

**Implementation:**
```javascript
detectRepetitions(transcript, config) {
  // Extract bot turns from transcript
  // Calculate similarity between all pairs
  // Return repetitions above threshold
}
```

**Output Format:**
```json
{
  "turn1": 3,
  "turn2": 7,
  "similarityScore": 0.85,
  "text1": "First response text",
  "text2": "Similar response text"
}
```

### 3. Intent Detection

**Purpose:** Analyze conversation flow and intent progression.

**Method:** OpenAI GPT-3.5-turbo with fallback keyword detection.

**MagicBricks Conversation Steps:**
- initial_greeting, interest_check, agent_connection_offer
- call_transfer, callback_scheduling, objection_handling
- voicemail_response, wrong_number_handling, goodbye

**Implementation:**
```javascript
async detectIntents(transcript) {
  // Parse transcript into turns
  // Analyze each turn with OpenAI API
  // Apply fallback detection if API fails
  // Return intent mappings with confidence
}
```

**Output Format:**
```json
{
  "turnNumber": 1,
  "speaker": "bot",
  "text": "नमस्ते, मैं Kavya बोल रही हूँ...",
  "detectedIntent": "greeting_and_identification",
  "confidence": 0.95,
  "conversationStep": "greeting"
}
```

### 4. Call Duration Analysis

**Purpose:** Evaluate call duration against ideal ranges with realistic penalty scoring.

**Implementation:**
```javascript
analyzeCallDuration(audioData, config) {
  // Calculate total duration
  // Compare against ideal range (2-4 minutes)
  // Apply gradual penalty scoring
  // Never score below 15 points
}
```

**Scoring Logic:**
- **Too Short**: 15 points deducted per minute under ideal minimum
- **Too Long**: 11 points deducted per minute over ideal maximum (updated for 4.5 min range)
- **Minimum Score**: 15 points (recognizes effort)

**Output Format:**
```json
{
  "totalDurationMinutes": 3.2,
  "idealRangeMin": 2.0,
  "idealRangeMax": 4.0,
  "withinIdealRange": true,
  "deviationFromIdeal": 0,
  "status": "optimal"
}
```

### 5. Response Latency Analysis

**Purpose:** Measure bot response times against industry standards.

**Implementation:**
```javascript
analyzeResponseLatency(transcript) {
  // Parse conversation turns
  // Measure response time between human and bot turns
  // Apply 5-second threshold with max 2 violations
  // Calculate average response time
}
```

**Industry Standards:**
- **Response Time Threshold**: 5 seconds maximum
- **Max Allowed Violations**: 3 per conversation (updated for better flexibility)
- **Severity Levels**: 
  - Moderate: 5-10 seconds
  - Severe: >10 seconds (additional penalty)

**Output Format:**
```json
{
  "responseTimes": [...],
  "latencyViolations": [...],
  "averageResponseTime": 3.2,
  "totalViolations": 1,
  "maxAllowedViolations": 3,
  "responseTimeThreshold": 5.0,
  "latencyScore": 85,
  "status": "optimal"
}
```

## Configuration

### Analysis Parameters

```javascript
const defaultConfig = {
  silenceThreshold: 5.0,              // Seconds
  idealCallDurationMin: 2.0,          // Minutes
  idealCallDurationMax: 4.5,          // Minutes
  repetitionSimilarityThreshold: 0.8  // 0.0-1.0
};
```

### Scoring Weights

```javascript
const weights = {
  silenceCompliance: 0.25,           // 25%
  repetitionAvoidance: 0.25,         // 25%
  callDurationOptimization: 0.10,    // 10%
  responseLatencyOptimization: 0.15, // 15%
  intentFlowAccuracy: 0.25           // 25%
};
```

### File Upload Limits

```javascript
const uploadConfig = {
  maxFileSize: 100 * 1024 * 1024,  // 100MB
  allowedTypes: /\.(mp3|m4a|mp4|wav|webm|ogg)$/i,
  tempDirectory: './uploads'
};
```

## Usage Examples

### Basic Analysis with Transcript Only

```javascript
const formData = new FormData();
formData.append('transcript', `
Chat Bot: "Namaste, मैं Rahul बोल रहा हूँ, Magicbricks से..."
Human: Hello.
Chat Bot: जी. आपने recently हमारे platform पर कुछ properties में interest दिखाया था...
`);

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});

const results = await response.json();
console.log('Overall Score:', results.overallScore);
```

### Analysis with Audio File

```javascript
const formData = new FormData();
formData.append('audioFile', audioFile);
formData.append('transcript', transcript);
formData.append('config', JSON.stringify({
  silenceThreshold: 3.0,
  idealCallDurationMin: 1.5,
  idealCallDurationMax: 3.0
}));

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});
```

### Custom Configuration

```javascript
const customConfig = {
  silenceThreshold: 7.0,              // More lenient
  idealCallDurationMin: 1.0,          // Shorter calls OK
  idealCallDurationMax: 5.0,          // Longer calls OK
  repetitionSimilarityThreshold: 0.9  // Stricter repetition detection
};
```

## Troubleshooting

### Common Issues

#### 1. Audio Processing Fails
**Symptoms:**
- "Audio processing failed" error
- Analysis continues with transcript only

**Solutions:**
- Check file format (must be MP3, M4A, MP4, WAV, WebM, OGG)
- Verify file size (max 100MB)
- Ensure FFmpeg is properly installed
- Try with a different audio file

#### 2. OpenAI API Errors
**Symptoms:**
- Intent detection shows low confidence
- "API request failed" in logs

**Solutions:**
- Verify OpenAI API key in server/.env
- Check API quota and billing status
- Test API connectivity
- System will use fallback keyword detection

#### 3. File Upload Issues
**Symptoms:**
- "File too large" error
- Upload fails silently

**Solutions:**
- Reduce file size (max 100MB)
- Check available disk space
- Verify file permissions in uploads directory
- Try a different file format

#### 4. Slow Performance
**Symptoms:**
- Long analysis times
- Browser becomes unresponsive

**Solutions:**
- Use smaller audio files for testing
- Close other browser tabs
- Check system memory usage
- Consider using transcript-only analysis

### Debug Mode

Enable debug logging in development:

```javascript
// server/index.js
console.log('Debug mode enabled');
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Performance Monitoring

Monitor analysis performance:

```javascript
const startTime = Date.now();
const results = await analyzer.analyzeCall(...);
const duration = Date.now() - startTime;
console.log(`Analysis completed in ${duration}ms`);
```

## Advanced Features

### Batch Processing

For multiple file analysis:

```javascript
const files = [file1, file2, file3];
const results = await Promise.all(
  files.map(file => analyzeFile(file))
);
```

### Custom Intent Steps

Modify conversation steps for your use case:

```javascript
// server/services/analyzer.js
const conversationSteps = {
  custom_greeting: 'Custom greeting step',
  custom_inquiry: 'Custom inquiry step',
  // Add your steps here
};
```

### Export Results

Export analysis results:

```javascript
const exportData = {
  timestamp: new Date().toISOString(),
  results: analysisResults,
  configuration: config
};

const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  type: 'application/json'
});
```

## Security Considerations

### Data Protection
- Audio files are automatically deleted after processing
- No persistent storage of sensitive data
- API keys stored in environment variables only

### Input Validation
- File type and size validation
- Transcript content sanitization
- Configuration parameter bounds checking

### API Security
- CORS configuration for frontend access
- Request size limits
- Error message sanitization

## Performance Optimization

### Frontend Optimization
- Component memoization with React.memo
- Lazy loading of visualization components
- Debounced file upload handling

### Backend Optimization
- Streaming file processing
- Async/await for non-blocking operations
- Memory-efficient audio processing

### Caching Strategy
- Results caching for identical inputs
- Audio processing cache for repeated files
- API response caching where appropriate

## Deployment

### Development Deployment
```bash
npm run dev  # Both frontend and backend
```

### Production Build
```bash
cd client
npm run build

cd ../server
npm start
```

### Docker Deployment
```dockerfile
# Example Dockerfile for containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

This documentation provides comprehensive coverage of the Voice Bot Call QA Analyzer system. For additional support or feature requests, please refer to the main README.md or create an issue in the repository.