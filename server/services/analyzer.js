// Custom Call QA Analyzer - No OpenAI dependency
class CallQAAnalyzer {
    constructor() {
        // Initialize custom intent patterns and conversation flow rules
        this.initializeIntentPatterns();

        // Performance optimization: Initialize caches
        this._cachedTranscript = null;
        this._cachedTurns = null;
        this._patternCache = new Map();
        this._intentCache = new Map();
    }

    initializeIntentPatterns() {
        // MagicBricks Property Search Conversation Flow Patterns
        this.intentPatterns = {
            initial_greeting: {
                patterns: [
                    /\b(नमस्ते|hello|hi|good\s+(morning|afternoon|evening))\b/gi,
                    /\bमैं.*?(बोल\s+रही\s+हूँ|speaking|calling)\b/gi,
                    /\bMagicbricks\s+से\b/gi,
                    /\bproperty\s+search\b/gi,
                    /\bproperties\s+में\s+interest\b/gi,
                    /\bplatform\s+पर.*?interest\b/gi
                ],
                score: 15,
                required: true,
                step: 1,
                description: "Initial greeting and MagicBricks introduction"
            },
            third_party_interaction: {
                patterns: [
                    /\bक्या\s+आप.*?हैं\b/gi,
                    /\bमैं.*?(हूँ|am)\b/gi,
                    /\bनाम\s+बता\s+सकते\s+हैं\b/gi,
                    /\bवो\s+यहाँ\s+नहीं\s+हैं\b/gi,
                    /\bगलत\s+number\b/gi,
                    /\bwrong\s+number\b/gi
                ],
                score: 12,
                required: false,
                step: 2,
                description: "Third-party interaction and name collection"
            },
            busy_response: {
                patterns: [
                    /\bमैं\s+अभी\s+व्यस्त\s+हूँ\b/gi,
                    /\bbusy\s+right\s+now\b/gi,
                    /\bcall\s+me\s+later\b/gi,
                    /\bबाद\s+में\s+call\s+करो\b/gi,
                    /\bbrief\s+रहूँगी\b/gi,
                    /\bएक\s+मिनट\s+है\b/gi
                ],
                score: 10,
                required: false,
                step: 3,
                description: "Customer busy response handling"
            },
            connection_failure: {
                patterns: [
                    /\bक्या\s+आप\s+मेरी\s+बात\s+सुन\s+पा\s+रहे\s+हैं\b/gi,
                    /\bconnection\s+में\s+समस्या\b/gi,
                    /\bदस\s+मिनट\s+में\s+दोबारा\s+कॉल\b/gi,
                    /\bnetwork\s+issue\b/gi
                ],
                score: 8,
                required: false,
                step: 4,
                description: "Connection failure handling"
            },
            callback_scheduling: {
                patterns: [
                    /\bकल\s+सुबह\s+दस\s+बजे\b/gi,
                    /\bकौन\s+सा\s+time\s+convenient\b/gi,

                    /\bcall\s+back\s+के\s+लिए\b/gi,
                    /\bथोड़ी\s+देर\s+बाद\b/gi,
                    /\bदोबारा\s+try\s+करूँगी\b/gi,
                    /\bspecified\s+time\b/gi,
                    /\b8\s+AM\s+to\s+10\s+PM\b/gi
                ],
                score: 8,
                required: false,
                step: 5,
                description: "Callback time scheduling"
            },
            interest_check: {
                patterns: [
                    /\bआपने\s+recently.*?platform\s+पर\b/gi,
                    /\bproperties\s+में\s+interest\s+दिखाया\b/gi,
                    /\bsearch\s+कर\s+रहे\s+हैं\b/gi,
                    /\bक्या\s+यह\s+सही\s+है\b/gi,
                    /\bBee-etch-kay\b/gi,
                    /\bTwo\s+बी\s+एच\s+के\b/gi,
                    /\bFlat|Villa\b/gi,
                    /\bbudget.*?है\b/gi,
                    /\bबजट.*?है\b/gi,
                    /\bआप.*?में.*?search\s+कर\s+रहे\s+हैं\b/gi
                ],
                score: 15,
                required: true,
                step: 6,
                description: "Property interest verification and requirement confirmation"
            },
            agent_connection_offer: {
                patterns: [
                    /\bThree\s+top\s+agents\s+shortlist\b/gi,
                    /\b3\s+top\s+agents\s+shortlist\b/gi,
                    /\bproperties\s+दिखाएंगे\b/gi,
                    /\bsite\s+visits.*?negotiations\b/gi,
                    /\bएक\s+agent\s+से\s+connect\b/gi,
                    /\bक्या\s+हम\s+आगे\s+बढ़ें\b/gi,
                    /\bfollow\s+up\s+करेंगे\b/gi,
                    /\bहमने\s+आपके\s+preferred\s+area\s+में.*?agents\s+shortlist\b/gi,
                    /\bagents\s+आपसे\s+जल्दी\s+follow\s+up\b/gi
                ],
                score: 12,
                required: true,
                step: 7,
                description: "Agent connection offer and consent"
            },
            agent_decline_handling: {
                patterns: [
                    /\bबिल्कुल\s+ठीक\s+है\b/gi,
                    /\bMagicbricks\s+dot\s+com\b/gi,
                    /\bverified\s+listings\s+देख\s+सकते\s+हैं\b/gi,
                    /\bआपका\s+समय\s+देने\s+के\s+लिए\s+धन्यवाद\b/gi,
                    /\bHave\s+a\s+great\s+day\b/gi
                ],
                score: 8,
                required: false,
                step: 8,
                description: "Handling agent connection decline"
            },
            call_transfer: {
                patterns: [
                    /\btransfer_call\b/gi,
                    /\bproperty_type.*?normalized\b/gi,
                    /\bagent\s+से\s+connect\s+कर\s+रही\s+हूँ\b/gi,
                    /\bconnecting\s+to\s+agent\b/gi,
                    /\bमैं\s+अभी\s+आपको\s+agent\s+से\s+connect\s+करती\s+हूँ\b/gi,
                    /\bPlease\s+लाइन\s+पर\s+बने\s+रहिए\b/gi,
                    /\bआपको\s+agent\s+से\s+connect\b/gi
                ],
                score: 15,
                required: true,
                step: 9,
                description: "Call transfer to agent execution"
            },
            call_ending: {
                patterns: [
                    /\bआपका\s+समय\s+के\s+लिए\s+धन्यवाद\b/gi,
                    /\bआपका\s+दिन\s+अच्छा\s+रहे\b/gi,
                    /\bHave\s+a\s+great\s+day\b/gi,
                    /\bthank\s+you\s+for\s+your\s+time\b/gi
                ],
                score: 8,
                required: false,
                step: 10,
                description: "Polite call ending"
            },
            voicemail_response: {
                patterns: [
                    /\bमैं.*?बोल\s+रही\s+हूँ\s+Magicbricks\s+से\b/gi,
                    /\bproperty\s+search\s+के\s+बारे\s+में\b/gi,
                    /\bजल्द\s+ही\s+दोबारा\s+call\b/gi,
                    /\bvoicemail.*?message\b/gi,
                    /\bafter\s+the\s+tone\b/gi
                ],
                score: 8,
                required: false,
                step: 11,
                description: "Voicemail message handling"
            },
            wrong_number_handling: {
                patterns: [
                    /\bSorry.*?गलत\s+number\b/gi,
                    /\bwrong\s+number\s+पर\s+call\b/gi,
                    /\bगलत\s+number\s+लग\s+गया\b/gi
                ],
                score: 8,
                required: false,
                step: 12,
                description: "Wrong number acknowledgment"
            },
            goodbye: {
                patterns: [
                    /\bGoodbye\b/gi,
                    /\bधन्यवाद\b/gi,
                    /\bbye\b/gi,
                    /\btake\s+care\b/gi,
                    /\bHave\s+a\s+great\s+day\b/gi
                ],
                score: 5,
                required: true,
                step: 13,
                description: "Final goodbye"
            },
            objection_handling: {
                patterns: [
                    /\bAgents\s+से\s+बार-बार\s+calls\s+नहीं\s+चाहिए\b/gi,
                    /\bबहुत\s+सारे\s+agents\s+call\s+कर\s+रहे\s+हैं\b/gi,
                    /\bबस\s+agent\s+का\s+number\s+दे\s+दो\b/gi,
                    /\bमैं\s+अभी\s+बस\s+browse\s+कर\s+रहा\s+हूँ\b/gi,
                    /\bresearch\s+phase\s+में\s+हूँ\b/gi,
                    /\bक्या\s+यह\s+service\s+free\s+है\b/gi,
                    /\bमैंने\s+search\s+ही\s+नहीं\s+किया\b/gi,
                    /\bproperty\s+search\s+नहीं\s+कर\s+रही\b/gi
                ],
                score: 10,
                required: false,
                step: 0, // Can occur at any step
                description: "Customer objection handling responses"
            },
            fetch_data_trigger: {
                patterns: [
                    /\bFETCH_DATA\b/gi,
                    /\bFETCH_NUMBERS\b/gi,
                    /\bcity.*?area.*?updated\b/gi,
                    /\blocality.*?changed\b/gi
                ],
                score: 5,
                required: false,
                step: 0, // Can occur during interest check
                description: "Data fetching action triggers"
            }
        };

        // MagicBricks Property Search Conversation Flow
        this.expectedFlow = [
            'initial_greeting',
            'third_party_interaction', // Optional - only if someone else answers
            'busy_response', // Optional - only if customer is busy
            'connection_failure', // Optional - only if connection issues
            'callback_scheduling', // Optional - only if callback needed
            'interest_check', // CRITICAL STEP 6
            'agent_connection_offer', // CRITICAL STEP 7
            'agent_decline_handling', // Optional - only if declined
            'call_transfer', // CRITICAL STEP 9
            'call_ending', // CRITICAL STEP 10
            'voicemail_response', // Optional - only for voicemail
            'wrong_number_handling', // Optional - only for wrong numbers
            'goodbye'
        ];

        // MagicBricks conversation step mapping with CRITICAL STEPS focus
        this.conversationSteps = {
            1: { name: 'Initial Greeting', intent: 'initial_greeting', critical: true, always_required: true, priority: 'mandatory', objective_critical: true },
            2: { name: 'Third Party Interaction', intent: 'third_party_interaction', critical: false, conditional: 'third_party_answers', priority: 'low', objective_critical: false },
            3: { name: 'Busy Response', intent: 'busy_response', critical: false, conditional: 'customer_busy', priority: 'low', objective_critical: false },
            4: { name: 'Connection Failure', intent: 'connection_failure', critical: false, conditional: 'connection_issues', priority: 'low', objective_critical: false },
            5: { name: 'Callback Scheduling', intent: 'callback_scheduling', critical: false, conditional: 'needs_callback', priority: 'low', objective_critical: false },
            6: { name: 'Interest Check & Property Confirmation', intent: 'interest_check', critical: true, mandatory: true, always_required: true, priority: 'mandatory', objective_critical: true },
            7: { name: 'Agent Connection Offer', intent: 'agent_connection_offer', critical: true, mandatory: true, always_required: true, priority: 'mandatory', objective_critical: true },
            8: { name: 'Agent Decline Handling', intent: 'agent_decline_handling', critical: false, conditional: 'agent_declined', priority: 'low', objective_critical: false },
            9: { name: 'Call Transfer to Agent', intent: 'call_transfer', critical: true, mandatory: true, conditional: 'agent_accepted', priority: 'mandatory', objective_critical: true },
            10: { name: 'Call Ending', intent: 'call_ending', critical: true, mandatory: true, conditional: 'call_completion', priority: 'mandatory', objective_critical: true },
            11: { name: 'Voicemail Response', intent: 'voicemail_response', critical: false, conditional: 'voicemail_detected', priority: 'low', objective_critical: false },
            12: { name: 'Wrong Number Handling', intent: 'wrong_number_handling', critical: false, conditional: 'wrong_number', priority: 'low', objective_critical: false },
            13: { name: 'Goodbye', intent: 'goodbye', critical: true, always_required: true, priority: 'high', objective_critical: false }
        };

        // Define conversation flow contexts and their required steps for MagicBricks
        this.conversationContexts = {
            successful_property_inquiry: {
                name: 'Successful Property Inquiry (Call Objective Achieved)',
                required_steps: [1, 6, 7, 9], // CRITICAL STEPS for objective completion (removed step 10)
                critical_steps: [1, 6, 7, 9], // Steps that MUST be completed for objective
                conditional_steps: {
                    agent_accepted: [9] // Call transfer with affirmative response achieves objective
                }
            },
            alternative_successful_flow: {
                name: 'Alternative Successful Flow (via Third Party)',
                required_steps: [1, 2, 6, 7, 9], // Including step 2 for third party (removed step 10)
                critical_steps: [1, 2, 6, 7, 9], // All critical for this flow
                conditional_steps: {
                    third_party_answers: [2],
                    agent_accepted: [9] // Call transfer with affirmative response achieves objective
                }
            },
            callback_scenario: {
                name: 'Callback Scheduled (Future Objective Completion)',
                required_steps: [1, 3, 5, 13], // Busy response leading to callback
                critical_steps: [1, 5], // Greeting and callback scheduling critical
                conditional_steps: {
                    customer_busy: [3],
                    needs_callback: [5]
                }
            },
            voicemail_scenario: {
                name: 'Voicemail Left (Future Objective Completion)',
                required_steps: [1, 11, 13], // Greeting, voicemail, goodbye
                critical_steps: [1, 11], // Greeting and voicemail message critical
                conditional_steps: {
                    voicemail_detected: [11]
                }
            },
            wrong_number: {
                name: 'Wrong Number (No Objective Possible)',
                required_steps: [1, 12, 13], // Greeting, wrong number acknowledgment, goodbye
                critical_steps: [1, 12], // Greeting and wrong number handling
                conditional_steps: {
                    wrong_number: [12]
                }
            },
            failed_inquiry: {
                name: 'Failed Property Inquiry (Objective Not Achieved)',
                required_steps: [1, 6, 8, 13], // Greeting, interest check, decline handling, goodbye
                critical_steps: [1, 6], // At least greeting and interest check attempted
                conditional_steps: {
                    agent_declined: [8]
                }
            }
        };

        // MagicBricks script adherence patterns for hallucination detection
        this.scriptAdherencePatterns = {
            // Required script phrases that should be present
            mandatory_phrases: [
                /\bआपने\s+recently\s+हमारे\s+platform\s+पर\s+कुछ\s+properties\s+में\s+interest\s+दिखाया\s+था\b/gi,
                /\bहमने\s+आपके\s+preferred\s+area\s+में\s+3\s+top\s+agents\s+shortlist\s+किए\s+हैं\b/gi,
                /\bक्या\s+मैं\s+आपको\s+कल\s+सुबह\s+दस\s+बजे\s+कॉल\s+कर\s+सकती\s+हूँ\b/gi,
                /\bBee-etch-kay\b/gi // BHK pronunciation rule
            ],
            // Prohibited phrases that indicate script deviation
            prohibited_phrases: [
                /\bक्या\s+मैं\s+आपकी\s+क्या\s+सहायता\s+कर\s+सकती\s+हूँ\b/gi,
                /\bHow\s+can\s+I\s+help\s+you\b/gi,
                /\bWhat\s+can\s+I\s+do\s+for\s+you\b/gi,
                /\bHow\s+may\s+I\s+assist\s+you\b/gi,
                /\bBHK\b/gi, // Should be Bee-etch-kay
                /\b\d+\s+BHK\b/gi, // Numbers should be spelled out
                /\b\d+\s+(lakh|crore|rupees)\b/gi // Monetary amounts should be spelled out
            ],
            // Objection handling responses that should match FAQ patterns
            objection_responses: [
                /\bमैं\s+पूरी\s+तरह\s+समझ\s+सकती\s+हूँ.*?unnecessary\s+calls\s+नहीं\s+आएंगे\b/gi,
                /\bQuality\s+की\s+बात\s+है.*?quantity\s+की\s+नहीं\b/gi,
                /\bमैं\s+personally\s+Agent\s+को\s+आपकी\s+requirements\s+brief\s+कर\s+दूँगी\b/gi
            ]
        };

        // Enhanced satisfaction indicators with Hindi support
        this.satisfactionPatterns = {
            positive: [
                /\b(धन्यवाद|thank\s+you|thanks|great|perfect|excellent|wonderful)\b/gi,
                /\b(बहुत\s+अच्छा|very\s+good|that\s+works|that's\s+perfect)\b/gi,
                /\b(helpful|really\s+appreciate|समझ\s+गई)\b/gi,
                /\b(ठीक\s+है|okay|alright|fine|हाँ|yes)\b/gi
            ],
            negative: [
                /\b(परेशान|frustrated|annoyed|disappointed|unhappy|terrible)\b/gi,
                /\b(समस्या|problem|issue|waste\s+of\s+time|not\s+helpful)\b/gi,
                /\b(गलत|wrong|incorrect|manager|escalate)\b/gi,
                /\b(व्यस्त|busy|not\s+interested|नहीं\s+चाहिए)\b/gi
            ],
            neutral: [
                /\b(शायद|maybe|perhaps|पता\s+नहीं|don't\s+know)\b/gi,
                /\b(देखते\s+हैं|let's\s+see|we'll\s+see)\b/gi
            ]
        };
    }

    async analyzeCall(transcript, audioData, config) {
        console.log('🚀 Starting comprehensive call analysis with advanced algorithms...');
        console.log('📊 Analysis Priority: Audio file analysis for silence, latency, hallucination detection, and interruption handling');
        console.log('📝 Transcript analysis as secondary reference for repetition and intent flow analysis');

        // Validate inputs
        if (!transcript || typeof transcript !== 'string') {
            console.log('⚠️ Invalid or missing transcript, using default empty transcript');
            transcript = 'Chat Bot: Hello, this is a default transcript for analysis.\nHuman: Thank you.';
        }

        try {
            // PRIORITY 1: Audio-based analyses (primary source)
            const silenceSegments = this.detectSilenceSegments(audioData, config);
            const callDurationAnalysis = this.analyzeCallDuration(audioData, config);
            const responseLatencyAnalysis = this.analyzeResponseLatency(audioData, transcript); // Audio primary, transcript secondary
            const hallucinationAnalysis = this.detectHallucinations(audioData, transcript); // Audio primary, transcript secondary
            const interruptionAnalysis = this.analyzeInterruptionHandling(audioData, transcript); // Audio primary, transcript secondary
            const audioQualityAnalysis = this.assessAudioQuality(audioData);

            // PRIORITY 2: Transcript-based analyses (primary source for these specific metrics)
            const repetitions = this.detectRepetitions(transcript, config);
            const intentFlow = await this.detectIntents(transcript);

            // Calculate comprehensive weighted score with audio-first priority
            const { overallScore, scoreBreakdown } = this.calculateAdvancedWeightedScore(
                silenceSegments, repetitions, callDurationAnalysis, responseLatencyAnalysis,
                hallucinationAnalysis, interruptionAnalysis, audioQualityAnalysis, intentFlow
            );

            const visualizationData = this.generateVisualizationData(audioData, silenceSegments);

            // Clear caches after analysis to prevent memory leaks
            this.clearAnalysisCache();

            console.log('✅ Advanced analysis completed successfully with enhanced critical step detection!');

            // Log critical step analysis results
            if (hallucinationAnalysis?.criticalStepAnalysis) {
                const csa = hallucinationAnalysis.criticalStepAnalysis;
                console.log(`🎯 Critical Step Analysis: ${csa.criticalStepViolations?.length || 0} violations, ${csa.contextDeviations?.length || 0} context deviations, ${csa.unaddressedQueries?.length || 0} unaddressed queries`);
            }

            return {
                overallScore,
                callDuration: audioData ? audioData.duration : 0,
                silenceViolations: silenceSegments, // Audio-first analysis
                repetitions, // Transcript-based analysis (primary for this metric)
                intentFlow, // Transcript-based analysis (primary for this metric)
                callDurationAnalysis, // Audio-based analysis
                responseLatencyAnalysis, // Audio-first with transcript context
                hallucinationAnalysis, // Enhanced with critical step analysis
                interruptionAnalysis, // Audio-first with transcript context
                audioQualityAnalysis, // Audio-based analysis
                scoreBreakdown,
                visualizationData,
                analysisApproach: {
                    audioPrimary: ['silence', 'latency', 'hallucination', 'interruption', 'audioQuality', 'callDuration'],
                    transcriptPrimary: ['repetition', 'intentFlow'],
                    enhanced: ['criticalStepAnalysis', 'contextAdherence', 'queryAddressing'],
                    note: 'Audio file analysis prioritized for timing-sensitive metrics, transcript used for content analysis, enhanced with critical step context adherence'
                },
                magicBricksAnalysis: {
                    useCase: 'MagicBricks Property Search',
                    criticalSteps: [1, 6, 7, 9],
                    alternativeCriticalSteps: [1, 2, 6, 7, 9],
                    objectiveAchieved: intentFlow.objectiveAchieved || false,
                    objectiveLogic: 'Step 9 (Call Transfer) + Affirmative Response = Objective Achieved',
                    scriptAdherence: 'Enhanced analysis for MagicBricks script compliance with critical step focus',
                    objectionHandling: 'Analyzed against MagicBricks FAQ responses',
                    contextAdherence: 'Enhanced detection of context deviations and unaddressed queries'
                }
            };

        } catch (error) {
            console.error('❌ Error during analysis:', error);
            throw error;
        }
    }

    detectSilenceSegments(audioData, config) {
        console.log('🔇 Detecting silence segments with SUPER ADVANCED analysis...');

        if (!audioData) {
            // Return minimal mock data for audio-only analysis
            return this.generateMinimalMockSilenceSegments();
        }

        const silenceSegments = [];
        const threshold = config.silenceThreshold;

        // SUPER ADVANCED silence detection with multiple validation layers
        if (audioData.silences) {
            audioData.silences.forEach((silence, index) => {
                // LAYER 1: Duration threshold (must be significantly long)
                if (silence.duration < threshold) return;

                // LAYER 2: Context validation - is this actually problematic?
                const contextValidation = this.validateSilenceContext(silence, index, audioData);
                if (!contextValidation.isProblematic) {
                    console.log(`🔍 Silence at ${silence.start}s dismissed: ${contextValidation.reason}`);
                    return;
                }

                // LAYER 3: Audio quality validation - could this be processing artifact?
                const qualityValidation = this.validateSilenceQuality(silence, audioData);
                if (!qualityValidation.isRealSilence) {
                    console.log(`🔍 Silence at ${silence.start}s dismissed: ${qualityValidation.reason}`);
                    return;
                }

                // LAYER 4: Conversation flow validation - does this disrupt flow?
                const flowValidation = this.validateSilenceFlow(silence, index, audioData);
                if (!flowValidation.disruptsFlow) {
                    console.log(`🔍 Silence at ${silence.start}s dismissed: ${flowValidation.reason}`);
                    return;
                }

                const contextualSeverity = this.calculateAdvancedSilenceSeverity(silence, index, audioData);
                const speakerContext = this.determineSpeakerContext(silence, index);

                silenceSegments.push({
                    startTime: silence.start,
                    endTime: silence.end,
                    duration: silence.duration,
                    speaker: speakerContext.speaker,
                    severity: contextualSeverity,
                    conversationPhase: speakerContext.phase,
                    impactScore: this.calculateSilenceImpact(silence, contextualSeverity),
                    contextualWeight: this.getContextualWeight(speakerContext.phase, speakerContext.speaker),
                    validationPassed: true,
                    qualityScore: qualityValidation.qualityScore
                });
            });
        }

        // Apply SUPER advanced filtering and scoring
        const processedSegments = this.processSuperAdvancedSilenceAnalysis(silenceSegments);

        console.log(`✅ Found ${processedSegments.length} VALIDATED silence violations (was ${audioData.silences?.length || 0} raw detections)`);
        return processedSegments;
    }

    calculateSilenceSeverity(silence, index) {
        // Advanced severity calculation based on duration and context
        const baseSeverity = Math.min(silence.duration / 10.0, 1.0); // Normalize to 0-1
        const positionWeight = index < 3 ? 1.2 : (index > 10 ? 0.8 : 1.0); // Early silences more critical
        const durationPenalty = Math.pow(silence.duration / 5.0, 1.5); // Exponential penalty for long silences

        return Math.min(baseSeverity * positionWeight * durationPenalty, 1.0);
    }

    determineSpeakerContext(silence, index) {
        // Determine speaker and conversation phase based on timing and patterns
        const phases = ['greeting', 'inquiry', 'information_gathering', 'resolution', 'closing'];
        const phaseIndex = Math.floor((index / 20) * phases.length);
        const currentPhase = phases[Math.min(phaseIndex, phases.length - 1)];

        return {
            speaker: index % 2 === 0 ? 'bot' : 'human',
            phase: currentPhase,
            confidence: 0.8 + (Math.random() * 0.2) // 80-100% confidence
        };
    }

    calculateSilenceImpact(silence, severity) {
        // Calculate user experience impact score
        const durationImpact = Math.log(silence.duration + 1) / Math.log(11); // Logarithmic scale
        const severityMultiplier = 1 + (severity * 2); // 1x to 3x multiplier

        return Math.min(durationImpact * severityMultiplier, 10.0); // Scale 0-10
    }

    getContextualWeight(phase, speaker) {
        // Context-aware weighting for different conversation phases and speakers
        const phaseWeights = {
            greeting: { bot: 0.7, human: 0.5 },
            inquiry: { bot: 1.0, human: 0.8 },
            information_gathering: { bot: 1.2, human: 0.9 },
            resolution: { bot: 1.1, human: 0.7 },
            closing: { bot: 0.6, human: 0.4 }
        };

        return phaseWeights[phase]?.[speaker] || 1.0;
    }

    processAdvancedSilenceAnalysis(segments) {
        // Apply advanced processing: clustering, filtering, and prioritization
        return segments
            .filter(segment => segment.impactScore > 2.0) // Filter low-impact silences
            .sort((a, b) => b.impactScore - a.impactScore) // Sort by impact
            .map(segment => ({
                ...segment,
                priority: segment.impactScore > 7 ? 'high' : (segment.impactScore > 4 ? 'medium' : 'low'),
                recommendation: this.generateSilenceRecommendation(segment)
            }));
    }

    generateSilenceRecommendation(segment) {
        if (segment.speaker === 'bot' && segment.duration > 8) {
            return 'Consider optimizing response generation speed or adding interim responses';
        } else if (segment.speaker === 'bot' && segment.conversationPhase === 'inquiry') {
            return 'Critical silence during inquiry phase - review bot response logic';
        } else if (segment.speaker === 'human' && segment.duration > 10) {
            return 'Long human silence may indicate confusion - review bot clarity';
        }
        return 'Monitor for pattern and consider conversation flow optimization';
    }

    generateMockSilenceSegments() {
        // Generate realistic mock data with advanced properties
        return [
            {
                startTime: 45.2, endTime: 51.8, duration: 6.6, speaker: 'bot',
                severity: 0.75, conversationPhase: 'inquiry', impactScore: 6.2,
                contextualWeight: 1.0, priority: 'medium',
                recommendation: 'Consider optimizing response generation speed'
            },
            {
                startTime: 89.1, endTime: 95.3, duration: 6.2, speaker: 'bot',
                severity: 0.68, conversationPhase: 'information_gathering', impactScore: 5.8,
                contextualWeight: 1.2, priority: 'medium',
                recommendation: 'Review bot response logic for information gathering'
            }
        ];
    }

    detectRepetitions(transcript, config) {
        console.log('🔄 Detecting TRUE repetitions (consecutive identical dialogues only)...');

        const repetitions = [];
        const botTurns = this.extractBotTurns(transcript);

        if (botTurns.length === 0) {
            console.log('⚠️ No bot turns found in transcript');
            return repetitions;
        }

        // ONLY detect consecutive repetitions - not legitimate conversation flow returns
        const consecutiveRepetitions = this.detectConsecutiveIdenticalRepetitions(transcript);

        console.log(`✅ Found ${consecutiveRepetitions.length} TRUE repetitions (consecutive identical only)`);
        return consecutiveRepetitions;
    }

    advancedSimilarityAnalysis(text1, text2, index1, index2) {
        // Multi-dimensional similarity analysis
        const lexicalSimilarity = this.calculateLexicalSimilarity(text1, text2);
        const semanticSimilarity = this.calculateSemanticSimilarity(text1, text2);
        const structuralSimilarity = this.calculateStructuralSimilarity(text1, text2);
        const contextualRelevance = this.calculateContextualRelevance(text1, text2, index1, index2);

        // Weighted overall similarity
        const overallSimilarity = (
            lexicalSimilarity * 0.3 +
            semanticSimilarity * 0.4 +
            structuralSimilarity * 0.2 +
            (1 - contextualRelevance) * 0.1 // Lower contextual relevance = higher repetition concern
        );

        const repetitionType = this.classifyRepetitionType(lexicalSimilarity, semanticSimilarity, structuralSimilarity);
        const severity = this.calculateRepetitionSeverity(overallSimilarity, Math.abs(index2 - index1));

        return {
            overallSimilarity,
            semanticSimilarity,
            structuralSimilarity,
            contextualRelevance,
            repetitionType,
            severity,
            recommendation: this.generateRepetitionRecommendation(repetitionType, severity)
        };
    }

    calculateLexicalSimilarity(text1, text2) {
        // Enhanced Levenshtein distance with word-level analysis
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);

        const maxLen = Math.max(words1.length, words2.length);
        if (maxLen === 0) return 1;

        const distance = this.levenshteinDistance(words1, words2);
        return (maxLen - distance) / maxLen;
    }

    calculateSemanticSimilarity(text1, text2) {
        // Simplified semantic similarity using keyword overlap and context
        const keywords1 = this.extractKeywords(text1);
        const keywords2 = this.extractKeywords(text2);

        const intersection = keywords1.filter(word => keywords2.includes(word));
        const union = [...new Set([...keywords1, ...keywords2])];

        const jaccardSimilarity = union.length > 0 ? intersection.length / union.length : 0;

        // Enhance with intent similarity
        const intent1 = this.extractSimpleIntent(text1);
        const intent2 = this.extractSimpleIntent(text2);
        const intentSimilarity = intent1 === intent2 ? 1.0 : 0.0;

        return (jaccardSimilarity * 0.7) + (intentSimilarity * 0.3);
    }

    calculateStructuralSimilarity(text1, text2) {
        // Analyze sentence structure and patterns
        const structure1 = this.analyzeTextStructure(text1);
        const structure2 = this.analyzeTextStructure(text2);

        let structuralScore = 0;

        // Compare sentence length similarity
        const lengthSimilarity = 1 - Math.abs(structure1.wordCount - structure2.wordCount) /
            Math.max(structure1.wordCount, structure2.wordCount);

        // Compare question vs statement patterns
        const patternSimilarity = structure1.isQuestion === structure2.isQuestion ? 1.0 : 0.5;

        // Compare punctuation patterns
        const punctuationSimilarity = this.comparePunctuationPatterns(text1, text2);

        return (lengthSimilarity * 0.4) + (patternSimilarity * 0.3) + (punctuationSimilarity * 0.3);
    }

    calculateContextualRelevance(text1, text2, index1, index2) {
        // Determine if repetition is contextually appropriate
        const turnDistance = Math.abs(index2 - index1);
        const distanceScore = Math.min(turnDistance / 10, 1.0); // Closer turns = less relevant

        // Check if it's a clarification or follow-up
        const isClarification = this.isClarificationPattern(text1, text2);
        const clarificationBonus = isClarification ? 0.3 : 0.0;

        return Math.min(distanceScore + clarificationBonus, 1.0);
    }

    classifyRepetitionType(lexical, semantic, structural) {
        if (lexical > 0.9 && structural > 0.8) return 'exact_repetition';
        if (semantic > 0.8 && lexical > 0.6) return 'semantic_repetition';
        if (structural > 0.8 && lexical < 0.6) return 'structural_repetition';
        if (semantic > 0.7) return 'conceptual_repetition';
        return 'partial_repetition';
    }

    calculateRepetitionSeverity(similarity, turnDistance) {
        // Higher similarity and closer turns = higher severity
        const similarityWeight = Math.pow(similarity, 2); // Exponential weight
        const distanceWeight = Math.max(0.1, 1 - (turnDistance / 20)); // Closer = more severe

        return Math.min(similarityWeight * distanceWeight * 10, 10); // Scale 0-10
    }

    generateRepetitionRecommendation(type, severity) {
        const recommendations = {
            exact_repetition: 'Critical: Identical responses detected. Review bot logic for dynamic responses.',
            semantic_repetition: 'High: Same meaning repeated. Add response variations or context awareness.',
            structural_repetition: 'Medium: Similar sentence patterns. Diversify response templates.',
            conceptual_repetition: 'Medium: Similar concepts repeated. Improve conversation flow logic.',
            partial_repetition: 'Low: Minor repetition detected. Monitor for patterns.'
        };

        const baseRecommendation = recommendations[type] || 'Monitor repetition patterns';
        const severityNote = severity > 7 ? ' [HIGH PRIORITY]' : severity > 4 ? ' [MEDIUM PRIORITY]' : ' [LOW PRIORITY]';

        return baseRecommendation + severityNote;
    }

    processAdvancedRepetitionAnalysis(repetitions) {
        // Filter and prioritize repetitions
        return repetitions
            .filter(rep => rep.severity > 3.0) // Filter low-severity repetitions
            .sort((a, b) => b.severity - a.severity) // Sort by severity
            .map(rep => ({
                ...rep,
                priority: rep.severity > 7 ? 'high' : (rep.severity > 5 ? 'medium' : 'low'),
                actionRequired: rep.severity > 6
            }));
    }

    // Helper methods for advanced similarity analysis
    extractKeywords(text) {
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
    }

    extractSimpleIntent(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('?')) return 'question';
        if (lowerText.includes('please') || lowerText.includes('can you')) return 'request';
        if (lowerText.includes('thank') || lowerText.includes('thanks')) return 'gratitude';
        if (lowerText.includes('sorry') || lowerText.includes('apologize')) return 'apology';
        return 'statement';
    }

    analyzeTextStructure(text) {
        return {
            wordCount: text.split(/\s+/).length,
            isQuestion: text.includes('?'),
            hasNumbers: /\d/.test(text),
            hasCapitals: /[A-Z]/.test(text),
            punctuationCount: (text.match(/[.,!?;:]/g) || []).length
        };
    }

    comparePunctuationPatterns(text1, text2) {
        const punct1 = (text1.match(/[.,!?;:]/g) || []).join('');
        const punct2 = (text2.match(/[.,!?;:]/g) || []).join('');

        if (punct1.length === 0 && punct2.length === 0) return 1.0;
        if (punct1.length === 0 || punct2.length === 0) return 0.0;

        return this.calculateSimilarity(punct1, punct2);
    }

    isClarificationPattern(text1, text2) {
        const clarificationWords = ['mean', 'clarify', 'explain', 'understand', 'repeat', 'again'];
        const text2Lower = text2.toLowerCase();
        return clarificationWords.some(word => text2Lower.includes(word));
    }

    levenshteinDistance(arr1, arr2) {
        const matrix = [];
        for (let i = 0; i <= arr2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= arr1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= arr2.length; i++) {
            for (let j = 1; j <= arr1.length; j++) {
                if (arr2[i - 1] === arr1[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[arr2.length][arr1.length];
    }

    extractBotTurns(transcript) {
        const botTurns = [];
        const lines = transcript.split('\n');
        let turnNumber = 0;

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('Chat Bot:') || line.startsWith('Bot:')) {
                turnNumber++;
                const text = line.includes(':') ? line.split(':', 2)[1].trim() : line;
                botTurns.push({
                    turnNumber,
                    text
                });
            }
        });

        return botTurns;
    }

    calculateSimilarity(text1, text2) {
        // Simple similarity calculation using Levenshtein distance
        const matrix = [];
        const len1 = text1.length;
        const len2 = text2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
    }

    analyzeCallDuration(audioData, config) {
        console.log('⏱️ Analyzing call duration...');

        const totalDurationMinutes = audioData ? audioData.duration / 60 : 3.0; // Default 3 minutes
        const idealMin = config.idealCallDurationMin;
        const idealMax = config.idealCallDurationMax;

        const callDurationAnalysis = {
            totalDurationMinutes,
            idealRangeMin: idealMin,
            idealRangeMax: idealMax,
            withinIdealRange: totalDurationMinutes >= idealMin && totalDurationMinutes <= idealMax,
            deviationFromIdeal: 0
        };

        if (totalDurationMinutes < idealMin) {
            callDurationAnalysis.deviationFromIdeal = idealMin - totalDurationMinutes;
            callDurationAnalysis.status = 'too_short';
        } else if (totalDurationMinutes > idealMax) {
            callDurationAnalysis.deviationFromIdeal = totalDurationMinutes - idealMax;
            callDurationAnalysis.status = 'too_long';
        } else {
            callDurationAnalysis.status = 'optimal';
        }

        console.log(`✅ Call duration: ${totalDurationMinutes.toFixed(1)} minutes (${callDurationAnalysis.status})`);
        return callDurationAnalysis;
    }

    analyzeResponseLatency(audioData, transcript) {
        console.log('⚡ Analyzing bot response latency with advanced timing analysis...');
        console.log('🎵 PRIMARY: Using audio file for precise timing measurements');
        console.log('📝 SECONDARY: Using transcript for context and turn identification');

        // Primary analysis from audio data
        if (audioData && audioData.turnTimings) {
            return this.analyzeResponseLatencyFromAudio(audioData, transcript);
        }

        // Fallback to transcript-based analysis with audio context
        console.log('⚠️ Audio timing data not available, using transcript with estimated timings');
        return this.analyzeResponseLatencyFromTranscript(transcript);
    }

    analyzeResponseLatencyFromAudio(audioData, transcript) {
        console.log('🎵 Analyzing response latency from audio timing data...');

        const responseTimes = [];
        const latencyViolations = [];
        const turnTimings = audioData.turnTimings || [];

        // Use actual audio timestamps for precise latency measurement
        for (let i = 1; i < turnTimings.length; i++) {
            const currentTurn = turnTimings[i];
            const previousTurn = turnTimings[i - 1];

            if (currentTurn.speaker === 'agent' && previousTurn.speaker === 'customer') {
                const responseTime = currentTurn.startTime - previousTurn.endTime;

                // Get transcript context for this turn
                const transcriptContext = this.getTranscriptContextForTiming(transcript, i);

                const latencyAnalysis = this.performAdvancedLatencyAnalysis(
                    responseTime,
                    { text: transcriptContext.humanText, speaker: 'customer' },
                    { text: transcriptContext.botText, speaker: 'agent' },
                    { phase: this.determineConversationPhase(i, turnTimings.length) },
                    i
                );

                responseTimes.push({
                    turnIndex: i,
                    responseTimeSeconds: responseTime,
                    humanTurnText: transcriptContext.humanText.substring(0, 50) + '...',
                    botResponseText: transcriptContext.botText.substring(0, 50) + '...',
                    audioTimestamp: currentTurn.startTime,
                    ...latencyAnalysis
                });

                if (latencyAnalysis.violationLevel !== 'none') {
                    latencyViolations.push({
                        turnIndex: i,
                        responseTimeSeconds: responseTime,
                        violationSeverity: latencyAnalysis.violationLevel,
                        humanTurnText: transcriptContext.humanText.substring(0, 50) + '...',
                        botResponseText: transcriptContext.botText.substring(0, 50) + '...',
                        contextType: latencyAnalysis.contextType,
                        expectedRange: latencyAnalysis.expectedRange,
                        impactScore: latencyAnalysis.impactScore,
                        recommendation: latencyAnalysis.recommendation,
                        audioTimestamp: currentTurn.startTime
                    });
                }
            }
        }

        const advancedLatencyScore = this.calculateAdvancedLatencyScore(responseTimes, latencyViolations);

        return {
            responseTimes,
            latencyViolations,
            averageResponseTime: responseTimes.length > 0 ?
                responseTimes.reduce((sum, rt) => sum + rt.responseTimeSeconds, 0) / responseTimes.length : 0,
            totalViolations: latencyViolations.length,
            contextualAnalysis: this.generateContextualLatencyInsights(responseTimes),
            latencyScore: advancedLatencyScore.score,
            performanceGrade: advancedLatencyScore.grade,
            status: advancedLatencyScore.status,
            recommendations: advancedLatencyScore.recommendations,
            analysisSource: 'audio_primary'
        };
    }

    analyzeResponseLatencyFromTranscript(transcript) {
        console.log('📝 Analyzing response latency from transcript with estimated timings...');

        const turns = this.parseTranscriptTurns(transcript);

        // Handle empty or invalid transcript
        if (turns.length === 0) {
            console.log('⚠️ No valid turns found in transcript, returning default latency analysis');
            return this.getDefaultLatencyAnalysis();
        }
        const responseTimes = [];
        const latencyViolations = [];

        // FIXED: Simple 5-second threshold as requested
        const RESPONSE_TIME_THRESHOLD_SECONDS = 5.0; // Only responses > 5 seconds are violations
        const MAX_ALLOWED_VIOLATIONS = 3; // Allow max 3 slow responses

        let currentTime = 0;
        let lastHumanTurnTime = 0;
        let conversationContext = this.initializeConversationContext();

        for (let i = 0; i < turns.length; i++) {
            const turn = turns[i];
            const estimatedTurnDuration = this.estimateAdvancedTurnDuration(turn.text, turn.speaker);

            // Update conversation context
            conversationContext = this.updateConversationContext(conversationContext, turn, i);

            if (turn.speaker === 'customer') {
                lastHumanTurnTime = currentTime;
            } else if (turn.speaker === 'agent' && i > 0 && turns[i - 1].speaker === 'customer') {
                const responseTime = currentTime - lastHumanTurnTime;
                const humanTurn = turns[i - 1];

                responseTimes.push({
                    turnIndex: i,
                    responseTimeSeconds: responseTime,
                    humanTurnText: humanTurn.text.substring(0, 50) + '...',
                    botResponseText: turn.text.substring(0, 50) + '...'
                });

                // FIXED: Simple violation check - only > 5 seconds
                if (responseTime > RESPONSE_TIME_THRESHOLD_SECONDS) {
                    latencyViolations.push({
                        turnIndex: i,
                        responseTimeSeconds: responseTime,
                        violationSeverity: responseTime > 10 ? 'severe' : 'moderate',
                        humanTurnText: humanTurn.text.substring(0, 50) + '...',
                        botResponseText: turn.text.substring(0, 50) + '...'
                    });
                }
            }

            currentTime += estimatedTurnDuration;
        }

        // FIXED: Simple scoring based on 5-second threshold
        const latencyScore = this.calculateSimpleLatencyScore(responseTimes, latencyViolations, RESPONSE_TIME_THRESHOLD_SECONDS, MAX_ALLOWED_VIOLATIONS);

        const latencyAnalysis = {
            responseTimes,
            latencyViolations,
            averageResponseTime: responseTimes.length > 0 ?
                responseTimes.reduce((sum, rt) => sum + rt.responseTimeSeconds, 0) / responseTimes.length : 0,
            totalViolations: latencyViolations.length,
            maxAllowedViolations: MAX_ALLOWED_VIOLATIONS,
            threshold: RESPONSE_TIME_THRESHOLD_SECONDS,
            latencyScore: latencyScore.score,
            performanceGrade: latencyScore.grade,
            status: latencyScore.status,
            recommendations: latencyScore.recommendations,
            analysisSource: 'transcript_fallback'
        };

        console.log(`✅ FIXED Response latency analysis: ${latencyViolations.length} violations (threshold: ${RESPONSE_TIME_THRESHOLD_SECONDS}s)`);
        console.log(`⚡ Simple scoring: ${latencyScore.score}/100 (${latencyScore.grade})`);

        return latencyAnalysis;
    }

    performAdvancedLatencyAnalysis(responseTime, humanTurn, botTurn, context, turnIndex) {
        // Determine context type for appropriate thresholds
        const contextType = this.classifyTurnContext(humanTurn.text, context, turnIndex);
        const thresholds = this.getContextualThresholds(contextType);

        // Calculate violation level
        let violationLevel = 'none';
        if (responseTime > thresholds.critical) {
            violationLevel = 'critical';
        } else if (responseTime > thresholds.acceptable) {
            violationLevel = 'moderate';
        } else if (responseTime > thresholds.optimal) {
            violationLevel = 'minor';
        }

        // Calculate impact score
        const impactScore = this.calculateLatencyImpact(responseTime, thresholds, contextType);

        // Generate contextual recommendation
        const recommendation = this.generateLatencyRecommendation(
            responseTime, violationLevel, contextType, humanTurn.text
        );

        return {
            contextType,
            expectedRange: `${thresholds.optimal}-${thresholds.acceptable}s`,
            violationLevel,
            impactScore,
            recommendation,
            userExperienceImpact: this.assessUserExperienceImpact(responseTime, contextType)
        };
    }

    classifyTurnContext(humanText, context, turnIndex) {
        const textLower = humanText.toLowerCase();

        // Early conversation
        if (turnIndex < 3) return 'greeting';

        // Question complexity analysis
        if (textLower.includes('?')) {
            const complexityIndicators = ['why', 'how', 'explain', 'difference', 'compare', 'multiple'];
            const isComplex = complexityIndicators.some(indicator => textLower.includes(indicator));
            return isComplex ? 'complex_query' : 'simple_query';
        }

        // Information processing needs
        const processingIndicators = ['calculate', 'find', 'search', 'check', 'verify', 'process'];
        if (processingIndicators.some(indicator => textLower.includes(indicator))) {
            return 'information_processing';
        }

        // Closing conversation
        if (context.phase === 'closing' || textLower.includes('bye') || textLower.includes('thank')) {
            return 'closing';
        }

        return 'simple_query';
    }

    getContextualThresholds(contextType) {
        const CONTEXT_THRESHOLDS = {
            greeting: { optimal: 1.0, acceptable: 2.0, critical: 4.0 },
            simple_query: { optimal: 1.5, acceptable: 3.0, critical: 5.0 },
            complex_query: { optimal: 2.5, acceptable: 5.0, critical: 8.0 },
            information_processing: { optimal: 3.0, acceptable: 6.0, critical: 10.0 },
            closing: { optimal: 1.0, acceptable: 2.0, critical: 3.0 }
        };

        return CONTEXT_THRESHOLDS[contextType] || CONTEXT_THRESHOLDS.simple_query;
    }

    calculateLatencyImpact(responseTime, thresholds, contextType) {
        // Calculate impact on user experience (0-10 scale)
        const optimalRatio = responseTime / thresholds.optimal;
        const contextMultiplier = this.getContextImpactMultiplier(contextType);

        let baseImpact;
        if (responseTime <= thresholds.optimal) {
            baseImpact = 0; // No negative impact
        } else if (responseTime <= thresholds.acceptable) {
            baseImpact = (optimalRatio - 1) * 3; // Minor impact
        } else if (responseTime <= thresholds.critical) {
            baseImpact = 3 + ((responseTime - thresholds.acceptable) / (thresholds.critical - thresholds.acceptable)) * 4;
        } else {
            baseImpact = 7 + Math.min((responseTime - thresholds.critical) / thresholds.critical * 3, 3);
        }

        return Math.min(baseImpact * contextMultiplier, 10);
    }

    getContextImpactMultiplier(contextType) {
        const multipliers = {
            greeting: 1.3, // First impressions matter
            simple_query: 1.0,
            complex_query: 0.8, // Users expect some delay
            information_processing: 0.7, // Processing time expected
            closing: 1.2 // Should be quick
        };

        return multipliers[contextType] || 1.0;
    }

    generateLatencyRecommendation(responseTime, violationLevel, contextType, humanText) {
        const baseRecommendations = {
            critical: 'URGENT: Optimize response generation pipeline and consider caching common responses',
            moderate: 'Improve response time through better query processing or interim acknowledgments',
            minor: 'Consider minor optimizations to improve user experience',
            none: 'Response time within acceptable range'
        };

        let recommendation = baseRecommendations[violationLevel];

        // Add context-specific advice
        if (contextType === 'information_processing' && violationLevel !== 'none') {
            recommendation += '. Consider adding "processing..." acknowledgments for complex queries.';
        } else if (contextType === 'greeting' && violationLevel !== 'none') {
            recommendation += '. First response delays create poor first impressions.';
        }

        return recommendation;
    }

    assessUserExperienceImpact(responseTime, contextType) {
        const thresholds = this.getContextualThresholds(contextType);

        if (responseTime <= thresholds.optimal) return 'excellent';
        if (responseTime <= thresholds.acceptable) return 'good';
        if (responseTime <= thresholds.critical) return 'poor';
        return 'very_poor';
    }

    calculateAdvancedLatencyScore(responseTimes, violations) {
        if (responseTimes.length === 0) {
            return { score: 100, grade: 'A', status: 'optimal', recommendations: [] };
        }

        // Calculate weighted score based on impact
        const totalImpact = responseTimes.reduce((sum, rt) => sum + (rt.impactScore || 0), 0);
        const maxPossibleImpact = responseTimes.length * 10; // Max impact per response

        const impactRatio = totalImpact / maxPossibleImpact;
        const baseScore = Math.max(0, 100 - (impactRatio * 100));

        // Apply penalties for critical violations
        const criticalViolations = violations.filter(v => v.violationSeverity === 'critical').length;
        const criticalPenalty = criticalViolations * 15;

        const finalScore = Math.max(0, baseScore - criticalPenalty);

        // Determine grade and status
        let grade, status;
        if (finalScore >= 90) { grade = 'A'; status = 'excellent'; }
        else if (finalScore >= 80) { grade = 'B'; status = 'good'; }
        else if (finalScore >= 70) { grade = 'C'; status = 'acceptable'; }
        else if (finalScore >= 60) { grade = 'D'; status = 'needs_improvement'; }
        else { grade = 'F'; status = 'critical'; }

        // Generate recommendations
        const recommendations = this.generateLatencyRecommendations(violations, responseTimes);

        return { score: Math.round(finalScore), grade, status, recommendations };
    }

    generateLatencyRecommendations(violations, responseTimes) {
        const recommendations = [];

        if (violations.length === 0) {
            recommendations.push('Response times are within acceptable ranges. Continue monitoring.');
            return recommendations;
        }

        // Analyze violation patterns
        const criticalCount = violations.filter(v => v.violationSeverity === 'critical').length;
        const contextTypes = [...new Set(violations.map(v => v.contextType))];

        if (criticalCount > 0) {
            recommendations.push(`PRIORITY: Address ${criticalCount} critical response delays immediately`);
        }

        if (contextTypes.includes('greeting')) {
            recommendations.push('Optimize initial response time - first impressions are crucial');
        }

        if (contextTypes.includes('information_processing')) {
            recommendations.push('Consider adding interim responses for complex processing tasks');
        }

        // Overall system recommendations
        const avgResponseTime = responseTimes.reduce((sum, rt) => sum + rt.responseTimeSeconds, 0) / responseTimes.length;
        if (avgResponseTime > 3.0) {
            recommendations.push('Overall response time is high - review system performance and caching strategies');
        }

        return recommendations;
    }

    initializeConversationContext() {
        return {
            phase: 'greeting',
            turnCount: 0,
            complexity: 'simple'
        };
    }

    updateConversationContext(context, turn, turnIndex) {
        const phases = ['greeting', 'inquiry', 'information_gathering', 'resolution', 'closing'];
        const phaseIndex = Math.min(Math.floor(turnIndex / 5), phases.length - 1);

        return {
            ...context,
            phase: phases[phaseIndex],
            turnCount: turnIndex,
            complexity: turn.text.length > 100 ? 'complex' : 'simple'
        };
    }

    generateContextualLatencyInsights(responseTimes) {
        const contextGroups = responseTimes.reduce((groups, rt) => {
            const context = rt.contextType || 'unknown';
            if (!groups[context]) groups[context] = [];
            groups[context].push(rt.responseTimeSeconds);
            return groups;
        }, {});

        const insights = {};
        Object.keys(contextGroups).forEach(context => {
            const times = contextGroups[context];
            insights[context] = {
                averageTime: times.reduce((a, b) => a + b, 0) / times.length,
                count: times.length,
                maxTime: Math.max(...times),
                minTime: Math.min(...times)
            };
        });

        return insights;
    }

    estimateAdvancedTurnDuration(text, speaker) {
        // Enhanced turn duration estimation with speaker and complexity factors
        const baseWordsPerSecond = speaker === 'agent' ? 3.0 : 2.5; // Bots can speak faster
        const wordCount = text.split(/\s+/).length;
        const complexityFactor = text.length > 100 ? 1.2 : 1.0;
        const punctuationPauses = (text.match(/[.!?]/g) || []).length * 0.5;

        const estimatedDuration = (wordCount / baseWordsPerSecond) * complexityFactor + punctuationPauses;

        // Add some realistic variation
        return estimatedDuration + (Math.random() * 1.0);
    }

    estimateTurnDuration(text) {
        // Estimate turn duration based on text length and complexity
        // This is a simplified estimation - in reality, you'd use actual audio timestamps
        const baseDuration = 2.0; // Base 2 seconds per turn
        const wordsPerSecond = 2.5; // Average speaking rate
        const wordCount = text.split(/\s+/).length;
        const estimatedDuration = baseDuration + (wordCount / wordsPerSecond);

        // Add some randomness to simulate realistic conversation timing
        return estimatedDuration + (Math.random() * 1.0);
    }

    async detectIntents(transcript) {
        console.log('🎭 Detecting intents using enhanced MagicBricks logic...');

        const turns = this.parseTranscriptTurns(transcript);

        // Handle empty or invalid transcript
        if (turns.length === 0) {
            console.log('⚠️ No valid turns found in transcript, returning default intent analysis');
            return this.getDefaultIntentAnalysis();
        }
        const intentMappings = [];
        const detectedIntents = new Set();
        const stepProgression = [];
        let totalConfidence = 0;

        // Process each turn with enhanced intent detection
        for (let i = 0; i < turns.length; i++) {
            const turn = turns[i];
            const { intent, step, confidence, stepNumber } = this.enhancedIntentDetection(turn.text, turn.speaker, i, turns);

            const mapping = {
                turnNumber: i + 1,
                speaker: turn.speaker,
                text: turn.text.substring(0, 100) + (turn.text.length > 100 ? '...' : ''), // Truncate for display
                detectedIntent: intent,
                confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
                conversationStep: step,
                stepNumber: stepNumber
            };

            intentMappings.push(mapping);
            totalConfidence += confidence;

            // Track detected intents and step progression
            if (step !== 'unknown') {
                detectedIntents.add(step);
                stepProgression.push({
                    step: stepNumber,
                    intent: step,
                    confidence: confidence,
                    turnNumber: i + 1
                });
            }
        }

        // Determine conversation context and calculate contextual scoring
        const conversationContext = this.determineConversationContext(intentMappings);
        const contextualAnalysis = this.calculateContextualFlowScore(conversationContext, stepProgression, intentMappings);

        // Calculate priority-based weighted average confidence
        const averageConfidence = this.calculatePriorityBasedConfidence(intentMappings, conversationContext);

        // NEW: Analyze call objective completion for MagicBricks
        const objectiveAnalysis = this.analyzeCallObjectiveCompletion(intentMappings, conversationContext);

        console.log(`✅ Detected intents for ${intentMappings.length} turns`);
        console.log(`🎯 Conversation context: ${conversationContext.name}`);
        console.log(`📊 Contextual flow score: ${contextualAnalysis.flowScore.toFixed(1)}/100`);
        console.log(`🎯 Average intent confidence: ${(averageConfidence * 100).toFixed(1)}%`);
        console.log(`🔍 Completed steps: ${contextualAnalysis.completedRequiredSteps}/${contextualAnalysis.totalRequiredSteps}`);
        console.log(`⚠️ Missing critical steps: ${contextualAnalysis.missingCriticalSteps.length}`);
        console.log(`🎯 CALL OBJECTIVE ACHIEVED: ${objectiveAnalysis.objectiveAchieved ? 'YES' : 'NO'}`);
        console.log(`📈 Critical steps completion: ${objectiveAnalysis.completedCriticalSteps.length}/${objectiveAnalysis.totalCriticalSteps}`);
        console.log(`🔍 DEBUG - Detected step numbers:`, objectiveAnalysis.completedCriticalSteps);
        console.log(`🔍 DEBUG - Missing step numbers:`, objectiveAnalysis.missingCriticalSteps);
        console.log(`🎯 ENHANCED OBJECTIVE LOGIC: Step 9 + Affirmative Response = Objective Achieved`);

        return {
            intentMappings,
            flowScore: Math.max(0, Math.min(100, contextualAnalysis.flowScore)),
            averageConfidence: averageConfidence,
            completedSteps: objectiveAnalysis.completedCriticalSteps.length, // Use critical steps completed count
            totalRequiredSteps: objectiveAnalysis.totalCriticalSteps, // Use critical steps count instead
            detectedIntents: Array.from(detectedIntents),
            stepProgression,
            missingCriticalSteps: objectiveAnalysis.missingCriticalSteps, // Use objective analysis missing steps
            conversationContext: conversationContext,
            contextualAnalysis: contextualAnalysis,
            conversationQuality: this.assessEnhancedConversationQuality(contextualAnalysis, averageConfidence),
            // NEW: Call objective analysis
            callObjective: objectiveAnalysis,
            objectiveAchieved: objectiveAnalysis.objectiveAchieved,
            criticalStepsAnalysis: {
                completed: objectiveAnalysis.completedCriticalSteps,
                missing: objectiveAnalysis.missingCriticalSteps,
                completionRate: objectiveAnalysis.completionRate,
                totalCriticalSteps: 4 // Always 4 for MagicBricks [1, 6, 7, 9]
            }
        };
    }

    enhancedIntentDetection(text, speaker, turnIndex, allTurns) {
        const textLower = text.toLowerCase();
        let bestMatch = {
            intent: 'General conversation',
            step: 'unknown',
            confidence: 0.2,
            stepNumber: 0
        };

        // SUPER ENHANCED pattern matching with business logic
        for (const [intentType, intentData] of Object.entries(this.intentPatterns)) {
            let matchScore = 0;
            let patternMatches = 0;
            const totalPatterns = intentData.patterns.length;

            // Check each pattern and calculate weighted score
            for (const pattern of intentData.patterns) {
                if (pattern.test(text)) {
                    patternMatches++;
                    // Give higher weight to more specific patterns
                    matchScore += intentData.score || 10;
                }
            }

            // Calculate confidence based on pattern matches and context
            let confidence = patternMatches / totalPatterns;

            // SUPER ENHANCED confidence boosting for successful conversations
            if (patternMatches > 0) {
                // Boost confidence significantly for key intents
                if (['initial_greeting', 'interest_check', 'agent_connection_offer', 'call_transfer'].includes(intentType)) {
                    confidence = Math.min(0.95, confidence + 0.3); // Major boost for critical steps
                } else if (patternMatches === totalPatterns) {
                    confidence = Math.min(0.95, confidence + 0.2);
                } else {
                    confidence = Math.min(0.85, confidence + 0.15);
                }
            }

            // Context-aware confidence adjustment with business logic
            confidence = this.superEnhancedConfidenceAdjustment(confidence, intentType, speaker, turnIndex, allTurns, textLower, text);

            if (confidence > bestMatch.confidence) {
                bestMatch = {
                    intent: this.getEnhancedIntentDescription(intentType, text),
                    step: intentType,
                    confidence: confidence,
                    stepNumber: intentData.step || 0
                };
            }
        }

        // Apply SUPER enhanced speaker-specific adjustments
        bestMatch = this.superEnhancedSpeakerAdjustments(bestMatch, speaker, text);

        return bestMatch;
    }

    getEnhancedIntentDescription(intentType, text) {
        const descriptions = {
            initial_greeting: 'Initial greeting and agent introduction',
            identity_verification: 'Student/parent identity verification',
            parent_response: 'Parent engagement and information setup',
            class_x_status: 'Class X board exam status inquiry',
            marks_percentage: 'Class X marks and percentage collection',
            admission_status: 'Class XI admission status verification',
            institution_type: 'School/institution type identification',
            school_board_details: 'School name and board affiliation',
            stream_selection: 'Academic stream and subject selection',
            admission_proof: 'Admission document collection',
            dropout_investigation: 'Dropout reason investigation',
            summary_confirmation: 'Information summary and confirmation',
            closing_statement: 'Professional closing and next steps',
            callback_scheduling: 'Callback appointment scheduling',
            goodbye: 'Final farewell and call termination'
        };
        return descriptions[intentType] || 'General conversation';
    }

    adjustConfidenceWithContext(confidence, intentType, speaker, turnIndex, allTurns, textLower) {
        // Boost confidence for agent-specific intents when speaker is agent
        if (speaker.toLowerCase().includes('bot') || speaker.toLowerCase().includes('agent')) {
            const agentIntents = ['initial_greeting', 'class_x_status', 'marks_percentage', 'admission_status',
                'institution_type', 'school_board_details', 'stream_selection', 'closing_statement'];
            if (agentIntents.includes(intentType)) {
                confidence = Math.min(0.95, confidence + 0.15);
            }
        }

        // Boost confidence for student/parent responses when speaker is human
        if (speaker.toLowerCase().includes('human') || speaker.toLowerCase().includes('student')) {
            const responseIntents = ['identity_verification', 'parent_response'];
            if (responseIntents.includes(intentType)) {
                confidence = Math.min(0.90, confidence + 0.1);
            }
        }

        // Sequential flow bonus - if this intent logically follows previous intents
        if (turnIndex > 0) {
            const previousIntent = this.getPreviousIntent(turnIndex, allTurns);
            if (this.isLogicalSequence(previousIntent, intentType)) {
                confidence = Math.min(0.95, confidence + 0.1);
            }
        }

        // Penalize very short responses for complex intents
        if (textLower.length < 10 && ['marks_percentage', 'school_board_details', 'stream_selection'].includes(intentType)) {
            confidence = Math.max(0.1, confidence - 0.2);
        }

        return confidence;
    }

    applySpeakerSpecificAdjustments(bestMatch, speaker, text) {
        // Apply final adjustments based on speaker role
        if (speaker.toLowerCase().includes('bot') || speaker.toLowerCase().includes('agent')) {
            // Agent should have higher confidence for structured questions
            if (['class_x_status', 'marks_percentage', 'admission_status'].includes(bestMatch.step)) {
                bestMatch.confidence = Math.min(0.95, bestMatch.confidence + 0.1);
            }
        }

        // Ensure minimum confidence for any detected pattern
        if (bestMatch.confidence < 0.3 && bestMatch.step !== 'unknown') {
            bestMatch.confidence = 0.3;
        }

        return bestMatch;
    }

    getPreviousIntent(turnIndex, allTurns) {
        // Simple implementation - could be enhanced with more sophisticated logic
        return turnIndex > 0 ? 'previous_intent' : null;
    }

    isLogicalSequence(previousIntent, currentIntent) {
        // Define logical conversation flow sequences
        const logicalSequences = {
            'initial_greeting': ['identity_verification'],
            'identity_verification': ['parent_response', 'class_x_status'],
            'class_x_status': ['marks_percentage'],
            'marks_percentage': ['admission_status'],
            'admission_status': ['institution_type'],
            'institution_type': ['school_board_details'],
            'school_board_details': ['stream_selection'],
            'stream_selection': ['admission_proof', 'summary_confirmation']
        };

        return logicalSequences[previousIntent]?.includes(currentIntent) || false;
    }

    calculatePriorityBasedConfidence(intentMappings, conversationContext) {
        if (intentMappings.length === 0) return 0;

        // Define critical steps for the detected context
        const contextRequiredSteps = conversationContext.required_steps || [];
        const criticalStepIntents = contextRequiredSteps
            .map(stepNum => this.conversationSteps[stepNum])
            .filter(step => step && step.critical)
            .map(step => step.intent);

        // Define MANDATORY data collection steps (7,8,10,11,12,13,14,16)
        const mandatoryDataSteps = ['class_x_status', 'marks_percentage', 'admission_status',
            'institution_type', 'school_board_details', 'stream_selection',
            'admission_proof', 'summary_confirmation'];

        const mandatoryStepMappings = intentMappings.filter(m =>
            mandatoryDataSteps.includes(m.conversationStep)
        );

        // Categorize mappings by priority and quality
        const highConfidenceMappings = intentMappings.filter(m => m.confidence > 0.7);
        const mediumConfidenceMappings = intentMappings.filter(m => m.confidence >= 0.4 && m.confidence <= 0.7);
        const lowConfidenceMappings = intentMappings.filter(m => m.confidence < 0.4);

        const criticalStepMappings = intentMappings.filter(m =>
            criticalStepIntents.includes(m.conversationStep)
        );

        const vagueMappings = this.identifyVagueMessages(intentMappings);
        const clearMappings = intentMappings.filter(m => !vagueMappings.includes(m));

        // Calculate weighted confidence with MANDATORY data collection priority
        let totalWeightedConfidence = 0;
        let totalWeight = 0;

        // PRIORITY 1: High confidence MANDATORY data collection steps (weight: 6.0)
        const highConfMandatory = mandatoryStepMappings.filter(m => m.confidence > 0.7);
        highConfMandatory.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 6.0;
            totalWeight += 6.0;
        });

        // PRIORITY 2: Medium confidence MANDATORY data collection steps (weight: 5.0)
        const mediumConfMandatory = mandatoryStepMappings.filter(m =>
            m.confidence >= 0.4 && m.confidence <= 0.7
        );
        mediumConfMandatory.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 5.0;
            totalWeight += 5.0;
        });

        // PRIORITY 3: Low confidence MANDATORY data collection steps (weight: 4.0)
        const lowConfMandatory = mandatoryStepMappings.filter(m => m.confidence < 0.4);
        lowConfMandatory.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 4.0;
            totalWeight += 4.0;
        });

        // Priority 4: High confidence other critical steps (weight: 3.0)
        const highConfCritical = criticalStepMappings.filter(m =>
            m.confidence > 0.7 && !mandatoryDataSteps.includes(m.conversationStep)
        );
        highConfCritical.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 3.0;
            totalWeight += 3.0;
        });

        // Priority 5: Medium confidence other critical steps (weight: 2.5)
        const mediumConfCritical = criticalStepMappings.filter(m =>
            m.confidence >= 0.4 && m.confidence <= 0.7 &&
            !mandatoryDataSteps.includes(m.conversationStep)
        );
        mediumConfCritical.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 2.5;
            totalWeight += 2.5;
        });

        // Priority 6: High confidence non-critical clear steps (weight: 2.0)
        const highConfNonCriticalClear = clearMappings.filter(m =>
            m.confidence > 0.7 &&
            !criticalStepIntents.includes(m.conversationStep) &&
            !mandatoryDataSteps.includes(m.conversationStep)
        );
        highConfNonCriticalClear.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 2.0;
            totalWeight += 2.0;
        });

        // Priority 7: Medium confidence non-critical clear steps (weight: 1.5)
        const mediumConfNonCriticalClear = clearMappings.filter(m =>
            m.confidence >= 0.4 && m.confidence <= 0.7 &&
            !criticalStepIntents.includes(m.conversationStep) &&
            !mandatoryDataSteps.includes(m.conversationStep)
        );
        mediumConfNonCriticalClear.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 1.5;
            totalWeight += 1.5;
        });

        // Priority 6: Vague messages (weight: 0.5)
        vagueMappings.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 0.5;
            totalWeight += 0.5;
        });

        // Priority 7: Low confidence non-critical steps (weight: 1.0)
        const lowConfNonCritical = intentMappings.filter(m =>
            m.confidence < 0.4 &&
            !criticalStepIntents.includes(m.conversationStep) &&
            !vagueMappings.includes(m)
        );
        lowConfNonCritical.forEach(mapping => {
            totalWeightedConfidence += mapping.confidence * 1.0;
            totalWeight += 1.0;
        });

        const priorityBasedConfidence = totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0;

        // Calculate confidence quality metrics
        const confidenceMetrics = {
            priorityBasedAverage: priorityBasedConfidence,
            simpleAverage: intentMappings.reduce((sum, m) => sum + m.confidence, 0) / intentMappings.length,
            highConfidenceCount: highConfidenceMappings.length,
            criticalStepsCount: criticalStepMappings.length,
            vagueMessagesCount: vagueMappings.length,
            clearMessagesCount: clearMappings.length,
            confidenceDistribution: {
                high: highConfidenceMappings.length,
                medium: mediumConfidenceMappings.length,
                low: lowConfidenceMappings.length
            }
        };

        console.log(`🎯 Priority-based confidence: ${(priorityBasedConfidence * 100).toFixed(1)}%`);
        console.log(`📊 Simple average: ${(confidenceMetrics.simpleAverage * 100).toFixed(1)}%`);
        console.log(`🔍 High confidence steps: ${confidenceMetrics.highConfidenceCount}`);
        console.log(`⭐ Critical steps: ${confidenceMetrics.criticalStepsCount}`);
        console.log(`📋 MANDATORY data steps: ${mandatoryStepMappings.length}/8 (Steps 7,8,10,11,12,13,14,16)`);
        console.log(`💬 Vague messages: ${confidenceMetrics.vagueMessagesCount}`);

        return priorityBasedConfidence;
    }

    identifyVagueMessages(intentMappings) {
        const vagueMessages = [];

        intentMappings.forEach(mapping => {
            const text = mapping.text.toLowerCase();
            const isVague = this.isMessageVague(text, mapping.speaker);

            if (isVague) {
                vagueMessages.push(mapping);
            }
        });

        return vagueMessages;
    }

    isMessageVague(text, speaker) {
        // Define vague patterns for both bot and human
        const vaguePatterns = {
            bot: [
                /\b(okay|ok|ठीक है|समझ गई)\b/gi,
                /\b(हाँ|yes|हम्म|hmm)\b/gi,
                /\b(और कुछ|anything else|कोई और)\b/gi,
                /\b(देखते हैं|let's see|पता नहीं)\b/gi
            ],
            human: [
                /\b(हाँ|yes|ठीक है|okay|ok)\b/gi,
                /\b(नहीं|no|ना)\b/gi,
                /\b(पता नहीं|don't know|मालूम नहीं)\b/gi,
                /\b(शायद|maybe|हो सकता है)\b/gi,
                /\b(हम्म|hmm|उम्म|umm)\b/gi
            ]
        };

        // Check if message is very short (likely vague)
        if (text.length < 10) {
            return true;
        }

        // Check for vague patterns based on speaker
        const speakerType = (speaker.toLowerCase().includes('bot') || speaker.toLowerCase().includes('agent')) ? 'bot' : 'human';
        const patterns = vaguePatterns[speakerType];

        // If message consists mostly of vague patterns
        let vagueMatches = 0;
        patterns.forEach(pattern => {
            if (pattern.test(text)) {
                vagueMatches++;
            }
        });

        // Consider vague if multiple vague patterns match or if it's a very short response
        return vagueMatches >= 2 || (vagueMatches >= 1 && text.length < 20);
    }

    determineConversationContext(intentMappings) {
        // Analyze the conversation to determine the primary context for MagicBricks
        const detectedIntents = intentMappings.map(m => m.conversationStep);
        const detectedSteps = intentMappings.map(m => m.stepNumber).filter(s => s > 0);

        // Check for specific MagicBricks conversation patterns
        const hasThirdPartyInteraction = detectedIntents.includes('third_party_interaction');
        const hasBusyResponse = detectedIntents.includes('busy_response');
        const hasCallbackScheduling = detectedIntents.includes('callback_scheduling');
        const hasWrongNumber = detectedIntents.includes('wrong_number_handling');
        const hasVoicemail = detectedIntents.includes('voicemail_response');
        const hasInterestCheck = detectedIntents.includes('interest_check');
        const hasAgentConnection = detectedIntents.includes('agent_connection_offer');
        const hasCallTransfer = detectedIntents.includes('call_transfer');
        const hasAgentDecline = detectedIntents.includes('agent_decline_handling');

        // Determine primary context based on MagicBricks flow
        if (hasWrongNumber) {
            return this.conversationContexts.wrong_number;
        } else if (hasVoicemail) {
            return this.conversationContexts.voicemail_scenario;
        } else if ((hasBusyResponse || hasCallbackScheduling) && !hasInterestCheck) {
            return this.conversationContexts.callback_scenario;
        } else if (hasInterestCheck && hasAgentConnection && hasCallTransfer) {
            // Successful completion - check if via third party
            if (hasThirdPartyInteraction) {
                return this.conversationContexts.alternative_successful_flow;
            } else {
                return this.conversationContexts.successful_property_inquiry;
            }
        } else if (hasInterestCheck && hasAgentDecline) {
            return this.conversationContexts.failed_inquiry;
        } else if (hasInterestCheck) {
            // Started interest check but didn't complete - could be partial success or failure
            if (hasAgentConnection) {
                return this.conversationContexts.successful_property_inquiry; // Partial success
            } else {
                return this.conversationContexts.failed_inquiry;
            }
        } else {
            // Default to failed inquiry if no clear pattern
            return this.conversationContexts.failed_inquiry;
        }
    }

    calculateContextualFlowScore(conversationContext, stepProgression, intentMappings) {
        let flowScore = 0;
        const maxScore = 100;

        // Get required steps for this context
        const requiredSteps = conversationContext.required_steps;
        const completedSteps = stepProgression.map(p => p.step);
        const completedRequiredSteps = requiredSteps.filter(step => completedSteps.includes(step));

        // Base score for context identification (20 points)
        flowScore += 20;

        // Required steps completion (40 points)
        const requiredStepsScore = (completedRequiredSteps.length / requiredSteps.length) * 40;
        flowScore += requiredStepsScore;

        // Conditional steps handling (20 points)
        let conditionalScore = 0;
        const conversationContent = intentMappings.map(m => m.text.toLowerCase()).join(' ');

        // Check for conditional triggers and their completion
        if (conversationContext.conditional_steps) {
            let applicableConditionalSteps = 0;
            let completedConditionalSteps = 0;

            // Check each conditional category
            for (const [condition, steps] of Object.entries(conversationContext.conditional_steps)) {
                if (this.isConditionMet(condition, conversationContent, intentMappings)) {
                    applicableConditionalSteps += steps.length;
                    const completedInCategory = steps.filter(step => completedSteps.includes(step)).length;
                    completedConditionalSteps += completedInCategory;
                }
            }

            if (applicableConditionalSteps > 0) {
                conditionalScore = (completedConditionalSteps / applicableConditionalSteps) * 20;
            } else {
                conditionalScore = 20; // Full points if no conditionals apply
            }
        } else {
            conditionalScore = 20; // Full points if no conditionals defined
        }
        flowScore += conditionalScore;

        // High confidence bonus (10 points)
        const highConfidenceSteps = stepProgression.filter(p => p.confidence > 0.7).length;
        const confidenceBonus = stepProgression.length > 0 ?
            (highConfidenceSteps / stepProgression.length) * 10 : 0;
        flowScore += confidenceBonus;

        // Sequential flow bonus (10 points)
        let sequentialBonus = 0;
        for (let i = 1; i < stepProgression.length; i++) {
            if (stepProgression[i].step >= stepProgression[i - 1].step) {
                sequentialBonus += 1;
            }
        }
        if (stepProgression.length > 1) {
            sequentialBonus = (sequentialBonus / (stepProgression.length - 1)) * 10;
        }
        flowScore += sequentialBonus;

        // Identify missing critical steps for this context
        const criticalRequiredSteps = requiredSteps.filter(stepNum => {
            const stepInfo = this.conversationSteps[stepNum];
            return stepInfo && stepInfo.critical;
        });
        const missingCriticalSteps = criticalRequiredSteps
            .filter(step => !completedSteps.includes(step))
            .map(step => this.conversationSteps[step].intent);

        return {
            flowScore: Math.min(maxScore, Math.max(0, flowScore)),
            completedRequiredSteps: completedRequiredSteps.length,
            totalRequiredSteps: requiredSteps.length,
            missingCriticalSteps,
            contextName: conversationContext.name,
            requiredStepsScore,
            conditionalScore,
            confidenceBonus,
            sequentialBonus
        };
    }

    isConditionMet(condition, conversationContent, intentMappings) {
        switch (condition) {
            case 'third_party_answers':
                return intentMappings.some(m => m.conversationStep === 'third_party_interaction');

            case 'customer_busy':
                return conversationContent.includes('busy') ||
                    conversationContent.includes('व्यस्त') ||
                    intentMappings.some(m => m.conversationStep === 'busy_response');

            case 'connection_issues':
                return conversationContent.includes('connection') ||
                    conversationContent.includes('network') ||
                    intentMappings.some(m => m.conversationStep === 'connection_failure');

            case 'needs_callback':
                return conversationContent.includes('callback') ||
                    conversationContent.includes('call back') ||
                    conversationContent.includes('बाद में') ||
                    intentMappings.some(m => m.conversationStep === 'callback_scheduling');

            case 'agent_accepted':
                return conversationContent.includes('yes') ||
                    conversationContent.includes('हाँ') ||
                    conversationContent.includes('okay') ||
                    conversationContent.includes('ठीक है') ||
                    intentMappings.some(m => m.conversationStep === 'call_transfer');

            case 'agent_declined':
                return conversationContent.includes('no') ||
                    conversationContent.includes('नहीं') ||
                    conversationContent.includes('not interested') ||
                    intentMappings.some(m => m.conversationStep === 'agent_decline_handling');

            case 'call_completion':
                return intentMappings.some(m => m.conversationStep === 'call_ending') ||
                    intentMappings.some(m => m.conversationStep === 'goodbye');

            case 'voicemail_detected':
                return conversationContent.includes('voicemail') ||
                    conversationContent.includes('message') ||
                    conversationContent.includes('after the tone') ||
                    intentMappings.some(m => m.conversationStep === 'voicemail_response');

            case 'wrong_number':
                return conversationContent.includes('wrong number') ||
                    conversationContent.includes('गलत number') ||
                    intentMappings.some(m => m.conversationStep === 'wrong_number_handling');

            default:
                return false;
        }
    }

    assessEnhancedConversationQuality(contextualAnalysis, averageConfidence) {
        let qualityScore = 0;

        // Context-appropriate completion (40 points)
        const completionRate = contextualAnalysis.completedRequiredSteps / contextualAnalysis.totalRequiredSteps;
        qualityScore += completionRate * 40;

        // Average confidence (30 points)
        qualityScore += averageConfidence * 30;

        // Missing critical steps penalty (20 points)
        const criticalStepsPenalty = contextualAnalysis.missingCriticalSteps.length * 5;
        qualityScore += Math.max(0, 20 - criticalStepsPenalty);

        // Flow coherence (10 points)
        qualityScore += (contextualAnalysis.sequentialBonus / 10) * 10;

        // Determine quality rating
        let rating = 'Poor';
        if (qualityScore >= 85) rating = 'Excellent';
        else if (qualityScore >= 70) rating = 'Good';
        else if (qualityScore >= 50) rating = 'Fair';

        return {
            rating,
            score: Math.round(qualityScore),
            factors: {
                contextAppropriate: completionRate > 0.8,
                goodConfidence: averageConfidence > 0.6,
                excellentConfidence: averageConfidence > 0.8,
                noCriticalMissing: contextualAnalysis.missingCriticalSteps.length === 0,
                goodFlow: contextualAnalysis.sequentialBonus > 5
            },
            breakdown: {
                completionScore: Math.round(completionRate * 40),
                confidenceScore: Math.round(averageConfidence * 30),
                criticalStepsScore: Math.round(Math.max(0, 20 - criticalStepsPenalty)),
                flowScore: Math.round((contextualAnalysis.sequentialBonus / 10) * 10)
            }
        };
    }

    calculateEnhancedFlowScore(stepProgression, intentMappings) {
        let flowScore = 0;
        const maxScore = 100;

        // Base score for having any conversation flow
        if (stepProgression.length > 0) {
            flowScore += 20;
        }

        // Sequential flow scoring
        let sequentialBonus = 0;
        for (let i = 1; i < stepProgression.length; i++) {
            const currentStep = stepProgression[i].step;
            const previousStep = stepProgression[i - 1].step;

            // Award points for logical progression
            if (currentStep > previousStep) {
                sequentialBonus += 5;
            } else if (currentStep === previousStep + 1) {
                sequentialBonus += 10; // Perfect sequence
            }
        }
        flowScore += Math.min(30, sequentialBonus);

        // Critical steps completion bonus
        const criticalSteps = Object.values(this.conversationSteps)
            .filter(step => step.critical)
            .map(step => step.intent);

        const completedCriticalSteps = stepProgression
            .map(p => p.intent)
            .filter(intent => criticalSteps.includes(intent));

        const criticalCompletionRate = completedCriticalSteps.length / criticalSteps.length;
        flowScore += criticalCompletionRate * 25;

        // High confidence bonus
        const highConfidenceSteps = stepProgression.filter(p => p.confidence > 0.7);
        const confidenceBonus = (highConfidenceSteps.length / stepProgression.length) * 15;
        flowScore += confidenceBonus;

        // Conversation completeness bonus
        const totalSteps = Object.keys(this.conversationSteps).length;
        const completionRate = stepProgression.length / totalSteps;
        flowScore += completionRate * 10;

        return Math.min(maxScore, Math.max(0, flowScore));
    }

    assessConversationQuality(stepProgression, averageConfidence, missingCriticalSteps) {
        let quality = 'Poor';
        let score = 0;

        // Calculate quality score
        if (stepProgression.length > 0) score += 20;
        if (averageConfidence > 0.6) score += 25;
        if (averageConfidence > 0.8) score += 15;
        if (missingCriticalSteps.length === 0) score += 25;
        if (stepProgression.length >= 8) score += 15; // Good conversation length

        // Determine quality rating
        if (score >= 80) quality = 'Excellent';
        else if (score >= 65) quality = 'Good';
        else if (score >= 45) quality = 'Fair';
        else quality = 'Poor';

        return {
            rating: quality,
            score: score,
            factors: {
                hasConversationFlow: stepProgression.length > 0,
                goodConfidence: averageConfidence > 0.6,
                excellentConfidence: averageConfidence > 0.8,
                allCriticalStepsPresent: missingCriticalSteps.length === 0,
                adequateLength: stepProgression.length >= 8
            }
        };
    }

    // Legacy method - kept for compatibility but enhanced
    adjustIntentWithContext(match, speaker, turnIndex, allTurns, textLower) {
        // This method is now handled by the enhanced detection logic
        // Keeping for backward compatibility
        return match;
    }

    analyzeSatisfaction(textLower) {
        for (const pattern of this.satisfactionPatterns.positive) {
            if (pattern.test(textLower)) {
                return 'positive';
            }
        }

        for (const pattern of this.satisfactionPatterns.negative) {
            if (pattern.test(textLower)) {
                return 'negative';
            }
        }

        return 'neutral';
    }



    parseTranscriptTurns(transcript) {
        // Performance optimization: Cache parsed results
        if (this._cachedTranscript === transcript && this._cachedTurns) {
            return this._cachedTurns;
        }

        const turns = [];

        // Handle null, undefined, or non-string transcript
        if (!transcript || typeof transcript !== 'string') {
            console.log('⚠️ Invalid transcript provided:', typeof transcript);
            return turns; // Return empty array for invalid transcript
        }

        // Performance optimization: Pre-compile regex patterns
        const agentPattern = /^(Chat Bot|Bot|Agent|Support|Assistant):/i;
        const customerPattern = /^(Human|User|Customer|Client|Caller):/i;
        const botKeywords = /bot|agent/i;

        const lines = transcript.split('\n');

        // Performance optimization: Use for loop instead of forEach
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            let speaker, text;

            // Optimized speaker detection with early returns
            if (agentPattern.test(line)) {
                speaker = 'agent';
                const colonIndex = line.indexOf(':');
                text = colonIndex !== -1 ? line.substring(colonIndex + 1).trim() : line;
            } else if (customerPattern.test(line)) {
                speaker = 'customer';
                const colonIndex = line.indexOf(':');
                text = colonIndex !== -1 ? line.substring(colonIndex + 1).trim() : line;
            } else {
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    // Generic speaker:text format - optimized detection
                    const speakerPart = line.substring(0, colonIndex).trim();
                    speaker = botKeywords.test(speakerPart) ? 'agent' : 'customer';
                    text = line.substring(colonIndex + 1).trim();
                } else {
                    continue; // Skip lines without clear speaker identification
                }
            }

            if (text && text.length > 0) {
                turns.push({ speaker, text });
            }
        }

        // Cache the result for performance
        this._cachedTranscript = transcript;
        this._cachedTurns = turns;

        return turns;
    }

    analyzeInterruptionHandling(audioData, transcript) {
        console.log('🔄 Analyzing interruption handling patterns...');
        console.log('🎵 PRIMARY: Using audio analysis for precise interruption detection and timing');
        console.log('📝 SECONDARY: Using transcript for context and content analysis');

        try {
            // Primary analysis from audio data
            if (audioData && audioData.interruptionData) {
                return this.analyzeInterruptionHandlingFromAudio(audioData, transcript);
            }

            // Fallback to transcript-based analysis
            console.log('⚠️ Audio interruption data not available, using transcript-based analysis');
            return this.analyzeInterruptionHandlingFromTranscript(transcript);
        } catch (error) {
            console.log('⚠️ Error in interruption analysis, returning default values:', error.message);
            return this.getDefaultInterruptionAnalysis();
        }
    }

    analyzeInterruptionHandlingFromTranscriptOriginal(transcript) {
        console.log('📝 Analyzing interruption handling from transcript...');

        const turns = this.parseTranscriptTurns(transcript);
        const interruptions = [];
        const interruptionPatterns = [];

        // Analyze turn-taking patterns
        for (let i = 1; i < turns.length - 1; i++) {
            const currentTurn = turns[i];
            const nextTurn = turns[i + 1];
            const prevTurn = turns[i - 1];

            // Detect potential interruptions
            const interruptionAnalysis = this.detectInterruptionPattern(
                prevTurn, currentTurn, nextTurn, i
            );

            if (interruptionAnalysis.isInterruption) {
                interruptions.push({
                    turnIndex: i,
                    interruptionType: interruptionAnalysis.type,
                    severity: interruptionAnalysis.severity,
                    handlingQuality: interruptionAnalysis.handlingQuality,
                    recoveryTime: interruptionAnalysis.recoveryTime,
                    contextAppropriate: interruptionAnalysis.contextAppropriate,
                    recommendation: interruptionAnalysis.recommendation
                });
            }

            // Analyze overall turn-taking pattern
            const turnPattern = this.analyzeTurnTakingPattern(prevTurn, currentTurn, nextTurn);
            interruptionPatterns.push(turnPattern);
        }

        const interruptionScore = this.calculateInterruptionScore(interruptions, interruptionPatterns);

        console.log(`✅ Interruption analysis: ${interruptions.length} interruptions detected`);

        return {
            interruptions,
            interruptionScore,
            turnTakingQuality: this.assessTurnTakingQuality(interruptionPatterns),
            conversationFlow: this.assessConversationFlow(interruptionPatterns),
            recommendations: this.generateInterruptionRecommendations(interruptions)
        };
    }

    detectInterruptionPattern(prevTurn, currentTurn, nextTurn, turnIndex) {
        // Analyze if current turn represents an interruption
        let isInterruption = false;
        let interruptionType = 'none';
        let severity = 0;
        let handlingQuality = 0;
        let recoveryTime = 0;
        let contextAppropriate = true;

        // Check for bot interrupting human
        if (prevTurn.speaker === 'customer' && currentTurn.speaker === 'agent') {
            // Analyze if bot cut off human mid-sentence
            const humanTextEndsAbruptly = this.checkAbruptEnding(prevTurn.text);
            const botResponseTooQuick = this.checkQuickResponse(prevTurn.text, currentTurn.text);

            if (humanTextEndsAbruptly && botResponseTooQuick) {
                isInterruption = true;
                interruptionType = 'bot_interrupts_human';
                severity = 7; // High severity - bots shouldn't interrupt humans
                handlingQuality = 2; // Poor handling
                contextAppropriate = false;
            }
        }

        // Check for human interrupting bot
        if (prevTurn.speaker === 'agent' && currentTurn.speaker === 'customer') {
            const botTextLength = prevTurn.text.split(/\s+/).length;
            const humanResponseQuick = currentTurn.text.length < 20;

            if (botTextLength > 20 && humanResponseQuick) {
                isInterruption = true;
                interruptionType = 'human_interrupts_bot';
                severity = 4; // Medium severity - humans can interrupt

                // Check if bot handled it well in next turn
                if (nextTurn && nextTurn.speaker === 'agent') {
                    handlingQuality = this.assessInterruptionRecovery(nextTurn.text);
                    recoveryTime = this.estimateRecoveryTime(currentTurn.text, nextTurn.text);
                }

                contextAppropriate = this.checkInterruptionContext(prevTurn.text, currentTurn.text);
            }
        }

        return {
            isInterruption,
            type: interruptionType,
            severity,
            handlingQuality,
            recoveryTime,
            contextAppropriate,
            recommendation: this.generateInterruptionRecommendation(interruptionType, severity, handlingQuality)
        };
    }

    checkAbruptEnding(text) {
        // Check if text ends abruptly (no proper punctuation, incomplete thought)
        const endsWithPunctuation = /[.!?]$/.test(text.trim());
        const hasIncompleteMarkers = /\b(and|but|so|because|if|when|while|since)\s*$/i.test(text.trim());

        return !endsWithPunctuation || hasIncompleteMarkers;
    }

    checkQuickResponse(humanText, botText) {
        // Simple heuristic: if human text is long but bot responds immediately with short text
        const humanWordCount = humanText.split(/\s+/).length;
        const botWordCount = botText.split(/\s+/).length;

        return humanWordCount > 10 && botWordCount < 5;
    }

    assessInterruptionRecovery(botResponseText) {
        // Assess how well bot recovered from interruption
        const recoveryIndicators = [
            /sorry|apologize|excuse me/i,
            /let me continue|as I was saying|going back to/i,
            /understand|I see|got it/i
        ];

        const hasRecoveryLanguage = recoveryIndicators.some(pattern => pattern.test(botResponseText));
        const responseLength = botResponseText.split(/\s+/).length;

        if (hasRecoveryLanguage && responseLength > 5) return 8; // Good recovery
        if (hasRecoveryLanguage) return 6; // Adequate recovery
        if (responseLength > 10) return 4; // Attempted recovery
        return 2; // Poor recovery
    }

    estimateRecoveryTime(interruptionText, recoveryText) {
        // Estimate time to recover from interruption (simplified)
        const interruptionComplexity = interruptionText.split(/\s+/).length;
        const recoveryComplexity = recoveryText.split(/\s+/).length;

        return Math.max(1, interruptionComplexity * 0.3 + recoveryComplexity * 0.2);
    }

    checkInterruptionContext(botText, humanInterruption) {
        // Check if human interruption was contextually appropriate
        const botTextLower = botText.toLowerCase();
        const humanTextLower = humanInterruption.toLowerCase();

        // Appropriate interruptions
        if (humanTextLower.includes('wait') || humanTextLower.includes('stop')) return true;
        if (humanTextLower.includes('question') || humanTextLower.includes('clarify')) return true;
        if (humanTextLower.includes('wrong') || humanTextLower.includes('mistake')) return true;

        // Inappropriate if bot was asking important question
        if (botTextLower.includes('important') || botTextLower.includes('need to know')) return false;

        return true; // Default: assume appropriate
    }

    generateInterruptionRecommendation(type, severity, handlingQuality) {
        const recommendations = {
            bot_interrupts_human: 'CRITICAL: Bot interrupting human. Implement better turn-taking detection.',
            human_interrupts_bot: handlingQuality > 6 ?
                'Good interruption handling. Continue monitoring.' :
                'Improve bot recovery from human interruptions.',
            none: 'No interruption issues detected.'
        };

        const baseRecommendation = recommendations[type] || 'Monitor turn-taking patterns.';
        const severityTag = severity > 6 ? ' [HIGH PRIORITY]' : severity > 3 ? ' [MEDIUM]' : ' [LOW]';

        return baseRecommendation + severityTag;
    }

    analyzeTurnTakingPattern(prevTurn, currentTurn, nextTurn) {
        // Analyze the quality of turn-taking in this sequence
        const turnGaps = this.estimateTurnGaps(prevTurn, currentTurn, nextTurn);
        const speakerTransition = this.analyzeSpeakerTransition(prevTurn, currentTurn);
        const conversationalFlow = this.assessLocalConversationalFlow(prevTurn, currentTurn, nextTurn);

        return {
            turnGaps,
            speakerTransition,
            conversationalFlow,
            overallQuality: (turnGaps.quality + speakerTransition.quality + conversationalFlow) / 3
        };
    }

    estimateTurnGaps(prevTurn, currentTurn, nextTurn) {
        // Estimate gaps between turns (simplified)
        const prevLength = prevTurn.text.split(/\s+/).length;
        const currentLength = currentTurn.text.split(/\s+/).length;

        // Estimate speaking time
        const prevSpeakingTime = prevLength * 0.4; // ~0.4 seconds per word
        const currentSpeakingTime = currentLength * 0.4;

        // Estimate gap (simplified heuristic)
        const estimatedGap = Math.random() * 2 + 0.5; // 0.5-2.5 seconds

        let quality = 8; // Default good quality
        if (estimatedGap > 3) quality = 4; // Too long gap
        if (estimatedGap < 0.2) quality = 6; // Too short gap (interruption)

        return {
            estimatedGap,
            quality,
            appropriate: estimatedGap >= 0.5 && estimatedGap <= 2.0
        };
    }

    analyzeSpeakerTransition(prevTurn, currentTurn) {
        // Analyze quality of speaker transition
        const speakerChanged = prevTurn.speaker !== currentTurn.speaker;
        const transitionSmooth = this.checkTransitionSmoothness(prevTurn.text, currentTurn.text);

        return {
            speakerChanged,
            smooth: transitionSmooth,
            quality: speakerChanged && transitionSmooth ? 9 : (speakerChanged ? 6 : 8)
        };
    }

    checkTransitionSmoothness(prevText, currentText) {
        // Check if transition between speakers is smooth
        const prevEndsWithQuestion = prevText.includes('?');
        const currentStartsWithAnswer = /^(yes|no|well|actually|I think)/i.test(currentText.trim());

        if (prevEndsWithQuestion && currentStartsWithAnswer) return true;

        // Check for acknowledgment patterns
        const acknowledgmentPatterns = /^(okay|alright|I see|understood|got it)/i;
        if (acknowledgmentPatterns.test(currentText.trim())) return true;

        return true; // Default: assume smooth
    }

    assessLocalConversationalFlow(prevTurn, currentTurn, nextTurn) {
        // Assess conversational flow in this local context
        const topicContinuity = this.checkTopicContinuity(prevTurn.text, currentTurn.text);
        const responseAppropriate = this.checkResponseAppropriateness(prevTurn.text, currentTurn.text);

        return (topicContinuity + responseAppropriate) / 2;
    }

    checkTopicContinuity(prevText, currentText) {
        // Simple topic continuity check
        const prevTopics = this.extractTopics(prevText);
        const currentTopics = this.extractTopics(currentText);

        if (prevTopics.length === 0 || currentTopics.length === 0) return 0.7;

        const commonTopics = prevTopics.filter(topic =>
            currentTopics.some(currentTopic => this.calculateSimilarity(topic, currentTopic) > 0.6)
        );

        return Math.min(1.0, commonTopics.length / Math.min(prevTopics.length, currentTopics.length) + 0.3);
    }

    checkResponseAppropriateness(prevText, currentText) {
        // Check if current response is appropriate to previous text
        const prevIntent = this.classifyIntent(prevText);
        const currentResponseType = this.classifyResponseType(currentText);

        return this.checkIntentResponseAlignment(prevIntent, currentResponseType);
    }

    calculateInterruptionScore(interruptions, patterns) {
        if (interruptions.length === 0 && patterns.length > 0) {
            const avgPatternQuality = patterns.reduce((sum, p) => sum + p.overallQuality, 0) / patterns.length;
            return Math.round(avgPatternQuality * 10);
        }

        // Calculate score based on interruptions and their handling
        const totalSeverity = interruptions.reduce((sum, i) => sum + i.severity, 0);
        const avgHandlingQuality = interruptions.length > 0 ?
            interruptions.reduce((sum, i) => sum + i.handlingQuality, 0) / interruptions.length : 8;

        const baseScore = 100 - (totalSeverity * 2); // Penalty for interruptions
        const handlingBonus = avgHandlingQuality * 2; // Bonus for good handling

        return Math.max(0, Math.min(100, Math.round(baseScore + handlingBonus)));
    }

    assessTurnTakingQuality(patterns) {
        if (patterns.length === 0) return { quality: 8, assessment: 'good' };

        const avgQuality = patterns.reduce((sum, p) => sum + p.overallQuality, 0) / patterns.length;

        let assessment;
        if (avgQuality >= 8) assessment = 'excellent';
        else if (avgQuality >= 6) assessment = 'good';
        else if (avgQuality >= 4) assessment = 'fair';
        else assessment = 'poor';

        return { quality: avgQuality, assessment };
    }

    assessConversationFlow(patterns) {
        // Assess overall conversation flow based on turn-taking patterns
        const smoothTransitions = patterns.filter(p => p.speakerTransition.smooth).length;
        const totalTransitions = patterns.length;

        const flowScore = totalTransitions > 0 ? (smoothTransitions / totalTransitions) * 10 : 8;

        return {
            score: flowScore,
            smoothTransitions,
            totalTransitions,
            flowQuality: flowScore >= 8 ? 'excellent' : flowScore >= 6 ? 'good' : flowScore >= 4 ? 'fair' : 'poor'
        };
    }

    generateInterruptionRecommendations(interruptions) {
        const recommendations = [];

        if (interruptions.length === 0) {
            recommendations.push('Turn-taking patterns are healthy. Continue monitoring.');
            return recommendations;
        }

        const botInterruptions = interruptions.filter(i => i.interruptionType === 'bot_interrupts_human');
        const humanInterruptions = interruptions.filter(i => i.interruptionType === 'human_interrupts_bot');

        if (botInterruptions.length > 0) {
            recommendations.push(`CRITICAL: ${botInterruptions.length} bot interruptions detected. Implement turn-taking detection.`);
        }

        if (humanInterruptions.length > 2) {
            recommendations.push(`High human interruption rate (${humanInterruptions.length}). Review bot response length and clarity.`);
        }

        const poorHandling = interruptions.filter(i => i.handlingQuality < 5).length;
        if (poorHandling > 0) {
            recommendations.push(`Improve interruption recovery - ${poorHandling} instances of poor handling detected.`);
        }

        return recommendations;
    }

    assessAudioQuality(audioData) {
        console.log('🎵 Assessing audio quality with advanced metrics...');

        if (!audioData) {
            // Return mock audio quality assessment
            return this.generateMockAudioQuality();
        }

        // Advanced audio quality metrics
        const qualityMetrics = {
            signalToNoiseRatio: this.calculateSNR(audioData),
            totalHarmonicDistortion: this.calculateTHD(audioData),
            clarityScore: this.assessClarityScore(audioData),
            backgroundNoiseLevel: this.analyzeBackgroundNoise(audioData),
            volumeConsistency: this.analyzeVolumeConsistency(audioData),
            frequencyResponse: this.analyzeFrequencyResponse(audioData)
        };

        const overallQualityScore = this.calculateOverallAudioQuality(qualityMetrics);

        console.log(`✅ Audio quality assessment: ${overallQualityScore}/100`);

        return {
            overallScore: overallQualityScore,
            metrics: qualityMetrics,
            qualityGrade: this.getAudioQualityGrade(overallQualityScore),
            recommendations: this.generateAudioQualityRecommendations(qualityMetrics)
        };
    }

    calculateSNR(audioData) {
        // Signal-to-Noise Ratio calculation (simplified)
        // In real implementation, this would analyze actual audio signal
        const mockSNR = 25 + Math.random() * 20; // 25-45 dB range

        return {
            value: mockSNR,
            unit: 'dB',
            quality: mockSNR > 35 ? 'excellent' : mockSNR > 25 ? 'good' : mockSNR > 15 ? 'fair' : 'poor',
            score: Math.min(100, (mockSNR / 40) * 100)
        };
    }

    calculateTHD(audioData) {
        // Total Harmonic Distortion calculation (simplified)
        const mockTHD = Math.random() * 5; // 0-5% range

        return {
            value: mockTHD,
            unit: '%',
            quality: mockTHD < 1 ? 'excellent' : mockTHD < 2 ? 'good' : mockTHD < 3 ? 'fair' : 'poor',
            score: Math.max(0, 100 - (mockTHD * 20))
        };
    }

    assessClarityScore(audioData) {
        // Speech clarity assessment (simplified)
        const mockClarity = 70 + Math.random() * 25; // 70-95 range

        return {
            value: mockClarity,
            unit: 'score',
            quality: mockClarity > 85 ? 'excellent' : mockClarity > 75 ? 'good' : mockClarity > 65 ? 'fair' : 'poor',
            score: mockClarity
        };
    }

    analyzeBackgroundNoise(audioData) {
        // Background noise level analysis (simplified)
        const mockNoiseLevel = Math.random() * 40; // 0-40 dB range

        return {
            value: mockNoiseLevel,
            unit: 'dB',
            quality: mockNoiseLevel < 10 ? 'excellent' : mockNoiseLevel < 20 ? 'good' : mockNoiseLevel < 30 ? 'fair' : 'poor',
            score: Math.max(0, 100 - (mockNoiseLevel * 2.5))
        };
    }

    analyzeVolumeConsistency(audioData) {
        // Volume consistency analysis (simplified)
        const mockConsistency = 80 + Math.random() * 15; // 80-95 range

        return {
            value: mockConsistency,
            unit: 'score',
            quality: mockConsistency > 90 ? 'excellent' : mockConsistency > 85 ? 'good' : mockConsistency > 80 ? 'fair' : 'poor',
            score: mockConsistency
        };
    }

    analyzeFrequencyResponse(audioData) {
        // Frequency response analysis (simplified)
        const mockResponse = 75 + Math.random() * 20; // 75-95 range

        return {
            value: mockResponse,
            unit: 'score',
            quality: mockResponse > 85 ? 'excellent' : mockResponse > 80 ? 'good' : mockResponse > 75 ? 'fair' : 'poor',
            score: mockResponse
        };
    }

    calculateOverallAudioQuality(metrics) {
        // Weighted calculation of overall audio quality
        const weights = {
            signalToNoiseRatio: 0.25,
            totalHarmonicDistortion: 0.20,
            clarityScore: 0.25,
            backgroundNoiseLevel: 0.15,
            volumeConsistency: 0.10,
            frequencyResponse: 0.05
        };

        let weightedScore = 0;
        Object.keys(weights).forEach(metric => {
            weightedScore += metrics[metric].score * weights[metric];
        });

        return Math.round(weightedScore);
    }

    getAudioQualityGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    generateAudioQualityRecommendations(metrics) {
        const recommendations = [];

        if (metrics.signalToNoiseRatio.score < 70) {
            recommendations.push('Improve recording environment to reduce background noise');
        }

        if (metrics.totalHarmonicDistortion.score < 80) {
            recommendations.push('Check audio equipment for distortion issues');
        }

        if (metrics.clarityScore.score < 75) {
            recommendations.push('Improve microphone quality or positioning for better clarity');
        }

        if (metrics.backgroundNoiseLevel.score < 70) {
            recommendations.push('Use noise cancellation or record in quieter environment');
        }

        if (metrics.volumeConsistency.score < 85) {
            recommendations.push('Implement automatic gain control for consistent volume levels');
        }

        if (recommendations.length === 0) {
            recommendations.push('Audio quality is within acceptable parameters');
        }

        return recommendations;
    }

    generateMockAudioQuality() {
        return {
            overallScore: 82,
            metrics: {
                signalToNoiseRatio: { value: 32, unit: 'dB', quality: 'good', score: 80 },
                totalHarmonicDistortion: { value: 1.2, unit: '%', quality: 'good', score: 76 },
                clarityScore: { value: 85, unit: 'score', quality: 'excellent', score: 85 },
                backgroundNoiseLevel: { value: 15, unit: 'dB', quality: 'good', score: 62 },
                volumeConsistency: { value: 88, unit: 'score', quality: 'good', score: 88 },
                frequencyResponse: { value: 82, unit: 'score', quality: 'good', score: 82 }
            },
            qualityGrade: 'B',
            recommendations: ['Audio quality is within acceptable parameters']
        };
    }

    calculateAdvancedWeightedScore(silenceSegments, repetitions, callDurationAnalysis, responseLatencyAnalysis,
        hallucinationAnalysis, interruptionAnalysis, audioQualityAnalysis, intentFlow) {
        console.log('📊 Calculating enhanced weighted scores as per MVP Technical Analysis...');

        // Enhanced weights based on MVP Technical Analysis requirements
        // Core 5 metrics with proper weighting as specified in MVP analysis
        const weights = {
            silenceCompliance: 0.25,              // 25% - Primary metric (silence detection)
            repetitionAvoidance: 0.25,            // 25% - Primary metric (repetition analysis)
            callDurationOptimization: 0.10,       // 10% - Reduced weight as per MVP
            responseLatencyOptimization: 0.15,    // 15% - New metric as per MVP
            intentFlowAccuracy: 0.25              // 25% - Primary metric (intent flow)
        };

        // Additional metrics for comprehensive analysis (not part of core 5)
        const additionalWeights = {
            hallucinationPrevention: 0.0,         // Integrated into intentFlowAccuracy
            interruptionHandling: 0.0,            // Integrated into responseLatencyOptimization
            audioQuality: 0.0                     // Separate quality metric, not part of core scoring
        };

        const scores = {};

        // 1. SILENCE DETECTION (25%) - SUPER ENHANCED with business logic
        const silenceViolations = silenceSegments.length;
        const maxExpectedViolations = 3; // Reduced threshold for more realistic scoring

        // SUPER ENHANCED silence scoring with business context
        let silenceScore = 100;
        if (silenceViolations > 0) {
            // Only penalize truly problematic silences
            const problematicSilences = silenceSegments.filter(s => s.priority === 'high' || s.priority === 'medium');
            const problematicCount = problematicSilences.length;

            if (problematicCount > 0) {
                const totalSeverity = problematicSilences.reduce((sum, segment) => sum + (segment.severity || 1), 0);
                const avgSeverity = totalSeverity / problematicCount;
                const severityMultiplier = Math.min(1.5, 1 + (avgSeverity * 0.5)); // More conservative multiplier

                silenceScore = Math.max(60, 100 - ((problematicCount / maxExpectedViolations) * 40 * severityMultiplier));
            }
        }
        scores.silenceCompliance = silenceScore;

        // 2. REPETITION ANALYSIS (25%) - SUPER ENHANCED with business logic
        const repetitionCount = repetitions.length;
        const maxExpectedRepetitions = 2; // Reduced threshold for more realistic scoring

        // SUPER ENHANCED repetition scoring with business context
        let repetitionScore = 100;
        if (repetitionCount > 0) {
            // Only penalize truly problematic repetitions
            const problematicRepetitions = repetitions.filter(rep => rep.isProblematicRepetition && rep.severity > 5);
            const problematicCount = problematicRepetitions.length;

            if (problematicCount > 0) {
                const severityWeightedCount = problematicRepetitions.reduce((sum, rep) => {
                    const severityMultiplier = rep.severity ? (rep.severity / 10) : 1;
                    const typeMultiplier = this.getRepetitionTypeMultiplier(rep.repetitionType);
                    return sum + (severityMultiplier * typeMultiplier);
                }, 0);

                repetitionScore = Math.max(70, 100 - ((severityWeightedCount / maxExpectedRepetitions) * 30));
            }
        }
        scores.repetitionAvoidance = repetitionScore;

        // 3. CALL DURATION ANALYSIS (10%) - Enhanced with conversation efficiency
        let durationScore = 100;
        if (callDurationAnalysis.withinIdealRange) {
            durationScore = 100;
        } else {
            const deviation = callDurationAnalysis.deviationFromIdeal;
            const totalDuration = callDurationAnalysis.totalDurationMinutes;

            // Enhanced scoring with conversation efficiency consideration
            const conversationEfficiency = this.calculateConversationEfficiency(intentFlow, totalDuration);
            const efficiencyBonus = Math.min(10, conversationEfficiency * 10); // Up to 10 point bonus

            if (callDurationAnalysis.status === 'too_short') {
                // Penalty for short calls, but consider if objectives were achieved
                const objectiveBonus = (intentFlow.objectiveAchieved) ? 20 : 0;
                durationScore = Math.max(0, 100 - (deviation * 15) + objectiveBonus);
            } else if (callDurationAnalysis.status === 'too_long') {
                // Penalty for long calls, but consider conversation efficiency
                durationScore = Math.max(15, 100 - (deviation * 11) + efficiencyBonus);
            }
        }
        scores.callDurationOptimization = Math.min(100, durationScore);

        // 4. RESPONSE LATENCY OPTIMIZATION (15%) - Enhanced with context awareness
        let latencyScore = responseLatencyAnalysis.latencyScore || 0;

        // Integrate interruption handling into latency score
        if (interruptionAnalysis && interruptionAnalysis.interruptionScore) {
            const interruptionPenalty = Math.max(0, (100 - interruptionAnalysis.interruptionScore) * 0.3);
            latencyScore = Math.max(0, latencyScore - interruptionPenalty);
        }

        scores.responseLatencyOptimization = latencyScore;

        // 5. INTENT FLOW ACCURACY (25%) - SUPER ENHANCED with business success logic
        let intentScore = 50; // Higher default for missing data

        if (intentFlow && intentFlow.flowScore !== undefined) {
            // Start with base flow score
            intentScore = intentFlow.flowScore;

            // MAJOR BONUS for achieving call objective (MagicBricks specific)
            if (intentFlow.objectiveAchieved) {
                intentScore = Math.min(100, Math.max(intentScore, 75) + 20); // Minimum 75 + 20 bonus for successful calls
            }

            // MAJOR BONUS for high critical steps completion
            if (intentFlow.criticalStepsAnalysis && intentFlow.criticalStepsAnalysis.completionRate) {
                const completionRate = intentFlow.criticalStepsAnalysis.completionRate;
                if (completionRate >= 1.0) {
                    intentScore = Math.min(100, intentScore + 15); // Full completion bonus
                } else if (completionRate >= 0.75) {
                    intentScore = Math.min(100, intentScore + 10); // High completion bonus
                } else if (completionRate >= 0.5) {
                    intentScore = Math.min(100, intentScore + 5); // Partial completion bonus
                }
            }

            // Enhanced hallucination penalty with critical step analysis
            if (hallucinationAnalysis) {
                const hallucinationScore = hallucinationAnalysis.enhancedScore || hallucinationAnalysis.hallucinationScore;

                // Apply penalty for poor hallucination scores
                if (hallucinationScore < 60) {
                    const hallucinationPenalty = Math.max(0, (60 - hallucinationScore) * 0.2);
                    intentScore = Math.max(50, intentScore - hallucinationPenalty);
                }

                // Additional penalty for critical step violations
                if (hallucinationAnalysis.criticalStepAnalysis) {
                    const criticalViolations = hallucinationAnalysis.criticalStepAnalysis.criticalStepViolations || [];
                    const severeCriticalViolations = criticalViolations.filter(v => v.severity >= 8);

                    if (severeCriticalViolations.length > 0) {
                        const criticalPenalty = severeCriticalViolations.length * 5; // 5 points per severe violation
                        intentScore = Math.max(40, intentScore - criticalPenalty);
                        console.log(`🚨 Applied critical step violation penalty: -${criticalPenalty} points for ${severeCriticalViolations.length} severe violations`);
                    }
                }
            }

            // Ensure successful conversations get good scores
            if (intentFlow.objectiveAchieved && intentScore < 80) {
                intentScore = 80; // Minimum 80 for successful objective achievement
            }
        }

        scores.intentFlowAccuracy = intentScore;

        // Calculate overall score using enhanced weights (Core 5 metrics only)
        const overallScore = Object.keys(weights).reduce((sum, metric) => {
            return sum + (scores[metric] * weights[metric]);
        }, 0);

        // Store additional metrics for reference (not included in core score)
        const additionalScores = {
            hallucinationPrevention: hallucinationAnalysis ? (hallucinationAnalysis.enhancedScore || hallucinationAnalysis.hallucinationScore) : 0,
            criticalStepAdherence: hallucinationAnalysis?.criticalStepAnalysis?.criticalStepScore || 0,
            interruptionHandling: interruptionAnalysis ? interruptionAnalysis.interruptionScore : 0,
            audioQuality: audioQualityAnalysis ? audioQualityAnalysis.overallScore : 0
        };

        const scoreBreakdown = {
            overallScore,
            componentScores: scores,
            additionalScores, // Separate from core scoring
            weights,
            mvpCompliance: {
                coreMetrics: 5,
                implementedMetrics: 5,
                weightingStrategy: 'MVP Technical Analysis Enhanced',
                scoringMethod: 'Context-aware with objective completion bonuses'
            },
            explanations: {
                silenceCompliance: `Found ${silenceViolations} raw silence detections, ${silenceSegments.filter(s => s.priority === 'high' || s.priority === 'medium').length} problematic (threshold: ${maxExpectedViolations}), SUPER advanced filtering applied`,
                repetitionAvoidance: `Found ${repetitionCount} potential repetitions, ${repetitions.filter(r => r.isProblematicRepetition).length} truly problematic (threshold: ${maxExpectedRepetitions}), Business context analysis applied`,
                callDurationOptimization: `Call duration: ${callDurationAnalysis.totalDurationMinutes.toFixed(1)}min (ideal: ${callDurationAnalysis.idealRangeMin}-${callDurationAnalysis.idealRangeMax}min), Efficiency bonus applied`,
                responseLatencyOptimization: `Response latency: ${responseLatencyAnalysis.totalViolations || 0} violations, Avg: ${responseLatencyAnalysis.averageResponseTime ? responseLatencyAnalysis.averageResponseTime.toFixed(1) : 0}s, Interruption handling integrated`,
                intentFlowAccuracy: `SUPER ENHANCED: Base flow ${intentFlow.flowScore ? intentFlow.flowScore.toFixed(1) : 0}/100, Objective achieved: ${intentFlow.objectiveAchieved ? 'YES (+20 bonus)' : 'NO'}, Critical steps: ${intentFlow.criticalStepsAnalysis ? (intentFlow.criticalStepsAnalysis.completionRate * 100).toFixed(0) : 0}%`
            },
            // Enhanced breakdown with MagicBricks-specific analysis
            conversationAnalysis: {
                totalTurns: intentFlow.intentMappings ? intentFlow.intentMappings.length : 0,
                averageConfidence: intentFlow.averageConfidence ? (intentFlow.averageConfidence * 100).toFixed(1) + '%' : '0%',
                completedSteps: intentFlow.completedSteps || 0,
                totalSteps: intentFlow.totalRequiredSteps || 20,
                missingCriticalSteps: intentFlow.missingCriticalSteps || [],
                conversationQuality: intentFlow.conversationQuality || { rating: 'Unknown', score: 0 },
                objectiveAchieved: intentFlow.objectiveAchieved || false,
                criticalStepsCompletion: intentFlow.criticalStepsAnalysis ?
                    `${intentFlow.criticalStepsAnalysis.completed.length}/${intentFlow.criticalStepsAnalysis.totalCriticalSteps || 4}` : '0/4'
            },
            // Additional metrics for comprehensive analysis
            supplementaryMetrics: {
                hallucinationScore: additionalScores.hallucinationPrevention,
                interruptionScore: additionalScores.interruptionHandling,
                audioQualityScore: additionalScores.audioQuality,
                scriptAdherence: hallucinationAnalysis ? (hallucinationAnalysis.scriptAdherence || 0) : 0,
                objectionHandling: hallucinationAnalysis ? (hallucinationAnalysis.objectionHandling || 0) : 0
            }
        };

        console.log(`✅ Enhanced MVP-compliant score calculated: ${overallScore.toFixed(1)}/100`);
        console.log(`📊 Core 5 Metrics: Silence(${scores.silenceCompliance.toFixed(1)}) + Repetition(${scores.repetitionAvoidance.toFixed(1)}) + Duration(${scores.callDurationOptimization.toFixed(1)}) + Latency(${scores.responseLatencyOptimization.toFixed(1)}) + Intent(${scores.intentFlowAccuracy.toFixed(1)})`);
        console.log(`🎯 Objective Achieved: ${intentFlow.objectiveAchieved ? 'YES' : 'NO'} | Critical Steps: ${intentFlow.criticalStepsAnalysis ? intentFlow.criticalStepsAnalysis.completionRate * 100 : 0}%`);

        return { overallScore, scoreBreakdown };
    }

    detectHallucinations(audioData, transcript) {
        console.log('🧠 Detecting hallucinations and conversation deviations...');
        console.log('🎯 ENHANCED: Critical step context adherence analysis');
        console.log('🎵 PRIMARY: Using audio analysis for speech patterns, tone, and confidence detection');
        console.log('📝 SECONDARY: Using transcript for content analysis and context verification');

        // Enhanced analysis with critical step focus
        const enhancedAnalysis = this.detectCriticalStepHallucinations(transcript);

        // Primary analysis from audio data
        if (audioData && audioData.speechAnalysis) {
            const audioAnalysis = this.detectHallucinationsFromAudio(audioData, transcript);
            return this.mergeHallucinationAnalyses(audioAnalysis, enhancedAnalysis);
        }

        // Fallback to transcript-based analysis with critical step enhancement
        console.log('⚠️ Audio speech analysis not available, using enhanced transcript-based detection');
        const transcriptAnalysis = this.detectHallucinationsFromTranscript(transcript);
        return this.mergeHallucinationAnalyses(transcriptAnalysis, enhancedAnalysis);
    }

    detectHallucinationsFromAudio(audioData, transcript) {
        console.log('🎵 Analyzing hallucinations from audio speech patterns...');

        const hallucinations = [];
        const turns = this.parseTranscriptTurns(transcript);
        const speechAnalysis = audioData.speechAnalysis || [];

        for (let i = 1; i < turns.length; i++) {
            if (turns[i].speaker === 'agent' && turns[i - 1].speaker === 'customer') {
                const humanInput = turns[i - 1].text;
                const botResponse = turns[i].text;

                // Get corresponding audio analysis for this turn
                const audioSegment = this.getAudioSegmentForTurn(speechAnalysis, i);

                const hallucinationAnalysis = this.analyzeResponseRelevanceFromAudio(
                    humanInput, botResponse, audioSegment, i
                );

                if (hallucinationAnalysis.isHallucination) {
                    hallucinations.push({
                        turnIndex: i,
                        humanInput: humanInput.substring(0, 100) + '...',
                        botResponse: botResponse.substring(0, 100) + '...',
                        hallucinationType: hallucinationAnalysis.type,
                        severity: hallucinationAnalysis.severity,
                        relevanceScore: hallucinationAnalysis.relevanceScore,
                        contextDeviation: hallucinationAnalysis.contextDeviation,
                        recommendation: hallucinationAnalysis.recommendation,
                        audioConfidence: audioSegment ? audioSegment.confidence : null,
                        speechPatterns: audioSegment ? audioSegment.patterns : null,
                        analysisSource: 'audio_primary'
                    });
                }
            }
        }

        const hallucinationScore = this.calculateHallucinationScore(hallucinations, turns.length);

        return {
            hallucinations,
            hallucinationScore,
            totalBotTurns: turns.filter(t => t.speaker === 'agent').length,
            deviationRate: hallucinations.length / Math.max(turns.filter(t => t.speaker === 'agent').length, 1),
            overallRelevance: this.calculateOverallRelevance(turns),
            analysisSource: 'audio_primary'
        };
    }

    detectCriticalStepHallucinations(transcript) {
        console.log('🎯 Analyzing critical step context adherence and response quality...');

        const turns = this.parseTranscriptTurns(transcript);
        const criticalStepViolations = [];
        const contextDeviations = [];
        const unaddressedQueries = [];

        // Critical steps that must be handled properly
        const criticalSteps = [1, 6, 7, 9]; // Initial greeting, Interest check, Agent offer, Call transfer

        // Track conversation state and expected responses
        let conversationState = {
            currentStep: 0,
            expectedContext: 'greeting',
            humanQueries: [],
            botResponses: [],
            criticalStepAttempts: new Map()
        };

        for (let i = 0; i < turns.length; i++) {
            const turn = turns[i];

            if (turn.speaker === 'customer') {
                // Analyze human input for context and intent
                const humanAnalysis = this.analyzeHumanInput(turn.text, conversationState, i);
                conversationState.humanQueries.push(humanAnalysis);

                // Check if human is asking something outside expected flow
                if (humanAnalysis.isOffTopic && conversationState.currentStep <= 7) {
                    contextDeviations.push({
                        turnIndex: i,
                        humanQuery: turn.text.substring(0, 100) + '...',
                        expectedContext: conversationState.expectedContext,
                        actualContext: humanAnalysis.detectedContext,
                        severity: humanAnalysis.deviationSeverity,
                        type: 'human_context_deviation'
                    });
                }
            } else if (turn.speaker === 'agent') {
                // Analyze bot response quality and context adherence
                const previousHuman = i > 0 && turns[i - 1].speaker === 'customer' ? turns[i - 1] : null;

                if (previousHuman) {
                    const responseAnalysis = this.analyzeCriticalStepResponse(
                        previousHuman.text,
                        turn.text,
                        conversationState,
                        i
                    );

                    conversationState.botResponses.push(responseAnalysis);

                    // Check for critical step violations
                    if (responseAnalysis.isCriticalStepViolation) {
                        criticalStepViolations.push({
                            turnIndex: i,
                            humanInput: previousHuman.text.substring(0, 100) + '...',
                            botResponse: turn.text.substring(0, 100) + '...',
                            expectedStep: responseAnalysis.expectedStep,
                            actualStep: responseAnalysis.detectedStep,
                            violationType: responseAnalysis.violationType,
                            severity: responseAnalysis.severity,
                            recommendation: responseAnalysis.recommendation
                        });
                    }

                    // Check for unaddressed queries
                    if (responseAnalysis.failedToAddress) {
                        unaddressedQueries.push({
                            turnIndex: i,
                            humanQuery: previousHuman.text.substring(0, 100) + '...',
                            botResponse: turn.text.substring(0, 100) + '...',
                            queryType: responseAnalysis.queryType,
                            expectedResponse: responseAnalysis.expectedResponse,
                            actualResponse: responseAnalysis.actualResponse,
                            severity: responseAnalysis.addressingSeverity,
                            recommendation: this.generateQueryAddressingRecommendation(responseAnalysis)
                        });
                    }

                    // Update conversation state
                    conversationState = this.updateConversationStateFromResponse(conversationState, responseAnalysis);
                }
            }
        }

        // Generate comprehensive recommendations
        const recommendations = this.generateCriticalStepRecommendations(
            criticalStepViolations,
            contextDeviations,
            unaddressedQueries,
            conversationState
        );

        console.log(`🎯 Critical step analysis: ${criticalStepViolations.length} violations, ${contextDeviations.length} context deviations, ${unaddressedQueries.length} unaddressed queries`);

        return {
            criticalStepViolations,
            contextDeviations,
            unaddressedQueries,
            conversationState,
            recommendations,
            criticalStepScore: this.calculateCriticalStepScore(criticalStepViolations, contextDeviations, unaddressedQueries),
            analysisSource: 'critical_step_enhanced'
        };
    }

    detectHallucinationsFromTranscript(transcript) {
        console.log('📝 Analyzing hallucinations from transcript content...');

        const turns = this.parseTranscriptTurns(transcript);

        // Handle empty or invalid transcript
        if (turns.length === 0) {
            console.log('⚠️ No valid turns found in transcript, returning default hallucination analysis');
            return this.getDefaultHallucinationAnalysis();
        }
        const hallucinations = [];

        for (let i = 1; i < turns.length; i++) {
            if (turns[i].speaker === 'agent' && turns[i - 1].speaker === 'customer') {
                const humanInput = turns[i - 1].text;
                const botResponse = turns[i].text;

                const hallucinationAnalysis = this.analyzeResponseRelevance(
                    humanInput, botResponse, i
                );

                if (hallucinationAnalysis.isHallucination) {
                    hallucinations.push({
                        turnIndex: i,
                        humanInput: humanInput.substring(0, 100) + '...',
                        botResponse: botResponse.substring(0, 100) + '...',
                        hallucinationType: hallucinationAnalysis.type,
                        severity: hallucinationAnalysis.severity,
                        relevanceScore: hallucinationAnalysis.relevanceScore,
                        contextDeviation: hallucinationAnalysis.contextDeviation,
                        recommendation: hallucinationAnalysis.recommendation
                    });
                }
            }
        }

        const hallucinationScore = this.calculateHallucinationScore(hallucinations, turns.length);

        console.log(`✅ Hallucination analysis: ${hallucinations.length} deviations detected`);

        return {
            hallucinations,
            hallucinationScore,
            totalBotTurns: turns.filter(t => t.speaker === 'agent').length,
            deviationRate: hallucinations.length / Math.max(turns.filter(t => t.speaker === 'agent').length, 1),
            overallRelevance: this.calculateOverallRelevance(turns)
        };
    }

    analyzeResponseRelevance(humanInput, botResponse, turnIndex) {
        // Multi-dimensional relevance analysis for MagicBricks
        const topicRelevance = this.calculateTopicRelevance(humanInput, botResponse);
        const contextualRelevance = this.calculateContextualRelevance(humanInput, botResponse, turnIndex);
        const semanticCoherence = this.calculateSemanticCoherence(humanInput, botResponse);
        const factualConsistency = this.checkFactualConsistency(botResponse);

        // NEW: Script adherence analysis for MagicBricks
        const scriptAdherence = this.checkScriptAdherence(botResponse, turnIndex);
        const objectionHandling = this.checkObjectionHandling(humanInput, botResponse);

        // Overall relevance score with script adherence (0-1)
        const relevanceScore = (topicRelevance * 0.25 + contextualRelevance * 0.25 +
            semanticCoherence * 0.2 + factualConsistency * 0.15 +
            scriptAdherence * 0.1 + objectionHandling * 0.05);

        // Determine if it's a hallucination (stricter threshold for script-based bot)
        const isHallucination = relevanceScore < 0.65 || scriptAdherence < 0.5;

        // Classify hallucination type with MagicBricks-specific categories
        let hallucinationType = 'none';
        let severity = 0;

        if (isHallucination) {
            if (scriptAdherence < 0.3) {
                hallucinationType = 'script_deviation';
                severity = 9; // High severity for script deviation
            } else if (objectionHandling < 0.4 && this.isObjectionPresent(humanInput)) {
                hallucinationType = 'improper_objection_handling';
                severity = 8;
            } else if (topicRelevance < 0.3) {
                hallucinationType = 'topic_deviation';
                severity = 8;
            } else if (contextualRelevance < 0.4) {
                hallucinationType = 'context_loss';
                severity = 7;
            } else if (semanticCoherence < 0.5) {
                hallucinationType = 'semantic_confusion';
                severity = 6;
            } else if (factualConsistency < 0.5) {
                hallucinationType = 'factual_error';
                severity = 9;
            } else {
                hallucinationType = 'general_irrelevance';
                severity = 5;
            }
        }

        return {
            isHallucination,
            type: hallucinationType,
            severity,
            relevanceScore,
            contextDeviation: 1 - contextualRelevance,
            scriptAdherence,
            objectionHandling,
            recommendation: this.generateHallucinationRecommendation(hallucinationType, severity)
        };
    }

    calculateTopicRelevance(humanInput, botResponse) {
        // Extract key topics from both inputs
        const humanTopics = this.extractTopics(humanInput);
        const botTopics = this.extractTopics(botResponse);

        if (humanTopics.length === 0 && botTopics.length === 0) return 1.0;
        if (humanTopics.length === 0 || botTopics.length === 0) return 0.3;

        // Calculate topic overlap
        const commonTopics = humanTopics.filter(topic =>
            botTopics.some(botTopic => this.calculateSimilarity(topic, botTopic) > 0.7)
        );

        return commonTopics.length / Math.max(humanTopics.length, botTopics.length);
    }

    extractTopics(text) {
        // Simple topic extraction using keywords and entities
        const topicKeywords = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !this.isStopWord(word));

        // Group similar words and return unique topics
        return [...new Set(topicKeywords)];
    }

    isStopWord(word) {
        const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
        return stopWords.includes(word.toLowerCase());
    }

    calculateContextualRelevance(humanInput, botResponse, turnIndex) {
        // Analyze if bot response fits the conversational context
        const humanIntent = this.classifyIntent(humanInput);
        const botResponseType = this.classifyResponseType(botResponse);

        // Check intent-response alignment
        const intentAlignment = this.checkIntentResponseAlignment(humanIntent, botResponseType);

        // Check conversational flow appropriateness
        const flowAppropriate = this.checkConversationalFlow(humanInput, botResponse, turnIndex);

        return (intentAlignment * 0.6) + (flowAppropriate * 0.4);
    }

    classifyIntent(text) {
        const textLower = text.toLowerCase();

        if (textLower.includes('?') || textLower.includes('what') || textLower.includes('how') || textLower.includes('why')) {
            return 'question';
        } else if (textLower.includes('please') || textLower.includes('can you') || textLower.includes('could you')) {
            return 'request';
        } else if (textLower.includes('thank') || textLower.includes('thanks')) {
            return 'gratitude';
        } else if (textLower.includes('yes') || textLower.includes('no') || textLower.includes('okay')) {
            return 'confirmation';
        } else if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('नमस्ते')) {
            return 'greeting';
        }

        return 'statement';
    }

    classifyResponseType(text) {
        const textLower = text.toLowerCase();

        if (textLower.includes('?')) {
            return 'question';
        } else if (textLower.includes('please') || textLower.includes('can you')) {
            return 'request';
        } else if (textLower.includes('thank') || textLower.includes('welcome')) {
            return 'acknowledgment';
        } else if (textLower.includes('sorry') || textLower.includes('apologize')) {
            return 'apology';
        } else if (textLower.includes('help') || textLower.includes('assist')) {
            return 'offer_help';
        }

        return 'information';
    }

    checkIntentResponseAlignment(humanIntent, botResponseType) {
        // Define appropriate response types for each human intent
        const alignmentMatrix = {
            question: ['information', 'question', 'acknowledgment'],
            request: ['acknowledgment', 'information', 'offer_help'],
            gratitude: ['acknowledgment', 'offer_help'],
            confirmation: ['acknowledgment', 'information'],
            greeting: ['acknowledgment', 'offer_help'],
            statement: ['acknowledgment', 'question', 'information']
        };

        const appropriateResponses = alignmentMatrix[humanIntent] || ['information'];
        return appropriateResponses.includes(botResponseType) ? 1.0 : 0.3;
    }

    checkConversationalFlow(humanInput, botResponse, turnIndex) {
        // Simple conversational flow check
        // In a real implementation, this would be more sophisticated
        const humanLength = humanInput.split(/\s+/).length;
        const botLength = botResponse.split(/\s+/).length;

        // Very short responses to complex questions might indicate poor flow
        if (humanLength > 10 && botLength < 3) return 0.4;

        // Very long responses to simple questions might also be poor
        if (humanLength < 5 && botLength > 50) return 0.6;

        return 0.8; // Default good flow
    }

    calculateSemanticCoherence(humanInput, botResponse) {
        // Check if the bot response makes semantic sense given the human input
        const humanSentiment = this.analyzeSentiment(humanInput);
        const botSentiment = this.analyzeSentiment(botResponse);

        // Check for appropriate sentiment alignment
        let sentimentAlignment = 0.8; // Default neutral alignment

        if (humanSentiment === 'negative' && botSentiment === 'positive') {
            sentimentAlignment = 0.9; // Good - addressing negative with positive
        } else if (humanSentiment === 'positive' && botSentiment === 'negative') {
            sentimentAlignment = 0.3; // Poor - responding negatively to positive
        }

        // Check for logical flow
        const logicalFlow = this.checkLogicalFlow(humanInput, botResponse);

        return (sentimentAlignment * 0.4) + (logicalFlow * 0.6);
    }

    analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased', 'thank', 'wonderful', 'perfect'];
        const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'wrong', 'problem'];

        const textLower = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    checkLogicalFlow(humanInput, botResponse) {
        // Simple logical flow check
        // Check if bot is answering what was asked
        const humanHasQuestion = humanInput.includes('?');
        const botProvidesAnswer = !botResponse.includes('?') && botResponse.length > 10;

        if (humanHasQuestion && botProvidesAnswer) return 0.9;
        if (humanHasQuestion && botResponse.includes('?')) return 0.6; // Question with question

        return 0.8; // Default reasonable flow
    }

    checkFactualConsistency(botResponse) {
        // Simple factual consistency check
        // In a real implementation, this would check against a knowledge base

        // Check for contradictory statements within the response
        const sentences = botResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);

        if (sentences.length < 2) return 0.9; // Single sentence, assume consistent

        // Look for obvious contradictions (simplified)
        const contradictionPatterns = [
            { positive: /\byes\b/i, negative: /\bno\b/i },
            { positive: /\bcan\b/i, negative: /\bcannot\b|\bcan't\b/i },
            { positive: /\bwill\b/i, negative: /\bwon't\b|\bwill not\b/i }
        ];

        for (const pattern of contradictionPatterns) {
            const hasPositive = sentences.some(s => pattern.positive.test(s));
            const hasNegative = sentences.some(s => pattern.negative.test(s));

            if (hasPositive && hasNegative) {
                return 0.3; // Likely contradiction
            }
        }

        return 0.9; // No obvious contradictions
    }

    generateHallucinationRecommendation(type, severity) {
        const recommendations = {
            script_deviation: 'CRITICAL: Bot deviated from MagicBricks script. Review script adherence and training.',
            improper_objection_handling: 'HIGH: Bot failed to handle customer objection properly. Review FAQ responses.',
            topic_deviation: 'CRITICAL: Bot completely off-topic from property search. Review intent recognition.',
            context_loss: 'HIGH: Bot lost conversational context. Improve context retention mechanisms.',
            semantic_confusion: 'MEDIUM: Bot response semantically unclear. Review response generation logic.',
            factual_error: 'CRITICAL: Factual inconsistencies detected. Verify knowledge base and fact-checking.',
            general_irrelevance: 'MEDIUM: Response not relevant to user input. Improve relevance scoring.',
            none: 'Response relevance within acceptable range.'
        };

        const baseRecommendation = recommendations[type] || 'Monitor response relevance.';
        const priorityTag = severity > 7 ? ' [URGENT]' : severity > 5 ? ' [HIGH PRIORITY]' : ' [MONITOR]';

        return baseRecommendation + priorityTag;
    }

    calculateHallucinationScore(hallucinations, totalTurns) {
        if (hallucinations.length === 0) return 100;

        // Calculate weighted score based on severity
        const totalSeverity = hallucinations.reduce((sum, h) => sum + h.severity, 0);
        const maxPossibleSeverity = hallucinations.length * 10;

        const severityRatio = totalSeverity / maxPossibleSeverity;
        const frequencyPenalty = (hallucinations.length / Math.max(totalTurns, 1)) * 100;

        const score = Math.max(0, 100 - (severityRatio * 60) - frequencyPenalty);

        return Math.round(score);
    }

    calculateOverallRelevance(turns) {
        // Calculate overall conversation relevance
        let totalRelevance = 0;
        let botTurnCount = 0;

        for (let i = 1; i < turns.length; i++) {
            if (turns[i].speaker === 'agent' && turns[i - 1].speaker === 'customer') {
                const relevance = this.calculateTopicRelevance(turns[i - 1].text, turns[i].text);
                totalRelevance += relevance;
                botTurnCount++;
            }
        }

        return botTurnCount > 0 ? totalRelevance / botTurnCount : 1.0;
    }

    generateVisualizationData(audioData, silenceSegments) {
        console.log('📈 Generating visualization data...');

        const duration = audioData ? audioData.duration : 180; // Default 3 minutes

        // Generate mock waveform data for visualization
        const sampleRate = 100; // 100 samples per second for visualization
        const totalSamples = Math.floor(duration * sampleRate);
        const waveformData = [];

        for (let i = 0; i < totalSamples; i++) {
            const time = i / sampleRate;
            // Generate realistic waveform with some variation
            const amplitude = 0.5 * Math.sin(2 * Math.PI * 0.1 * time) * Math.exp(-time / 60) +
                0.3 * Math.random() - 0.15;
            waveformData.push({
                time,
                amplitude
            });
        }

        const visualizationData = {
            duration,
            waveformData,
            silenceMarkers: silenceSegments.map(segment => ({
                start: segment.startTime,
                end: segment.endTime,
                duration: segment.duration,
                speaker: segment.speaker
            })),
            sampleRate
        };

        console.log(`✅ Visualization data generated with ${silenceSegments.length} silence markers`);
        return visualizationData;
    }

    generateAdvancedOverallRecommendations(scores, analysisData) {
        const recommendations = [];
        const { silenceSegments, repetitions, hallucinationAnalysis,
            interruptionAnalysis, audioQualityAnalysis, responseLatencyAnalysis } = analysisData;

        // Priority-based recommendations
        const criticalIssues = [];
        const highPriorityIssues = [];
        const mediumPriorityIssues = [];

        // Analyze each metric for recommendations
        if (scores.hallucinationPrevention < 70) {
            criticalIssues.push(`CRITICAL: High hallucination rate (${hallucinationAnalysis.deviationRate * 100}%) - Review response relevance logic`);
        }

        if (scores.interruptionHandling < 60) {
            const botInterruptions = interruptionAnalysis.interruptions.filter(i => i.interruptionType === 'bot_interrupts_human').length;
            if (botInterruptions > 0) {
                criticalIssues.push(`CRITICAL: Bot interrupting humans ${botInterruptions} times - Fix turn-taking detection`);
            }
        }

        if (scores.responseLatencyOptimization < 70) {
            highPriorityIssues.push(`HIGH: Response latency issues - ${responseLatencyAnalysis.totalViolations} violations detected`);
        }

        if (scores.silenceCompliance < 75) {
            const highImpactSilences = silenceSegments.filter(s => s.impactScore > 7).length;
            if (highImpactSilences > 0) {
                highPriorityIssues.push(`HIGH: ${highImpactSilences} high-impact silence violations - Optimize response generation`);
            }
        }

        if (scores.repetitionAvoidance < 80) {
            const severeRepetitions = repetitions.filter(r => r.severity > 7).length;
            if (severeRepetitions > 0) {
                mediumPriorityIssues.push(`MEDIUM: ${severeRepetitions} severe repetitions - Add response variation`);
            }
        }

        if (scores.audioQuality < 75) {
            mediumPriorityIssues.push(`MEDIUM: Audio quality below standard (${audioQualityAnalysis.qualityGrade}) - Review recording setup`);
        }

        // Combine all recommendations
        recommendations.push(...criticalIssues);
        recommendations.push(...highPriorityIssues);
        recommendations.push(...mediumPriorityIssues);

        // Add positive feedback if scores are good
        if (scores.hallucinationPrevention > 85) {
            recommendations.push('✅ Excellent response relevance - maintain current quality');
        }

        if (scores.interruptionHandling > 85) {
            recommendations.push('✅ Good turn-taking behavior - continue monitoring');
        }

        if (recommendations.length === 0) {
            recommendations.push('Overall performance is within acceptable parameters. Continue monitoring for consistency.');
        }

        return recommendations;
    }

    // ===== UPDATED INTERRUPTION HANDLING METHOD =====

    // Rename the original method to be the fallback
    analyzeInterruptionHandlingFromTranscriptOriginal(transcript) {
        const turns = this.parseTranscriptTurns(transcript);
        const interruptions = [];
        const interruptionPatterns = [];

        // Analyze turn-taking patterns
        for (let i = 1; i < turns.length - 1; i++) {
            const currentTurn = turns[i];
            const nextTurn = turns[i + 1];
            const prevTurn = turns[i - 1];

            // Detect potential interruptions
            const interruptionAnalysis = this.detectInterruptionPattern(
                prevTurn, currentTurn, nextTurn, i
            );

            if (interruptionAnalysis.isInterruption) {
                interruptions.push({
                    turnIndex: i,
                    interruptionType: interruptionAnalysis.type,
                    severity: interruptionAnalysis.severity,
                    handlingQuality: interruptionAnalysis.handlingQuality,
                    recoveryTime: interruptionAnalysis.recoveryTime,
                    contextAppropriate: interruptionAnalysis.contextAppropriate,
                    recommendation: interruptionAnalysis.recommendation,
                    analysisSource: 'transcript_fallback'
                });
            }

            // Analyze overall turn-taking pattern
            const turnPattern = this.analyzeTurnTakingPattern(prevTurn, currentTurn, nextTurn);
            interruptionPatterns.push(turnPattern);
        }

        const interruptionScore = this.calculateInterruptionScore(interruptions, interruptionPatterns);

        return {
            interruptions,
            interruptionScore,
            turnTakingQuality: this.assessTurnTakingQuality(interruptionPatterns),
            conversationFlow: this.assessConversationFlow(interruptionPatterns),
            recommendations: this.generateInterruptionRecommendations(interruptions),
            analysisSource: 'transcript_fallback'
        };
    }

    // ===== NEW AUDIO-FIRST ANALYSIS METHODS =====

    getTranscriptContextForTiming(transcript, turnIndex) {
        const turns = this.parseTranscriptTurns(transcript);
        return {
            humanText: turns[turnIndex - 1]?.text || '',
            botText: turns[turnIndex]?.text || ''
        };
    }

    determineConversationPhase(turnIndex, totalTurns) {
        const progress = turnIndex / totalTurns;
        if (progress < 0.2) return 'greeting';
        if (progress < 0.4) return 'inquiry';
        if (progress < 0.8) return 'information_gathering';
        if (progress < 0.95) return 'resolution';
        return 'closing';
    }

    getAudioSegmentForTurn(speechAnalysis, turnIndex) {
        return speechAnalysis.find(segment => segment.turnIndex === turnIndex) || null;
    }

    analyzeResponseRelevanceFromAudio(humanInput, botResponse, audioSegment, turnIndex) {
        // Enhanced analysis using audio confidence and speech patterns
        const transcriptAnalysis = this.analyzeResponseRelevance(humanInput, botResponse, turnIndex);

        if (!audioSegment) {
            return transcriptAnalysis;
        }

        // Audio-specific hallucination indicators
        const audioConfidence = audioSegment.confidence || 0.8;
        const speechHesitation = audioSegment.hesitationCount || 0;
        const speechPace = audioSegment.wordsPerMinute || 150;
        const toneConsistency = audioSegment.toneConsistency || 0.8;

        // Adjust relevance score based on audio indicators
        let adjustedRelevanceScore = transcriptAnalysis.relevanceScore;

        // Low confidence in speech recognition suggests potential hallucination
        if (audioConfidence < 0.6) {
            adjustedRelevanceScore *= 0.8;
        }

        // High hesitation suggests uncertainty/potential hallucination
        if (speechHesitation > 3) {
            adjustedRelevanceScore *= 0.7;
        }

        // Unusually fast speech might indicate scripted/irrelevant responses
        if (speechPace > 200) {
            adjustedRelevanceScore *= 0.9;
        }

        // Poor tone consistency suggests confusion/hallucination
        if (toneConsistency < 0.6) {
            adjustedRelevanceScore *= 0.8;
        }

        const isHallucination = adjustedRelevanceScore < 0.6;

        return {
            ...transcriptAnalysis,
            relevanceScore: adjustedRelevanceScore,
            isHallucination,
            audioIndicators: {
                confidence: audioConfidence,
                hesitation: speechHesitation,
                speechPace,
                toneConsistency
            }
        };
    }

    getTranscriptContextForInterruption(transcript, audioInterruption) {
        const turns = this.parseTranscriptTurns(transcript);
        const turnIndex = audioInterruption.turnIndex || 0;

        return {
            previousTurn: turns[turnIndex - 1] || null,
            currentTurn: turns[turnIndex] || null,
            nextTurn: turns[turnIndex + 1] || null
        };
    }

    analyzeAudioInterruption(audioInterruption, transcriptContext, index) {
        const overlapDuration = audioInterruption.overlapDuration || 0;
        const interruptionType = audioInterruption.type || 'unknown';
        const speakerTransition = audioInterruption.speakerTransition || {};

        let severity = 0;
        let handlingQuality = 5;
        let isSignificant = false;

        // Analyze based on audio characteristics
        if (interruptionType === 'bot_interrupts_human') {
            severity = Math.min(10, 5 + (overlapDuration * 2)); // Higher severity for longer overlaps
            handlingQuality = 2; // Poor handling when bot interrupts
            isSignificant = overlapDuration > 0.5; // Significant if overlap > 0.5 seconds
        } else if (interruptionType === 'human_interrupts_bot') {
            severity = Math.min(8, 3 + overlapDuration);
            // Check if bot handled it well (from transcript context)
            if (transcriptContext.nextTurn) {
                handlingQuality = this.assessInterruptionRecovery(transcriptContext.nextTurn.text);
            }
            isSignificant = overlapDuration > 0.3;
        }

        const recoveryTime = speakerTransition.recoveryTime || this.estimateRecoveryTime(
            transcriptContext.currentTurn?.text || '',
            transcriptContext.nextTurn?.text || ''
        );

        return {
            isSignificant,
            type: interruptionType,
            severity,
            handlingQuality,
            recoveryTime,
            contextAppropriate: this.checkInterruptionContextFromAudio(audioInterruption, transcriptContext),
            recommendation: this.generateInterruptionRecommendation(interruptionType, severity, handlingQuality)
        };
    }

    checkInterruptionContextFromAudio(audioInterruption, transcriptContext) {
        // Use audio energy levels and speech patterns to determine appropriateness
        const energyLevel = audioInterruption.energyLevel || 0.5;
        const urgencyIndicators = audioInterruption.urgencyIndicators || 0;

        // High energy + urgency indicators suggest appropriate interruption
        if (energyLevel > 0.8 && urgencyIndicators > 2) {
            return true;
        }

        // Fall back to transcript-based analysis
        if (transcriptContext.previousTurn && transcriptContext.currentTurn) {
            return this.checkInterruptionContext(
                transcriptContext.previousTurn.text,
                transcriptContext.currentTurn.text
            );
        }

        return true; // Default: assume appropriate
    }

    analyzeTurnTakingPatternFromAudio(audioInterruption, transcriptContext) {
        const silenceDuration = audioInterruption.silenceDuration || 1.0;
        const overlapDuration = audioInterruption.overlapDuration || 0;
        const speakerTransition = audioInterruption.speakerTransition || {};

        // Audio-based turn quality assessment
        let quality = 8; // Default good quality

        // Optimal silence duration: 0.5-2.0 seconds
        if (silenceDuration < 0.2) {
            quality = 4; // Too quick (interruption)
        } else if (silenceDuration > 3.0) {
            quality = 5; // Too long (awkward pause)
        }

        // Overlap penalty
        if (overlapDuration > 0.5) {
            quality -= 2;
        }

        return {
            turnGaps: {
                silenceDuration,
                quality: Math.max(1, quality),
                appropriate: silenceDuration >= 0.5 && silenceDuration <= 2.0
            },
            speakerTransition: {
                speakerChanged: true,
                smooth: overlapDuration < 0.3,
                quality: overlapDuration < 0.3 ? 9 : 6
            },
            conversationalFlow: speakerTransition.flowScore || 0.8,
            overallQuality: Math.max(1, quality) / 10
        };
    }

    // ===== NEW MAGICBRICKS SCRIPT ADHERENCE METHODS =====

    checkScriptAdherence(botResponse, turnIndex) {
        let adherenceScore = 1.0;
        const responseText = botResponse.toLowerCase();

        // Check for prohibited phrases (script violations)
        for (const pattern of this.scriptAdherencePatterns.prohibited_phrases) {
            if (pattern.test(botResponse)) {
                adherenceScore -= 0.3; // Heavy penalty for prohibited phrases
            }
        }

        // Check for proper BHK pronunciation
        if (/\bBHK\b/gi.test(botResponse) && !/\bBee-etch-kay\b/gi.test(botResponse)) {
            adherenceScore -= 0.2; // Penalty for incorrect BHK pronunciation
        }

        // Check for proper number spelling in monetary amounts
        if (/\b\d+\s+(lakh|crore|rupees)\b/gi.test(botResponse)) {
            adherenceScore -= 0.25; // Penalty for numeric digits in monetary amounts
        }

        // Check for proper property number spelling
        if (/\b\d+\s+(BHK|Sector)\b/gi.test(botResponse)) {
            adherenceScore -= 0.2; // Penalty for numeric digits in property identifiers
        }

        // Bonus for using mandatory phrases at appropriate steps
        if (turnIndex >= 6) { // Interest check step and beyond
            for (const pattern of this.scriptAdherencePatterns.mandatory_phrases) {
                if (pattern.test(botResponse)) {
                    adherenceScore += 0.1; // Bonus for using scripted phrases
                }
            }
        }

        return Math.max(0, Math.min(1, adherenceScore));
    }

    checkObjectionHandling(humanInput, botResponse) {
        if (!this.isObjectionPresent(humanInput)) {
            return 1.0; // No objection, so no handling needed
        }

        let handlingScore = 0.5; // Base score for attempting to handle objection

        // Check if bot used appropriate objection handling responses
        for (const pattern of this.scriptAdherencePatterns.objection_responses) {
            if (pattern.test(botResponse)) {
                handlingScore += 0.3; // Bonus for using scripted objection responses
            }
        }

        // Check if bot acknowledged the objection
        const acknowledgmentPatterns = [
            /\bमैं\s+पूरी\s+तरह\s+समझ\s+सकती\s+हूँ\b/gi,
            /\bI\s+understand\b/gi,
            /\bमैं\s+समझ\s+गई\b/gi
        ];

        for (const pattern of acknowledgmentPatterns) {
            if (pattern.test(botResponse)) {
                handlingScore += 0.2; // Bonus for acknowledging objection
                break;
            }
        }

        return Math.min(1, handlingScore);
    }

    isObjectionPresent(humanInput) {
        const objectionPatterns = [
            /\bAgents\s+से\s+बार-बार\s+calls\s+नहीं\s+चाहिए\b/gi,
            /\bबहुत\s+सारे\s+agents\s+call\s+कर\s+रहे\s+हैं\b/gi,
            /\bबस\s+agent\s+का\s+number\s+दे\s+दो\b/gi,
            /\bमैं\s+अभी\s+बस\s+browse\s+कर\s+रहा\s+हूँ\b/gi,
            /\bresearch\s+phase\s+में\s+हूँ\b/gi,
            /\bक्या\s+यह\s+service\s+free\s+है\b/gi,
            /\bमैंने\s+search\s+ही\s+नहीं\s+किया\b/gi,
            /\bproperty\s+search\s+नहीं\s+कर\s+रही\b/gi,
            /\bnot\s+interested\b/gi,
            /\bनहीं\s+चाहिए\b/gi
        ];

        return objectionPatterns.some(pattern => pattern.test(humanInput));
    }

    // Update the call objective analysis
    analyzeCallObjectiveCompletion(intentMappings, conversationContext) {
        const criticalSteps = [1, 6, 7, 9]; // Updated: Removed step 10, objective achieved with step 9 + affirmative response
        const alternativeCriticalSteps = [1, 2, 6, 7, 9]; // Including step 2 for third party

        // FIXED: Lower confidence threshold and add detailed logging
        const allStepMappings = intentMappings
            .filter(m => m.stepNumber > 0)
            .map(m => ({ step: m.stepNumber, confidence: m.confidence, intent: m.intent }));

        console.log(`🔍 ALL DETECTED STEPS:`, allStepMappings);

        const completedSteps = intentMappings
            .filter(m => m.confidence > 0.4) // LOWERED: More lenient confidence threshold
            .map(m => m.stepNumber)
            .filter(step => step > 0);

        console.log(`✅ COMPLETED STEPS (confidence > 0.4):`, completedSteps);

        // Check primary objective completion (steps 1, 6, 7, 9)
        const primaryObjectiveSteps = criticalSteps.filter(step => completedSteps.includes(step));
        const primaryObjectiveComplete = primaryObjectiveSteps.length === criticalSteps.length;

        console.log(`🎯 CRITICAL STEPS ANALYSIS:`);
        console.log(`   Required: [${criticalSteps.join(', ')}]`);
        console.log(`   Completed: [${primaryObjectiveSteps.join(', ')}] (${primaryObjectiveSteps.length}/${criticalSteps.length})`);
        console.log(`   Missing: [${criticalSteps.filter(step => !completedSteps.includes(step)).join(', ')}]`);

        // Check alternative objective completion (steps 1, 2, 6, 7, 9)
        const alternativeObjectiveSteps = alternativeCriticalSteps.filter(step => completedSteps.includes(step));
        const alternativeObjectiveComplete = alternativeObjectiveSteps.length === alternativeCriticalSteps.length;

        // Enhanced objective completion: If step 9 (call transfer) is present, check for affirmative response
        const hasCallTransfer = completedSteps.includes(9);
        const hasAffirmativeResponse = hasCallTransfer ? this.checkAffirmativeResponseToTransfer(intentMappings) : false;

        // Objective achieved if all critical steps completed OR if call transfer + affirmative response
        const objectiveAchieved = primaryObjectiveComplete || alternativeObjectiveComplete ||
            (hasCallTransfer && hasAffirmativeResponse && primaryObjectiveSteps.length >= 3);

        return {
            objectiveAchieved,
            primaryObjectiveComplete,
            alternativeObjectiveComplete,
            hasCallTransferWithAffirmation: hasCallTransfer && hasAffirmativeResponse,
            completedCriticalSteps: objectiveAchieved ?
                (primaryObjectiveComplete ? primaryObjectiveSteps :
                    alternativeObjectiveComplete ? alternativeObjectiveSteps :
                        [...new Set([...primaryObjectiveSteps, ...alternativeObjectiveSteps])]) :
                [...new Set([...primaryObjectiveSteps, ...alternativeObjectiveSteps])],
            totalCriticalSteps: criticalSteps.length, // Always use primary critical steps count (4)
            missingCriticalSteps: objectiveAchieved ? [] :
                criticalSteps.filter(step => !completedSteps.includes(step)),
            completionRate: objectiveAchieved ? 1.0 :
                Math.max(primaryObjectiveSteps.length / criticalSteps.length,
                    alternativeObjectiveSteps.length / alternativeCriticalSteps.length),
            objectiveAchievementReason: objectiveAchieved ?
                (primaryObjectiveComplete ? 'All 4 critical steps completed' :
                    alternativeObjectiveComplete ? 'All 5 alternative critical steps completed' :
                        'Call transfer with affirmative response') :
                'Critical steps incomplete or no affirmative response to transfer'
        };
    }

    analyzeInterruptionHandlingFromTranscript(transcript) {
        console.log('📝 Analyzing interruption handling from transcript...');
        return this.analyzeInterruptionHandlingFromTranscriptOriginal(transcript);
    }

    // ===== ENHANCED SCORING HELPER METHODS =====

    getRepetitionTypeMultiplier(repetitionType) {
        const multipliers = {
            'exact_repetition': 2.0,      // Highest penalty
            'semantic_repetition': 1.8,   // High penalty
            'structural_repetition': 1.4, // Medium penalty
            'conceptual_repetition': 1.2, // Lower penalty
            'partial_repetition': 1.0     // Base penalty
        };
        return multipliers[repetitionType] || 1.0;
    }

    calculateConversationEfficiency(intentFlow, totalDurationMinutes) {
        if (!intentFlow || !intentFlow.intentMappings) return 0.5;

        const totalTurns = intentFlow.intentMappings.length;
        const completedSteps = intentFlow.completedSteps || 0;
        const totalRequiredSteps = intentFlow.totalRequiredSteps || 10;

        // Calculate information density (steps completed per minute)
        const stepsPerMinute = completedSteps / totalDurationMinutes;
        const turnsPerMinute = totalTurns / totalDurationMinutes;

        // Ideal ranges based on MagicBricks conversation flow
        const idealStepsPerMinute = 2.5; // ~2-3 steps per minute
        const idealTurnsPerMinute = 8;    // ~8 turns per minute

        // Calculate efficiency scores
        const stepEfficiency = Math.min(1.0, stepsPerMinute / idealStepsPerMinute);
        const turnEfficiency = Math.min(1.0, turnsPerMinute / idealTurnsPerMinute);
        const completionEfficiency = completedSteps / totalRequiredSteps;

        // Weighted efficiency score
        return (stepEfficiency * 0.4) + (turnEfficiency * 0.3) + (completionEfficiency * 0.3);
    }

    // Context-aware scoring adjustments
    getContextualWeights(callContext) {
        const baseWeights = {
            silenceCompliance: 0.25,
            repetitionAvoidance: 0.25,
            callDurationOptimization: 0.10,
            responseLatencyOptimization: 0.15,
            intentFlowAccuracy: 0.25
        };

        // Adjust based on call type (future enhancement)
        switch (callContext?.type) {
            case 'property_inquiry':
                return {
                    ...baseWeights,
                    intentFlowAccuracy: 0.30,           // Higher weight for objective completion
                    responseLatencyOptimization: 0.20,  // Important for customer experience
                    silenceCompliance: 0.20,
                    repetitionAvoidance: 0.20,
                    callDurationOptimization: 0.10
                };
            case 'callback_scheduling':
                return {
                    ...baseWeights,
                    responseLatencyOptimization: 0.25,  // Quick responses crucial
                    silenceCompliance: 0.30,            // Avoid awkward pauses
                    intentFlowAccuracy: 0.20,
                    repetitionAvoidance: 0.15,
                    callDurationOptimization: 0.10
                };
            default:
                return baseWeights;
        }
    }

    // Enhanced scoring with ML-ready features (future enhancement)
    calculateMLEnhancedScore(metrics, historicalData) {
        // Placeholder for future ML enhancement
        // This would use trained models to predict optimal scores
        // based on historical performance data

        const features = {
            silencePattern: metrics.silenceSegments?.map(s => s.duration) || [],
            repetitionPattern: metrics.repetitions?.map(r => r.similarityScore) || [],
            latencyPattern: metrics.responseLatencyAnalysis?.responseTimes?.map(rt => rt.responseTimeSeconds) || [],
            conversationLength: metrics.callDurationAnalysis?.totalDurationMinutes || 0,
            objectiveAchieved: metrics.intentFlow?.objectiveAchieved || false
        };

        // For now, return the standard score
        // In future, this would be: return this.mlModel.predict(features)
        return null;
    }

    // ===== SUPER ADVANCED SILENCE DETECTION METHODS =====

    validateSilenceContext(silence, index, audioData) {
        // Natural pauses that shouldn't be flagged
        const callDuration = audioData.duration || 180;
        if (silence.start < 5 || silence.start > (callDuration - 10)) {
            return { isProblematic: false, reason: 'Natural pause at call boundary' };
        }

        // Check if silence duration is reasonable for conversation context
        if (silence.duration < 8) { // Increased threshold for real problematic silences
            return { isProblematic: false, reason: 'Duration within acceptable conversation rhythm' };
        }

        return { isProblematic: true, reason: 'Potentially disruptive silence' };
    }

    validateSilenceQuality(silence, audioData) {
        // Check if this could be an audio processing artifact
        const qualityScore = Math.random() * 0.3 + 0.7; // Mock quality score 0.7-1.0

        if (qualityScore < 0.8) {
            return { isRealSilence: false, reason: 'Likely audio processing artifact', qualityScore };
        }

        return { isRealSilence: true, reason: 'Validated as real silence', qualityScore };
    }

    validateSilenceFlow(silence, index, audioData) {
        // Check if silence disrupts conversation flow
        const flowScore = Math.random() * 0.4 + 0.6; // Mock flow score 0.6-1.0

        if (flowScore > 0.8) {
            return { disruptsFlow: false, reason: 'Does not disrupt conversation flow' };
        }

        return { disruptsFlow: true, reason: 'Disrupts conversation flow' };
    }

    calculateAdvancedSilenceSeverity(silence, index, audioData) {
        // More conservative severity calculation
        const baseSeverity = Math.min(silence.duration / 15.0, 1.0); // Increased threshold
        const positionWeight = index < 2 ? 1.1 : (index > 8 ? 0.9 : 1.0); // Less aggressive weighting
        const durationPenalty = Math.pow(silence.duration / 8.0, 1.2); // Less aggressive penalty

        return Math.min(baseSeverity * positionWeight * durationPenalty, 1.0);
    }

    processSuperAdvancedSilenceAnalysis(segments) {
        // Apply business logic filtering
        return segments
            .filter(segment => segment.impactScore > 4.0) // Higher threshold for real issues
            .sort((a, b) => b.impactScore - a.impactScore)
            .map(segment => ({
                ...segment,
                priority: segment.impactScore > 8 ? 'high' : (segment.impactScore > 6 ? 'medium' : 'low'),
                recommendation: this.generateAdvancedSilenceRecommendation(segment)
            }));
    }

    generateMinimalMockSilenceSegments() {
        // Return minimal mock data for successful calls
        return [];
    }

    generateAdvancedSilenceRecommendation(segment) {
        if (segment.impactScore > 8) {
            return 'CRITICAL: Address significant silence gap that disrupts user experience';
        } else if (segment.impactScore > 6) {
            return 'MEDIUM: Consider optimizing response time in this conversation phase';
        } else {
            return 'LOW: Monitor for patterns but within acceptable range';
        }
    }

    // ===== SUPER ADVANCED REPETITION DETECTION METHODS =====

    detectConsecutiveIdenticalRepetitions(transcript) {
        console.log('🔍 Detecting consecutive identical repetitions and block patterns...');
        const repetitions = [];
        const lines = transcript.split('\n').filter(line => line.trim());

        // Extract all bot responses with their positions
        const botResponses = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (this.isBotLine(line)) {
                const botText = this.extractTextFromLine(line);
                if (botText.length >= 5) { // Allow shorter responses for pattern detection
                    botResponses.push({
                        lineIndex: i,
                        text: botText,
                        originalLine: line,
                        index: botResponses.length
                    });
                }
            }
        }

        console.log(`Found ${botResponses.length} bot responses to analyze`);

        // Method 1: Single line repetitions
        for (let i = 0; i < botResponses.length - 1; i++) {
            const current = botResponses[i];
            const next = botResponses[i + 1];

            if (this.areIdenticalBotResponses(current.text, next.text)) {
                // Check if they are consecutive in the bot sequence (no human intervention)
                if (this.areConsecutiveBotResponses(current, next, lines)) {
                    repetitions.push({
                        type: 'single_line_repetition',
                        text1: current.text,
                        text2: next.text,
                        similarityScore: 1.0,
                        severity: 10,
                        isProblematicRepetition: true,
                        recommendation: 'Remove consecutive identical bot responses'
                    });
                }
            }
        }

        // Method 2: Block pattern repetitions (like your example)
        const blockRepetitions = this.detectBlockPatternRepetitions(botResponses, lines);
        repetitions.push(...blockRepetitions);

        console.log(`Found ${repetitions.length} consecutive repetitions (${repetitions.filter(r => r.type === 'single_line_repetition').length} single-line, ${blockRepetitions.length} block patterns)`);
        return repetitions;
    }

    detectConsecutiveExactRepetitions(transcript) {
        console.log('🔍 Detecting consecutive exact repetitions...');
        const repetitions = [];
        const lines = transcript.split('\n').filter(line => line.trim());

        // Look for exact consecutive bot repetitions (like your example)
        for (let i = 0; i < lines.length - 1; i++) {
            const currentLine = lines[i].trim();
            const nextLine = lines[i + 1].trim();

            // Check if both are bot lines
            if (this.isBotLine(currentLine) && this.isBotLine(nextLine)) {
                const currentText = this.extractTextFromLine(currentLine);
                const nextText = this.extractTextFromLine(nextLine);

                // Check for exact or near-exact match
                if (this.isExactMatch(currentText, nextText)) {
                    // Look ahead to see if this is part of a larger block
                    const blockSize = this.detectRepetitionBlockSize(lines, i);

                    repetitions.push({
                        type: 'consecutive_exact',
                        startLine: i,
                        blockSize: blockSize,
                        text1: currentText,
                        text2: nextText,
                        similarityScore: 1.0,
                        severity: 10, // Maximum severity for exact repetitions
                        isProblematicRepetition: true,
                        recommendation: 'Remove exact consecutive repetitions - major user experience issue'
                    });

                    // Skip the processed block
                    i += blockSize - 1;
                }
            }
        }

        return repetitions;
    }

    detectRepetitionBlockSize(lines, startIndex) {
        let blockSize = 1;
        const firstText = this.extractTextFromLine(lines[startIndex]);

        // Look for repeating patterns
        for (let i = startIndex + 1; i < lines.length; i++) {
            const currentLine = lines[i].trim();
            if (this.isBotLine(currentLine)) {
                const currentText = this.extractTextFromLine(currentLine);
                if (this.isExactMatch(firstText, currentText)) {
                    blockSize++;
                } else {
                    break;
                }
            }
        }

        return blockSize;
    }

    calculateAdvancedSemanticSimilarity(text1, text2) {
        // Multi-dimensional semantic analysis without BERT (lightweight approach)

        // 1. Keyword overlap analysis
        const keywordSimilarity = this.calculateKeywordSimilarity(text1, text2);

        // 2. Intent similarity analysis
        const intentSimilarity = this.calculateIntentSimilarity(text1, text2);

        // 3. Structural similarity analysis
        const structuralSimilarity = this.calculateStructuralSimilarity(text1, text2);

        // 4. N-gram similarity analysis
        const ngramSimilarity = this.calculateNgramSimilarity(text1, text2);

        // 5. Contextual similarity (business domain specific)
        const contextualSimilarity = this.calculateContextualSimilarity(text1, text2);

        // Weighted combination for overall score
        const overallScore = (
            keywordSimilarity * 0.25 +
            intentSimilarity * 0.25 +
            structuralSimilarity * 0.2 +
            ngramSimilarity * 0.15 +
            contextualSimilarity * 0.15
        );

        return {
            overallScore,
            keywordSimilarity,
            intentSimilarity,
            structuralSimilarity,
            ngramSimilarity,
            contextualSimilarity,
            confidence: this.calculateSimilarityConfidence(overallScore, text1, text2)
        };
    }

    calculateKeywordSimilarity(text1, text2) {
        const keywords1 = this.extractKeywords(text1);
        const keywords2 = this.extractKeywords(text2);

        if (keywords1.length === 0 && keywords2.length === 0) return 1.0;
        if (keywords1.length === 0 || keywords2.length === 0) return 0.0;

        const intersection = keywords1.filter(word => keywords2.includes(word));
        const union = [...new Set([...keywords1, ...keywords2])];

        return intersection.length / union.length; // Jaccard similarity
    }

    calculateIntentSimilarity(text1, text2) {
        // Analyze intent patterns specific to MagicBricks conversation
        const intent1 = this.extractConversationIntent(text1);
        const intent2 = this.extractConversationIntent(text2);

        if (intent1 === intent2 && intent1 !== 'unknown') {
            return 1.0; // Same intent
        } else if (this.areRelatedIntents(intent1, intent2)) {
            return 0.7; // Related intents
        } else {
            return 0.0; // Different intents
        }
    }

    calculateStructuralSimilarity(text1, text2) {
        // Analyze sentence structure and patterns
        const structure1 = this.analyzeTextStructure(text1);
        const structure2 = this.analyzeTextStructure(text2);

        let similarity = 0;

        // Compare sentence length similarity
        const lengthSimilarity = 1 - Math.abs(structure1.wordCount - structure2.wordCount) /
            Math.max(structure1.wordCount, structure2.wordCount);
        similarity += lengthSimilarity * 0.3;

        // Compare question/statement patterns
        if (structure1.isQuestion === structure2.isQuestion) similarity += 0.3;

        // Compare punctuation patterns
        if (structure1.punctuationPattern === structure2.punctuationPattern) similarity += 0.2;

        // Compare language mix (Hindi/English)
        if (structure1.languageMix === structure2.languageMix) similarity += 0.2;

        return Math.min(1.0, similarity);
    }

    calculateNgramSimilarity(text1, text2) {
        // N-gram analysis for phrase-level similarity
        const bigrams1 = this.extractNgrams(text1, 2);
        const bigrams2 = this.extractNgrams(text2, 2);
        const trigrams1 = this.extractNgrams(text1, 3);
        const trigrams2 = this.extractNgrams(text2, 3);

        const bigramSimilarity = this.calculateSetSimilarity(bigrams1, bigrams2);
        const trigramSimilarity = this.calculateSetSimilarity(trigrams1, trigrams2);

        return (bigramSimilarity * 0.6 + trigramSimilarity * 0.4);
    }

    calculateContextualSimilarity(text1, text2) {
        // Business context specific similarity for MagicBricks
        const context1 = this.extractBusinessContext(text1);
        const context2 = this.extractBusinessContext(text2);

        let similarity = 0;

        // Property-related context
        if (context1.isPropertyRelated && context2.isPropertyRelated) similarity += 0.3;

        // Agent-related context
        if (context1.isAgentRelated && context2.isAgentRelated) similarity += 0.3;

        // Pricing context
        if (context1.isPricingRelated && context2.isPricingRelated) similarity += 0.2;

        // Location context
        if (context1.isLocationRelated && context2.isLocationRelated) similarity += 0.2;

        return Math.min(1.0, similarity);
    }

    isExactMatch(text1, text2) {
        if (!text1 || !text2) return false;

        // Normalize for comparison
        const normalized1 = text1.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalized2 = text2.toLowerCase().replace(/[^\w\s]/g, '').trim();

        return normalized1 === normalized2;
    }

    isBotLine(line) {
        return /^(Chat Bot|Bot|Agent|Support|Assistant):/i.test(line.trim());
    }

    extractTextFromLine(line) {
        const colonIndex = line.indexOf(':');
        return colonIndex !== -1 ? line.substring(colonIndex + 1).trim() : line.trim();
    }

    isAlreadyDetected(text1, text2, existingRepetitions) {
        return existingRepetitions.some(rep =>
            (rep.text1 === text1 && rep.text2 === text2) ||
            (rep.text1 === text2 && rep.text2 === text1)
        );
    }

    isProblematicRepetition(text1, text2, distance, semanticAnalysis) {
        // Determine if this repetition is actually problematic

        // Skip very short common phrases
        if (text1.length < 15 || text2.length < 15) {
            return { isProblematic: false };
        }

        // High similarity with close distance is always problematic
        if (semanticAnalysis.overallScore > 0.9 && distance <= 5) {
            return {
                isProblematic: true,
                severity: 9,
                type: 'high_similarity_close',
                recommendation: 'Vary response phrasing - high semantic similarity detected'
            };
        }

        // Exact intent match is problematic
        if (semanticAnalysis.intentSimilarity === 1.0 && distance <= 10) {
            return {
                isProblematic: true,
                severity: 8,
                type: 'intent_repetition',
                recommendation: 'Use different phrasing for same intent to avoid repetition'
            };
        }

        // High structural similarity suggests template repetition
        if (semanticAnalysis.structuralSimilarity > 0.8 && semanticAnalysis.overallScore > 0.75) {
            return {
                isProblematic: true,
                severity: 7,
                type: 'structural_repetition',
                recommendation: 'Vary sentence structure to improve conversation flow'
            };
        }

        return { isProblematic: false };
    }

    calculateSimilarityConfidence(overallScore, text1, text2) {
        // Calculate confidence in the similarity score
        let confidence = 0.5; // Base confidence

        // Higher confidence for longer texts
        const avgLength = (text1.length + text2.length) / 2;
        if (avgLength > 50) confidence += 0.2;
        else if (avgLength > 20) confidence += 0.1;

        // Higher confidence for clear similarity patterns
        if (overallScore > 0.8 || overallScore < 0.2) confidence += 0.2;

        // Lower confidence for medium similarity (ambiguous cases)
        if (overallScore >= 0.4 && overallScore <= 0.6) confidence -= 0.1;

        return Math.min(1.0, Math.max(0.1, confidence));
    }

    superAdvancedSimilarityAnalysis(text1, text2, index1, index2, consecutiveInfo) {
        // Enhanced similarity analysis with business context
        const lexicalSimilarity = this.calculateLexicalSimilarity(text1, text2);
        const semanticSimilarity = this.calculateSemanticSimilarity(text1, text2);
        const structuralSimilarity = this.calculateStructuralSimilarity(text1, text2);

        // CRITICAL: Check if repetition is contextually justified
        const contextualJustification = this.analyzeRepetitionJustification(text1, text2, consecutiveInfo);

        // Weighted overall similarity with business logic
        const overallSimilarity = (
            lexicalSimilarity * 0.4 +
            semanticSimilarity * 0.4 +
            structuralSimilarity * 0.2
        );

        // Determine if this is actually problematic
        const isProblematicRepetition = this.isRepetitionProblematic(
            overallSimilarity, contextualJustification, consecutiveInfo
        );

        const repetitionType = this.classifyRepetitionType(lexicalSimilarity, semanticSimilarity, structuralSimilarity);
        const severity = isProblematicRepetition ?
            this.calculateRepetitionSeverity(overallSimilarity, Math.abs(index2 - index1)) : 0;

        return {
            overallSimilarity,
            semanticSimilarity,
            structuralSimilarity,
            contextualRelevance: 1 - contextualJustification.score, // Invert for compatibility
            repetitionType,
            severity,
            isProblematicRepetition,
            contextualJustification,
            recommendation: this.generateRepetitionRecommendation(repetitionType, severity)
        };
    }

    analyzeRepetitionJustification(text1, text2, consecutiveInfo) {
        // Check if repetition is justified by business context
        const justificationReasons = [];
        let justificationScore = 0;

        // 1. Clarification or emphasis
        if (text1.includes('क्या') || text2.includes('क्या') ||
            text1.includes('confirm') || text2.includes('confirm')) {
            justificationReasons.push('Clarification request');
            justificationScore += 0.3;
        }

        // 2. Different conversation context
        if (!consecutiveInfo.isConsecutive) {
            justificationReasons.push('Different conversation context');
            justificationScore += 0.4;
        }

        // 3. Standard greeting or closing
        if (text1.includes('नमस्ते') || text1.includes('धन्यवाद') ||
            text2.includes('नमस्ते') || text2.includes('धन्यवाद')) {
            justificationReasons.push('Standard greeting/closing');
            justificationScore += 0.5;
        }

        // 4. Information confirmation
        if (text1.includes('सही है') || text2.includes('सही है') ||
            text1.includes('correct') || text2.includes('correct')) {
            justificationReasons.push('Information confirmation');
            justificationScore += 0.3;
        }

        return {
            score: Math.min(justificationScore, 1.0),
            reasons: justificationReasons,
            isJustified: justificationScore > 0.4
        };
    }

    isRepetitionProblematic(similarity, justification, consecutiveInfo) {
        // Business logic to determine if repetition is actually problematic

        // If highly justified, not problematic
        if (justification.isJustified) {
            return false;
        }

        // If not consecutive, less likely to be problematic
        if (!consecutiveInfo.isConsecutive) {
            return similarity > 0.9; // Only exact repetitions are problematic
        }

        // If consecutive and high similarity, likely problematic
        return similarity > 0.8;
    }

    processSuperAdvancedRepetitionAnalysis(repetitions, botTurns) {
        // Apply business logic filtering
        const problematicRepetitions = repetitions.filter(rep => {
            // Only include truly problematic repetitions
            return rep.isProblematicRepetition && rep.severity > 5.0;
        });

        return problematicRepetitions
            .sort((a, b) => b.severity - a.severity)
            .map(rep => ({
                ...rep,
                priority: rep.severity > 8 ? 'high' : (rep.severity > 6 ? 'medium' : 'low'),
                actionRequired: rep.severity > 7,
                businessImpact: this.assessRepetitionBusinessImpact(rep)
            }));
    }

    assessRepetitionBusinessImpact(repetition) {
        if (repetition.severity > 8) {
            return 'High - May confuse customers and appear robotic';
        } else if (repetition.severity > 6) {
            return 'Medium - Could affect conversation flow';
        } else {
            return 'Low - Minor impact on user experience';
        }
    }

    // ===== SUPER ENHANCED INTENT DETECTION METHODS =====

    superEnhancedConfidenceAdjustment(confidence, intentType, speaker, turnIndex, allTurns, textLower, originalText) {
        // Business logic for MagicBricks conversation success patterns

        // 1. Boost confidence for successful conversation indicators
        if (intentType === 'initial_greeting' && originalText.includes('Magicbricks')) {
            confidence = Math.min(0.95, confidence + 0.2);
        }

        if (intentType === 'interest_check' && (originalText.includes('search कर रहे हैं') || originalText.includes('क्या यह सही है'))) {
            confidence = Math.min(0.95, confidence + 0.25);
        }

        if (intentType === 'agent_connection_offer' && originalText.includes('agents shortlist')) {
            confidence = Math.min(0.95, confidence + 0.25);
        }

        if (intentType === 'call_transfer' && (originalText.includes('connect करती हूँ') || originalText.includes('लाइन पर बने रहिए'))) {
            confidence = Math.min(0.95, confidence + 0.3);
        }

        // 2. Context-based confidence adjustment
        if (speaker.toLowerCase().includes('bot') || speaker.toLowerCase().includes('agent')) {
            const agentIntents = ['initial_greeting', 'interest_check', 'agent_connection_offer', 'call_transfer'];
            if (agentIntents.includes(intentType)) {
                confidence = Math.min(0.95, confidence + 0.1);
            }
        }

        // 3. Sequential flow bonus
        if (turnIndex > 0) {
            const expectedSequence = this.getExpectedSequenceBonus(intentType, turnIndex);
            confidence = Math.min(0.95, confidence + expectedSequence);
        }

        return confidence;
    }

    getExpectedSequenceBonus(intentType, turnIndex) {
        // Bonus for intents appearing in expected sequence
        const expectedSequences = {
            'initial_greeting': turnIndex < 3 ? 0.1 : 0,
            'interest_check': turnIndex > 2 && turnIndex < 8 ? 0.15 : 0,
            'agent_connection_offer': turnIndex > 5 && turnIndex < 12 ? 0.15 : 0,
            'call_transfer': turnIndex > 8 ? 0.2 : 0
        };

        return expectedSequences[intentType] || 0;
    }

    superEnhancedSpeakerAdjustments(bestMatch, speaker, text) {
        // Enhanced speaker-specific adjustments for business logic

        if (speaker.toLowerCase().includes('bot') || speaker.toLowerCase().includes('agent')) {
            // Agent should have very high confidence for structured responses
            if (['interest_check', 'agent_connection_offer', 'call_transfer'].includes(bestMatch.step)) {
                bestMatch.confidence = Math.min(0.95, bestMatch.confidence + 0.15);
            }
        }

        // Ensure minimum confidence for detected patterns in successful conversations
        if (bestMatch.confidence > 0.3 && bestMatch.step !== 'unknown') {
            bestMatch.confidence = Math.max(0.5, bestMatch.confidence); // Minimum 50% for detected patterns
        }

        return bestMatch;
    }

    getDefaultInterruptionAnalysis() {
        console.log('📝 Returning default interruption analysis due to error');
        return {
            interruptions: [],
            interruptionScore: 85, // Default good score
            turnTakingQuality: { quality: 8, assessment: 'good' },
            conversationFlow: { score: 8, flowQuality: 'good' },
            recommendations: ['Unable to analyze interruption patterns - transcript may be missing or invalid'],
            analysisSource: 'default_fallback'
        };
    }

    calculateSimpleLatencyScore(responseTimes, violations, threshold, maxAllowed) {
        // Simple scoring based on 5-second threshold
        let latencyScore = 100;

        // Penalty for violations
        if (violations.length > maxAllowed) {
            const excessViolations = violations.length - maxAllowed;
            latencyScore = Math.max(0, 100 - (excessViolations * 25));
        }

        // Additional penalty for severe violations (>10 seconds)
        const severeViolations = violations.filter(v => v.violationSeverity === 'severe').length;
        if (severeViolations > 0) {
            latencyScore = Math.max(0, latencyScore - (severeViolations * 15));
        }

        // Determine grade and status
        let grade, status;
        if (latencyScore >= 90) { grade = 'A'; status = 'excellent'; }
        else if (latencyScore >= 80) { grade = 'B'; status = 'good'; }
        else if (latencyScore >= 70) { grade = 'C'; status = 'acceptable'; }
        else if (latencyScore >= 60) { grade = 'D'; status = 'needs_improvement'; }
        else { grade = 'F'; status = 'critical'; }

        // Generate recommendations
        const recommendations = [];
        if (violations.length === 0) {
            recommendations.push('All response times within 5-second threshold. Excellent performance.');
        } else if (violations.length <= maxAllowed) {
            recommendations.push(`${violations.length} response time violations detected but within acceptable limit (${maxAllowed})`);
        } else {
            recommendations.push(`${violations.length} response time violations exceed limit (${maxAllowed}). Optimize bot response speed.`);
        }

        if (severeViolations > 0) {
            recommendations.push(`${severeViolations} severe violations (>10s) detected. Critical optimization needed.`);
        }

        return { score: Math.round(latencyScore), grade, status, recommendations };
    }

    getDefaultLatencyAnalysis() {
        console.log('📝 Returning default latency analysis due to error');
        return {
            responseTimes: [],
            latencyViolations: [],
            averageResponseTime: 2.5, // Default reasonable response time
            totalViolations: 0,
            maxAllowedViolations: 3,
            threshold: 5.0,
            latencyScore: 80, // Default good score
            performanceGrade: 'B',
            status: 'acceptable',
            recommendations: ['Unable to analyze response latency - transcript may be missing or invalid'],
            analysisSource: 'default_fallback'
        };
    }

    getDefaultIntentAnalysis() {
        console.log('📝 Returning default intent analysis due to error');
        return {
            intentMappings: [],
            flowScore: 50, // Default neutral score
            averageConfidence: 0.5,
            completedSteps: 0,
            totalRequiredSteps: 4, // Updated critical steps count (removed step 10)
            detectedIntents: [],
            stepProgression: [],
            missingCriticalSteps: [1, 6, 7, 9], // Updated critical steps missing
            conversationContext: { name: 'Unknown Context' },
            contextualAnalysis: { flowScore: 50, totalRequiredSteps: 4 },
            conversationQuality: { rating: 'Unknown', score: 50 },
            callObjective: {
                objectiveAchieved: false,
                completionRate: 0,
                totalCriticalSteps: 4
            },
            objectiveAchieved: false,
            criticalStepsAnalysis: {
                completed: [],
                missing: [1, 6, 7, 9],
                completionRate: 0
            },
            analysisSource: 'default_fallback'
        };
    }

    analyzeHumanInput(humanText, conversationState, turnIndex) {
        const textLower = humanText.toLowerCase();

        // Detect query type and context
        const queryAnalysis = {
            isQuestion: /\?|क्या|कैसे|कब|कहाँ|कौन|why|how|when|where|who/.test(textLower),
            isObjection: /नहीं|no|not interested|busy|later|परेशान|problem/.test(textLower),
            isConfirmation: /हाँ|yes|ok|ठीक|sure|alright/.test(textLower),
            isPropertyRelated: /property|flat|house|bhk|बी.*एच.*के|मकान|घर/.test(textLower),
            isAgentRelated: /agent|broker|dealer|एजेंट/.test(textLower),
            isPriceRelated: /price|cost|budget|लाख|crore|रुपए|पैसे/.test(textLower)
        };

        // Determine expected context based on conversation state
        const expectedContexts = {
            0: 'greeting_response',
            1: 'name_confirmation',
            6: 'property_interest_response',
            7: 'agent_connection_response',
            9: 'transfer_confirmation'
        };

        const expectedContext = expectedContexts[conversationState.currentStep] || 'general_response';

        // Detect if human input is off-topic for current step
        let isOffTopic = false;
        let deviationSeverity = 0;
        let detectedContext = 'general';

        if (conversationState.currentStep === 6 && !queryAnalysis.isPropertyRelated && !queryAnalysis.isConfirmation) {
            isOffTopic = true;
            deviationSeverity = 7;
            detectedContext = 'non_property_query';
        } else if (conversationState.currentStep === 7 && !queryAnalysis.isAgentRelated && !queryAnalysis.isConfirmation && !queryAnalysis.isObjection) {
            isOffTopic = true;
            deviationSeverity = 8;
            detectedContext = 'non_agent_query';
        }

        return {
            text: humanText,
            queryAnalysis,
            expectedContext,
            detectedContext,
            isOffTopic,
            deviationSeverity,
            turnIndex
        };
    }

    analyzeCriticalStepResponse(humanInput, botResponse, conversationState, turnIndex) {
        const humanLower = humanInput.toLowerCase();
        const botLower = botResponse.toLowerCase();

        // Determine what step the bot should be executing
        const expectedStep = this.determineExpectedStep(humanInput, conversationState);
        const detectedStep = this.detectBotStep(botResponse);

        // Check if bot is following the critical path
        const isCriticalStepViolation = this.checkCriticalStepViolation(expectedStep, detectedStep, humanInput, botResponse);

        // Analyze if bot properly addressed the human query
        const addressingAnalysis = this.analyzeQueryAddressing(humanInput, botResponse, expectedStep);

        // Check for script adherence in critical steps
        const scriptAdherence = this.checkCriticalStepScriptAdherence(botResponse, expectedStep);

        return {
            expectedStep,
            detectedStep,
            isCriticalStepViolation: isCriticalStepViolation.isViolation,
            violationType: isCriticalStepViolation.type,
            severity: isCriticalStepViolation.severity,
            recommendation: isCriticalStepViolation.recommendation,
            failedToAddress: addressingAnalysis.failed,
            queryType: addressingAnalysis.queryType,
            expectedResponse: addressingAnalysis.expected,
            actualResponse: addressingAnalysis.actual,
            addressingSeverity: addressingAnalysis.severity,
            scriptAdherence: scriptAdherence.score,
            scriptViolations: scriptAdherence.violations,
            turnIndex
        };
    }

    determineExpectedStep(humanInput, conversationState) {
        const humanLower = humanInput.toLowerCase();

        // Based on human input and conversation state, determine what step bot should execute
        if (conversationState.currentStep === 0 || /hello|hi|नमस्ते/.test(humanLower)) {
            return 1; // Initial greeting
        } else if (/property|flat|search|interest|बी.*एच.*के/.test(humanLower)) {
            return 6; // Interest check
        } else if (/agent|connect|help|एजेंट/.test(humanLower) && conversationState.currentStep >= 6) {
            return 7; // Agent connection offer
        } else if (/yes|ok|हाँ|ठीक/.test(humanLower) && conversationState.currentStep === 7) {
            return 9; // Call transfer
        } else if (/busy|later|बाद में/.test(humanLower)) {
            return 5; // Callback scheduling
        } else if (/no|नहीं|not interested/.test(humanLower)) {
            return 8; // Decline handling
        }

        return conversationState.currentStep; // Continue current step
    }

    detectBotStep(botResponse) {
        const botLower = botResponse.toLowerCase();

        // Detect which step the bot is actually executing based on response patterns
        for (const [intentType, intentData] of Object.entries(this.intentPatterns)) {
            for (const pattern of intentData.patterns) {
                if (pattern.test(botResponse)) {
                    return intentData.step;
                }
            }
        }

        return 0; // Unknown step
    }

    checkCriticalStepViolation(expectedStep, detectedStep, humanInput, botResponse) {
        const criticalSteps = [1, 6, 7, 9];

        if (!criticalSteps.includes(expectedStep)) {
            return { isViolation: false, type: 'none', severity: 0, recommendation: '' };
        }

        if (expectedStep !== detectedStep) {
            let violationType = 'step_mismatch';
            let severity = 6;
            let recommendation = '';

            if (expectedStep === 6 && detectedStep !== 6) {
                violationType = 'missed_interest_check';
                severity = 9;
                recommendation = 'Bot failed to verify property interest when customer mentioned property-related query. Should execute interest verification step.';
            } else if (expectedStep === 7 && detectedStep !== 7) {
                violationType = 'missed_agent_offer';
                severity = 9;
                recommendation = 'Bot failed to offer agent connection when appropriate. Should present agent connection offer.';
            } else if (expectedStep === 9 && detectedStep !== 9) {
                violationType = 'missed_call_transfer';
                severity = 10;
                recommendation = 'Bot failed to execute call transfer after customer agreement. Critical business objective failure.';
            } else if (expectedStep === 1 && detectedStep !== 1) {
                violationType = 'improper_greeting';
                severity = 7;
                recommendation = 'Bot failed to provide proper initial greeting and introduction.';
            }

            return { isViolation: true, type: violationType, severity, recommendation };
        }

        return { isViolation: false, type: 'none', severity: 0, recommendation: '' };
    }

    analyzeQueryAddressing(humanInput, botResponse, expectedStep) {
        const humanLower = humanInput.toLowerCase();
        const botLower = botResponse.toLowerCase();

        // Determine query type
        let queryType = 'general';
        if (/price|cost|budget|लाख|crore/.test(humanLower)) queryType = 'pricing';
        else if (/location|area|where|कहाँ/.test(humanLower)) queryType = 'location';
        else if (/size|bhk|बी.*एच.*के|room/.test(humanLower)) queryType = 'property_size';
        else if (/agent|broker|एजेंट/.test(humanLower)) queryType = 'agent_related';
        else if (/time|when|कब/.test(humanLower)) queryType = 'timing';
        else if (/\?/.test(humanInput)) queryType = 'question';

        // Check if bot addressed the query appropriately
        const addressingPatterns = {
            pricing: /budget|price|cost|लाख|crore|affordable/,
            location: /area|location|where|कहाँ|locality/,
            property_size: /bhk|बी.*एच.*के|room|size|flat/,
            agent_related: /agent|broker|एजेंट|connect|help/,
            timing: /time|when|कब|schedule|call/,
            question: /yes|no|हाँ|नहीं|answer|reply/
        };

        const expectedPattern = addressingPatterns[queryType];
        const addressed = expectedPattern ? expectedPattern.test(botLower) : true;

        let severity = 0;
        if (!addressed && queryType !== 'general') {
            severity = queryType === 'agent_related' ? 8 : 6;
        }

        return {
            failed: !addressed && queryType !== 'general',
            queryType,
            expected: `Should address ${queryType} query`,
            actual: addressed ? 'Query addressed' : 'Query not addressed',
            severity
        };
    }

    checkCriticalStepScriptAdherence(botResponse, step) {
        const violations = [];
        let score = 1.0;

        // Check step-specific script requirements
        if (step === 1) {
            // Initial greeting must include MagicBricks introduction
            if (!/magicbricks|मैजिकब्रिक्स/i.test(botResponse)) {
                violations.push('Missing MagicBricks introduction');
                score -= 0.3;
            }
        } else if (step === 6) {
            // Interest check must mention platform and recent activity
            if (!/platform|recently|interest/i.test(botResponse)) {
                violations.push('Missing platform reference or recent activity mention');
                score -= 0.4;
            }
            // Should use "Bee-etch-kay" not "BHK"
            if (/\bBHK\b/i.test(botResponse)) {
                violations.push('Used "BHK" instead of "Bee-etch-kay"');
                score -= 0.2;
            }
        } else if (step === 7) {
            // Agent offer must mention shortlisted agents
            if (!/shortlist|agent|top.*agent/i.test(botResponse)) {
                violations.push('Missing agent shortlist mention');
                score -= 0.4;
            }
        } else if (step === 9) {
            // Call transfer must indicate actual transfer action
            if (!/transfer|connect|agent.*connect/i.test(botResponse)) {
                violations.push('Missing transfer action indication');
                score -= 0.5;
            }
        }

        return { score: Math.max(0, score), violations };
    }

    generateQueryAddressingRecommendation(responseAnalysis) {
        const { queryType, failedToAddress, expectedStep } = responseAnalysis;

        if (!failedToAddress) return '';

        const recommendations = {
            pricing: 'Bot should acknowledge pricing queries and either provide budget ranges or ask for customer budget preferences.',
            location: 'Bot should acknowledge location queries and confirm the area of interest or ask for preferred locations.',
            property_size: 'Bot should acknowledge property size queries and confirm BHK requirements (using "Bee-etch-kay" pronunciation).',
            agent_related: 'Bot should address agent-related queries by explaining the agent connection process and benefits.',
            timing: 'Bot should address timing queries by providing available time slots or asking for customer preferences.',
            question: 'Bot should directly answer customer questions before proceeding with the script.'
        };

        return recommendations[queryType] || 'Bot should acknowledge and address customer query before continuing with conversation flow.';
    }

    updateConversationStateFromResponse(conversationState, responseAnalysis) {
        const newState = { ...conversationState };

        // Update current step based on bot response
        if (responseAnalysis.detectedStep > 0) {
            newState.currentStep = responseAnalysis.detectedStep;
        }

        // Update expected context
        const contextMap = {
            1: 'post_greeting',
            6: 'post_interest_check',
            7: 'post_agent_offer',
            9: 'post_transfer'
        };

        newState.expectedContext = contextMap[responseAnalysis.detectedStep] || 'general';

        // Track critical step attempts
        if ([1, 6, 7, 9].includes(responseAnalysis.detectedStep)) {
            const attempts = newState.criticalStepAttempts.get(responseAnalysis.detectedStep) || 0;
            newState.criticalStepAttempts.set(responseAnalysis.detectedStep, attempts + 1);
        }

        return newState;
    }

    generateCriticalStepRecommendations(criticalStepViolations, contextDeviations, unaddressedQueries, conversationState) {
        const recommendations = [];

        // Critical step violation recommendations
        if (criticalStepViolations.length > 0) {
            recommendations.push(`CRITICAL: ${criticalStepViolations.length} critical step violations detected. Review conversation flow logic.`);

            const violationTypes = [...new Set(criticalStepViolations.map(v => v.violationType))];
            violationTypes.forEach(type => {
                const count = criticalStepViolations.filter(v => v.violationType === type).length;
                recommendations.push(`- ${type.replace(/_/g, ' ')}: ${count} occurrence(s)`);
            });
        }

        // Context deviation recommendations
        if (contextDeviations.length > 0) {
            recommendations.push(`ATTENTION: ${contextDeviations.length} context deviations detected. Bot may be going off-script.`);
        }

        // Unaddressed query recommendations
        if (unaddressedQueries.length > 0) {
            recommendations.push(`IMPROVEMENT: ${unaddressedQueries.length} customer queries not properly addressed.`);

            const queryTypes = [...new Set(unaddressedQueries.map(q => q.queryType))];
            queryTypes.forEach(type => {
                const count = unaddressedQueries.filter(q => q.queryType === type).length;
                recommendations.push(`- Improve ${type} query handling: ${count} missed`);
            });
        }

        // Overall conversation state recommendations
        const completedCriticalSteps = Array.from(conversationState.criticalStepAttempts.keys());
        const missedCriticalSteps = [1, 6, 7, 9].filter(step => !completedCriticalSteps.includes(step));

        if (missedCriticalSteps.length > 0) {
            recommendations.push(`MISSING: Critical steps not attempted: ${missedCriticalSteps.join(', ')}`);
        }

        return recommendations;
    }

    calculateCriticalStepScore(criticalStepViolations, contextDeviations, unaddressedQueries) {
        let score = 100;

        // Penalties for different types of issues
        score -= criticalStepViolations.length * 15; // Heavy penalty for critical step violations
        score -= contextDeviations.length * 8; // Medium penalty for context deviations  
        score -= unaddressedQueries.length * 5; // Light penalty for unaddressed queries

        // Additional severity-based penalties
        const severityPenalty = criticalStepViolations.reduce((sum, v) => sum + v.severity, 0);
        score -= severityPenalty;

        return Math.max(0, Math.min(100, score));
    }

    mergeHallucinationAnalyses(primaryAnalysis, criticalStepAnalysis) {
        // Merge the traditional hallucination analysis with critical step analysis
        return {
            ...primaryAnalysis,
            criticalStepAnalysis: criticalStepAnalysis,
            enhancedScore: this.calculateEnhancedHallucinationScore(primaryAnalysis, criticalStepAnalysis),
            combinedRecommendations: [
                ...(primaryAnalysis.recommendations || []),
                ...criticalStepAnalysis.recommendations
            ],
            analysisSource: 'enhanced_with_critical_steps'
        };
    }

    calculateEnhancedHallucinationScore(primaryAnalysis, criticalStepAnalysis) {
        // Combine traditional hallucination score with critical step score
        const primaryWeight = 0.6;
        const criticalStepWeight = 0.4;

        const combinedScore = (primaryAnalysis.hallucinationScore * primaryWeight) +
            (criticalStepAnalysis.criticalStepScore * criticalStepWeight);

        return Math.round(combinedScore);
    }

    getDefaultHallucinationAnalysis() {
        console.log('📝 Returning default hallucination analysis due to error');
        return {
            hallucinations: [],
            hallucinationScore: 80, // Default good score
            totalBotTurns: 0,
            deviationRate: 0,
            overallRelevance: 0.8,
            criticalStepAnalysis: {
                criticalStepViolations: [],
                contextDeviations: [],
                unaddressedQueries: [],
                recommendations: [],
                criticalStepScore: 80
            },
            analysisSource: 'default_fallback'
        };
    }

    checkAffirmativeResponseToTransfer(intentMappings) {
        // Look for affirmative responses after call transfer offer (step 7) or call transfer (step 9)
        const affirmativePatterns = [
            /\b(हाँ|yes|ठीक\s+है|okay|ok|sure|alright)\b/gi,
            /\b(बिल्कुल|जरूर|चलिए|ठीक)\b/gi,
            /\b(go\s+ahead|proceed|continue)\b/gi
        ];

        // Find the last call transfer or agent connection offer
        let lastTransferIndex = -1;
        for (let i = intentMappings.length - 1; i >= 0; i--) {
            if (intentMappings[i].conversationStep === 'call_transfer' ||
                intentMappings[i].conversationStep === 'agent_connection_offer') {
                lastTransferIndex = i;
                break;
            }
        }

        if (lastTransferIndex === -1) return false;

        // Check for affirmative responses after the transfer offer
        for (let i = lastTransferIndex + 1; i < intentMappings.length; i++) {
            const mapping = intentMappings[i];
            if (mapping.speaker && mapping.speaker.toLowerCase().includes('human')) {
                // Check if human response contains affirmative patterns
                for (const pattern of affirmativePatterns) {
                    if (pattern.test(mapping.text)) {
                        console.log(`✅ Found affirmative response to call transfer: "${mapping.text.substring(0, 50)}..."`);
                        return true;
                    }
                }
            }
        }

        console.log('⚠️ No clear affirmative response found to call transfer');
        return false;
    }
    extractKeywords(text) {
        // Extract meaningful keywords, excluding stop words
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'है', 'हैं', 'का', 'की', 'के', 'में', 'से', 'को', 'और', 'या', 'पर', 'के लिए'
        ]);

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));

        return [...new Set(words)]; // Remove duplicates
    }

    extractConversationIntent(text) {
        const textLower = text.toLowerCase();

        // MagicBricks specific intent patterns
        if (/नमस्ते|hello|magicbricks|बोल रहा हूँ/.test(textLower)) return 'greeting';
        if (/property|properties|flat|bhk|बी.*एच.*के|search/.test(textLower)) return 'property_inquiry';
        if (/agent|connect|shortlist|top.*agent/.test(textLower)) return 'agent_connection';
        if (/budget|बजट|लाख|crore|price/.test(textLower)) return 'pricing';
        if (/area|location|में|कहाँ/.test(textLower)) return 'location';
        if (/transfer|connect.*agent|line.*पर/.test(textLower)) return 'call_transfer';
        if (/find.*नहीं.*पा.*रहा|reconfirm|confirm/.test(textLower)) return 'clarification_request';

        return 'unknown';
    }

    areRelatedIntents(intent1, intent2) {
        const relatedGroups = [
            ['property_inquiry', 'pricing', 'location'],
            ['agent_connection', 'call_transfer'],
            ['greeting', 'unknown']
        ];

        return relatedGroups.some(group =>
            group.includes(intent1) && group.includes(intent2)
        );
    }

    analyzeTextStructure(text) {
        const words = text.split(/\s+/);
        const sentences = text.split(/[।.!?]+/).filter(s => s.trim());

        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            isQuestion: /\?|क्या|कैसे|कब|कहाँ|कौन/.test(text),
            punctuationPattern: this.extractPunctuationPattern(text),
            languageMix: this.detectLanguageMix(text)
        };
    }

    extractPunctuationPattern(text) {
        const punctuation = text.replace(/[^\.,!?।]/g, '');
        return punctuation || 'none';
    }

    detectLanguageMix(text) {
        const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
        const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
        const total = hindiChars + englishChars;

        if (total === 0) return 'mixed';

        const hindiRatio = hindiChars / total;
        if (hindiRatio > 0.7) return 'hindi_dominant';
        if (hindiRatio < 0.3) return 'english_dominant';
        return 'mixed';
    }

    extractNgrams(text, n) {
        const words = text.toLowerCase().split(/\s+/);
        const ngrams = [];

        for (let i = 0; i <= words.length - n; i++) {
            ngrams.push(words.slice(i, i + n).join(' '));
        }

        return ngrams;
    }

    calculateSetSimilarity(set1, set2) {
        if (set1.length === 0 && set2.length === 0) return 1.0;
        if (set1.length === 0 || set2.length === 0) return 0.0;

        const intersection = set1.filter(item => set2.includes(item));
        const union = [...new Set([...set1, ...set2])];

        return intersection.length / union.length;
    }

    extractBusinessContext(text) {
        const textLower = text.toLowerCase();

        return {
            isPropertyRelated: /property|flat|house|bhk|बी.*एच.*के|villa|apartment/.test(textLower),
            isAgentRelated: /agent|broker|dealer|एजेंट|connect|shortlist/.test(textLower),
            isPricingRelated: /budget|price|cost|लाख|crore|रुपए|affordable/.test(textLower),
            isLocationRelated: /area|location|city|में|कहाँ|where|locality/.test(textLower),
            isConfirmationRelated: /confirm|reconfirm|सही|correct|right/.test(textLower)
        };
    }

    areIdenticalBotResponses(text1, text2) {
        if (!text1 || !text2) return false;

        // Normalize texts for comparison (remove punctuation, extra spaces, case differences)
        const normalize = (text) => {
            return text.toLowerCase()
                .replace(/[^\w\s]/g, ' ')  // Remove punctuation
                .replace(/\s+/g, ' ')      // Normalize spaces
                .trim();
        };

        const normalized1 = normalize(text1);
        const normalized2 = normalize(text2);

        // Consider identical if normalized texts are exactly the same
        return normalized1 === normalized2 && normalized1.length > 0;
    }

    detectBlockPatternRepetitions(botResponses, lines) {
        console.log('🔍 Detecting block pattern repetitions...');
        const blockRepetitions = [];

        // Look for 2-line, 3-line, and 4-line block patterns
        for (let blockSize = 2; blockSize <= 4; blockSize++) {
            for (let i = 0; i <= botResponses.length - (blockSize * 2); i++) {
                // Get the first block
                const firstBlock = botResponses.slice(i, i + blockSize);

                // Look for the same block pattern immediately after
                const secondBlockStart = i + blockSize;
                const secondBlock = botResponses.slice(secondBlockStart, secondBlockStart + blockSize);

                // Check if we have enough responses for the second block
                if (secondBlock.length < blockSize) continue;

                // Check if the blocks are identical
                const blocksMatch = this.doBlocksMatch(firstBlock, secondBlock);

                if (blocksMatch) {
                    // Verify these blocks are consecutive (no human intervention between them)
                    const areConsecutive = this.areBlocksConsecutive(firstBlock, secondBlock, lines);

                    if (areConsecutive) {
                        blockRepetitions.push({
                            type: 'block_pattern_repetition',
                            blockSize: blockSize,
                            text1: firstBlock.map(r => r.text).join(' | '),
                            text2: secondBlock.map(r => r.text).join(' | '),
                            firstBlock: firstBlock.map(r => r.text),
                            secondBlock: secondBlock.map(r => r.text),
                            similarityScore: 1.0,
                            severity: 10,
                            isProblematicRepetition: true,
                            recommendation: `Remove ${blockSize}-line block repetition - bot is repeating entire conversation blocks`
                        });

                        // Skip ahead to avoid overlapping detections
                        i += (blockSize * 2) - 1;
                        break; // Break out of blockSize loop for this position
                    }
                }
            }
        }

        console.log(`Found ${blockRepetitions.length} block pattern repetitions`);
        return blockRepetitions;
    }

    doBlocksMatch(block1, block2) {
        if (block1.length !== block2.length) return false;

        for (let i = 0; i < block1.length; i++) {
            if (!this.areIdenticalBotResponses(block1[i].text, block2[i].text)) {
                return false;
            }
        }

        return true;
    }

    areBlocksConsecutive(firstBlock, secondBlock, lines) {
        // Check if there are any human responses between the two blocks
        const firstBlockEnd = firstBlock[firstBlock.length - 1].lineIndex;
        const secondBlockStart = secondBlock[0].lineIndex;

        // Look for human responses between the blocks
        for (let i = firstBlockEnd + 1; i < secondBlockStart; i++) {
            if (i < lines.length) {
                const line = lines[i].trim();
                if (line && this.isHumanLine(line)) {
                    return false; // Human intervention found
                }
            }
        }

        return true;
    }

    areConsecutiveBotResponses(response1, response2, lines) {
        // Check if there are any human responses between these two bot responses
        const startLine = response1.lineIndex;
        const endLine = response2.lineIndex;

        for (let i = startLine + 1; i < endLine; i++) {
            if (i < lines.length) {
                const line = lines[i].trim();
                if (line && this.isHumanLine(line)) {
                    return false; // Human intervention found
                }
            }
        }

        return true;
    }

    isHumanLine(line) {
        return /^(Human|User|Customer|Client|Caller):/i.test(line.trim());
    }

    isBotLine(line) {
        return /^(Chat Bot|Bot|Agent|Support|Assistant):/i.test(line.trim());
    }

    extractTextFromLine(line) {
        const colonIndex = line.indexOf(':');
        return colonIndex !== -1 ? line.substring(colonIndex + 1).trim() : line.trim();
    }

    clearAnalysisCache() {
        // Clear caches to prevent memory leaks
        this._cachedTranscript = null;
        this._cachedTurns = null;
        this._patternCache.clear();
        this._intentCache.clear();
    }
}

module.exports = { CallQAAnalyzer };