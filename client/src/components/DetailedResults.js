import React, { useState } from 'react';
import { FileText, AlertTriangle, Repeat, Clock, MessageSquare } from 'lucide-react';

const DetailedResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'silence', label: 'Silence Analysis', icon: AlertTriangle },
    { id: 'repetitions', label: 'Repetitions', icon: Repeat },
    { id: 'latency', label: 'Latency Analysis', icon: Clock },
    { id: 'intentflow', label: 'Intent Flow Detection', icon: MessageSquare }
  ];

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3">Call Overview</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Overall Score:</span>
              <span className="font-medium">{Math.round(results.overallScore)}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Call Duration:</span>
              <span className="font-medium">{formatTime(results.callDuration * 60)}</span>
            </div>
            <div className="flex justify-between">
              <span>Analysis Date:</span>
              <span className="font-medium">{new Date(results.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-3">Quality Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Silence Violations:</span>
              <span className="font-medium">{results.silenceViolations?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Repetitions Found:</span>
              <span className="font-medium">{results.repetitions?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Intent Flow Score:</span>
              <span className="font-medium">{Math.round(results.intentFlow?.flowScore || 0)}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Priority-Based Confidence:</span>
              <span className="font-medium">{Math.round((results.intentFlow?.averageConfidence || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Key Insights</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          {results.overallScore >= 85 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Excellent call quality with minimal issues detected</span>
            </li>
          )}
          {results.silenceViolations?.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">⚠</span>
              <span>Found {results.silenceViolations.length} silence violations that may impact user experience</span>
            </li>
          )}
          {results.repetitions?.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">!</span>
              <span>Detected {results.repetitions.length} repetitive responses that should be addressed</span>
            </li>
          )}
          {results.latencyAnalysis?.status === 'optimal' && (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Call duration is within the ideal range</span>
            </li>
          )}
          {(results.intentFlow?.flowScore || 0) >= 80 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Excellent conversation flow with high intent detection confidence</span>
            </li>
          )}
          {(results.intentFlow?.averageConfidence || 0) < 0.5 && (
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">⚠</span>
              <span>Low average intent confidence may indicate unclear conversation patterns</span>
            </li>
          )}
          {(results.intentFlow?.missingCriticalSteps?.length || 0) > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">!</span>
              <span>Missing {results.intentFlow.missingCriticalSteps.length} critical conversation steps</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderSilenceTab = () => (
    <div className="space-y-4">
      {results.silenceViolations?.length > 0 ? (
        <>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">
              {results.silenceViolations.length} Silence Violations Detected
            </h4>
            <p className="text-sm text-red-700">
              Silence periods longer than 5.0 seconds can negatively impact user experience.
            </p>
          </div>
          
          <div className="space-y-3">
            {results.silenceViolations.map((violation, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-800">
                    Violation #{index + 1}
                  </span>
                  <span className="text-sm text-gray-600 capitalize">
                    After {violation.speaker} turn
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Start Time:</span>
                    <div className="font-medium">{formatTime(violation.startTime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">End Time:</span>
                    <div className="font-medium">{formatTime(violation.endTime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium text-red-600">{violation.duration.toFixed(1)}s</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <AlertTriangle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-green-800">No Silence Violations</h4>
          <p className="text-sm text-green-700">All silence periods are within acceptable limits.</p>
        </div>
      )}
    </div>
  );

  const renderRepetitionsTab = () => (
    <div className="space-y-4">
      {results.repetitions?.length > 0 ? (
        <>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">
              {results.repetitions.length} Repetitions Found
            </h4>
            <p className="text-sm text-orange-700">
              Similar responses detected with 80%+ similarity that may indicate scripted or repetitive behavior.
            </p>
          </div>
          
          <div className="space-y-3">
            {results.repetitions.map((repetition, index) => (
              <div key={index} className="border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-orange-800">
                    Repetition #{index + 1}
                  </span>
                  <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {Math.round(repetition.similarityScore * 100)}% similar
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600 mb-1">Turn #{repetition.turn1}:</div>
                    <div className="text-sm">{repetition.text1}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600 mb-1">Turn #{repetition.turn2}:</div>
                    <div className="text-sm">{repetition.text2}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Repeat className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold text-green-800">No Repetitions Detected</h4>
          <p className="text-sm text-green-700">Bot responses show good variety and natural conversation flow.</p>
        </div>
      )}
    </div>
  );

  const renderLatencyTab = () => (
    <div className="space-y-6">
      {/* Call Duration Analysis */}
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${
          results.callDurationAnalysis?.status === 'optimal' ? 'bg-green-50' : 
          results.callDurationAnalysis?.status === 'too_short' ? 'bg-orange-50' : 'bg-red-50'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            results.callDurationAnalysis?.status === 'optimal' ? 'text-green-800' : 
            results.callDurationAnalysis?.status === 'too_short' ? 'text-orange-800' : 'text-red-800'
          }`}>
            Call Duration Analysis
          </h4>
          <p className={`text-sm ${
            results.callDurationAnalysis?.status === 'optimal' ? 'text-green-700' : 
            results.callDurationAnalysis?.status === 'too_short' ? 'text-orange-700' : 'text-red-700'
          }`}>
            {results.callDurationAnalysis?.status === 'optimal' && 'Call duration is within the ideal range for effective communication.'}
            {results.callDurationAnalysis?.status === 'too_short' && 'Call duration is shorter than ideal, which may indicate incomplete conversation.'}
            {results.callDurationAnalysis?.status === 'too_long' && 'Call duration exceeds the ideal range, which may indicate inefficiency.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-3">Current Metrics</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Actual Duration:</span>
                <span className="font-medium">
                  {results.callDurationAnalysis?.totalDurationMinutes?.toFixed(1)} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium capitalize ${
                  results.callDurationAnalysis?.status === 'optimal' ? 'text-green-600' : 
                  results.callDurationAnalysis?.status === 'too_short' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {results.callDurationAnalysis?.status?.replace('_', ' ')}
                </span>
              </div>
              {results.callDurationAnalysis?.deviationFromIdeal > 0 && (
                <div className="flex justify-between">
                  <span>Deviation:</span>
                  <span className="font-medium text-red-600">
                    {results.callDurationAnalysis.deviationFromIdeal.toFixed(1)} minutes
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-3">Ideal Range</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Minimum:</span>
                <span className="font-medium">
                  {results.callDurationAnalysis?.idealRangeMin} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span>Maximum:</span>
                <span className="font-medium">
                  {results.callDurationAnalysis?.idealRangeMax} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span>Within Range:</span>
                <span className={`font-medium ${
                  results.callDurationAnalysis?.withinIdealRange ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.callDurationAnalysis?.withinIdealRange ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Latency Analysis */}
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Response Latency Analysis</h4>
          <p className="text-sm text-green-700">
            This analysis measures how quickly the bot responds to human inputs. Industry standard is under 5 seconds per response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-3">Response Time Metrics</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Average Response Time:</span>
                <span className="font-medium">
                  {results.responseLatencyAnalysis?.averageResponseTime?.toFixed(1)} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Violations:</span>
                <span className={`font-medium ${
                  results.responseLatencyAnalysis?.totalViolations <= results.responseLatencyAnalysis?.maxAllowedViolations 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.responseLatencyAnalysis?.totalViolations || 0}/{results.responseLatencyAnalysis?.maxAllowedViolations || 3}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Threshold:</span>
                <span className="font-medium">
                  {results.responseLatencyAnalysis?.responseTimeThreshold || 5} seconds
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-3">Violation Details</h5>
            {results.responseLatencyAnalysis?.latencyViolations?.length > 0 ? (
              <div className="space-y-2 text-sm">
                {results.responseLatencyAnalysis.latencyViolations.slice(0, 3).map((violation, index) => (
                  <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                    <div className="font-medium text-red-800">
                      Turn {violation.turnIndex}: {violation.responseTimeSeconds.toFixed(1)}s
                    </div>
                    <div className="text-red-600 text-xs mt-1">
                      {violation.violationSeverity === 'severe' ? 'Severe (>10s)' : 'Moderate (5-10s)'}
                    </div>
                  </div>
                ))}
                {results.responseLatencyAnalysis.latencyViolations.length > 3 && (
                  <div className="text-gray-500 text-xs">
                    +{results.responseLatencyAnalysis.latencyViolations.length - 3} more violations
                  </div>
                )}
              </div>
            ) : (
              <div className="text-green-600 text-sm">
                ✓ No latency violations detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntentFlowTab = () => {
    const intentFlow = results.intentFlow;
    const flowScore = intentFlow?.flowScore || 0;
    const averageConfidence = intentFlow?.averageConfidence || 0;
    const completedSteps = intentFlow?.completedSteps || 0;
    const totalRequiredSteps = intentFlow?.totalRequiredSteps || 20;
    const missingCriticalSteps = intentFlow?.missingCriticalSteps || [];
    const conversationQuality = intentFlow?.conversationQuality || { rating: 'Unknown', score: 0 };
    const intentMappings = intentFlow?.intentMappings || [];
    const conversationContext = intentFlow?.conversationContext || { name: 'Unknown Context' };
    const contextualAnalysis = intentFlow?.contextualAnalysis || {};

    const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      if (score >= 40) return 'text-orange-600';
      return 'text-red-600';
    };

    const getScoreBackground = (score) => {
      if (score >= 80) return 'bg-green-50 border-green-200';
      if (score >= 60) return 'bg-yellow-50 border-yellow-200';
      if (score >= 40) return 'bg-orange-50 border-orange-200';
      return 'bg-red-50 border-red-200';
    };

    // MagicBricks critical steps: [1, 6, 7, 9] - Greeting, Interest Check, Agent Offer, Call Transfer
    const magicBricksCriticalSteps = [1, 6, 7, 9];
    
    // Use the critical steps analysis from the backend (more accurate)
    const completedCriticalSteps = intentFlow?.criticalStepsAnalysis?.completed?.length || 0;
    const totalCriticalSteps = intentFlow?.criticalStepsAnalysis?.totalCriticalSteps || 4;

    const highConfidenceSteps = intentMappings.filter(mapping => mapping.confidence > 0.7).length;
    const lowConfidenceSteps = intentMappings.filter(mapping => mapping.confidence < 0.5).length;

    return (
      <div className="space-y-6">
        {/* Conversation Context */}
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="font-semibold text-indigo-800 mb-2">Detected Conversation Context</h4>
          <p className="text-indigo-700 font-medium mb-2">{conversationContext.name}</p>
          <p className="text-sm text-indigo-600">
            The system identified this conversation type and adjusted scoring accordingly.
            Only relevant steps for this context are considered in the analysis.
          </p>
        </div>

        {/* Overall Flow Score */}
        <div className={`p-4 rounded-lg border ${getScoreBackground(flowScore)}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Contextual Intent Flow Score</h4>
            <span className={`text-2xl font-bold ${getScoreColor(flowScore)}`}>
              {Math.round(flowScore)}/100
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            This score reflects how well the conversation followed the expected flow for the detected context
            ({conversationContext.name.toLowerCase()}) and the confidence in intent detection.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className={`text-lg font-bold ${getScoreColor(averageConfidence * 100)}`}>
                {Math.round(averageConfidence * 100)}%
              </div>
              <div className="text-gray-600">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {completedSteps}/{totalRequiredSteps}
              </div>
              <div className="text-gray-600">Required Steps</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {completedCriticalSteps}/{totalCriticalSteps}
              </div>
              <div className="text-gray-600">Critical Steps</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${
                conversationQuality.rating === 'Excellent' ? 'text-green-600' :
                conversationQuality.rating === 'Good' ? 'text-blue-600' :
                conversationQuality.rating === 'Fair' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {conversationQuality.rating}
              </div>
              <div className="text-gray-600">Quality Rating</div>
            </div>
          </div>
        </div>

        {/* Enhanced Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Priority-Based Confidence Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Confidence Steps ({'>'}70%)</span>
                <span className="font-medium text-green-600">{highConfidenceSteps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Confidence Steps (40-70%)</span>
                <span className="font-medium text-yellow-600">{intentMappings.filter(m => m.confidence >= 0.4 && m.confidence <= 0.7).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Confidence Steps ({'<'}40%)</span>
                <span className="font-medium text-red-600">{lowConfidenceSteps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Priority-Weighted Average</span>
                <span className={`font-medium ${getScoreColor(averageConfidence * 100)}`}>
                  {Math.round(averageConfidence * 100)}%
                </span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
              <strong>Smart Weighting:</strong> Critical steps and high-confidence interactions are prioritized.
              Vague responses receive reduced weightage for more accurate assessment.
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">Contextual Flow Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Context-Required Steps</span>
                <span className="font-medium">{completedSteps}/{totalRequiredSteps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Required Steps Score</span>
                <span className="font-medium text-blue-600">{Math.round(contextualAnalysis.requiredStepsScore || 0)}/40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conditional Steps Score</span>
                <span className="font-medium text-green-600">{Math.round(contextualAnalysis.conditionalScore || 0)}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Flow Coherence</span>
                <span className="font-medium text-orange-600">{Math.round(contextualAnalysis.sequentialBonus || 0)}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Critical Steps */}
        {missingCriticalSteps.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-3">⚠️ Missing Critical Steps</h4>
            <p className="text-sm text-red-700 mb-3">
              These important conversation steps were not detected, which may impact the overall effectiveness:
            </p>
            <div className="flex flex-wrap gap-2">
              {missingCriticalSteps.map((step, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Score Explanation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Contextual Scoring Methodology</h4>
          <div className="mb-3 p-3 bg-indigo-50 rounded text-sm">
            <strong>Context-Aware Scoring:</strong> The system identifies the conversation type
            ({conversationContext.name.toLowerCase()}) and only evaluates steps relevant to that context,
            making the analysis more accurate and fair.
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span><strong>Context Identification (20 points):</strong> Correctly identifying the conversation type</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span><strong>Required Steps (40 points):</strong> Completion of steps essential for this context</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span><strong>Conditional Steps (20 points):</strong> Context-specific steps (e.g., dropout investigation only if mentioned)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Priority-Based Confidence (10 points):</strong> Weighted average prioritizing critical steps and high-confidence interactions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span><strong>Sequential Flow (10 points):</strong> Logical progression through conversation steps</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
            <strong>Smart Logic:</strong> MagicBricks conversation flow prioritizes critical steps for call objective achievement.
            Third-party interactions and callback scheduling are handled as separate contexts.
            Wrong number and voicemail handling are separate contexts.
          </div>
          <div className="mt-2 p-3 bg-purple-50 rounded text-sm">
            <strong>Priority-Based Confidence:</strong> Critical steps (4x weight), high-confidence steps (2.5x weight),
            clear messages (2x weight), while vague responses like "हाँ", "okay", "ठीक है" get reduced weightage (0.5x)
            for more meaningful confidence assessment.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Analysis Results</h3>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'silence' && renderSilenceTab()}
        {activeTab === 'repetitions' && renderRepetitionsTab()}
        {activeTab === 'latency' && renderLatencyTab()}
        {activeTab === 'intentflow' && renderIntentFlowTab()}
      </div>
    </div>
  );
};

export default DetailedResults;