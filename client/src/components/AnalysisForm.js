import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, FileAudio, Settings, Play, AlertCircle, BarChart3 } from 'lucide-react';

const AnalysisForm = ({ onAnalysisStart, onAnalysisComplete }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [config, setConfig] = useState({
    silenceThreshold: 5.0,
    idealCallDurationMin: 2.0,
    idealCallDurationMax: 4.0,
    repetitionSimilarityThreshold: 0.8
  });
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.m4a', '.mp4', '.wav', '.webm', '.ogg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setAudioFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: () => {
      setError('Please upload a valid audio file (MP3, M4A, MP4, WAV, WebM, OGG)');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!transcript.trim()) {
      setError('Please provide a transcript');
      return;
    }

    setError('');
    onAnalysisStart();

    try {
      const formData = new FormData();
      if (audioFile) {
        formData.append('audioFile', audioFile);
      }
      formData.append('transcript', transcript);
      formData.append('config', JSON.stringify(config));

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000 // 2 minutes timeout
      });

      if (response.data.success) {
        onAnalysisComplete(response.data);
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || 'Failed to analyze call. Please try again.');
    }
  };

  const loadSampleData = async () => {
    try {
      const response = await axios.get('/api/test-sample');
      if (response.data.success) {
        setTranscript(`Chat Bot: "Namaste , मैं Rahul बोल रहा हूँ, Magicbricks से. क्या मैं Saral Two से बात कर रहा हूँ ?"
Human: Hello.
Chat Bot: जी. आपने recently हमारे platform पर कुछ properties में interest दिखाया था.
Chat Bot: आप Camorta Island test, Andaman & Nicobar में Three बी एच के, Flat search कर रहे हैं, क्या यह सही है?
Human: हां सही है नज़ीर लेकर.
Chat Bot: Okay, noted. और आपका बजट छत्तीस लाख रुपये है, सही है?
Human: हां budget चाहिए.
Chat Bot: हमने आपके preferred area में Three top agents shortlist किए हैं जो आपको properties दिखाएंगे और site visits और negotiations में भी मदद करेंगे.
Chat Bot: मैं आपको अभी एक agent से connect कर सकता हूँ, बाकी agents आपसे जल्दी follow up करेंगे.
Chat Bot: क्या हम आगे बढ़ें?
Human: हां ठीक है आने बाद.
Chat Bot: Please लाइन पर बने रहिए. मैं अभी आपको agent से connect करता हूँ.`);
        onAnalysisStart();
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      setError('Failed to load sample data');
    }
  };

  const removeFile = () => {
    setAudioFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Call Analysis Setup</h2>
          <button
            type="button"
            onClick={loadSampleData}
            className="btn btn-secondary"
          >
            <Play className="w-4 h-4" />
            Try Sample Data
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio File Upload */}
          <div className="form-group">
            <label className="form-label">Audio File (Optional)</label>
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the audio file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop an audio file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports MP3, M4A, MP4, WAV, WebM, OGG (max 100MB)
                  </p>
                </div>
              )}
            </div>

            {audioFile && (
              <div className="file-info">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{audioFile.name}</span>
                  <span className="text-gray-500">
                    ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Transcript */}
          <div className="form-group">
            <label className="form-label">Call Transcript *</label>
            <textarea
              className="form-textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your call transcript here...&#10;&#10;Format:&#10;Chat Bot: Hello, this is...&#10;Human: Hi there...&#10;Chat Bot: How can I help you today?"
              rows={8}
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Use format: "Chat Bot: message" and "Human: message" on separate lines
            </p>
          </div>

          {/* Advanced Configuration */}
          <div className="form-group">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Settings className="w-4 h-4" />
              Advanced Configuration
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-2 gap-4">
                  <div>
                    <label className="form-label">Silence Threshold (seconds)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={config.silenceThreshold}
                      onChange={(e) => setConfig({
                        ...config,
                        silenceThreshold: parseFloat(e.target.value)
                      })}
                      min="1"
                      max="30"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="form-label">Repetition Similarity Threshold</label>
                    <input
                      type="number"
                      className="form-input"
                      value={config.repetitionSimilarityThreshold}
                      onChange={(e) => setConfig({
                        ...config,
                        repetitionSimilarityThreshold: parseFloat(e.target.value)
                      })}
                      min="0.1"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="form-label">Ideal Call Duration Min (minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={config.idealCallDurationMin}
                      onChange={(e) => setConfig({
                        ...config,
                        idealCallDurationMin: parseFloat(e.target.value)
                      })}
                      min="0.5"
                      max="10"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="form-label">Ideal Call Duration Max (minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={config.idealCallDurationMax}
                      onChange={(e) => setConfig({
                        ...config,
                        idealCallDurationMax: parseFloat(e.target.value)
                      })}
                      min="1"
                      max="20"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="btn btn-primary px-8 py-3 text-lg"
              disabled={!transcript.trim()}
            >
              <BarChart3 className="w-5 h-5" />
              Analyze Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnalysisForm;