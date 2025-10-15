import React, { useState } from 'react';
import { MessageSquare, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';

const IntentFlow = ({ intentFlow }) => {
  const [showAll, setShowAll] = useState(false);

  // Handle both old and new data structures
  const intentMappings = intentFlow?.intentMappings || intentFlow || [];
  const displayedFlow = showAll ? intentMappings : intentMappings.slice(0, 10);

  // Enhanced data from new structure
  const flowScore = intentFlow?.flowScore || 0;
  const averageConfidence = intentFlow?.averageConfidence || 0;
  const completedSteps = intentFlow?.completedSteps || 0;
  const totalRequiredSteps = intentFlow?.totalRequiredSteps || 20;
  const missingCriticalSteps = intentFlow?.missingCriticalSteps || [];
  const conversationQuality = intentFlow?.conversationQuality || { rating: 'Unknown', score: 0 };
  const conversationContext = intentFlow?.conversationContext || { name: 'Unknown Context' };
  const contextualAnalysis = intentFlow?.contextualAnalysis || {};

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStepColor = (step) => {
    const colors = {
      // MagicBricks conversation steps
      initial_greeting: 'bg-blue-100 text-blue-800',
      third_party_interaction: 'bg-purple-100 text-purple-800',
      busy_response: 'bg-indigo-100 text-indigo-800',
      connection_failure: 'bg-cyan-100 text-cyan-800',
      callback_scheduling: 'bg-amber-100 text-amber-800',
      interest_check: 'bg-green-100 text-green-800',
      agent_connection_offer: 'bg-lime-100 text-lime-800',
      agent_decline_handling: 'bg-yellow-100 text-yellow-800',
      call_transfer: 'bg-orange-100 text-orange-800',
      call_ending: 'bg-red-100 text-red-800',
      voicemail_response: 'bg-pink-100 text-pink-800',
      wrong_number_handling: 'bg-violet-100 text-violet-800',
      goodbye: 'bg-slate-100 text-slate-800',
      objection_handling: 'bg-rose-100 text-rose-800',
      fetch_data_trigger: 'bg-emerald-100 text-emerald-800',
      unknown: 'bg-gray-100 text-gray-600'
    };
    return colors[step] || colors.unknown;
  };

  const formatStepName = (step) => {
    return step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate enhanced flow statistics
  const botTurns = intentMappings.filter(turn => turn.speaker === 'agent' || turn.speaker === 'bot');
  const humanTurns = intentMappings.filter(turn => turn.speaker === 'customer' || turn.speaker === 'human');

  // Enhanced confidence analysis
  const highConfidenceSteps = intentMappings.filter(turn => turn.confidence > 0.7);
  const mediumConfidenceSteps = intentMappings.filter(turn => turn.confidence >= 0.4 && turn.confidence <= 0.7);
  const lowConfidenceSteps = intentMappings.filter(turn => turn.confidence < 0.4);

  // Calculate speaker-specific confidence for potential future use
  const avgBotConfidence = botTurns.length > 0 ?
    botTurns.reduce((sum, turn) => sum + turn.confidence, 0) / botTurns.length : 0;
  const avgHumanConfidence = humanTurns.length > 0 ?
    humanTurns.reduce((sum, turn) => sum + turn.confidence, 0) / humanTurns.length : 0;

  const stepCounts = intentMappings.reduce((acc, turn) => {
    acc[turn.conversationStep] = (acc[turn.conversationStep] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <MessageSquare className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Intent Flow Analysis</h3>
          <p className="text-gray-600">Conversation flow and intent detection results</p>
        </div>
      </div>

      {/* Conversation Context Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-indigo-800">Detected Conversation Context</h4>
            <p className="text-indigo-600 font-medium">{conversationContext.name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-600">Context-Appropriate Scoring</div>
            <div className="text-lg font-bold text-indigo-800">
              {completedSteps}/{totalRequiredSteps} Required Steps
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Flow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{intentMappings.length}</div>
          <div className="text-sm text-gray-600">Total Turns</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(flowScore)}</div>
          <div className="text-sm text-gray-600">Contextual Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round(averageConfidence * 100)}%</div>
          <div className="text-sm text-gray-600">Priority-Based Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{completedSteps}/{totalRequiredSteps}</div>
          <div className="text-sm text-gray-600">Required Steps</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${conversationQuality.rating === 'Excellent' ? 'text-green-600' :
                                                conversationQuality.rating === 'Good' ? 'text-blue-600' :
                                                conversationQuality.rating === 'Fair' ? 'text-yellow-600' : 'text-red-600'}`}>
            {conversationQuality.rating}
          </div>
          <div className="text-sm text-gray-600">Quality Rating</div>
        </div>
      </div>

      {/* MANDATORY Data Collection Analysis */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-3">🎯 MagicBricks Critical Steps</h4>
        <div className="mb-3 text-sm text-purple-700">
          <strong>Critical Steps:</strong> 1 (Initial Greeting), 6 (Interest Check), 7 (Agent Offer), 9 (Call Transfer)
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-purple-600">
              {intentFlow?.criticalStepsAnalysis?.completed?.length || 0}
            </div>
            <div className="text-gray-600">Completed Critical Steps</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">
              {intentFlow?.criticalStepsAnalysis?.completed?.length || 0}
            </div>
            <div className="text-gray-600">Completed Critical</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-orange-600">
              {intentFlow?.criticalStepsAnalysis?.totalCriticalSteps || 4}
            </div>
            <div className="text-gray-600">Total Critical</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">
              {Math.round((intentFlow?.criticalStepsAnalysis?.completionRate || 0) * 100)}%
            </div>
            <div className="text-gray-600">Completion Rate</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-purple-600 bg-purple-50 p-2 rounded">
          <strong>CRITICAL STEPS:</strong> MagicBricks conversation flow requires completion of all 4 critical steps for successful call objective achievement.
        </div>
      </div>

      {/* Enhanced Confidence Analysis */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-3">Priority-Based Confidence Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-green-600">{highConfidenceSteps.length}</div>
            <div className="text-gray-600">High Confidence (&gt;70%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-yellow-600">{mediumConfidenceSteps.length}</div>
            <div className="text-gray-600">Medium Confidence (40-70%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-red-600">{lowConfidenceSteps.length}</div>
            <div className="text-gray-600">Low Confidence (&lt;40%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600">{Math.round(averageConfidence * 100)}%</div>
            <div className="text-gray-600">Weighted Average</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-purple-600 bg-purple-50 p-2 rounded">
          <strong>Smart Weighting:</strong> MANDATORY data steps get highest priority (6x-4x weight), other critical steps (3x-2.5x), vague messages (0.5x weight).
        </div>
      </div>

      {/* Contextual Analysis Breakdown */}
      {contextualAnalysis.contextName && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Contextual Analysis Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-blue-600">{Math.round(contextualAnalysis.requiredStepsScore || 0)}/40</div>
              <div className="text-gray-600">Required Steps</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">{Math.round(contextualAnalysis.conditionalScore || 0)}/20</div>
              <div className="text-gray-600">Conditional Steps</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600">{Math.round(contextualAnalysis.confidenceBonus || 0)}/10</div>
              <div className="text-gray-600">Confidence Bonus</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">{Math.round(contextualAnalysis.sequentialBonus || 0)}/10</div>
              <div className="text-gray-600">Sequential Flow</div>
            </div>
          </div>
        </div>
      )}

      {/* Missing Critical Steps Alert */}
      {missingCriticalSteps.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Missing Critical Steps</h4>
          <div className="flex flex-wrap gap-2">
            {missingCriticalSteps.map((step, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {formatStepName(step)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Steps Summary */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Conversation Steps Covered</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stepCounts).map(([step, count]) => (
            <span
              key={step}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStepColor(step)}`}
            >
              {formatStepName(step)} ({count})
            </span>
          ))}
        </div>
      </div>

      {/* Turn-by-Turn Flow */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Turn-by-Turn Analysis</h4>
        
        {displayedFlow.map((turn, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {/* Speaker Icon */}
              <div className={`p-2 rounded-lg ${(turn.speaker === 'bot' || turn.speaker === 'agent') ? 'bg-blue-100' : 'bg-green-100'}`}>
                {(turn.speaker === 'bot' || turn.speaker === 'agent') ? (
                  <Bot className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 text-green-600" />
                )}
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      Turn #{turn.turnNumber} - {(turn.speaker === 'bot' || turn.speaker === 'agent') ? 'Agent' : 'Human'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStepColor(turn.conversationStep)}`}>
                      {formatStepName(turn.conversationStep)}
                    </span>
                    {turn.stepNumber && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Step {turn.stepNumber}
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(turn.confidence)}`}>
                    {Math.round(turn.confidence * 100)}% confidence
                  </span>
                </div>

                {/* Intent */}
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Intent: </span>
                  <span className="text-sm text-gray-600">{turn.detectedIntent}</span>
                </div>

                {/* Text */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="font-medium text-gray-700">Text: </span>
                  <span className="text-gray-800">{turn.text}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Show More/Less Button */}
        {intentMappings.length > 10 && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn btn-secondary"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All ({intentMappings.length - 10} more)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Confidence Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-3">Priority-Based Confidence Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">High Confidence Steps</div>
            <div className="text-2xl font-bold text-green-600">
              {highConfidenceSteps.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Medium Confidence Steps</div>
            <div className="text-2xl font-bold text-yellow-600">
              {mediumConfidenceSteps.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Low Confidence Steps</div>
            <div className="text-2xl font-bold text-red-600">
              {lowConfidenceSteps.length}
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">Priority-Weighted Average</div>
          <div className="text-3xl font-bold text-purple-600">
            {Math.round(averageConfidence * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntentFlow;