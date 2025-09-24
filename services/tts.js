/**
 * Piper TTS Service Wrapper (MIT Licensed)
 * Generates voice coaching audio files for Chess Academy
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class PiperTTSService {
  constructor() {
    this.piperPath = process.env.PIPER_PATH || '/usr/local/bin/piper';
    this.voiceModel = process.env.PIPER_VOICE_MODEL || 'en_US-lessac-medium.onnx';
    this.outputDir = path.join(process.cwd(), 'public', 'audio', 'coach');
    this.cacheDir = path.join(process.cwd(), '.tts-cache');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
      console.log('TTS directories initialized');
    } catch (error) {
      console.error('Failed to create TTS directories:', error);
    }
  }

  /**
   * Generate hash for caching TTS files
   */
  generateHash(text, voiceId) {
    return crypto.createHash('md5')
      .update(`${text}-${voiceId}-${this.voiceModel}`)
      .digest('hex');
  }

  /**
   * Check if TTS file is already cached
   */
  async isCached(lineKey, voiceId) {
    const filename = `${lineKey}_${voiceId}.mp3`;
    const filepath = path.join(this.outputDir, filename);

    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Main render function: render(lineKey, voiceId) → mp3 path
   */
  async render(lineKey, voiceId, text, options = {}) {
    try {
      const filename = `${lineKey}_${voiceId}.mp3`;
      const outputPath = path.join(this.outputDir, filename);
      const tempWavPath = path.join(this.cacheDir, `${lineKey}_${voiceId}_temp.wav`);

      // Check if already cached
      if (await this.isCached(lineKey, voiceId) && !options.force) {
        console.log(`TTS cached: ${filename}`);
        return {
          success: true,
          audioPath: `/audio/coach/${filename}`,
          localPath: outputPath,
          cached: true,
          duration: await this.getAudioDuration(outputPath)
        };
      }

      console.log(`Generating TTS: ${lineKey} - "${text}"`);

      // Generate WAV with Piper
      await this.runPiper(text, tempWavPath);

      // Convert WAV to MP3 for web optimization
      await this.convertToMP3(tempWavPath, outputPath);

      // Clean up temp file
      await fs.unlink(tempWavPath).catch(() => {});

      const duration = await this.getAudioDuration(outputPath);

      return {
        success: true,
        audioPath: `/audio/coach/${filename}`,
        localPath: outputPath,
        cached: false,
        duration,
        size: (await fs.stat(outputPath)).size
      };

    } catch (error) {
      console.error(`TTS generation failed for ${lineKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        fallback: text // Return text for browser TTS fallback
      };
    }
  }

  /**
   * Run Piper TTS to generate WAV file
   */
  async runPiper(text, outputPath) {
    return new Promise((resolve, reject) => {
      console.log(`Running Piper: "${text}" -> ${path.basename(outputPath)}`);

      const piperArgs = [
        '--model', this.voiceModel,
        '--output_file', outputPath,
        '--speaker', '0', // Default speaker
        '--length_scale', '1.0', // Normal speed
        '--noise_scale', '0.667', // Voice variation
        '--noise_w', '0.8' // Phoneme variation
      ];

      const piper = spawn(this.piperPath, piperArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';

      piper.stdin.write(text);
      piper.stdin.end();

      piper.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      piper.on('close', async (code) => {
        if (code === 0) {
          try {
            // Verify output file exists
            await fs.access(outputPath);
            console.log(`Piper success: ${path.basename(outputPath)}`);
            resolve();
          } catch {
            reject(new Error('Piper output file not created'));
          }
        } else {
          reject(new Error(`Piper failed (code ${code}): ${stderr}`));
        }
      });

      piper.on('error', (error) => {
        reject(new Error(`Piper process error: ${error.message}`));
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        piper.kill('SIGTERM');
        reject(new Error('Piper TTS timeout (30s)'));
      }, 30000);
    });
  }

  /**
   * Convert WAV to MP3 using ffmpeg
   */
  async convertToMP3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-acodec', 'mp3',
        '-ab', '64k', // 64kbps for web optimization
        '-ar', '22050', // 22kHz sample rate
        '-y', // Overwrite output
        outputPath
      ], { stdio: ['pipe', 'pipe', 'pipe'] });

      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed (code ${code}): ${stderr}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg error: ${error.message}`));
      });

      setTimeout(() => {
        ffmpeg.kill('SIGTERM');
        reject(new Error('FFmpeg timeout'));
      }, 15000);
    });
  }

  /**
   * Get audio file duration using ffprobe
   */
  async getAudioDuration(audioPath) {
    return new Promise((resolve) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        audioPath
      ]);

      let stdout = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(stdout);
            const duration = parseFloat(info.format.duration) || 2.0;
            resolve(duration);
          } catch {
            resolve(2.0); // Default duration
          }
        } else {
          resolve(2.0); // Default duration
        }
      });

      ffprobe.on('error', () => {
        resolve(2.0); // Default duration
      });
    });
  }

  /**
   * Batch render multiple phrases
   */
  async renderBatch(phrases) {
    const results = [];
    console.log(`Batch rendering ${phrases.length} phrases...`);

    for (const { lineKey, voiceId, text } of phrases) {
      const result = await this.render(lineKey, voiceId, text);
      results.push({ lineKey, ...result });

      // Small delay between renders to prevent system overload
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    console.log(`Batch complete: ${successful} success, ${failed} failed`);
    return results;
  }

  /**
   * Pre-generate common chess coaching phrases
   */
  async preGenerateCommonPhrases() {
    console.log('Pre-generating common chess coaching phrases...');

    const commonPhrases = [
      { lineKey: 'GOOD_MOVE_1', text: 'Nice idea!', voiceId: 'en_US_lessac' },
      { lineKey: 'GOOD_MOVE_2', text: 'That improves your activity.', voiceId: 'en_US_lessac' },
      { lineKey: 'EXCELLENT_1', text: 'Brilliant move!', voiceId: 'en_US_lessac' },
      { lineKey: 'CHECK', text: 'Check!', voiceId: 'en_US_lessac' },
      { lineKey: 'CHECKMATE', text: 'Checkmate! Well played!', voiceId: 'en_US_lessac' },
      { lineKey: 'HANGING_WARNING', text: 'Careful — your piece is hanging.', voiceId: 'en_US_lessac' },
      { lineKey: 'BLUNDER_1', text: 'Think again — that loses material.', voiceId: 'en_US_lessac' },
      { lineKey: 'ENCOURAGEMENT_1', text: 'Keep thinking!', voiceId: 'en_US_lessac' },
      { lineKey: 'OPENING_1', text: 'Good opening principle!', voiceId: 'en_US_lessac' },
      { lineKey: 'ENDGAME_1', text: 'Activate your king in the endgame.', voiceId: 'en_US_lessac' },
      { lineKey: 'TACTICAL_1', text: 'Look for pins and forks.', voiceId: 'en_US_lessac' },
      { lineKey: 'POSITIONAL_1', text: 'Control key squares.', voiceId: 'en_US_lessac' },
      { lineKey: 'TIME_WARNING', text: 'Time is running low.', voiceId: 'en_US_lessac' },
      { lineKey: 'LEVEL_UP', text: 'Ready for the next level?', voiceId: 'en_US_lessac' },
      { lineKey: 'PROGRESS', text: 'Your chess is improving!', voiceId: 'en_US_lessac' }
    ];

    return await this.renderBatch(commonPhrases);
  }

  /**
   * Health check - verify Piper installation
   */
  async healthCheck() {
    try {
      console.log('Checking Piper TTS installation...');

      // Check Piper executable
      await fs.access(this.piperPath);
      console.log(`✓ Piper found at: ${this.piperPath}`);

      // Check voice model
      if (path.isAbsolute(this.voiceModel)) {
        await fs.access(this.voiceModel);
        console.log(`✓ Voice model found: ${this.voiceModel}`);
      } else {
        console.log(`ℹ Voice model: ${this.voiceModel} (relative path)`);
      }

      // Test TTS generation
      const testResult = await this.render(
        'HEALTH_CHECK',
        'test',
        'Chess Academy voice system is working.',
        { force: true }
      );

      if (testResult.success) {
        console.log('✓ TTS generation test successful');
        return { healthy: true, message: 'Piper TTS service operational' };
      } else {
        console.log('✗ TTS generation test failed');
        return { healthy: false, message: testResult.error };
      }

    } catch (error) {
      console.error('Health check failed:', error.message);
      return {
        healthy: false,
        message: `Piper TTS not available: ${error.message}`,
        fallback: 'Browser Web Speech API will be used'
      };
    }
  }

  /**
   * Clear TTS cache
   */
  async clearCache() {
    try {
      const files = await fs.readdir(this.outputDir);
      const audioFiles = files.filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));

      for (const file of audioFiles) {
        await fs.unlink(path.join(this.outputDir, file));
      }

      console.log(`Cleared ${audioFiles.length} TTS cache files`);
      return { cleared: audioFiles.length };
    } catch (error) {
      console.error('Cache clear failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Get TTS cache statistics
   */
  async getCacheStats() {
    try {
      const files = await fs.readdir(this.outputDir);
      const audioFiles = files.filter(f => f.endsWith('.mp3'));

      let totalSize = 0;
      for (const file of audioFiles) {
        const stats = await fs.stat(path.join(this.outputDir, file));
        totalSize += stats.size;
      }

      return {
        files: audioFiles.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        directory: this.outputDir
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Export singleton instance
export const piperTTS = new PiperTTSService();
export default PiperTTSService;