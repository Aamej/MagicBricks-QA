import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ScoreOverview = ({ overallScore, scoreBreakdown }) => {
  const getScoreColor = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return <TrendingUp className="w-6 h-6" />;
    if (score >= 50) return <Minus className="w-6 h-6" />;
    return <TrendingDown className="w-6 h-6" />;
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Overall QA Score</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Score Circle */}
        <div className="text-center">
          <div className={`score-circle ${getScoreColor(overallScore)}`}>
            {Math.round(overallScore)}
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {getScoreIcon(overallScore)}
            <span className="text-lg font-semibold">{getScoreLabel(overallScore)}</span>
          </div>
          <p className="text-gray-600">Out of 100 points</p>
        </div>

        {/* Component Scores */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Score Breakdown</h4>
          
          {Object.entries(scoreBreakdown.componentScores).map(([key, score]) => {
            const weight = scoreBreakdown.weights[key];
            const explanation = scoreBreakdown.explanations[key];
            
            const formatLabel = (key) => {
              return key.replace(/([A-Z])/g, ' $1')
                       .replace(/^./, str => str.toUpperCase())
                       .trim();
            };

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    {formatLabel(key)}
                  </span>
                  <span className="font-semibold">
                    {Math.round(score)}/100 ({Math.round(weight * 100)}%)
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreColor(score).replace('score-', 'bg-')}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">{explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScoreOverview;