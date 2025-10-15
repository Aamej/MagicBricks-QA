import React from 'react';
import ScoreOverview from './ScoreOverview';
import WaveformChart from './WaveformChart';
import MetricsGrid from './MetricsGrid';
import IntentFlow from './IntentFlow';
import DetailedResults from './DetailedResults';
import { RotateCcw, Download } from 'lucide-react';

const Dashboard = ({ results, onReset }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `voice-bot-qa-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
            <p className="text-gray-600">
              Comprehensive QA analysis completed at {new Date(results.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="btn btn-secondary"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
            <button
              onClick={onReset}
              className="btn btn-primary"
            >
              <RotateCcw className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <ScoreOverview 
        overallScore={results.overallScore}
        scoreBreakdown={results.scoreBreakdown}
      />

      {/* Metrics Grid */}
      <MetricsGrid 
        callDuration={results.callDuration}
        silenceViolations={results.silenceViolations}
        repetitions={results.repetitions}
        callDurationAnalysis={results.callDurationAnalysis}
        responseLatencyAnalysis={results.responseLatencyAnalysis}
      />

      {/* Waveform Visualization */}
      {results.visualizationData && (
        <WaveformChart 
          visualizationData={results.visualizationData}
        />
      )}

      {/* Intent Flow */}
      {results.intentFlow && results.intentFlow.length > 0 && (
        <IntentFlow 
          intentFlow={results.intentFlow}
        />
      )}

      {/* Detailed Results */}
      <DetailedResults 
        results={results}
      />
    </div>
  );
};

export default Dashboard;