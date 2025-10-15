import React from 'react';
import { Clock, VolumeX, Repeat, Timer } from 'lucide-react';

const MetricsGrid = ({ callDuration, silenceViolations, repetitions, callDurationAnalysis, responseLatencyAnalysis }) => {
  const formatDuration = (minutes) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    }
    return `${minutes.toFixed(1)}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'too_short': return 'text-orange-600 bg-orange-100';
      case 'too_long': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'optimal': return 'Optimal';
      case 'too_short': return 'Too Short';
      case 'too_long': return 'Too Long';
      default: return 'Unknown';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Call Duration */}
      <div className="card metric-card">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div className="metric-value text-blue-600">
          {formatDuration(callDuration)}
        </div>
        <div className="metric-label">Call Duration</div>
        {callDurationAnalysis && (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(callDurationAnalysis.status)}`}>
            {getStatusLabel(callDurationAnalysis.status)}
          </div>
        )}
      </div>

      {/* Silence Violations */}
      <div className="card metric-card">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
          <VolumeX className="w-6 h-6 text-red-600" />
        </div>
        <div className="metric-value text-red-600">
          {silenceViolations?.length || 0}
        </div>
        <div className="metric-label">Silence Violations</div>
        <div className="text-xs text-gray-500 mt-1">
          Threshold: 5.0s
        </div>
      </div>

      {/* Repetitions */}
      <div className="card metric-card">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
          <Repeat className="w-6 h-6 text-orange-600" />
        </div>
        <div className="metric-value text-orange-600">
          {repetitions?.length || 0}
        </div>
        <div className="metric-label">Repetitions Found</div>
        <div className="text-xs text-gray-500 mt-1">
          Similarity: 80%+
        </div>
      </div>

      {/* Response Latency */}
      <div className="card metric-card">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
          <Timer className="w-6 h-6 text-green-600" />
        </div>
        <div className="metric-value text-green-600">
          {responseLatencyAnalysis?.averageResponseTime?.toFixed(1)}s
        </div>
        <div className="metric-label">Avg Response Time</div>
        <div className="text-xs text-gray-500 mt-1">
          Violations: {responseLatencyAnalysis?.totalViolations || 0}/{responseLatencyAnalysis?.maxAllowedViolations || 3}
        </div>
      </div>
    </div>
  );
};

export default MetricsGrid;