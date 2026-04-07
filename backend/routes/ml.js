// ============================================================
// ATHNEXUS — ML Integration Routes
// Prediction endpoints that call the Python ML API
// ============================================================

const express = require('express');
const axios = require('axios');
const router = express.Router();

// ML API Gateway URL
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

// =============================
// ✅ Health Check
// =============================

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_API_URL}/health`);
    res.json({ status: 'ML API is connected', mlStatus: response.data });
  } catch (error) {
    res.status(500).json({ 
      error: 'ML API unavailable', 
      message: error.message 
    });
  }
});

// =============================
// 🔮 Single Athlete Prediction
// =============================

router.post('/predict', async (req, res) => {
  try {
    const athleteData = req.body;

    if (!athleteData || Object.keys(athleteData).length === 0) {
      return res.status(400).json({ error: 'No athlete data provided' });
    }

    // Forward to Python ML API
    const prediction = await axios.post(`${ML_API_URL}/predict`, athleteData);

    res.json({
      success: true,
      selectionProbability: prediction.data.selection_probability,
      selected: prediction.data.selected,
      confidence: prediction.data.confidence,
      athleteData: athleteData
    });
  } catch (error) {
    console.error('ML Prediction Error:', error.message);
    res.status(500).json({
      error: 'Prediction failed',
      message: error.message
    });
  }
});

// =============================
// 📊 Batch Predictions
// =============================

router.post('/predict_batch', async (req, res) => {
  try {
    const { athletes } = req.body;

    if (!athletes || !Array.isArray(athletes) || athletes.length === 0) {
      return res.status(400).json({ error: 'No athletes provided' });
    }

    // Forward to Python ML API
    const predictions = await axios.post(`${ML_API_URL}/predict_batch`, {
      athletes: athletes
    });

    // Enhance response with additional info
    const results = predictions.data.predictions.map(pred => ({
      ...pred,
      selectionThreshold: 75,  // Recommend selection if probability >= 75%
      recommendation: pred.selection_probability >= 75 ? 'RECOMMENDED' : 'REVIEW'
    }));

    res.json({
      success: true,
      totalAthletes: athletes.length,
      predictions: results,
      summary: {
        recommended: results.filter(r => r.recommendation === 'RECOMMENDED').length,
        needsReview: results.filter(r => r.recommendation === 'REVIEW').length
      }
    });
  } catch (error) {
    console.error('Batch Prediction Error:', error.message);
    res.status(500).json({
      error: 'Batch prediction failed',
      message: error.message
    });
  }
});

// =============================
// 📈 Feature Importance
// =============================

router.get('/feature_importance', async (req, res) => {
  try {
    const response = await axios.get(`${ML_API_URL}/feature_importance`);

    res.json({
      success: true,
      topFeatures: response.data.top_features,
      description: 'Top 10 features that influence athlete selection predictions'
    });
  } catch (error) {
    console.error('Feature Importance Error:', error.message);
    res.status(500).json({
      error: 'Could not fetch feature importance',
      message: error.message
    });
  }
});

// =============================
// 🎯 Event-Based Athlete Filtering
// =============================
// Predict which athletes are best suited for a specific event

router.post('/recommend_athletes', async (req, res) => {
  try {
    const { athletes, eventType } = req.body;

    if (!athletes || !Array.isArray(athletes) || athletes.length === 0) {
      return res.status(400).json({ error: 'No athletes provided' });
    }

    // Get predictions for all athletes
    const predictions = await axios.post(`${ML_API_URL}/predict_batch`, {
      athletes: athletes
    });

    // Rank athletes by selection probability
    const rankedAthletes = predictions.data.predictions
      .sort((a, b) => b.selection_probability - a.selection_probability)
      .map((pred, index) => ({
        rank: index + 1,
        ...pred
      }));

    res.json({
      success: true,
      eventType: eventType || 'General',
      totalAthletes: athletes.length,
      recommendations: rankedAthletes,
      topCandidates: rankedAthletes.slice(0, 10),
      message: `Top 10 athletes ranked for ${eventType || 'this event'}`
    });
  } catch (error) {
    console.error('Recommendation Error:', error.message);
    res.status(500).json({
      error: 'Recommendation generation failed',
      message: error.message
    });
  }
});

// =============================
// 🏆 Rank Athletes for Event
// =============================
// Intelligently rank athletes for a specific event based on event criteria

router.post('/rank_for_event', async (req, res) => {
  try {
    const { eventId, eventDetails, candidateAthletes } = req.body;

    if (!eventDetails || !candidateAthletes || !Array.isArray(candidateAthletes)) {
      return res.status(400).json({ 
        error: 'Missing event details or candidate athletes' 
      });
    }

    const { sport, level, gender, format, state } = eventDetails;

    // Extract athlete profile data for ML prediction
    const athleteData = candidateAthletes.map(athlete => ({
      AthleteID: athlete.id || athlete.athleteId || athlete.email,
      ...athlete.profileData || athlete
    }));

    // Get ML predictions
    const predictions = await axios.post(`${ML_API_URL}/predict_batch`, {
      athletes: athleteData
    });

    // Rank by selection probability and score
    const rankedAthletes = predictions.data.predictions
      .map((pred, index) => {
        const athlete = candidateAthletes[index];
        const selectionScore = pred.selection_probability;
        
        // Boost score for relevant experience
        let experienceBoost = 0;
        if (athlete.experience && athlete.experience > 3) experienceBoost += 10;
        if (athlete.medals && athlete.medals > 2) experienceBoost += 10;
        
        return {
          rank: null,
          athleteId: athlete.id || athlete.athleteId || athlete.email,
          athleteName: athlete.name || athlete.athleteName || 'Unknown',
          email: athlete.email || athlete.athleteEmail,
          selectionProbability: selectionScore,
          selectionScore: selectionScore + experienceBoost,
          experience: athlete.experience || 0,
          medals: athlete.medals || 0,
          sport: athlete.sport || sport,
          level: level,
          isEligible: gender === 'Open' || athlete.gender === gender || gender === 'Mixed',
          predicted: true
        };
      })
      .filter(a => a.isEligible)
      .sort((a, b) => b.selectionScore - a.selectionScore)
      .map((athlete, index) => ({
        ...athlete,
        rank: index + 1
      }));

    res.json({
      success: true,
      eventId,
      totalEligible: rankedAthletes.length,
      rankedAthletes: rankedAthletes,
      topCandidates: rankedAthletes.slice(0, 15),
      message: `Smart ranking completed for ${sport} event`
    });
  } catch (error) {
    console.error('Event Ranking Error:', error.message);
    res.status(500).json({
      error: 'Event ranking failed',
      message: error.message
    });
  }
});

// =============================
// ✅ Select Players for Event
// =============================
// Admin finalizes player selection for an event

router.post('/select_players/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { selectedAthleteIds, substitutesIds, totalNeeded } = req.body;

    if (!selectedAthleteIds || !Array.isArray(selectedAthleteIds)) {
      return res.status(400).json({ 
        error: 'Invalid selection data' 
      });
    }

    const required = totalNeeded || selectedAthleteIds.length;
    const substitutes = substitutesIds || [];

    // Validate counts
    if (selectedAthleteIds.length !== required) {
      return res.status(400).json({
        error: `Expected ${required} selected athletes, got ${selectedAthleteIds.length}`
      });
    }

    if (substitutes.length !== 2) {
      return res.status(400).json({
        error: 'Must select exactly 2 substitutes'
      });
    }

    res.json({
      success: true,
      eventId,
      message: 'Player selection recorded successfully',
      selected: {
        mainPlayers: selectedAthleteIds,
        substitutes: substitutes,
        totalSelected: selectedAthleteIds.length,
        totalSubstitutes: 2
      },
      notification: `Event updated with ${selectedAthleteIds.length} main players + 2 substitutes`
    });
  } catch (error) {
    console.error('Selection Error:', error.message);
    res.status(500).json({
      error: 'Player selection failed',
      message: error.message
    });
  }
});

module.exports = router;
