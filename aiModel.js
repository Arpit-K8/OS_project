// AI Model for Page Replacement Algorithm Suggestion
class PageReplacementAI {
    constructor() {
        this.patterns = {
            'FIFO': {
                weight: 0.3,
                description: 'Good for sequential access patterns'
            },
            'LRU': {
                weight: 0.4,
                description: 'Best for temporal locality patterns'
            },
            'Optimal': {
                weight: 0.2,
                description: 'Best for predictable future access patterns'
            },
            'Hybrid': {
                weight: 0.1,
                description: 'Good for mixed access patterns'
            }
        };
    }

    // Analyze reference string patterns
    analyzePatterns(referenceString) {
        const analysis = {
            sequentialPatterns: this.detectSequentialPatterns(referenceString),
            temporalLocality: this.detectTemporalLocality(referenceString),
            futurePredictability: this.analyzeFuturePredictability(referenceString),
            uniquePages: new Set(referenceString).size
        };
        return analysis;
    }

    // Detect sequential access patterns
    detectSequentialPatterns(referenceString) {
        let sequentialCount = 0;
        for (let i = 1; i < referenceString.length; i++) {
            if (Math.abs(referenceString[i] - referenceString[i-1]) === 1) {
                sequentialCount++;
            }
        }
        return sequentialCount / referenceString.length;
    }

    // Detect temporal locality (recently accessed pages being accessed again)
    detectTemporalLocality(referenceString) {
        const windowSize = Math.min(5, referenceString.length);
        let localityCount = 0;
        
        for (let i = windowSize; i < referenceString.length; i++) {
            const currentPage = referenceString[i];
            const window = referenceString.slice(i - windowSize, i);
            if (window.includes(currentPage)) {
                localityCount++;
            }
        }
        return localityCount / (referenceString.length - windowSize);
    }

    // Analyze how predictable future accesses are
    analyzeFuturePredictability(referenceString) {
        const patternLength = 3;
        let patternCount = 0;
        
        for (let i = 0; i < referenceString.length - patternLength; i++) {
            const currentPattern = referenceString.slice(i, i + patternLength);
            const remainingString = referenceString.slice(i + patternLength);
            
            if (remainingString.join(',').includes(currentPattern.join(','))) {
                patternCount++;
            }
        }
        return patternCount / (referenceString.length - patternLength);
    }

    // Calculate scores for each algorithm based on the analysis
    calculateScores(analysis) {
        const scores = {
            'FIFO': 0,
            'LRU': 0,
            'Optimal': 0,
            'Hybrid': 0
        };

        // Weight calculations based on patterns
        scores['FIFO'] = analysis.sequentialPatterns * 0.6 + 
                        (1 - analysis.temporalLocality) * 0.4;

        scores['LRU'] = analysis.temporalLocality * 0.7 + 
                       analysis.uniquePages / referenceString.length * 0.3;

        scores['Optimal'] = analysis.futurePredictability * 0.8 + 
                          (1 - analysis.sequentialPatterns) * 0.2;

        scores['Hybrid'] = (analysis.temporalLocality + analysis.futurePredictability) * 0.5;

        return scores;
    }

    // Get the best algorithm suggestion
    suggestAlgorithm(referenceString) {
        const analysis = this.analyzePatterns(referenceString);
        const scores = this.calculateScores(analysis);
        
        let bestAlgorithm = 'FIFO';
        let highestScore = 0;

        for (const [algorithm, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                bestAlgorithm = algorithm;
            }
        }

        return {
            algorithm: bestAlgorithm,
            confidence: highestScore,
            explanation: this.generateExplanation(bestAlgorithm, analysis)
        };
    }

    // Generate explanation for the suggestion
    generateExplanation(algorithm, analysis) {
        const explanations = {
            'FIFO': `FIFO is suggested because your reference string shows ${(analysis.sequentialPatterns * 100).toFixed(1)}% sequential access patterns.`,
            'LRU': `LRU is suggested because your reference string shows ${(analysis.temporalLocality * 100).toFixed(1)}% temporal locality.`,
            'Optimal': `Optimal is suggested because your reference string shows ${(analysis.futurePredictability * 100).toFixed(1)}% predictable future access patterns.`,
            'Hybrid': `Hybrid is suggested because your reference string shows a mix of temporal locality (${(analysis.temporalLocality * 100).toFixed(1)}%) and predictable patterns (${(analysis.futurePredictability * 100).toFixed(1)}%).`
        };

        return explanations[algorithm];
    }
}

// Export the AI model
const pageReplacementAI = new PageReplacementAI(); 
