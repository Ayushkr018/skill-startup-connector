/* ==========================================
   SkillSync AI - Matching Algorithm Module
   Advanced AI-Powered Skill Matching System
   ========================================== */

class MatchingEngine {
    constructor() {
        this.skillsDatabase = new Map();
        this.userProfiles = new Map();
        this.companyProfiles = new Map();
        this.matchHistory = new Map();
        this.weights = {
            skillMatch: 0.40,
            experienceLevel: 0.25,
            culturalFit: 0.15,
            locationPreference: 0.10,
            salaryExpectation: 0.05,
            availabilityMatch: 0.05
        };
        this.mlModels = {
            skillSimilarity: null,
            culturalFitPredictor: null,
            successPredictor: null
        };
        this.init();
    }

    init() {
        console.log('🤖 SkillSync AI Matching Engine Initializing...');
        this.loadSkillsTaxonomy();
        this.initializeMLModels();
        this.setupNLPProcessor();
        this.loadMarketData();
        console.log('📝 Matching Engine create');
    }

    // ==========================================
    // Core Matching Algorithm
    // ==========================================

    async findMatches(userId, userType = 'student', options = {}) {
        try {
            console.log(`🎯 Finding matches for ${userType}: ${userId}`);

            const userProfile = await this.getUserProfile(userId);
            if (!userProfile) {
                throw new Error('User profile not found');
            }

            const candidates = await this.getCandidates(userType === 'student' ? 'startup' : 'student');
            const matches = [];

            for (const candidate of candidates) {
                const matchScore = await this.calculateMatchScore(userProfile, candidate, userType);
                
                if (matchScore.overall >= (options.minScore || 60)) {
                    matches.push({
                        id: candidate.id,
                        profile: candidate,
                        matchScore: matchScore,
                        compatibility: this.generateCompatibilityReport(userProfile, candidate, matchScore),
                        recommendations: this.generateRecommendations(matchScore)
                    });
                }
            }

            // Sort by overall match score
            matches.sort((a, b) => b.matchScore.overall - a.matchScore.overall);

            // Apply ML-based ranking optimization
            const optimizedMatches = await this.optimizeMatchRanking(matches, userProfile);

            // Cache results for performance
            this.cacheMatchResults(userId, optimizedMatches);

            console.log(`📝 Found ${optimizedMatches.length} matches`);
            return optimizedMatches.slice(0, options.limit || 20);

        } catch (error) {
            console.error('Error finding matches:', error);
            throw error;
        }
    }

    async calculateMatchScore(userProfile, candidateProfile, userType) {
        const scores = {
            skillMatch: await this.calculateSkillMatch(userProfile, candidateProfile, userType),
            experienceLevel: this.calculateExperienceMatch(userProfile, candidateProfile),
            culturalFit: await this.calculateCulturalFit(userProfile, candidateProfile),
            locationPreference: this.calculateLocationMatch(userProfile, candidateProfile),
            salaryExpectation: this.calculateSalaryMatch(userProfile, candidateProfile),
            availabilityMatch: this.calculateAvailabilityMatch(userProfile, candidateProfile)
        };

        // Calculate weighted overall score
        const overall = Object.keys(scores).reduce((total, key) => {
            return total + (scores[key] * this.weights[key]);
        }, 0);

        // Apply ML success prediction adjustment
        const successPrediction = await this.predictMatchSuccess(userProfile, candidateProfile);
        const adjustedOverall = Math.min(100, overall * successPrediction);

        return {
            ...scores,
            overall: Math.round(adjustedOverall),
            successPrediction: Math.round(successPrediction * 100),
            breakdown: this.generateScoreBreakdown(scores, this.weights)
        };
    }

    // ==========================================
    // Skill Matching with Advanced NLP
    // ==========================================

    async calculateSkillMatch(userProfile, candidateProfile, userType) {
        const userSkills = this.extractSkills(userProfile);
        const requiredSkills = userType === 'student' ? 
            this.extractRequiredSkills(candidateProfile) : 
            this.extractSkills(candidateProfile);

        if (userSkills.length === 0 || requiredSkills.length === 0) {
            return 0;
        }

        // Direct skill matches
        const directMatches = this.findDirectSkillMatches(userSkills, requiredSkills);
        
        // Semantic skill similarity using embeddings
        const semanticMatches = await this.findSemanticSkillMatches(userSkills, requiredSkills);
        
        // Skill level compatibility
        const levelCompatibility = this.calculateSkillLevelMatch(userSkills, requiredSkills);
        
        // Trending skills bonus
        const trendingBonus = this.calculateTrendingSkillsBonus(userSkills, requiredSkills);

        const skillScore = {
            direct: directMatches.score,
            semantic: semanticMatches.score,
            level: levelCompatibility,
            trending: trendingBonus,
            matchedSkills: [...directMatches.matched, ...semanticMatches.matched],
            missingSkills: this.findMissingSkills(userSkills, requiredSkills)
        };

        // Weighted combination of skill match components
        const finalScore = (
            skillScore.direct * 0.5 +
            skillScore.semantic * 0.3 +
            skillScore.level * 0.15 +
            skillScore.trending * 0.05
        );

        return Math.min(100, finalScore);
    }

    findDirectSkillMatches(userSkills, requiredSkills) {
        const matched = [];
        let totalScore = 0;

        for (const reqSkill of requiredSkills) {
            for (const userSkill of userSkills) {
                const similarity = this.calculateStringSimilarity(
                    reqSkill.name.toLowerCase(),
                    userSkill.name.toLowerCase()
                );

                if (similarity >= 0.85) {
                    matched.push({
                        required: reqSkill,
                        user: userSkill,
                        similarity: similarity,
                        levelMatch: this.compareLevels(userSkill.level, reqSkill.level)
                    });
                    totalScore += similarity * reqSkill.importance * userSkill.proficiency;
                }
            }
        }

        return {
            score: Math.min(100, (totalScore / requiredSkills.length) * 100),
            matched: matched
        };
    }

    async findSemanticSkillMatches(userSkills, requiredSkills) {
        const matched = [];
        let totalScore = 0;

        try {
            for (const reqSkill of requiredSkills) {
                const userSkillEmbeddings = await Promise.all(
                    userSkills.map(skill => this.getSkillEmbedding(skill.name))
                );
                const reqSkillEmbedding = await this.getSkillEmbedding(reqSkill.name);

                let bestMatch = null;
                let bestSimilarity = 0;

                userSkills.forEach((userSkill, index) => {
                    const similarity = this.calculateCosineSimilarity(
                        userSkillEmbeddings[index],
                        reqSkillEmbedding
                    );

                    if (similarity > bestSimilarity && similarity >= 0.6) {
                        bestSimilarity = similarity;
                        bestMatch = {
                            required: reqSkill,
                            user: userSkill,
                            similarity: similarity,
                            type: 'semantic'
                        };
                    }
                });

                if (bestMatch) {
                    matched.push(bestMatch);
                    totalScore += bestSimilarity * reqSkill.importance;
                }
            }

            return {
                score: Math.min(100, (totalScore / requiredSkills.length) * 100),
                matched: matched
            };

        } catch (error) {
            console.warn('Semantic matching failed, falling back to keyword matching:', error);
            return this.fallbackKeywordMatching(userSkills, requiredSkills);
        }
    }

    calculateSkillLevelMatch(userSkills, requiredSkills) {
        const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        let totalCompatibility = 0;
        let matchCount = 0;

        for (const reqSkill of requiredSkills) {
            const matchingUserSkill = userSkills.find(us => 
                this.calculateStringSimilarity(us.name, reqSkill.name) >= 0.8
            );

            if (matchingUserSkill) {
                const userLevel = levelMap[matchingUserSkill.level] || 1;
                const requiredLevel = levelMap[reqSkill.level] || 1;
                
                // Perfect match = 100, one level below = 80, two levels = 60, etc.
                const compatibility = Math.max(0, 100 - (Math.abs(userLevel - requiredLevel) * 20));
                totalCompatibility += compatibility;
                matchCount++;
            }
        }

        return matchCount > 0 ? totalCompatibility / matchCount : 0;
    }

    calculateTrendingSkillsBonus(userSkills, requiredSkills) {
        const trendingSkills = this.getTrendingSkills();
        let bonus = 0;

        for (const userSkill of userSkills) {
            const trending = trendingSkills.find(ts => 
                this.calculateStringSimilarity(ts.name, userSkill.name) >= 0.8
            );
            
            if (trending && requiredSkills.some(rs => 
                this.calculateStringSimilarity(rs.name, userSkill.name) >= 0.8
            )) {
                bonus += trending.growthRate * 0.1;
            }
        }

        return Math.min(20, bonus); // Cap bonus at 20 points
    }

    // ==========================================
    // Cultural Fit Assessment
    // ==========================================

    async calculateCulturalFit(userProfile, candidateProfile) {
        const culturalFactors = {
            workStyle: this.compareWorkStyles(userProfile, candidateProfile),
            communication: this.compareCommunicationStyles(userProfile, candidateProfile),
            values: this.compareValues(userProfile, candidateProfile),
            teamwork: this.compareTeamworkPreferences(userProfile, candidateProfile),
            growth: this.compareGrowthMindset(userProfile, candidateProfile)
        };

        // Use ML model for cultural fit prediction if available
        if (this.mlModels.culturalFitPredictor) {
            try {
                const mlPrediction = await this.mlModels.culturalFitPredictor.predict({
                    userProfile: this.serializeProfileForML(userProfile),
                    candidateProfile: this.serializeProfileForML(candidateProfile)
                });
                
                // Combine rule-based and ML-based predictions
                const ruleBasedScore = this.calculateAverageCulturalScore(culturalFactors);
                return (ruleBasedScore * 0.6) + (mlPrediction * 0.4);
            } catch (error) {
                console.warn('ML cultural fit prediction failed:', error);
            }
        }

        return this.calculateAverageCulturalScore(culturalFactors);
    }

    compareWorkStyles(userProfile, candidateProfile) {
        const userStyle = userProfile.workStyle || 'flexible';
        const companyStyle = candidateProfile.workStyle || 'flexible';

        const compatibility = {
            'remote-remote': 100,
            'office-office': 100,
            'hybrid-hybrid': 100,
            'flexible-flexible': 100,
            'remote-hybrid': 85,
            'hybrid-remote': 85,
            'office-hybrid': 75,
            'hybrid-office': 75,
            'remote-flexible': 90,
            'flexible-remote': 90,
            'office-flexible': 80,
            'flexible-office': 80,
            'remote-office': 40,
            'office-remote': 40
        };

        return compatibility[`${userStyle}-${companyStyle}`] || 60;
    }

    compareCommunicationStyles(userProfile, candidateProfile) {
        const userComm = userProfile.communicationStyle || 'balanced';
        const companyComm = candidateProfile.communicationStyle || 'balanced';

        // Communication style compatibility matrix
        const matrix = {
            'direct-direct': 95,
            'collaborative-collaborative': 95,
            'formal-formal': 90,
            'casual-casual': 90,
            'balanced-balanced': 100,
            'direct-collaborative': 75,
            'collaborative-direct': 75,
            'formal-casual': 60,
            'casual-formal': 60,
            'balanced-direct': 85,
            'balanced-collaborative': 85,
            'balanced-formal': 80,
            'balanced-casual': 80
        };

        return matrix[`${userComm}-${companyComm}`] || 70;
    }

    compareValues(userProfile, candidateProfile) {
        const userValues = userProfile.values || [];
        const companyValues = candidateProfile.values || [];

        if (userValues.length === 0 || companyValues.length === 0) {
            return 70; // Neutral score when no values data
        }

        const commonValues = userValues.filter(uv => 
            companyValues.some(cv => 
                this.calculateStringSimilarity(uv.toLowerCase(), cv.toLowerCase()) >= 0.7
            )
        );

        const valueScore = (commonValues.length / Math.max(userValues.length, companyValues.length)) * 100;
        return Math.min(100, valueScore + 20); // Bonus for having any common values
    }

    // ==========================================
    // Experience and Location Matching
    // ==========================================

    calculateExperienceMatch(userProfile, candidateProfile) {
        const userExp = userProfile.experienceYears || 0;
        const requiredExp = candidateProfile.minExperience || 0;
        const preferredExp = candidateProfile.preferredExperience || requiredExp + 2;

        if (userExp >= preferredExp) {
            return 100;
        } else if (userExp >= requiredExp) {
            const ratio = (userExp - requiredExp) / (preferredExp - requiredExp);
            return 70 + (ratio * 30);
        } else if (userExp >= requiredExp * 0.7) {
            // Allow slight experience deficit with reduced score
            const ratio = userExp / requiredExp;
            return ratio * 70;
        } else {
            return Math.max(20, (userExp / requiredExp) * 50);
        }
    }

    calculateLocationMatch(userProfile, candidateProfile) {
        const userLocation = userProfile.location || {};
        const jobLocation = candidateProfile.location || {};

        // Remote work preferences
        if (userProfile.remotePreference === 'remote-only' && candidateProfile.remoteAllowed) {
            return 100;
        }

        if (userProfile.remotePreference === 'office-only' && !candidateProfile.remoteAllowed) {
            return candidateProfile.location ? this.calculateGeographicDistance(userLocation, jobLocation) : 50;
        }

        // Geographic distance calculation
        if (userLocation.city && jobLocation.city) {
            return this.calculateGeographicDistance(userLocation, jobLocation);
        }

        return 60; // Neutral score for incomplete location data
    }

    calculateGeographicDistance(location1, location2) {
        // Simplified distance calculation (in real app, use actual geolocation APIs)
        if (location1.city === location2.city) return 100;
        if (location1.state === location2.state) return 80;
        if (location1.country === location2.country) return 60;
        return 30;
    }

    calculateSalaryMatch(userProfile, candidateProfile) {
        const userExpected = userProfile.salaryExpectation || 0;
        const jobOffered = candidateProfile.salaryRange || {};

        if (!userExpected || (!jobOffered.min && !jobOffered.max)) {
            return 70; // Neutral when salary data unavailable
        }

        const jobMin = jobOffered.min || 0;
        const jobMax = jobOffered.max || jobMin * 1.5;

        if (userExpected >= jobMin && userExpected <= jobMax) {
            return 100;
        } else if (userExpected < jobMin) {
            // User expects less than offered - good for employer
            return 90;
        } else {
            // User expects more than offered
            const overage = (userExpected - jobMax) / jobMax;
            return Math.max(30, 100 - (overage * 100));
        }
    }

    calculateAvailabilityMatch(userProfile, candidateProfile) {
        const userAvailable = userProfile.availableFrom ? new Date(userProfile.availableFrom) : new Date();
        const jobStartDate = candidateProfile.startDate ? new Date(candidateProfile.startDate) : new Date();

        const timeDiff = Math.abs(userAvailable - jobStartDate) / (1000 * 60 * 60 * 24); // Days

        if (timeDiff <= 7) return 100;
        if (timeDiff <= 30) return 85;
        if (timeDiff <= 60) return 70;
        return Math.max(40, 100 - timeDiff);
    }

    // ==========================================
    // Machine Learning Integration
    // ==========================================

    async initializeMLModels() {
        try {
            // Initialize TensorFlow.js models for client-side ML
            if (typeof tf !== 'undefined') {
                await this.loadSkillSimilarityModel();
                await this.loadCulturalFitModel();
                await this.loadSuccessPredictionModel();
            } else {
                console.warn('TensorFlow.js not available, using rule-based matching only');
            }
        } catch (error) {
            console.warn('Failed to initialize ML models:', error);
        }
    }

    async loadSkillSimilarityModel() {
        try {
            // Load pre-trained skill embedding model
            this.mlModels.skillSimilarity = await tf.loadLayersModel('/models/skill-embeddings/model.json');
            console.log('📝 Skill similarity model loaded');
        } catch (error) {
            console.warn('Skill similarity model not available:', error);
        }
    }

    async getSkillEmbedding(skillName) {
        if (this.mlModels.skillSimilarity) {
            // Use ML model to generate embeddings
            const tokenized = this.tokenizeSkill(skillName);
            const tensor = tf.tensor2d([tokenized]);
            const embedding = await this.mlModels.skillSimilarity.predict(tensor);
            return embedding.arraySync()[0];
        } else {
            // Fallback to simple word vectors
            return this.generateSimpleEmbedding(skillName);
        }
    }

    calculateCosineSimilarity(vector1, vector2) {
        if (vector1.length !== vector2.length) return 0;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            norm1 += vector1[i] * vector1[i];
            norm2 += vector2[i] * vector2[i];
        }

        if (norm1 === 0 || norm2 === 0) return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    async predictMatchSuccess(userProfile, candidateProfile) {
        if (this.mlModels.successPredictor) {
            try {
                const features = this.extractFeaturesForML(userProfile, candidateProfile);
                const prediction = await this.mlModels.successPredictor.predict(tf.tensor2d([features]));
                return prediction.dataSync()[0];
            } catch (error) {
                console.warn('ML success prediction failed:', error);
            }
        }

        // Fallback to rule-based prediction
        return this.ruleBasedSuccessPrediction(userProfile, candidateProfile);
    }

    // ==========================================
    // Advanced Matching Features
    // ==========================================

    async optimizeMatchRanking(matches, userProfile) {
        // Apply diversity optimization
        const diversifiedMatches = this.applyDiversityFilter(matches);
        
        // Apply recency bias (prefer newer postings)
        const recencyOptimized = this.applyRecencyBoost(diversifiedMatches);
        
        // Apply user preference learning
        const preferenceOptimized = await this.applyPreferenceLearning(recencyOptimized, userProfile);
        
        return preferenceOptimized;
    }

    applyDiversityFilter(matches) {
        // Ensure diversity in company types, industries, and sizes
        const diversified = [];
        const seenCompanies = new Set();
        const industryCount = {};
        const maxPerIndustry = 5;

        for (const match of matches) {
            const industry = match.profile.industry || 'other';
            const companyId = match.profile.companyId || match.id;

            if (!seenCompanies.has(companyId) && 
                (industryCount[industry] || 0) < maxPerIndustry) {
                
                diversified.push(match);
                seenCompanies.add(companyId);
                industryCount[industry] = (industryCount[industry] || 0) + 1;
            }
        }

        // Fill remaining slots with best matches regardless of diversity
        const remaining = matches.filter(m => !diversified.includes(m))
                                .slice(0, Math.max(0, 20 - diversified.length));
        
        return [...diversified, ...remaining];
    }

    applyRecencyBoost(matches) {
        const now = Date.now();
        return matches.map(match => {
            const postDate = new Date(match.profile.postedDate || now);
            const daysOld = (now - postDate) / (1000 * 60 * 60 * 24);
            
            let recencyMultiplier = 1.0;
            if (daysOld <= 3) recencyMultiplier = 1.1;
            else if (daysOld <= 7) recencyMultiplier = 1.05;
            else if (daysOld > 30) recencyMultiplier = 0.95;
            
            return {
                ...match,
                matchScore: {
                    ...match.matchScore,
                    overall: Math.min(100, match.matchScore.overall * recencyMultiplier)
                }
            };
        }).sort((a, b) => b.matchScore.overall - a.matchScore.overall);
    }

    async applyPreferenceLearning(matches, userProfile) {
        // Learn from user's past interactions
        const userHistory = await this.getUserMatchHistory(userProfile.id);
        
        if (!userHistory || userHistory.length < 5) {
            return matches; // Not enough data for learning
        }

        // Analyze patterns in user's past preferences
        const preferences = this.analyzeUserPreferences(userHistory);
        
        // Apply preference-based scoring
        return matches.map(match => {
            const preferenceScore = this.calculatePreferenceAlignment(match, preferences);
            const adjustedScore = (match.matchScore.overall * 0.8) + (preferenceScore * 0.2);
            
            return {
                ...match,
                matchScore: {
                    ...match.matchScore,
                    overall: Math.round(adjustedScore),
                    preferenceAlignment: Math.round(preferenceScore)
                }
            };
        }).sort((a, b) => b.matchScore.overall - a.matchScore.overall);
    }

    // ==========================================
    // Utility and Helper Methods
    // ==========================================

    extractSkills(profile) {
        const skills = [];
        
        // Extract from skills array
        if (profile.skills && Array.isArray(profile.skills)) {
            skills.push(...profile.skills.map(skill => ({
                name: skill.name || skill,
                level: skill.level || 'intermediate',
                proficiency: skill.proficiency || 0.8,
                experience: skill.experience || 1
            })));
        }

        // Extract from description using NLP
        if (profile.description) {
            const extractedSkills = this.extractSkillsFromText(profile.description);
            skills.push(...extractedSkills);
        }

        return this.deduplicateSkills(skills);
    }

    extractSkillsFromText(text) {
        // Simple skill extraction using keywords and patterns
        const skillKeywords = this.getSkillKeywords();
        const skills = [];
        const words = text.toLowerCase().split(/\W+/);

        for (const keyword of skillKeywords) {
            if (words.includes(keyword.toLowerCase()) || 
                text.toLowerCase().includes(keyword.toLowerCase())) {
                skills.push({
                    name: keyword,
                    level: 'intermediate',
                    proficiency: 0.7,
                    source: 'extracted'
                });
            }
        }

        return skills;
    }

    getSkillKeywords() {
        return [
            // Programming Languages
            'javascript', 'python', 'java', 'typescript', 'react', 'node.js', 'angular',
            'vue.js', 'php', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            
            // Frameworks & Libraries
            'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'next.js',
            'gatsby', 'nuxt.js', 'bootstrap', 'tailwind', 'material-ui',
            
            // Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
            'oracle', 'sql server', 'firebase', 'dynamodb',
            
            // Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'github actions',
            'terraform', 'ansible', 'ci/cd', 'microservices',
            
            // Design & UI/UX
            'figma', 'photoshop', 'sketch', 'ui design', 'ux design', 'wireframing',
            'prototyping', 'user research', 'design systems',
            
            // AI & Data Science
            'machine learning', 'deep learning', 'artificial intelligence', 'tensorflow',
            'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis',
            
            // Business Skills
            'project management', 'agile', 'scrum', 'leadership', 'communication',
            'marketing', 'sales', 'strategy', 'analysis'
        ];
    }

    deduplicateSkills(skills) {
        const seen = new Map();
        
        for (const skill of skills) {
            const key = skill.name.toLowerCase();
            if (!seen.has(key) || seen.get(key).proficiency < skill.proficiency) {
                seen.set(key, skill);
            }
        }
        
        return Array.from(seen.values());
    }

    calculateStringSimilarity(str1, str2) {
        // Levenshtein distance based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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
        
        return matrix[str2.length][str1.length];
    }

    generateCompatibilityReport(userProfile, candidateProfile, matchScore) {
        return {
            strengths: this.identifyMatchStrengths(matchScore),
            concerns: this.identifyMatchConcerns(matchScore),
            recommendations: this.generateMatchRecommendations(userProfile, candidateProfile, matchScore),
            skillGaps: this.identifySkillGaps(userProfile, candidateProfile),
            culturalAlignment: this.describeCulturalAlignment(matchScore.culturalFit)
        };
    }

    identifyMatchStrengths(matchScore) {
        const strengths = [];
        
        if (matchScore.skillMatch >= 80) {
            strengths.push('Excellent skill alignment with high technical compatibility');
        }
        if (matchScore.culturalFit >= 80) {
            strengths.push('Strong cultural fit with aligned work styles and values');
        }
        if (matchScore.experienceLevel >= 85) {
            strengths.push('Perfect experience level match for the role requirements');
        }
        if (matchScore.locationPreference >= 90) {
            strengths.push('Ideal location and remote work preference alignment');
        }
        
        return strengths;
    }

    identifyMatchConcerns(matchScore) {
        const concerns = [];
        
        if (matchScore.skillMatch < 60) {
            concerns.push('Significant skill gaps may require additional training');
        }
        if (matchScore.culturalFit < 60) {
            concerns.push('Potential cultural misalignment in work style or values');
        }
        if (matchScore.experienceLevel < 50) {
            concerns.push('Experience level may not meet minimum requirements');
        }
        if (matchScore.salaryExpectation < 50) {
            concerns.push('Substantial gap between salary expectations and offer');
        }
        
        return concerns;
    }

    // ==========================================
    // Data Management
    // ==========================================

    async loadSkillsTaxonomy() {
        try {
            // Load comprehensive skills database
            const response = await fetch('/data/skills-taxonomy.json');
            const skillsData = await response.json();
            
            for (const skill of skillsData.skills) {
                this.skillsDatabase.set(skill.name.toLowerCase(), {
                    ...skill,
                    synonyms: skill.synonyms || [],
                    category: skill.category || 'general',
                    trending: skill.trending || false,
                    demandScore: skill.demandScore || 50
                });
            }
            
            console.log(`📚 Loaded ${this.skillsDatabase.size} skills into database`);
        } catch (error) {
            console.warn('Failed to load skills taxonomy:', error);
            this.loadDefaultSkills();
        }
    }

    loadDefaultSkills() {
        // Fallback skill database
        const defaultSkills = [
            { name: 'JavaScript', category: 'programming', trending: true, demandScore: 90 },
            { name: 'Python', category: 'programming', trending: true, demandScore: 95 },
            { name: 'React', category: 'frontend', trending: true, demandScore: 85 },
            { name: 'Node.js', category: 'backend', trending: true, demandScore: 80 },
            { name: 'Machine Learning', category: 'ai', trending: true, demandScore: 88 },
            { name: 'UI/UX Design', category: 'design', trending: true, demandScore: 75 }
        ];

        for (const skill of defaultSkills) {
            this.skillsDatabase.set(skill.name.toLowerCase(), skill);
        }
    }

    async loadMarketData() {
        try {
            // Load current market trends and salary data
            const [trendsData, salaryData] = await Promise.all([
                fetch('/data/market-trends.json').then(r => r.json()),
                fetch('/data/salary-data.json').then(r => r.json())
            ]);

            this.marketTrends = trendsData;
            this.salaryData = salaryData;
            
        } catch (error) {
            console.warn('Failed to load market data:', error);
            this.marketTrends = { skills: [] };
            this.salaryData = { ranges: {} };
        }
    }

    getTrendingSkills() {
        return this.marketTrends.skills || [];
    }

    async getUserProfile(userId) {
        // In a real app, this would fetch from your backend API
        try {
            const response = await fetch(`/api/profiles/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            return null;
        }
    }

    async getCandidates(userType) {
        try {
            const response = await fetch(`/api/candidates?type=${userType}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch candidates:', error);
            return [];
        }
    }

    cacheMatchResults(userId, matches) {
        const cacheKey = `matches_${userId}`;
        const cacheData = {
            matches,
            timestamp: Date.now(),
            expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
        };

        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache match results:', error);
        }
    }

    // ==========================================
    // Public API Methods
    // ==========================================

    async getMatchesForUser(userId, options = {}) {
        return await this.findMatches(userId, 'student', options);
    }

    async getMatchesForStartup(startupId, options = {}) {
        return await this.findMatches(startupId, 'startup', options);
    }

    async updateMatchFeedback(matchId, userId, feedback) {
        // Record user feedback for learning
        const feedbackData = {
            matchId,
            userId,
            feedback,
            timestamp: Date.now()
        };

        try {
            await fetch('/api/matches/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });
            
            // Update local learning model
            this.incorporateFeedback(feedbackData);
            
        } catch (error) {
            console.error('Failed to record match feedback:', error);
        }
    }

    getMatchStatistics() {
        return {
            totalMatches: this.matchHistory.size,
            averageScore: this.calculateAverageMatchScore(),
            topSkills: this.getTopMatchedSkills(),
            successRate: this.calculateSuccessRate()
        };
    }
}

// Initialize the matching engine
const matchingEngine = new MatchingEngine();

// Export for global access
window.matchingEngine = matchingEngine;
window.matching = matchingEngine;

console.log(`
🤖 SkillSync AI Matching Engine Loaded
🎯 Advanced Skill Matching Algorithms create
🧠 Machine Learning Integration Active
📊 Real-time Market Data Processing
`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatchingEngine;
}
