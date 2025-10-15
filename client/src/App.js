import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AnalysisForm from './components/AnalysisForm';
import { Mic, BarChart3 } from 'lucide-react';

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Voice Bot QA Dashboard</h1>
                <p className="text-gray-600">Analyze call quality, silence, repetition & conversational flow</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4" />
              <span>Real-time Analysis</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!analysisResults && !isAnalyzing && (
          <AnalysisForm 
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {isAnalyzing && (
          <div className="card text-center">
            <div className="loading">
              <div className="spinner"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Call...</h3>
            <p className="text-gray-600">Processing audio and transcript for comprehensive QA analysis</p>
            <button
              onClick={resetAnalysis}
              className="btn btn-secondary mt-4"
            >
              Cancel Analysis
            </button>
          </div>
        )}

        {analysisResults && (
          <Dashboard 
            results={analysisResults}
            onReset={resetAnalysis}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>Voice Bot QA Analysis System - Powered by OpenAI & Advanced Audio Processing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;