Y# Voice Bot QA Analysis System

A comprehensive system for analyzing voice bot call quality with **SUPER ADVANCED ALGORITHMS** for accurate, business-aligned quality assessment.

## 🎯 **Current Implementation: MagicBricks Property Search Use Case**

This system is specifically optimized for **MagicBricks property search conversations** with:
- **Critical Steps Tracking**: [1, 6, 7, 9] - Greeting, Interest Check, Agent Offer, Call Transfer
- **Objective Achievement Logic**: Call transfer + affirmative response = Success
- **Audio-First Analysis**: Prioritizes audio file analysis over transcript for timing-sensitive metrics
- **Business Context Awareness**: Understands property search conversation patterns

## 🚀 **SUPER ADVANCED FEATURES**

### **Core 5 Metrics (MVP Compliant)**
- **Silence Detection (25%)**: 4-layer validation system with business logic filtering
- **Repetition Analysis (25%)**: Contextual analysis - only flags truly problematic repetitions
- **Call Duration (10%)**: Optimized for 1.0-3.5 minute range with efficiency bonuses
- **Response Latency (15%)**: Simple 5-second threshold with audio-first timing
- **Intent Flow Accuracy (25%)**: MagicBricks-specific with objective achievement bonuses

### **Advanced Analysis Capabilities**
- **Audio-First Priority**: Uses actual audio timestamps when available, transcript as fallback
- **Business Context Awareness**: Understands MagicBricks property search patterns
- **Script Adherence Detection**: Monitors compliance with prescribed dialogue
- **Objection Handling Analysis**: Validates responses against 58+ FAQ scenarios
- **Critical Steps Tracking**: Monitors [1, 6, 7, 9] completion for objective achievement
- **Hallucination Detection**: Multi-dimensional analysis with audio confidence integration
- **Interruption Handling**: Precise audio overlap detection with context validation

### **Technical Features**
- **Visual Waveform**: Interactive audio visualization with silence markers
- **Responsive Dashboard**: Modern web interface with real-time analysis
- **File Upload Support**: MP3, M4A, MP4, WAV, WebM, OGG audio files
- **Comprehensive Reporting**: Detailed breakdowns with actionable recommendations

## Available Implementations

### 1. Web Application (Node.js + React)
**Location**: Main project files
**Use Case**: Production deployment, team collaboration, web-based analysis

**Technology Stack:**
- **Backend**: Node.js with Express.js, OpenAI API, FFmpeg, Multer
- **Frontend**: React 18, Recharts, React Dropzone, Lucide React
- **Features**: File uploads, real-time analysis, responsive dashboard

### 2. Google Colab Notebook
**Location**: `COLAB_NO_DEEPGRAM.py`
**Use Case**: Research, experimentation, quick analysis
**Documentation**: See `COLAB_DOCUMENTATION.md`

**Technology Stack:**
- **Python**: librosa, pydub, matplotlib, OpenAI API
- **Features**: Interactive analysis, visualization, URL/file processing

## Quick Start

Choose your preferred implementation:

### Option 1: Web Application (Recommended)

**Prerequisites:**
- Node.js 16+ and npm
- OpenAI API key

**Installation:**

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd voice-bot-qa-system
npm install
```

2. **Install backend dependencies:**
```bash
cd server
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../client
npm install
```

4. **Configure environment:**
```bash
cd ../server
# Edit .env file with your OpenAI API key
```

### Running the Application

**Development mode (both frontend and backend):**
```bash
# From project root
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

**Production mode:**
```bash
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Google Colab Notebook

1. **Open the notebook:**
   - Upload `COLAB_NO_DEEPGRAM.py` to Google Colab
   - Or copy the code directly into a new Colab notebook

2. **Set your OpenAI API key:**
   ```python
   OPENAI_API_KEY = "your-api-key-here"
   ```

3. **Run the analysis:**
   ```python
   # Initialize analyzer
   analyzer = CallQAAnalyzer(OPENAI_API_KEY)
   
   # Analyze with your data
   results = analyzer.analyze_call(audio_url, transcript, config)
   ```

**See `COLAB_DOCUMENTATION.md` for detailed usage instructions.**

## Usage

### 1. Upload Audio & Transcript
- Drag & drop audio files (MP3, M4A, MP4, WAV, WebM, OGG)
- Paste call transcript in the specified format:
  ```
  Chat Bot: Hello, this is...
  Human: Hi there...
  Chat Bot: How can I help you today?
  ```

### 2. Configure Analysis Parameters
- **Silence Threshold**: Minimum silence duration to flag (default: 5.0s)
- **Ideal Call Duration**: Expected call length range (default: 1.0-3.5 minutes)
- **Repetition Similarity**: Threshold for detecting similar responses (default: 80%)
- **Response Latency**: Maximum acceptable response time (fixed: 5.0s)

### 3. View Results
- **Overall Score**: Weighted QA score out of 100
- **Metrics Dashboard**: Key performance indicators
- **Waveform Visualization**: Audio analysis with silence markers
- **Intent Flow**: Conversation step analysis
- **Detailed Reports**: Comprehensive breakdown of findings

## API Endpoints

### `GET /api/health`
Health check endpoint

### `POST /api/analyze`
Main analysis endpoint
- **Body**: FormData with `audioFile`, `transcript`, and `config`
- **Response**: Complete analysis results

### `GET /api/test-sample`
Test endpoint with sample data

## Configuration

### Analysis Parameters
```javascript
{
  silenceThreshold: 5.0,              // seconds
  idealCallDurationMin: 1.0,          // minutes (UPDATED)
  idealCallDurationMax: 3.5,          // minutes (UPDATED)
  repetitionSimilarityThreshold: 0.8, // 0.0-1.0
  responseLatencyThreshold: 5.0       // seconds (FIXED)
}
```

### Scoring Weights (MVP Compliant)
- **Silence Compliance: 25%** - Audio-first with 4-layer validation
- **Repetition Avoidance: 25%** - Contextual business logic filtering
- **Call Duration Optimization: 10%** - Efficiency-focused scoring
- **Response Latency Optimization: 15%** - Simple 5-second threshold
- **Intent Flow Accuracy: 25%** - MagicBricks objective achievement focus

## 🏗️ **Project Architecture**

```
voice-bot-qa-system/
├── 📋 Documentation
│   ├── README.md                           # Main documentation (this file)
│   ├── MVP_Technical_Analysis_Complete.md  # Technical algorithms documentation
│   ├── AUDIO_FIRST_ANALYSIS_CHANGES.md    # Audio-first implementation details
│   ├── MAGICBRICKS_ANALYSIS_UPDATE.md     # MagicBricks use case documentation
│   └── ENHANCED_WEIGHTED_SCORING.md       # Advanced scoring methodology
├── 🖥️ Server (Node.js Backend)
│   ├── index.js                           # Express server with API endpoints
│   ├── .env                               # Environment configuration (OpenAI API key)
│   ├── package.json                       # Backend dependencies
│   ├── uploads/                           # Temporary audio file storage
│   └── services/                          # Core analysis services
│       ├── analyzer.js                    # 🧠 MAIN ANALYSIS ENGINE (3,800+ lines)
│       └── audioProcessor.js              # Audio processing utilities
├── 🌐 Client (React Frontend)
│   ├── package.json                       # Frontend dependencies
│   ├── public/index.html                  # HTML template
│   └── src/
│       ├── App.js                         # Main React application
│       ├── index.js                       # React entry point
│       ├── index.css                      # Global styles (Tailwind CSS)
│       └── components/                    # React UI components
│           ├── Dashboard.js               # Main dashboard layout
│           ├── AnalysisForm.js            # File upload & configuration
│           ├── ScoreOverview.js           # Overall QA score display
│           ├── MetricsGrid.js             # Key performance metrics
│           ├── WaveformChart.js           # Audio waveform visualization
│           ├── IntentFlow.js              # Conversation flow analysis
│           └── DetailedResults.js         # Comprehensive analysis results
├── 🚀 Deployment Scripts
│   ├── install.bat                        # Windows installation script
│   ├── start.bat                          # Windows startup script
│   └── package.json                       # Root package configuration
└── 📊 Legacy/Research
    ├── COLAB_NO_DEEPGRAM.py              # Google Colab implementation
    ├── COLAB_DOCUMENTATION.md            # Colab usage guide
    └── Technical documentation.md         # Legacy technical docs
```

## 📁 **Key Files Explained**

### **🧠 Core Analysis Engine**
- **`server/services/analyzer.js`** (3,800+ lines)
  - Main QA analysis logic with SUPER ADVANCED algorithms
  - MagicBricks conversation flow patterns and critical steps tracking
  - Audio-first analysis with transcript fallback
  - Script adherence detection and objection handling validation
  - 4-layer silence validation, contextual repetition analysis
  - Business logic for realistic scoring

### **🖥️ Backend Server**
- **`server/index.js`** 
  - Express.js API server with file upload handling
  - Analysis configuration and request processing
  - Error handling and response formatting
- **`server/services/audioProcessor.js`**
  - FFmpeg integration for audio processing
  - Audio metadata extraction and format conversion

### **🌐 Frontend Application**
- **`client/src/App.js`** - Main React application with routing
- **`client/src/components/Dashboard.js`** - Primary dashboard layout
- **`client/src/components/AnalysisForm.js`** - File upload and configuration UI
- **`client/src/components/ScoreOverview.js`** - Overall QA score visualization
- **`client/src/components/MetricsGrid.js`** - Key performance indicators display
- **`client/src/components/WaveformChart.js`** - Interactive audio waveform with silence markers
- **`client/src/components/IntentFlow.js`** - Conversation flow and critical steps analysis
- **`client/src/components/DetailedResults.js`** - Comprehensive analysis breakdown

### **📋 Documentation Files**
- **`MVP_Technical_Analysis_Complete.md`** - Detailed technical algorithms and methodology
- **`AUDIO_FIRST_ANALYSIS_CHANGES.md`** - Audio-first implementation documentation
- **`MAGICBRICKS_ANALYSIS_UPDATE.md`** - MagicBricks use case transition details
- **`ENHANCED_WEIGHTED_SCORING.md`** - Advanced scoring methodology explanation

## Recent Improvements (v3.0)

### **🎯 MagicBricks Use Case Implementation**
- **Complete Transition**: From iDreamCareer to MagicBricks property search
- **Critical Steps**: [1, 6, 7, 9] - Greeting, Interest Check, Agent Offer, Call Transfer
- **Objective Achievement**: Call transfer + affirmative response = Success
- **Script Adherence**: Monitors compliance with MagicBricks prescribed dialogue
- **Objection Handling**: Validates responses against 58+ FAQ scenarios

### **🔊 SUPER ADVANCED Algorithms**
- **4-Layer Silence Validation**: Context, quality, flow, and business logic filtering
- **Contextual Repetition Analysis**: Only flags consecutive repetitions without human dialogue
- **Audio-First Analysis**: Prioritizes audio timing over transcript estimation
- **Business Logic Integration**: Realistic scoring that reflects actual call success

### **⚡ Fixed Response Latency Analysis**
- **Simple 5-Second Threshold**: Only responses > 5 seconds are violations
- **Removed Complex Context Thresholds**: No more false positives for 2-3 second responses
- **Max 3 Violations Allowed**: Realistic tolerance for conversation flow

### **⏱️ Updated Call Duration Range**
- **New Ideal Range**: 1.0 - 3.5 minutes (was 2.0 - 4.5 minutes)
- **Business Aligned**: Optimized for efficient property search conversations
- **Efficiency Bonuses**: Rewards successful objective completion in shorter time

## Analysis Components

### 1. Silence Detection
- Processes audio files to identify silence periods
- Flags violations exceeding configured threshold
- Associates silence with speaker turns

### 2. Repetition Analysis
- Compares bot responses using similarity algorithms
- Identifies repetitive or scripted behavior
- Calculates similarity scores between turns

### 3. Intent Detection
- Uses OpenAI API for conversation analysis
- Maps turns to conversation steps
- Provides confidence scores for each intent

### 4. Call Duration Analysis
- Evaluates call duration against ideal ranges (2-4.5 minutes)
- Uses gradual penalty scoring instead of harsh cutoffs
- 11 points deducted per minute over ideal range
- Minimum score of 15 points to recognize effort

### 5. Response Latency Analysis
- Measures bot response time after human inputs
- Industry standard: 5-second maximum response time
- Allows up to 3 violations during entire call before scoring penalty
- Tracks average response time and violation details

## Customization

### Adding New Analysis Metrics
1. Extend the analyzer service in `server/services/analyzer.js`
2. Update scoring weights in `calculateWeightedScore()`
3. Add UI components in the React frontend

### Modifying Conversation Steps
Update the `conversationSteps` object in the analyzer to match your specific use case:

```javascript
const conversationSteps = {
  greeting: 'Initial greeting and identification',
  // Add your custom steps here
};
```

## Troubleshooting

### Common Issues

**Audio processing fails:**
- Ensure FFmpeg is properly installed
- Check file format compatibility
- Verify file size limits (100MB max)

**OpenAI API errors:**
- Verify API key is correctly set
- Check API quota and billing
- Ensure network connectivity

**File upload issues:**
- Check file permissions in uploads directory
- Verify multer configuration
- Ensure adequate disk space

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## File Structure

```
voice-bot-qa-system/
├── README.md                           # Main documentation
├── COLAB_DOCUMENTATION.md              # Colab notebook documentation
├── COLAB_NO_DEEPGRAM.py               # Google Colab implementation
├── package.json                       # Root package configuration
├── install.bat                        # Windows installation script
├── start.bat                          # Windows startup script
├── server/                            # Node.js backend
│   ├── package.json
│   ├── .env                          # Environment configuration
│   ├── index.js                      # Express server
│   └── services/                     # Core services
│       ├── analyzer.js               # Main analysis logic
│       └── audioProcessor.js         # Audio processing
└── client/                           # React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                    # Main application
        ├── index.js                  # React entry point
        ├── index.css                 # Global styles
        └── components/               # React components
            ├── AnalysisForm.js       # File upload and configuration
            ├── Dashboard.js          # Main dashboard
            ├── ScoreOverview.js      # QA score display
            ├── MetricsGrid.js        # Key metrics
            ├── WaveformChart.js      # Audio visualization
            ├── IntentFlow.js         # Conversation analysis
            └── DetailedResults.js    # Comprehensive results
```

## Implementation Comparison

| Feature | Web Application | Colab Notebook |
|---------|----------------|----------------|
| **Deployment** | Production-ready | Research/Testing |
| **User Interface** | Modern web dashboard | Interactive notebook |
| **File Upload** | Drag & drop, multiple formats | URL or file path |
| **Real-time Analysis** | ✅ Progress indicators | ✅ Step-by-step execution |
| **Visualization** | Interactive charts | Matplotlib plots |
| **Collaboration** | Multi-user web access | Shared notebook |
| **Customization** | Component-based | Code modification |
| **Audio Processing** | FFmpeg (production) | librosa/pydub (research) |
| **Scalability** | High (web server) | Limited (single session) |

## Support

For issues and questions:
1. **Web Application**: Check the troubleshooting section in this README
2. **Colab Notebook**: See `COLAB_DOCUMENTATION.md` for specific guidance
3. **General Issues**: Create an issue in the repository.