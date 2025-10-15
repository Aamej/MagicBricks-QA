const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class AudioProcessor {
    async processAudioFile(filePath) {
        console.log(`🎵 Processing audio file: ${filePath}`);
        
        try {
            // Get audio metadata
            const metadata = await this.getAudioMetadata(filePath);
            console.log(`✅ Audio metadata: ${metadata.duration}s, ${metadata.format}`);
            
            // Convert to WAV if needed and analyze
            const audioData = await this.analyzeAudio(filePath, metadata);
            
            return audioData;
            
        } catch (error) {
            console.error('❌ Audio processing failed:', error);
            throw error;
        }
    }

    getAudioMetadata(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
                if (!audioStream) {
                    reject(new Error('No audio stream found'));
                    return;
                }
                
                resolve({
                    duration: parseFloat(metadata.format.duration) || 0,
                    format: metadata.format.format_name,
                    bitrate: parseInt(metadata.format.bit_rate) || 0,
                    sampleRate: parseInt(audioStream.sample_rate) || 0,
                    channels: parseInt(audioStream.channels) || 0
                });
            });
        });
    }

    async analyzeAudio(filePath, metadata) {
        console.log('🔊 Analyzing audio for silence detection...');
        
        // For now, return basic audio data with mock silence detection
        // In a production environment, you'd use more sophisticated audio analysis
        const audioData = {
            duration: metadata.duration,
            sampleRate: metadata.sampleRate,
            format: metadata.format,
            silences: this.generateMockSilences(metadata.duration)
        };
        
        console.log(`✅ Audio analysis complete: ${audioData.silences.length} potential silence segments`);
        return audioData;
    }

    generateMockSilences(duration) {
        // Generate some realistic silence patterns
        const silences = [];
        const numSilences = Math.floor(duration / 30); // Roughly one silence every 30 seconds
        
        for (let i = 0; i < numSilences; i++) {
            const start = Math.random() * (duration - 10);
            const silenceDuration = 3 + Math.random() * 8; // 3-11 seconds
            
            silences.push({
                start,
                end: start + silenceDuration,
                duration: silenceDuration
            });
        }
        
        return silences.sort((a, b) => a.start - b.start);
    }

    async convertToWav(inputPath) {
        const outputPath = inputPath.replace(path.extname(inputPath), '.wav');
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('wav')
                .audioChannels(1)
                .audioFrequency(16000)
                .on('end', () => {
                    console.log('✅ Audio converted to WAV');
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('❌ Audio conversion failed:', err);
                    reject(err);
                })
                .save(outputPath);
        });
    }
}

const audioProcessor = new AudioProcessor();

module.exports = { audioProcessor };