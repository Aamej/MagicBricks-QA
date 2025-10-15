import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { Activity } from 'lucide-react';

const WaveformChart = ({ visualizationData }) => {
  if (!visualizationData || !visualizationData.waveformData) {
    return null;
  }

  const { waveformData, silenceMarkers, duration } = visualizationData;

  // Sample the waveform data for better performance (take every 10th point)
  const sampledData = waveformData.filter((_, index) => index % 10 === 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const time = parseFloat(label);
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`}</p>
          <p className="text-blue-600">{`Amplitude: ${payload[0].value.toFixed(3)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Audio Waveform Analysis</h3>
          <p className="text-gray-600">Visual representation with silence violations highlighted</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span>Audio Waveform</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 bg-opacity-30 rounded"></div>
            <span>Silence Violations ({silenceMarkers.length})</span>
          </div>
          <div className="text-gray-600">
            Duration: {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <ComposedChart data={sampledData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              type="number"
              scale="linear"
              domain={[0, duration]}
              tickFormatter={(value) => {
                const minutes = Math.floor(value / 60);
                const seconds = Math.floor(value % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
              }}
            />
            <YAxis 
              domain={[-1, 1]}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Silence markers as background areas */}
            {silenceMarkers.map((marker, index) => (
              <ReferenceLine
                key={index}
                x={marker.start}
                stroke="red"
                strokeDasharray="2 2"
                strokeOpacity={0.7}
              />
            ))}
            
            <Line
              type="monotone"
              dataKey="amplitude"
              stroke="#3b82f6"
              strokeWidth={1}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Silence Violations Summary */}
      {silenceMarkers.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-3">Silence Violations Detected</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {silenceMarkers.map((marker, index) => (
              <div key={index} className="bg-white p-3 rounded border border-red-200">
                <div className="text-sm">
                  <div className="font-medium text-red-700">
                    Violation #{index + 1}
                  </div>
                  <div className="text-gray-600">
                    {Math.floor(marker.start / 60)}:{Math.floor(marker.start % 60).toString().padStart(2, '0')} - {Math.floor(marker.end / 60)}:{Math.floor(marker.end % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-red-600 font-medium">
                    {marker.duration.toFixed(1)}s silence
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    After {marker.speaker} turn
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaveformChart;