import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, PlayCircle, ArrowLeft, AlertCircle, Type, X } from 'lucide-react';
import { bumpStat } from '../lib/appStats';

type CommunicationTab = 'speech' | 'roleplay' | 'training';
type SupportState = 'checking' | 'supported' | 'unsupported';
type MicPermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

interface FillerBreakdownItem {
  word: string;
  count: number;
}

interface SpeechAnalysis {
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  wpm: number;
  fillerCount: number;
  fillerBreakdown: FillerBreakdownItem[];
  pauseCount: number;
  longestPauseSeconds: number;
  avgConfidence: number; // 0-100, only meaningful if speech recognition ran
  avgVolume: number; // 0-100
  clarity: 'Good' | 'Average' | 'Needs Improvement';
  volumeLabel: 'Low' | 'Medium' | 'High';
  fluency: 'Smooth' | 'Some pauses' | 'Many pauses';
}

interface TrainingVideo {
  id: number;
  title: string;
  category: string;
  youtubeId: string;
  duration: string;
  description: string;
}

const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of'];

export function Communication() {
  const [activeTab, setActiveTab] = useState<CommunicationTab>('speech');

  // Browser / permission capability checks
  const [supportState, setSupportState] = useState<SupportState>('checking');
  const [micPermission, setMicPermission] = useState<MicPermissionState>('unknown');
  const [micError, setMicError] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Manual typing fallback (unsupported browser, denied mic, or by choice)
  const [useManualMode, setUseManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Results
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<SpeechAnalysis | null>(null);

  // Role-play state
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Voice Training state
  const [selectedTrainingVideo, setSelectedTrainingVideo] = useState<TrainingVideo | null>(null);

  // Refs for speech recognition + audio analysis - refs (not state) so the
  // event callbacks always see the latest values without stale closures.
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const confidenceScoresRef = useRef<number[]>([]);
  const volumeSamplesRef = useRef<number[]>([]);
  const pauseDurationsRef = useRef<number[]>([]);
  const lastResultTimestampRef = useRef<number | null>(null);

  // Detect browser support + mic permission state on mount
  useEffect(() => {
    const hasSpeechRecognition =
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));
    setSupportState(hasSpeechRecognition ? 'supported' : 'unsupported');
    if (!hasSpeechRecognition) setUseManualMode(true);

    if (typeof navigator !== 'undefined' && (navigator as any).permissions?.query) {
      (navigator as any).permissions
        .query({ name: 'microphone' })
        .then((status: any) => {
          setMicPermission(status.state);
          status.onchange = () => setMicPermission(status.state);
        })
        .catch(() => {
          // Permissions API doesn't support querying "microphone" in every
          // browser (notably Safari) - we'll find out for real on record.
        });
    }
  }, []);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      }
      cleanupAudioResources();
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const cleanupAudioResources = () => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const scenarioVideos: Record<string, string> = {
    'Job Interview': 'naIkpQ_cIt0',
    'Public Speaking': 'Tnn2hpYhH-s',
    'Conflict Resolution': 'v4sby5j4dTY',
    'Class Presentation': 'XrZH066n-Fg',
    'Debate Practice': '4BTVcfmY_-4'
  };

  const scenarios = [
    { id: 1, title: 'Job Interview', icon: '💼', difficulty: 'Medium' },
    { id: 2, title: 'Public Speaking', icon: '🎤', difficulty: 'Hard' },
    { id: 3, title: 'Conflict Resolution', icon: '🤝', difficulty: 'Medium' },
    { id: 4, title: 'Class Presentation', icon: '📊', difficulty: 'Easy' },
    { id: 5, title: 'Debate Practice', icon: '⚖️', difficulty: 'Hard' }
  ];

  const trainingVideos: TrainingVideo[] = [
    {
      id: 1,
      title: 'How to Speak Clearly and Confidently',
      category: 'Voice Clarity',
      youtubeId: '03iwO3d6AUs',
      duration: '6:24',
      description: 'Learn techniques to improve your speaking clarity and project confidence'
    },
    {
      id: 2,
      title: 'Public Speaking Tips: Be More Confident',
      category: 'Confidence',
      youtubeId: 'LohaQE65dlE',
      duration: '8:12',
      description: 'Master public speaking with these practical confidence-building tips'
    },
    {
      id: 3,
      title: 'How to Sound Smarter When You Speak',
      category: 'Communication Skills',
      youtubeId: 'gW8v_wAGQY8',
      duration: '5:47',
      description: 'Practical advice to enhance your verbal communication and sound more articulate'
    },
    {
      id: 4,
      title: 'Improve Your Voice - Daily Vocal Exercises',
      category: 'Voice Training',
      youtubeId: '9XmZewUz8FQ',
      duration: '10:33',
      description: 'Daily exercises to strengthen and improve your speaking voice'
    },
    {
      id: 5,
      title: 'How to Eliminate Filler Words (Um, Ah, Like)',
      category: 'Fluency',
      youtubeId: 'yLRzqRO2UJE',
      duration: '7:15',
      description: 'Strategies to reduce filler words and speak more fluently'
    },
    {
      id: 6,
      title: 'Speak Without Hesitation - Improve Fluency',
      category: 'Fluency',
      youtubeId: 'U9vqtyWE3-o',
      duration: '9:28',
      description: 'Techniques to speak smoothly without hesitation or pauses'
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetCapturedData = () => {
    finalTranscriptRef.current = '';
    confidenceScoresRef.current = [];
    volumeSamplesRef.current = [];
    pauseDurationsRef.current = [];
    lastResultTimestampRef.current = null;
  };

  const startRecording = async () => {
    setMicError(null);
    setHasAnalysis(false);
    setAnalysisResults(null);
    setLiveTranscript('');
    setRecordingTime(0);
    setVolumeLevel(0);
    resetCapturedData();

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSupportState('unsupported');
      setUseManualMode(true);
      return;
    }

    // Set up microphone stream + volume analysis first, since permission
    // errors surface here before speech recognition even starts.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaStreamRef.current = stream;
      setMicPermission('granted');

      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx: AudioContext = new AudioCtor();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      volumeIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
        const pct = Math.min(100, Math.round((avg / 128) * 100));
        volumeSamplesRef.current.push(pct);
        setVolumeLevel(pct);
      }, 150);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setMicError('Microphone access was denied. Allow microphone access for this site in your browser settings, then try again.');
        setMicPermission('denied');
      } else if (err?.name === 'NotFoundError') {
        setMicError('No microphone was found on this device.');
      } else {
        setMicError('Could not access the microphone. You can type your speech below instead.');
      }
      setUseManualMode(true);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text: string = result[0].transcript;
        if (result.isFinal) {
          const now = performance.now();
          if (lastResultTimestampRef.current !== null) {
            const gapSeconds = (now - lastResultTimestampRef.current) / 1000;
            if (gapSeconds > 1.5) pauseDurationsRef.current.push(gapSeconds);
          }
          lastResultTimestampRef.current = now;
          finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + text.trim()).trim();
          if (typeof result[0].confidence === 'number' && result[0].confidence > 0) {
            confidenceScoresRef.current.push(result[0].confidence);
          }
        } else {
          interim += text;
        }
      }
      setLiveTranscript((finalTranscriptRef.current + ' ' + interim).trim());
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed') {
        setMicError('Microphone permission was denied.');
        setMicPermission('denied');
        shouldRestartRef.current = false;
        stopRecording();
        return;
      }
      if (event.error === 'audio-capture') {
        setMicError('No microphone could be accessed.');
        shouldRestartRef.current = false;
        stopRecording();
        return;
      }
      if (event.error === 'network') {
        setMicError('Network error - speech recognition needs an internet connection.');
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current && isRecordingRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch { /* ignore - already running */ }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    isRecordingRef.current = true;

    try {
      recognition.start();
    } catch {
      setMicError('Could not start speech recognition. Please try again.');
      cleanupAudioResources();
      return;
    }

    setIsRecording(true);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    shouldRestartRef.current = false;
    isRecordingRef.current = false;
    setIsRecording(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    cleanupAudioResources();

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    // Give the final onresult event a beat to land before scoring.
    setTimeout(() => computeAnalysis(), 300);
  };

  const computeAnalysis = (durationOverride?: number) => {
    const transcript = finalTranscriptRef.current.trim();
    const duration = Math.max(durationOverride ?? recordingTime, 1);

    if (!transcript) {
      setAnalysisResults({
        transcript: '',
        durationSeconds: duration,
        wordCount: 0,
        wpm: 0,
        fillerCount: 0,
        fillerBreakdown: [],
        pauseCount: 0,
        longestPauseSeconds: 0,
        avgConfidence: 0,
        avgVolume: 0,
        clarity: 'Needs Improvement',
        volumeLabel: 'Low',
        fluency: 'Many pauses'
      });
      setHasAnalysis(true);
      return;
    }

    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const wpm = Math.round(wordCount / (duration / 60));

    const fillerBreakdown: FillerBreakdownItem[] = FILLER_WORDS
      .map(word => {
        const matches = transcript.match(new RegExp(`\\b${word}\\b`, 'gi'));
        return { word, count: matches ? matches.length : 0 };
      })
      .filter(item => item.count > 0);
    const fillerCount = fillerBreakdown.reduce((sum, item) => sum + item.count, 0);
    const fillerRate = wordCount > 0 ? fillerCount / wordCount : 0;

    const pauseCount = pauseDurationsRef.current.length;
    const longestPauseSeconds = pauseDurationsRef.current.length
      ? Math.round(Math.max(...pauseDurationsRef.current) * 10) / 10
      : 0;

    const avgConfidence = confidenceScoresRef.current.length
      ? Math.round(
          (confidenceScoresRef.current.reduce((a, b) => a + b, 0) / confidenceScoresRef.current.length) * 100
        )
      : 0;

    const avgVolume = volumeSamplesRef.current.length
      ? Math.round(volumeSamplesRef.current.reduce((a, b) => a + b, 0) / volumeSamplesRef.current.length)
      : 0;

    let clarityScore = 100 - fillerRate * 150 - pauseCount * 4;
    if (avgConfidence > 0) {
      clarityScore = clarityScore * 0.6 + avgConfidence * 0.4;
    }
    clarityScore = Math.max(0, Math.min(100, Math.round(clarityScore)));

    const clarity: SpeechAnalysis['clarity'] =
      clarityScore >= 75 ? 'Good' : clarityScore >= 50 ? 'Average' : 'Needs Improvement';

    const volumeLabel: SpeechAnalysis['volumeLabel'] =
      avgVolume === 0 ? 'Medium' : avgVolume < 25 ? 'Low' : avgVolume < 65 ? 'Medium' : 'High';

    const fluency: SpeechAnalysis['fluency'] =
      pauseCount === 0 && fillerCount === 0
        ? 'Smooth'
        : pauseCount <= 2 && fillerCount <= 3
        ? 'Some pauses'
        : 'Many pauses';

    setAnalysisResults({
      transcript,
      durationSeconds: duration,
      wordCount,
      wpm,
      fillerCount,
      fillerBreakdown,
      pauseCount,
      longestPauseSeconds,
      avgConfidence,
      avgVolume,
      clarity,
      volumeLabel,
      fluency
    });
    setHasAnalysis(true);
    bumpStat('speechAnalysesCompleted');
  };

  const analyzeManualInput = () => {
    if (!manualInput.trim()) return;
    resetCapturedData();
    finalTranscriptRef.current = manualInput.trim();
    const estimatedSeconds = Math.max(5, Math.round((manualInput.trim().split(/\s+/).length / 150) * 60));
    setRecordingTime(estimatedSeconds);
    computeAnalysis(estimatedSeconds);
  };

  const tryAgain = () => {
    setHasAnalysis(false);
    setAnalysisResults(null);
    setLiveTranscript('');
    setManualInput('');
    setRecordingTime(0);
    setVolumeLevel(0);
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-gray-800 dark:text-white mb-2">Communication Booster</h1>
          <p className="text-gray-600 dark:text-gray-300">Practice and improve your speaking skills</p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl shadow">
          <button
            onClick={() => setActiveTab('speech')}
            className={`py-3 px-2 rounded-lg transition-all text-sm ${
              activeTab === 'speech'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🎙️ Speech Analysis
          </button>
          <button
            onClick={() => setActiveTab('roleplay')}
            className={`py-3 px-2 rounded-lg transition-all text-sm ${
              activeTab === 'roleplay'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🎭 Role-Play
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`py-3 px-2 rounded-lg transition-all text-sm ${
              activeTab === 'training'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            📚 Voice Training
          </button>
        </div>

        {/* Speech Analysis Tab */}
        {activeTab === 'speech' && (
          <div className="space-y-4">
            {!hasAnalysis && (
              <>
                {supportState === 'unsupported' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex gap-3">
                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Live speech recognition isn't supported in this browser. Try Chrome, Edge, or Safari (iOS 14.5+) for real-time analysis - for now you can type what you'd like to say below.
                    </p>
                  </div>
                )}

                {micError && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 flex gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-800 dark:text-red-200">{micError}</p>
                  </div>
                )}

                {!useManualMode && supportState === 'supported' && (
                  <div className="bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 p-8 rounded-2xl shadow-lg">
                    <div className="text-center mb-6">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center transition-all transform ${
                          isRecording
                            ? 'bg-red-500 animate-pulse scale-110 shadow-2xl'
                            : 'bg-green-500 hover:scale-110 hover:shadow-xl'
                        }`}
                      >
                        {isRecording ? (
                          <StopCircle className="text-white" size={48} />
                        ) : (
                          <Mic className="text-white" size={48} />
                        )}
                      </button>
                      <p className="text-gray-800 dark:text-white text-lg mb-2">
                        {isRecording ? 'Recording... speak naturally' : 'Tap to start recording'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isRecording ? `Time: ${formatTime(recordingTime)}` : 'Uses your microphone with live transcription'}
                      </p>
                    </div>

                    {isRecording && (
                      <div className="space-y-4">
                        {/* Real volume-driven sound wave */}
                        <div className="flex items-end justify-center gap-1 h-12">
                          {[...Array(9)].map((_, i) => {
                            const wobble = Math.sin((Date.now() / 180) + i) * 8;
                            const height = Math.max(6, Math.min(48, (volumeLevel / 100) * 48 + wobble));
                            return (
                              <div
                                key={i}
                                className="w-2 bg-green-600 dark:bg-green-400 rounded-full transition-all duration-100"
                                style={{ height: `${height}px` }}
                              />
                            );
                          })}
                        </div>

                        {/* Volume meter */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Volume</span>
                            <span>{volumeLevel}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all duration-150"
                              style={{ width: `${volumeLevel}%` }}
                            />
                          </div>
                        </div>

                        {/* Live transcript */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Live transcript</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 min-h-[3rem]">
                            {liveTranscript || 'Start speaking...'}
                          </p>
                          <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{liveTranscript.split(/\s+/).filter(Boolean).length} words</span>
                            <span>
                              {recordingTime > 0
                                ? Math.round(liveTranscript.split(/\s+/).filter(Boolean).length / (recordingTime / 60))
                                : 0}{' '}
                              WPM
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!useManualMode && supportState === 'supported' && (
                  <button
                    onClick={() => setUseManualMode(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2"
                  >
                    <Type size={16} />
                    Type instead
                  </button>
                )}

                {useManualMode && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-800 dark:text-white">Type your speech</h3>
                      {supportState === 'supported' && !micError && (
                        <button
                          onClick={() => setUseManualMode(false)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      placeholder="e.g., Hello everyone, I'm excited to share my thoughts today..."
                      className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white resize-none focus:outline-none focus:border-green-400 dark:focus:border-green-500 text-sm"
                    />
                    <button
                      onClick={analyzeManualInput}
                      disabled={!manualInput.trim()}
                      className="w-full mt-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-colors"
                    >
                      Analyze
                    </button>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-blue-800 dark:text-blue-200 mb-2">For the most accurate analysis</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use a quiet room with minimal background noise</li>
                    <li>• Speak at a normal conversational pace</li>
                    <li>• Position yourself 6-12 inches from your microphone</li>
                    <li>• Speak for at least 15-20 seconds for reliable metrics</li>
                  </ul>
                </div>
              </>
            )}

            {/* Analysis Results */}
            {hasAnalysis && analysisResults && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h2 className="text-gray-800 dark:text-white mb-4">Speech Analysis Results</h2>

                  {analysisResults.wordCount === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        No speech was detected. Try again and speak a little closer to the microphone, or type your speech instead.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Primary Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Clarity</p>
                          <p className="text-2xl text-blue-700 dark:text-blue-300">{analysisResults.clarity}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Volume</p>
                          <p className="text-2xl text-green-700 dark:text-green-300">{analysisResults.volumeLabel}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                          <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Fluency</p>
                          <p className="text-2xl text-purple-700 dark:text-purple-300">{analysisResults.fluency}</p>
                        </div>
                      </div>

                      {/* Detailed Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <MetricTile label="Words" value={String(analysisResults.wordCount)} />
                        <MetricTile label="Pace" value={`${analysisResults.wpm} WPM`} />
                        <MetricTile label="Duration" value={formatTime(analysisResults.durationSeconds)} />
                        <MetricTile
                          label="Confidence"
                          value={analysisResults.avgConfidence > 0 ? `${analysisResults.avgConfidence}%` : '—'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <MetricTile label="Filler words" value={String(analysisResults.fillerCount)} />
                        <MetricTile
                          label="Long pauses"
                          value={
                            analysisResults.pauseCount > 0
                              ? `${analysisResults.pauseCount} (longest ${analysisResults.longestPauseSeconds}s)`
                              : '0'
                          }
                        />
                      </div>

                      {analysisResults.fillerBreakdown.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Filler words used</p>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.fillerBreakdown.map(item => (
                              <span
                                key={item.word}
                                className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-xs"
                              >
                                "{item.word}" × {item.count}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Transcript */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <h3 className="text-gray-700 dark:text-gray-300 mb-2">Your Speech</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {analysisResults.transcript || 'No speech captured.'}
                    </p>
                  </div>

                  <button
                    onClick={tryAgain}
                    className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Role-Play Tab */}
        {activeTab === 'roleplay' && (
          <div className="space-y-4">
            {!selectedScenario ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h2 className="text-gray-800 dark:text-white mb-4">Choose a Scenario</h2>
                  <div className="grid gap-3">
                    {scenarios.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenario(scenario.title);
                          setSelectedVideoId(scenarioVideos[scenario.title]);
                        }}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-xl hover:shadow-lg transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{scenario.icon}</span>
                            <div>
                              <h3 className="text-gray-800 dark:text-white">{scenario.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty: {scenario.difficulty}</p>
                            </div>
                          </div>
                          <span className="text-purple-600 dark:text-purple-400">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 dark:text-white">{selectedScenario}</h2>
                  <button
                    onClick={() => {
                      setSelectedScenario(null);
                      setSelectedVideoId(null);
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    ← Back
                  </button>
                </div>

                {selectedVideoId && (
                  <div className="mb-4">
                    <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${selectedVideoId}`}
                        title={selectedScenario}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-blue-800 dark:text-blue-200 mb-2">Practice Tips</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Watch the scenario video to understand the context</li>
                    <li>• Think about what you would say in this situation</li>
                    <li>• Practice your response out loud</li>
                    <li>• Focus on clarity, tone, and confidence</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            {!selectedTrainingVideo ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h2 className="text-gray-800 dark:text-white mb-4">Voice Training Videos</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Watch these expert videos to improve your speaking skills
                  </p>

                  <div className="grid gap-4">
                    {trainingVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedTrainingVideo(video)}
                        className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 p-4 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-700"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <PlayCircle className="text-orange-600 dark:text-orange-400" size={48} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-gray-800 dark:text-white mb-1">{video.title}</h3>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">{video.category} • {video.duration}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{video.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <button
                  onClick={() => setSelectedTrainingVideo(null)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
                >
                  <ArrowLeft size={20} />
                  Back to Videos
                </button>

                <h2 className="text-gray-800 dark:text-white mb-2">{selectedTrainingVideo.title}</h2>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                  {selectedTrainingVideo.category} • {selectedTrainingVideo.duration}
                </p>

                <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedTrainingVideo.youtubeId}`}
                    title={selectedTrainingVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                  <h3 className="text-orange-800 dark:text-orange-200 mb-2">About this video</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {selectedTrainingVideo.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}
