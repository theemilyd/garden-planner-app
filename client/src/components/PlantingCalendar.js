import React, { useState, useEffect, useRef } from 'react';
// We still need plantDatabase for fallback search
// eslint-disable-next-line no-unused-vars
import { plantDatabase, plantFamilies, seedViabilityGuide } from '../data/plantDatabase';
import * as plantAPI from '../services/plantAPI';

// This is an enhanced version with mock data to demonstrate the UI
const PlantingCalendar = () => {
  // Basic state
  const [country, setCountry] = useState('US');
  const [postalCode, setPostalCode] = useState('');
  const [plantInput, setPlantInput] = useState('');
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [showFrostAlert, setShowFrostAlert] = useState(false);
  const [dataSource, setDataSource] = useState(null);
  const [hemisphere, setHemisphere] = useState('northern');
  
  // UI state
  const [showGerminationModal, setShowGerminationModal] = useState(false);
  const [showFamilyInfoModal, setShowFamilyInfoModal] = useState(false);
  const [showViabilityGuide, setShowViabilityGuide] = useState(false);
  const [selectedPlantDetails, setSelectedPlantDetails] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const modalRef = useRef(null);
  
  // Succession planting features
  const [successionPlans, setSuccessionPlans] = useState([]);
  const [showSuccessionPlanner, setShowSuccessionPlanner] = useState(false);
  const [advancedSuccessionMode, setAdvancedSuccessionMode] = useState(false);
  
  // Subscription tier state
  const [subscriptionTier, setSubscriptionTier] = useState('free'); // free, starter, pro, market
  const [plantLimit, setPlantLimit] = useState(10);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Inventory management
  const [seedInventory, setSeedInventory] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Location & microclimate 
  const [microclimateAdjustments, setMicroclimateAdjustments] = useState({
    frostPocketAdjustment: 0,
    windExposureAdjustment: 0,
    slopeAdjustment: 0
  });
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowGerminationModal(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);
  
  // Show germination details modal
  const handleShowGerminationDetails = (plant) => {
    // Check if plant might be from API (missing germination data)
    if (!plant.germination || !plant.germination.soilTemp) {
      // Create default germination data for API plants
      const apiPlant = {
        ...plant,
        germination: {
          soilTemp: { min: 55, max: 75, optimal: 65 }, // Default values in °F
          daysToGerminate: { min: 7, max: 14 },
          seedDepth: 0.25, // inches
          lightNeeded: false,
          specialTechniques: [],
          instructions: `Planting instructions for ${plant.name}: Plant seeds when soil temperature is 55-75°F.`,
          confidence: "medium",
          notes: "This is default germination data. For more accurate information, consult seed packets or gardening resources."
        },
        difficulty: 'moderate',
        family: plant.scientific_name ? plant.scientific_name.split(' ')[0] : 'Unknown'
      };
      
      setSelectedPlantDetails(apiPlant);
      setShowGerminationModal(true);
      return;
    }
    
    // Use the normalizePlantData function for local database plants
    import('../data/plantDatabase').then(({ normalizePlantData }) => {
      const normalizedPlant = normalizePlantData([plant])[0];
      setSelectedPlantDetails(normalizedPlant);
      setShowGerminationModal(true);
    }).catch(err => {
      console.error('Error normalizing plant data:', err);
      // Fallback if import fails
      setSelectedPlantDetails(plant);
      setShowGerminationModal(true);
    });
  };
  
  // Show plant family information
  const handleShowFamilyInfo = (familyName) => {
    setSelectedFamily(plantFamilies[familyName]);
    setShowFamilyInfoModal(true);
  };
  
  // Toggle hemisphere between northern and southern
  const toggleHemisphere = () => {
    setHemisphere(hemisphere === 'northern' ? 'southern' : 'northern');
  };
  
  // Create succession planting plan
  const createSuccessionPlan = (plant) => {
    // Check if user has reached plan limit for free tier
    if (subscriptionTier === 'free' && successionPlans.length >= 3) {
      setShowUpgradeModal(true);
      return;
    }
    
    try {
      // Determine if plant has necessary data
      const hasGrowingCycleData = plant.growingCycle && 
                               plant.growingCycle.daysToMaturity &&
                               plant.growingCycle.successionPlanting !== false;
      
      const startDate = new Date();
      const plans = [];
      
      // Get maturity days based on available data
      const maturityDays = hasGrowingCycleData 
        ? plant.growingCycle.daysToMaturity 
        : (plant.days_to_maturity || { min: 60, max: 80 });
        
      // Get planting interval
      const weeksInterval = hasGrowingCycleData 
        ? (plant.growingCycle.successionInterval?.weeks || 2)
        : 2;
        
      // Determine number of plantings based on subscription tier
      const tierPlantingLimits = {
        'free': 3,
        'starter': 4,
        'pro': 6,
        'market': 10
      };
      const numberOfPlantings = tierPlantingLimits[subscriptionTier] || 3;
      
      // Calculate last possible planting date based on frost date
      let lastPlantingDate = null;
      if (zoneInfo && zoneInfo.firstFrostDate) {
        const firstFrost = new Date(zoneInfo.firstFrostDate);
        lastPlantingDate = new Date(firstFrost);
        // Subtract maximum days to maturity and add 2-week buffer
        lastPlantingDate.setDate(lastPlantingDate.getDate() - (maturityDays.max || 80) - 14);
      }
      
      // Generate succession plans
      for (let i = 0; i < numberOfPlantings; i++) {
        // Calculate planting date with proper interval
        const plantingDate = new Date(startDate);
        plantingDate.setDate(plantingDate.getDate() + (i * weeksInterval * 7));
        
        // Skip if past the last planting date
        if (lastPlantingDate && plantingDate > lastPlantingDate) break;
        
        // Calculate harvest window
        const harvestStartDate = new Date(plantingDate);
        harvestStartDate.setDate(harvestStartDate.getDate() + (maturityDays.min || 60));
        
        const harvestEndDate = new Date(plantingDate);
        harvestEndDate.setDate(harvestEndDate.getDate() + (maturityDays.max || 80));
        
        // Apply microclimate adjustments for paid tiers
        if (subscriptionTier !== 'free') {
          // Calculate total microclimate adjustment in days
          const totalAdjustment = 
            microclimateAdjustments.frostPocketAdjustment + 
            microclimateAdjustments.windExposureAdjustment + 
            microclimateAdjustments.slopeAdjustment;
          
          // Apply adjustments to harvest dates
          harvestStartDate.setDate(harvestStartDate.getDate() + totalAdjustment);
          harvestEndDate.setDate(harvestEndDate.getDate() + totalAdjustment);
        }
        
        // Create plan object
        plans.push({
          plantName: plant.name,
          plantingNumber: i + 1,
          plantingDate: plantingDate,
          harvestStartDate: harvestStartDate,
          harvestEndDate: harvestEndDate,
          isEstimated: !hasGrowingCycleData,
          notes: getTierSpecificNotes(subscriptionTier, hasGrowingCycleData)
        });
      }
      
      setSuccessionPlans(plans);
      setShowSuccessionPlanner(true);
    } catch (error) {
      console.error("Error creating succession plan:", error);
      // Provide a fallback basic plan in case of errors
      createFallbackSuccessionPlan(plant);
    }
  };
  
  // Helper function for tier-specific notes
  const getTierSpecificNotes = (tier, hasAccurateData) => {
    if (tier === 'free') return "Basic plan";
    if (tier === 'market') return "Commercial production optimized";
    if (!hasAccurateData) return "Estimated plan based on typical growing patterns";
    return "Optimized for home garden";
  };
  
  // Create a fallback succession plan when errors occur
  const createFallbackSuccessionPlan = (plant) => {
    const startDate = new Date();
    const plans = [];
    
    // Create a basic 3-part succession plan
    for (let i = 0; i < 3; i++) {
      const plantingDate = new Date(startDate);
      plantingDate.setDate(plantingDate.getDate() + (i * 14)); // 2 weeks apart
      
      const harvestStartDate = new Date(plantingDate);
      harvestStartDate.setDate(harvestStartDate.getDate() + 60);
      
      const harvestEndDate = new Date(plantingDate);
      harvestEndDate.setDate(harvestEndDate.getDate() + 80);
      
      plans.push({
        plantName: plant.name,
        plantingNumber: i + 1,
        plantingDate: plantingDate,
        harvestStartDate: harvestStartDate,
        harvestEndDate: harvestEndDate,
        isEstimated: true,
        notes: "Basic fallback plan - some data may be missing"
      });
    }
    
    setSuccessionPlans(plans);
    setShowSuccessionPlanner(true);
  };
  
  // Country database with postal code formats
  const countries = [
    { code: 'US', name: 'United States', postalFormat: '#####', zoneSystem: 'USDA' },
    { code: 'CA', name: 'Canada', postalFormat: 'A#A #A#', zoneSystem: 'Canadian' },
    { code: 'GB', name: 'United Kingdom', postalFormat: 'AA## #AA', zoneSystem: 'RHS' },
    { code: 'AU', name: 'Australia', postalFormat: '####', zoneSystem: 'Australian' },
    { code: 'NZ', name: 'New Zealand', postalFormat: '####', zoneSystem: 'NZ' },
    { code: 'FR', name: 'France', postalFormat: '#####', zoneSystem: 'European' },
    { code: 'DE', name: 'Germany', postalFormat: '#####', zoneSystem: 'European' },
    { code: 'IT', name: 'Italy', postalFormat: '#####', zoneSystem: 'European' },
    { code: 'ES', name: 'Spain', postalFormat: '#####', zoneSystem: 'European' },
  ];
  
  // Plant database with enhanced germination data and multiple citations - mock data with varied planting dates
  // Important: Each plant has unique planting times to help users visualize the differences
  const plantDatabase = [
    {
      id: 1,
      name: 'Tomato',
      type: 'Vegetable',
      indoorStart: 2, // March (0-indexed)
      indoorEnd: 3,   // April
      outdoorStart: 4, // May
      outdoorEnd: 6,   // July (longer growing season than most plants)
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'Cornell University', url: 'https://gardening.cornell.edu' }
      ],
      germination: {
        soilTemp: { min: 21, max: 29, optimal: 26 }, // °C
        daysToGerminate: { min: 6, max: 14 },
        seedDepth: 0.6, // cm
        lightNeeded: false,
        specialTechniques: [],
        instructions: "Sow seeds ¼ inch deep. Maintain soil temperature at 70-90°F (21-32°C) for best germination. Keep soil consistently moist but not waterlogged.",
        confidence: "high",
        notes: "Tomato seeds germinate best in warm soil. Cold soil can significantly delay germination."
      },
      difficulty: 'easy'
    },
    {
      id: 2,
      name: 'Cucumber',
      type: 'Vegetable',
      indoorStart: 3, // April
      indoorEnd: 4,   // May
      outdoorStart: 4, // May
      outdoorEnd: 7,   // August
      source: 'Cornell Cooperative Extension',
      sources: [
        { name: 'Cornell Cooperative Extension', url: 'https://cce.cornell.edu' },
        { name: 'University of Minnesota Extension', url: 'https://extension.umn.edu' }
      ],
      germination: {
        soilTemp: { min: 15, max: 35, optimal: 29 }, // °C
        daysToGerminate: { min: 3, max: 10 },
        seedDepth: 1.3, // cm
        lightNeeded: false,
        specialTechniques: [],
        instructions: "Plant seeds 1/2 inch deep. Cucumbers need warm soil to germinate well. Pre-warming soil with plastic or starting indoors can help germination.",
        confidence: "high",
        notes: "Seeds may rot in cold, wet soil. Wait until soil warms to at least 60°F (15°C)."
      },
      difficulty: 'easy'
    },
    {
      id: 3,
      name: 'Lettuce',
      type: 'Vegetable',
      indoorStart: 1, // February
      indoorEnd: 2,   // March
      outdoorStart: 2, // March
      outdoorEnd: 4,   // May
      fall: {
        outdoorStart: 7, // August
        outdoorEnd: 9    // October
      },
      source: 'University of Minnesota Extension',
      sources: [
        { name: 'University of Minnesota Extension', url: 'https://extension.umn.edu' },
        { name: "Johnny's Selected Seeds", url: 'https://www.johnnyseeds.com' }
      ],
      germination: {
        soilTemp: { min: 2, max: 27, optimal: 18 }, // °C
        daysToGerminate: { min: 2, max: 15 },
        seedDepth: 0.3, // cm
        lightNeeded: true,
        specialTechniques: ["Light exposure needed"],
        instructions: "Sow seeds very shallowly, about 1/8 inch deep or less. Lettuce seeds need light to germinate. Keep soil surface moist until germination.",
        confidence: "high",
        notes: "Germination rate drops significantly at temperatures above 80°F (27°C)."
      },
      difficulty: 'easy'
    },
    {
      id: 4,
      name: 'Peas',
      type: 'Vegetable',
      indoorStart: null, // Direct sow only
      indoorEnd: null,
      outdoorStart: 1, // February
      outdoorEnd: 3,   // April
      source: "Farmer's Almanac",
      sources: [
        { name: "Farmer's Almanac", url: 'https://www.farmersalmanac.com' },
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' }
      ],
      germination: {
        soilTemp: { min: 4, max: 24, optimal: 18 }, // °C
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 2.5, // cm
        lightNeeded: false,
        specialTechniques: ["Pre-soaking"],
        instructions: "Plant seeds 1 inch deep. Soaking seeds in water for 12-24 hours before planting can speed germination. Peas prefer cool soil temperatures.",
        confidence: "high",
        notes: "Peas can rot in cold, wet soil. Add beneficial bacteria (garden inoculant) to improve germination and growth."
      },
      difficulty: 'easy'
    },
    {
      id: 5,
      name: 'Basil',
      type: 'Herb',
      indoorStart: 2, // March
      indoorEnd: 4,   // May
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'Purdue University Extension',
      sources: [
        { name: 'Purdue University Extension', url: 'https://www.purdue.edu/hla/sites/yardandgarden/' },
        { name: 'University of Illinois Extension', url: 'https://extension.illinois.edu' }
      ],
      germination: {
        soilTemp: { min: 18, max: 35, optimal: 27 }, // °C
        daysToGerminate: { min: 5, max: 10 },
        seedDepth: 0.3, // cm
        lightNeeded: true,
        specialTechniques: ["Light exposure needed", "Bottom heat"],
        instructions: "Sow seeds shallowly, barely covering with soil. Basil needs light and warm temperatures to germinate. A heat mat can improve germination rates.",
        confidence: "high",
        notes: "Basil is very sensitive to cold temperatures. Do not transplant outdoors until nighttime temperatures are consistently above 50°F (10°C)."
      },
      difficulty: 'moderate'
    },
    {
      id: 6,
      name: 'Sunflower',
      type: 'Flower',
      indoorStart: 2, // March
      indoorEnd: 4,   // May
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'Burpee Seed Company', url: 'https://www.burpee.com' },
        { name: 'National Gardening Association', url: 'https://garden.org' }
      ],
      directSowingNotRecommended: true, // Flag that direct sowing is not ideal in cool climates
      regionSpecific: {
        countries: {
          'GB': {
            // UK-specific growing advice
            indoorStart: 2, // March
            indoorEnd: 4,   // May
            outdoorStart: 4, // May after last frost
            outdoorEnd: 5,  // June
            notes: "In the UK, sunflowers should be started indoors in March-April, and transplanted outdoors after all risk of frost has passed (usually May)."
          }
        },
        northernHemisphere: {
          zoneAdjustments: {
            // UK and similar cold-climate specific timing
            cold: {
              indoorShift: 0,  // Already adjusted in base data
              outdoorShift: 1, // Delay outdoor planting in cold regions
              forceIndoor: true // Force indoor starting in cold regions, no direct sowing
            }
          }
        }
      },
      germination: {
        soilTemp: { min: 21, max: 30, optimal: 24 }, // °C
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 2.5, // cm
        lightNeeded: false,
        specialTechniques: [],
        instructions: "Plant seeds 1 inch deep. Sunflowers prefer direct sowing but can be started indoors in peat pots to minimize root disturbance during transplanting.",
        confidence: "high",
        notes: "Protect seeds from birds and rodents which may dig them up before germination."
      },
      difficulty: 'easy'
    },
    {
      id: 7,
      name: 'Carrot',
      type: 'Vegetable',
      indoorStart: null, // Direct sow only
      indoorEnd: null,
      outdoorStart: 2, // March
      outdoorEnd: 4,   // May
      fall: {
        outdoorStart: 7, // August
        outdoorEnd: 8    // September
      },
      source: 'Almanac Garden Planner',
      sources: [
        { name: 'Almanac Garden Planner', url: 'https://planner.almanac.com' },
        { name: "Johnny's Selected Seeds", url: 'https://www.johnnyseeds.com' }
      ],
      germination: {
        soilTemp: { min: 7, max: 30, optimal: 24 }, // °C
        daysToGerminate: { min: 14, max: 21 },
        seedDepth: 0.3, // cm
        lightNeeded: false,
        specialTechniques: ["Keep consistently moist", "Cover with light row cover"],
        instructions: "Sow carrot seeds shallowly, about 1/8 to 1/4 inch deep. Carrot seeds are small and slow to germinate. Keep soil consistently moist and never let it dry out during germination.",
        confidence: "moderate",
        notes: "Covering soil with a lightweight board or row cover can help keep soil moist during germination. Remove cover as soon as seedlings emerge."
      },
      difficulty: 'moderate'
    },
    {
      id: 8,
      name: 'Zucchini',
      type: 'Vegetable',
      indoorStart: 3, // April
      indoorEnd: 4,   // May
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'University of California Extension',
      sources: [
        { name: 'University of California Extension', url: 'https://ucanr.edu' },
        { name: 'Iowa State University Extension', url: 'https://www.extension.iastate.edu' }
      ],
      germination: {
        soilTemp: { min: 16, max: 35, optimal: 29 }, // °C
        daysToGerminate: { min: 6, max: 10 },
        seedDepth: 2.5, // cm
        lightNeeded: false,
        specialTechniques: [],
        instructions: "Plant seeds 1 inch deep. If starting indoors, use biodegradable pots to minimize root disturbance during transplanting.",
        confidence: "high",
        notes: "Zucchini seeds may rot in cold, wet soil. Wait until soil warms to at least 60°F (15°C)."
      },
      difficulty: 'easy'
    },
    {
      id: 9,
      name: 'Spinach',
      type: 'Vegetable',
      indoorStart: 1, // February
      indoorEnd: 2,   // March
      outdoorStart: 2, // March
      outdoorEnd: 3,   // April (spring)
      source: 'Iowa State University Extension',
      sources: [
        { name: 'Iowa State University Extension', url: 'https://www.extension.iastate.edu' },
        { name: 'University of Minnesota Extension', url: 'https://extension.umn.edu' }
      ],
      germination: {
        soilTemp: { min: 2, max: 24, optimal: 15 }, // °C
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 1.3, // cm
        lightNeeded: false,
        specialTechniques: ["Pre-soaking"],
        instructions: "Plant seeds 1/2 inch deep. Spinach germinates best in cool soil. Soaking seeds for a few hours can improve germination rates.",
        confidence: "high",
        notes: "Germination is poor when soil temperatures exceed 75°F (24°C). For summer planting, refrigerate seeds for 1-2 weeks before sowing."
      },
      difficulty: 'easy'
    },
    {
      id: 10,
      name: 'Marigold',
      type: 'Flower',
      indoorStart: 2, // March
      indoorEnd: 3,   // April
      outdoorStart: 4, // May
      outdoorEnd: 6,   // July
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'National Gardening Association', url: 'https://garden.org' },
        { name: 'Burpee Seed Company', url: 'https://www.burpee.com' }
      ],
      germination: {
        soilTemp: { min: 18, max: 29, optimal: 24 }, // °C
        daysToGerminate: { min: 5, max: 10 },
        seedDepth: 0.6, // cm
        lightNeeded: true,
        specialTechniques: ["Light exposure helps"],
        instructions: "Sow seeds 1/4 inch deep. Marigolds germinate easily with some light and warm soil.",
        confidence: "high",
        notes: "Keep soil consistently moist but not waterlogged during germination."
      },
      difficulty: 'easy'
    },
    {
      id: 11,
      name: 'Sweet Pea',
      type: 'Flower',
      indoorStart: 1, // February 
      indoorEnd: 2,   // March
      outdoorStart: 3, // April
      outdoorEnd: 4,   // May
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'Thompson & Morgan', url: 'https://www.thompson-morgan.com' },
        { name: 'Sarah Raven', url: 'https://www.sarahraven.com' }
      ],
      germination: {
        soilTemp: { min: 13, max: 18, optimal: 15 }, // °C
        daysToGerminate: { min: 10, max: 28 },
        seedDepth: 1.3, // cm
        lightNeeded: false,
        specialTechniques: ["Scarification", "Pre-soaking"],
        instructions: "Nick the seed coat with a file or sandpaper and soak in water for 24 hours before planting. Sow seeds 1/2 inch deep.",
        confidence: "high",
        notes: "Sweet peas have hard seed coats. Scarification significantly improves germination rates. Seeds can also be pre-sprouted between damp paper towels."
      },
      difficulty: 'moderate'
    },
    {
      id: 12,
      name: 'Zinnia',
      type: 'Flower',
      indoorStart: 2, // March
      indoorEnd: 3,   // April
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'University of Illinois Extension', url: 'https://extension.illinois.edu' },
        { name: 'Burpee Seed Company', url: 'https://www.burpee.com' }
      ],
      germination: {
        soilTemp: { min: 21, max: 29, optimal: 24 }, // °C
        daysToGerminate: { min: 5, max: 10 },
        seedDepth: 0.6, // cm
        lightNeeded: false,
        specialTechniques: [],
        instructions: "Sow seeds 1/4 inch deep. Zinnias need warm soil to germinate well. Direct sowing is often more successful than transplanting.",
        confidence: "high",
        notes: "Zinnias don't like having their roots disturbed. If starting indoors, use peat pots or soil blocks."
      },
      difficulty: 'easy'
    },
    {
      id: 13,
      name: 'Lavender',
      type: 'Herb',
      indoorStart: 1, // February
      indoorEnd: 3,   // April
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'Kew Royal Botanic Gardens',
      sources: [
        { name: 'Kew Royal Botanic Gardens', url: 'https://www.kew.org' },
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' }
      ],
      germination: {
        soilTemp: { min: 18, max: 24, optimal: 21 }, // °C
        daysToGerminate: { min: 14, max: 28 },
        seedDepth: 0.3, // cm
        lightNeeded: true,
        specialTechniques: ["Light exposure needed", "Cold stratification"],
        instructions: "Surface sow seeds, barely covering with a fine layer of soil. Lavender seeds need light to germinate. Cold stratify seeds in refrigerator for 3-4 weeks before sowing for improved germination.",
        confidence: "moderate",
        notes: "Lavender seeds are notoriously slow and difficult to germinate. Expect 30-40% germination rate even with proper techniques. Propagation from cuttings is often more reliable."
      },
      difficulty: 'difficult'
    },
    {
      id: 14,
      name: 'Thyme',
      type: 'Herb',
      indoorStart: 2, // March
      indoorEnd: 3,   // April
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'National Gardening Association',
      sources: [
        { name: 'National Gardening Association', url: 'https://garden.org' },
        { name: 'University of Minnesota Extension', url: 'https://extension.umn.edu' }
      ],
      germination: {
        soilTemp: { min: 18, max: 26, optimal: 21 }, // °C
        daysToGerminate: { min: 14, max: 28 },
        seedDepth: 0.3, // cm
        lightNeeded: true,
        specialTechniques: ["Light exposure needed"],
        instructions: "Surface sow seeds, as they need light to germinate. Keep soil moist but not wet until germination. Use well-draining seed starting mix.",
        confidence: "moderate",
        notes: "Thyme seeds are tiny and can take up to a month to germinate. Be patient and don't overwater."
      },
      difficulty: 'moderate'
    },
    {
      id: 15,
      name: 'Cosmos',
      type: 'Flower',
      indoorStart: 3, // April
      indoorEnd: 4,   // May
      outdoorStart: 4, // May
      outdoorEnd: 6,   // July
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'Burpee Seed Company', url: 'https://www.burpee.com' },
        { name: 'National Gardening Association', url: 'https://garden.org' }
      ],
      germination: {
        soilTemp: { min: 18, max: 26, optimal: 21 }, // °C
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 0.6, // cm
        lightNeeded: false,
        specialTechniques: [],
        instructions: "Sow seeds 1/4 inch deep. Cosmos germinate easily in warm soil and grow quickly.",
        confidence: "high",
        notes: "Cosmos prefer being direct seeded. If started indoors, transplant carefully to avoid disturbing the taproot."
      },
      difficulty: 'easy'
    },
    {
      id: 16,
      name: 'Delphinium',
      type: 'Flower',
      indoorStart: 0, // January
      indoorEnd: 1,   // February
      outdoorStart: 3, // April
      outdoorEnd: 4,   // May
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'American Delphinium Society', url: 'https://delphiniumsociety.org' },
        { name: 'Chiltern Seeds', url: 'https://www.chilternseeds.co.uk' }
      ],
      germination: {
        soilTemp: { min: 15, max: 18, optimal: 16 }, // °C
        daysToGerminate: { min: 14, max: 28 },
        seedDepth: 0.3, // cm
        lightNeeded: false,
        specialTechniques: ["Cold stratification", "Darkness for germination"],
        instructions: "Refrigerate seeds for 2-4 weeks before planting. Sow seeds 1/8 inch deep, cover with dark paper until germination. Best started in winter to allow for growth before summer planting.",
        confidence: "high",
        notes: "Delphinium seeds need a cold period (stratification) to break dormancy. The duration of cold treatment varies based on variety. In zones 8+, longer stratification may be needed to compensate for warmer winters."
      },
      difficulty: 'difficult'
    },
    {
      id: 17,
      name: 'Echinacea',
      type: 'Flower',
      indoorStart: 1, // February
      indoorEnd: 2,   // March
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'Prairie Nursery',
      sources: [
        { name: 'Prairie Nursery', url: 'https://www.prairienursery.com' },
        { name: 'Lady Bird Johnson Wildflower Center', url: 'https://www.wildflower.org' }
      ],
      germination: {
        soilTemp: { min: 18, max: 24, optimal: 21 }, // °C
        daysToGerminate: { min: 10, max: 30 },
        seedDepth: 0.3, // cm
        lightNeeded: false,
        specialTechniques: ["Cold stratification"],
        instructions: "Cold stratify seeds for 4-12 weeks (depending on species) at 1-5°C (refrigerator). Sow seeds 1/8 inch deep after stratification. Can be winter sown outdoors in cold climates.",
        confidence: "high",
        notes: "Different Echinacea species have varied stratification requirements. E. purpurea needs less stratification than other species. For natural stratification, seeds can be sown in fall for spring germination."
      },
      difficulty: 'moderate'
    },
    {
      id: 18,
      name: 'Cilantro',
      type: 'Herb',
      indoorStart: 2, // March
      indoorEnd: 4,   // May
      outdoorStart: 3, // April
      outdoorEnd: 8,   // September
      source: 'University of California Extension',
      sources: [
        { name: 'University of California Extension', url: 'https://ucanr.edu' },
        { name: "Johnny's Selected Seeds", url: 'https://www.johnnyseeds.com' }
      ],
      germination: {
        soilTemp: { min: 10, max: 29, optimal: 18 }, // °C
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 0.6, // cm
        lightNeeded: false,
        specialTechniques: ["Crushing seeds"],
        instructions: "Lightly crush the round seed casing before planting to improve germination. Sow 1/4 inch deep. Seeds prefer cool temperatures for germination.",
        confidence: "high",
        notes: "Cilantro seeds are actually fruits containing two seeds. Germination improves when the round casing is cracked. Direct sowing is preferable as cilantro does not transplant well."
      },
      difficulty: 'moderate'
    },
    {
      id: 19,
      name: 'Rosemary',
      type: 'Herb',
      indoorStart: 0, // January
      indoorEnd: 2,   // March
      outdoorStart: 4, // May
      outdoorEnd: 5,   // June
      source: 'Purdue University Extension',
      sources: [
        { name: 'Purdue University Extension', url: 'https://www.purdue.edu/hla/sites/yardandgarden/' },
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' }
      ],
      germination: {
        soilTemp: { min: 18, max: 24, optimal: 21 }, // °C
        daysToGerminate: { min: 14, max: 42 },
        seedDepth: 0.3, // cm
        lightNeeded: true,
        specialTechniques: ["Light exposure needed", "Bottom heat", "High humidity"],
        instructions: "Surface sow seeds, pressing lightly into soil but not covering. Rosemary needs light to germinate. Use a heat mat (70-75°F/21-24°C) and cover with clear plastic to maintain humidity.",
        confidence: "moderate",
        notes: "Rosemary is notoriously difficult and slow to germinate from seed. Seeds have a low viability rate. For best results, use fresh seeds and expect only 30-50% germination rate. Propagating from cuttings is more reliable."
      },
      difficulty: 'difficult'
    },
    {
      id: 20,
      name: 'Foxglove',
      type: 'Flower',
      indoorStart: 5, // June
      indoorEnd: 7,   // August
      outdoorStart: 8, // September
      outdoorEnd: 9,   // October
      source: 'Royal Horticultural Society',
      sources: [
        { name: 'Royal Horticultural Society', url: 'https://www.rhs.org.uk' },
        { name: 'Thompson & Morgan', url: 'https://www.thompson-morgan.com' }
      ],
      germination: {
        soilTemp: { min: 18, max: 22, optimal: 20 }, // °C
        daysToGerminate: { min: 14, max: 21 },
        seedDepth: 0.1, // cm
        lightNeeded: true,
        specialTechniques: ["Surface sowing", "Light exposure needed"],
        instructions: "Surface sow seeds, do not cover as light aids germination. Press seeds gently onto moist soil surface. Keep soil consistently moist but not waterlogged.",
        confidence: "high",
        notes: "Foxglove seeds are tiny. Mix with fine sand for even distribution when sowing. Foxglove is a biennial that typically flowers in its second year. Sow in summer for flowering plants the following year."
      },
      difficulty: 'moderate'
    }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Simulate frost alert check
  useEffect(() => {
    if (zoneInfo) {
      // In a real app, this would call a weather API
      const currentMonth = new Date().getMonth();
      
      // Simulate potential frost alert for demonstration
      if ((currentMonth === 3 || currentMonth === 9) && Math.random() > 0.5) {
        setShowFrostAlert(true);
      }
    }
  }, [zoneInfo]);

  // Get postal code format for selected country
  const getPostalCodeFormat = () => {
    const selectedCountry = countries.find(c => c.code === country);
    return selectedCountry ? selectedCountry.postalFormat : '#####';
  };

  // Validate postal code based on country format
  const isValidPostalCode = (code) => {
    // Skip empty codes
    if (!code || code.trim() === '') {
      return false;
    }
    
    // Apply country-specific validation patterns
    switch(country) {
      case 'US':
        // US ZIP codes: 5 digits or 5+4 format
        return /^\d{5}(-\d{4})?$/.test(code);
        
      case 'CA':
        // Canadian postal codes: A1A 1A1 format
        // Remove spaces for validation and allow with/without space
        const caCode = code.replace(/\s+/g, '');
        return /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(caCode);
        
      case 'GB':
        // UK postcodes have complex format but simplified for UI
        // Allow common formats like SW1A 1AA, B1 1AA, etc.
        const ukCode = code.toUpperCase().replace(/\s+/g, ' ').trim();
        return /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/.test(ukCode);
        
      case 'AU':
      case 'NZ':
        // Australia and New Zealand: 4 digits
        return /^\d{4}$/.test(code);
        
      case 'FR':
      case 'DE':
      case 'IT':
      case 'ES':
        // European postal codes: typically 5 digits
        return /^\d{5}$/.test(code);
        
      default:
        // Generic validation for other countries
        // Require at least 3 characters, allow letters, numbers, and hyphens
        return /^[A-Za-z0-9-]{3,10}$/.test(code);
    }
  };

  // Generate growing zone based on country and postal code
  const getZone = (countryCode, postalCode) => {
    setLoading(true);
    
    // In a paid version, this would connect to real weather/climate APIs
    // For demonstration, we'll simulate an API call
    if (subscriptionTier !== 'free') {
      console.log(`Using premium weather data API for ${countryCode}, ${postalCode}`);
      // In a real implementation, we would use a weather API here
    }
    
    // Set country code in a window global for debugging
    window.currentCountry = countryCode;
    console.log(`Setting location to country: ${countryCode}, postal code: ${postalCode}`);
    
    // In a real app, this would call an API for accurate zone data
    setTimeout(() => {
      let zone, lastFrost, firstFrost, growingDays, source;
      
      // Mock data for demonstration - would be API-based in production
      switch(countryCode) {
        case 'US':
          // Simple US zone calculation
          const firstDigit = parseInt(postalCode.charAt(0));
          zone = `${10-firstDigit}${['a','b'][Math.floor(Math.random() * 2)]}`;
          lastFrost = ['March 30', 'April 15', 'April 30', 'May 15'][Math.floor(Math.random() * 4)];
          firstFrost = ['October 1', 'October 15', 'October 30', 'November 15'][Math.floor(Math.random() * 4)];
          growingDays = Math.floor(Math.random() * 50) + 150;
          source = 'USDA Plant Hardiness Zone Map';
          break;
        case 'CA':
          zone = `${Math.floor(Math.random() * 5) + 2}${['a','b'][Math.floor(Math.random() * 2)]}`;
          lastFrost = ['April 15', 'May 1', 'May 15', 'May 30'][Math.floor(Math.random() * 4)];
          firstFrost = ['September 15', 'September 30', 'October 15'][Math.floor(Math.random() * 3)];
          growingDays = Math.floor(Math.random() * 40) + 120;
          source = 'Agriculture and Agri-Food Canada';
          break;
        case 'GB':
          // Set a deterministic value for testing purposes
          zone = 'H3';
          lastFrost = 'May 1';
          firstFrost = 'October 30';
          growingDays = 150; // Shorter growing season than US
          source = 'Royal Horticultural Society';
          console.log("UK zone data set - forcing sunflowers to indoor start in March-April");
          break;
        case 'AU':
          zone = `${Math.floor(Math.random() * 7) + 1}`;
          lastFrost = 'N/A'; // Many parts of Australia don't have frost
          firstFrost = 'N/A';
          growingDays = 365; // Year-round growing in many areas
          source = 'Australian National Botanic Gardens';
          break;
        default:
          zone = `${Math.floor(Math.random() * 10) + 1}`;
          lastFrost = 'April 15';
          firstFrost = 'October 15';
          growingDays = 180;
          source = 'International Association of Horticultural Producers';
      }
      
      setZoneInfo({
        country: countryCode,
        postalCode,
        zoneName: zone,
        lastFrostDate: lastFrost,
        firstFrostDate: firstFrost,
        growingDays,
        zoneSystem: countries.find(c => c.code === countryCode)?.zoneSystem || 'USDA'
      });
      
      setDataSource(source);
      setLoading(false);
      setShowCalendar(true);
    }, 500);
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (isValidPostalCode(postalCode)) {
      getZone(country, postalCode);
    }
  };

  const handleAddPlant = () => {
    if (plantInput.trim() === '') return;
    
    // Check plant limit based on subscription tier
    if (selectedPlants.length >= plantLimit) {
      setShowUpgradeModal(true);
      return;
    }
    
    // First check if we have suggestions from the API
    if (suggestions && suggestions.length > 0) {
      // Add first suggestion that isn't already selected
      const newPlant = suggestions.find(plant => 
        !selectedPlants.some(p => p.id === plant.id)
      );
      
      if (newPlant) {
        // For paid tiers, add enhanced data
        if (subscriptionTier !== 'free') {
          newPlant.enhancedData = {
            precisionRating: 'high',
            regionalAdjustments: true,
            customNotes: [] // Allow users to add notes in paid version
          };
        }
        
        setSelectedPlants([...selectedPlants, newPlant]);
        setPlantInput('');
        setSuggestions([]);
        return;
      }
    }
    
    // Make sure plantDatabase is defined
    if (!plantDatabase || !Array.isArray(plantDatabase)) {
      console.error('Plant database not available');
      return;
    }
    
    // Access the expanded database for paid tiers
    // In a real implementation, this would connect to a larger plant database
    let databaseToSearch = plantDatabase;
    if (subscriptionTier !== 'free') {
      console.log('Using expanded plant database for paid tier');
      // This would normally fetch from a premium database with 1000+ varieties
    }
    
    // Fallback to local database if no suggestions
    const matchingPlants = databaseToSearch.filter(plant => 
      plant.name.toLowerCase().includes(plantInput.toLowerCase())
    );
    
    if (matchingPlants.length > 0) {
      // Add first matching plant that isn't already selected
      const newPlant = matchingPlants.find(plant => 
        !selectedPlants.some(p => p.id === plant.id)
      );
      
      if (newPlant) {
        setSelectedPlants([...selectedPlants, newPlant]);
        setPlantInput('');
        setSuggestions([]);
      }
    }
  };

  const handleRemovePlant = (id) => {
    setSelectedPlants(selectedPlants.filter(plant => plant.id !== id));
  };

  // Get plant suggestions filtered by type if a filter is active
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get plant suggestions from API filtered by type if a filter is active
  const getPlantSuggestions = async () => {
    // Empty search term returns no results
    if (plantInput.trim() === '') {
      setSuggestions([]);
      return [];
    }
    
    setIsLoading(true);
    
    try {
      // Prepare search filters
      const filters = {
        search: plantInput.trim(),
        limit: 10
      };
      
      // Only add type filter if not set to 'All'
      if (typeFilter !== 'All') {
        filters.type = typeFilter;
      }
      
      // First try to search using API
      try {
        const response = await plantAPI.getAllPlants(filters);
        
        // Validate response structure and check for plants
        if (response?.data?.plants?.length > 0) {
          // Format API plants for UI display
          const apiPlants = response.data.plants.map(plant => {
            try {
              // Use API's formatPlantForUI if available, or create a basic format
              return typeof plantAPI.formatPlantForUI === 'function'
                ? plantAPI.formatPlantForUI(plant)
                : {
                    id: plant.id || `api-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: plant.name || plant.common_name || 'Unknown Plant',
                    type: plant.type || plant.category || 'Vegetable',
                    days_to_maturity: plant.days_to_maturity || { min: 60, max: 90 },
                    ...plant
                  };
            } catch (formatError) {
              console.error('Error formatting plant:', formatError);
              // Provide basic fallback format
              return {
                id: plant.id || `api-${Date.now()}`,
                name: plant.name || 'Unknown Plant',
                type: plant.type || 'Vegetable'
              };
            }
          });
          
          // Filter out plants that are already selected
          const filteredPlants = apiPlants.filter(plant => 
            !selectedPlants.some(p => p.id === plant.id)
          );
          
          if (filteredPlants.length > 0) {
            setSuggestions(filteredPlants);
            setIsLoading(false);
            return filteredPlants;
          }
        }
      } catch (apiError) {
        // Log API error but continue to fallback
        console.error('API search error:', apiError);
      }
      
      // Fallback to local database search
      let localResults = [];
      
      if (Array.isArray(plantDatabase)) {
        // Search by name
        localResults = plantDatabase.filter(plant => {
          // Skip already selected plants
          if (selectedPlants.some(p => p.id === plant.id)) {
            return false;
          }
          
          // Check plant name
          const nameMatch = plant.name?.toLowerCase().includes(plantInput.toLowerCase());
          if (nameMatch) return true;
          
          // Check varieties if available
          if (Array.isArray(plant.varieties)) {
            return plant.varieties.some(variety => 
              variety.toLowerCase().includes(plantInput.toLowerCase())
            );
          }
          
          return false;
        });
        
        // Apply type filter if active
        if (typeFilter !== 'All') {
          localResults = localResults.filter(plant => plant.type === typeFilter);
        }
      }
      
      // Limit results to 10 plants
      const limitedResults = localResults.slice(0, 10);
      setSuggestions(limitedResults);
      return limitedResults;
    } catch (error) {
      console.error('Plant search error:', error);
      // Return empty array in case of overall failure
      setSuggestions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (plant) => {
    setSelectedPlants([...selectedPlants, plant]);
    setPlantInput('');
  };

  // Fetch plant suggestions when plantInput changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (plantInput.trim()) {
        getPlantSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300); // Debounce for better UX

    return () => clearTimeout(delaySearch);
  }, [plantInput, typeFilter, selectedPlants]);

  // Get all unique plant types for filtering
  const getPlantTypes = () => {
    const types = new Set(plantDatabase.map(plant => plant.type));
    return ['All', ...Array.from(types)];
  };

  // Adjust planting dates based on growing zone, country, and hemisphere
  const adjustDatesForZone = (plant) => {
    if (!zoneInfo) return plant;
    
    // Create a deep copy to avoid modifying the original
    const adjustedPlant = JSON.parse(JSON.stringify(plant));
    
    // Ensure all required properties exist
    adjustedPlant.indoorStart = adjustedPlant.indoorStart || null;
    adjustedPlant.indoorEnd = adjustedPlant.indoorEnd || null;
    adjustedPlant.outdoorStart = adjustedPlant.outdoorStart || null;
    adjustedPlant.outdoorEnd = adjustedPlant.outdoorEnd || null;
    adjustedPlant.difficulty = adjustedPlant.difficulty || 'moderate';
    
    // Apply country-specific settings if available
    if (plant.regionSpecific && plant.regionSpecific.countries && zoneInfo.country) {
      const countrySettings = plant.regionSpecific.countries[zoneInfo.country];
      if (countrySettings) {
        // Override with country-specific values
        if (countrySettings.indoorStart !== undefined) {
          adjustedPlant.indoorStart = countrySettings.indoorStart;
        }
        if (countrySettings.indoorEnd !== undefined) {
          adjustedPlant.indoorEnd = countrySettings.indoorEnd;
        }
        if (countrySettings.outdoorStart !== undefined) {
          adjustedPlant.outdoorStart = countrySettings.outdoorStart;
        }
        if (countrySettings.outdoorEnd !== undefined) {
          adjustedPlant.outdoorEnd = countrySettings.outdoorEnd;
        }
        // Store country-specific notes if available
        if (countrySettings.notes) {
          adjustedPlant.countryNotes = countrySettings.notes;
        }
      }
    }
    
    // Respect directSowingNotRecommended flag for cold regions
    if (plant.directSowingNotRecommended && 
        zoneInfo.country === 'GB' && 
        adjustedPlant.indoorStart !== null) {
      // Ensure direct sowing is not recommended by extending indoor period
      adjustedPlant.indoorEnd = Math.max(adjustedPlant.indoorEnd, adjustedPlant.outdoorStart - 1);
    }
    
    // If the plant is from API, use the growing_calendar to calculate planting months
    if (!adjustedPlant.indoorStart && plant.growing_calendar) {
      // Calculate month from frost date and weeks_before_last_frost
      const calculateMonthFromFrostDate = (weeks, isBefore = true, isFirstFrost = false) => {
        if (!zoneInfo) return null;
        
        // Parse frost date
        const frostDateString = isFirstFrost ? zoneInfo.firstFrostDate : zoneInfo.lastFrostDate;
        const frostDate = new Date(frostDateString);
        
        // Default to middle of the month if specific date isn't available
        if (isNaN(frostDate.getTime())) {
          // Use hemisphere to determine default frost dates
          if (hemisphere === 'northern') {
            return isFirstFrost ? 9 : 4; // October for first frost, May for last frost in Northern hemisphere
          } else {
            return isFirstFrost ? 3 : 10; // April for first frost, November for last frost in Southern hemisphere
          }
        }
        
        // Calculate the planting date
        const plantingDate = new Date(frostDate);
        const daysOffset = isBefore ? (weeks * -7) : (weeks * 7); // Negative for before frost
        plantingDate.setDate(plantingDate.getDate() + daysOffset);
        
        // Return the month (0-indexed)
        return plantingDate.getMonth();
      };
      
      // Calculate indoor start and end months
      if (plant.growing_calendar.indoor_seed_start && plant.growing_calendar.indoor_seed_start.weeks_before_last_frost) {
        const weeks = plant.growing_calendar.indoor_seed_start.weeks_before_last_frost;
        adjustedPlant.indoorStart = calculateMonthFromFrostDate(weeks, true);
        
        // Indoor end is typically when transplanting occurs
        if (plant.growing_calendar.transplant && plant.growing_calendar.transplant.weeks_after_last_frost) {
          // End indoor period when ready to transplant
          adjustedPlant.indoorEnd = calculateMonthFromFrostDate(0, false); // Last frost date
        } else {
          // Or default to 4-6 weeks of indoor growing
          adjustedPlant.indoorEnd = calculateMonthFromFrostDate(Math.max(1, weeks - 4), true);
        }
      }
      
      // Calculate spring direct sow start and end
      if (plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.spring) {
        const weeks = plant.growing_calendar.direct_sow.spring.weeks_from_last_frost;
        // Handle negative weeks (before last frost)
        const isBefore = weeks < 0;
        const absWeeks = Math.abs(weeks);
        
        adjustedPlant.outdoorStart = calculateMonthFromFrostDate(absWeeks, isBefore);
        
        // Set outdoorEnd - typically a 3-4 week period for succession planting
        // or up to when it would be too hot or too late for that crop
        if (plant.days_to_maturity && plant.days_to_maturity.max) {
          // Calculate based on growing season length
          const growingWeeks = Math.ceil(plant.days_to_maturity.max / 7) + 2; // Add some buffer
          adjustedPlant.outdoorEnd = calculateMonthFromFrostDate(absWeeks + growingWeeks, isBefore);
        } else {
          // Default to 2 months of planting window
          adjustedPlant.outdoorEnd = (adjustedPlant.outdoorStart + 2) % 12;
        }
      }
      
      // Consider fall planting too
      if (plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.fall 
          && plant.growing_calendar.direct_sow.fall.weeks_before_first_frost) {
        const weeks = plant.growing_calendar.direct_sow.fall.weeks_before_first_frost;
        const fallStart = calculateMonthFromFrostDate(weeks, true, true);
        
        // Update outdoor times if fall makes sense
        if (adjustedPlant.outdoorStart === null) {
          adjustedPlant.outdoorStart = fallStart;
          adjustedPlant.outdoorEnd = calculateMonthFromFrostDate(1, true, true);  // Almost to frost date
        } else {
          // Extend existing planting times if there's fall planting
          const currentEnd = adjustedPlant.outdoorEnd;
          
          // If there's a gap between spring and fall, don't connect them
          if (Math.abs(fallStart - currentEnd) > 2) {
            // Just note the fall planting by extending the end date
            if (fallStart > currentEnd) {
              adjustedPlant.outdoorEnd = fallStart;
            }
          }
        }
      }
      
      // If outdoor data is still missing, use some reasonable defaults
      if (adjustedPlant.outdoorStart === null) {
        adjustedPlant.outdoorStart = adjustedPlant.indoorEnd !== null ? 
          (adjustedPlant.indoorEnd + 1) % 12 : // Month after indoor ends
          (hemisphere === 'northern' ? 4 : 10); // Default to May (northern) or November (southern)
        
        adjustedPlant.outdoorEnd = (adjustedPlant.outdoorStart + 2) % 12; // 3 month planting window
      }
    }
    
    // Check if the plant has region-specific data
    if (!plant.regionSpecific) return adjustedPlant;
    
    // Determine if we're in a cold or hot zone
    let temperatureZone = 'moderate';
    if (zoneInfo.zoneSystem === 'USDA') {
      const zoneNum = parseInt(zoneInfo.zoneName);
      if (zoneNum <= 4) temperatureZone = 'cold';
      else if (zoneNum >= 8) temperatureZone = 'hot';
    }
    
    // Apply hemisphere-specific adjustments
    if (hemisphere === 'southern' && plant.regionSpecific.southernHemisphere) {
      const seasonAdjust = plant.regionSpecific.southernHemisphere.seasonAdjust || 6;
      
      // Shift planting dates by the specified number of months (usually 6)
      if (adjustedPlant.indoorStart !== null) {
        adjustedPlant.indoorStart = (adjustedPlant.indoorStart + seasonAdjust) % 12;
      }
      if (adjustedPlant.indoorEnd !== null) {
        adjustedPlant.indoorEnd = (adjustedPlant.indoorEnd + seasonAdjust) % 12;
      }
      adjustedPlant.outdoorStart = (adjustedPlant.outdoorStart + seasonAdjust) % 12;
      adjustedPlant.outdoorEnd = (adjustedPlant.outdoorEnd + seasonAdjust) % 12;
      
      // Check for months to avoid in the southern hemisphere
      adjustedPlant.avoidMonths = plant.regionSpecific.southernHemisphere.avoidMonths || [];
    } 
    // Apply northern hemisphere adjustments
    else if (hemisphere === 'northern' && plant.regionSpecific.northernHemisphere) {
      // Apply zone-specific adjustments based on temperature zone
      if (temperatureZone === 'cold' && plant.regionSpecific.northernHemisphere.zoneAdjustments?.cold) {
        const adjustments = plant.regionSpecific.northernHemisphere.zoneAdjustments.cold;
        
        // Apply indoor shift
        if (adjustments.indoorShift && adjustedPlant.indoorStart !== null) {
          adjustedPlant.indoorStart += adjustments.indoorShift;
          adjustedPlant.indoorEnd += adjustments.indoorShift;
        }
        
        // Apply outdoor shift
        if (adjustments.outdoorShift) {
          adjustedPlant.outdoorStart += adjustments.outdoorShift;
          adjustedPlant.outdoorEnd += adjustments.outdoorShift;
        }
      } 
      // Hot zone adjustments
      else if (temperatureZone === 'hot' && plant.regionSpecific.northernHemisphere.zoneAdjustments?.hot) {
        const adjustments = plant.regionSpecific.northernHemisphere.zoneAdjustments.hot;
        
        // Apply indoor shift
        if (adjustments.indoorShift && adjustedPlant.indoorStart !== null) {
          adjustedPlant.indoorStart = Math.max(0, adjustedPlant.indoorStart + adjustments.indoorShift);
          adjustedPlant.indoorEnd = Math.max(0, adjustedPlant.indoorEnd + adjustments.indoorShift);
        }
        
        // Apply outdoor shift
        if (adjustments.outdoorShift) {
          adjustedPlant.outdoorStart = Math.max(0, adjustedPlant.outdoorStart + adjustments.outdoorShift);
          adjustedPlant.outdoorEnd = Math.max(0, adjustedPlant.outdoorEnd + adjustments.outdoorShift);
        }
        
        // Check for months to avoid in hot regions
        adjustedPlant.avoidMonths = adjustments.avoidMonths || [];
      }
    }
    
    // Cap months at 11 (December)
    if (adjustedPlant.indoorStart !== null) {
      adjustedPlant.indoorStart = Math.min(11, Math.max(0, adjustedPlant.indoorStart));
      adjustedPlant.indoorEnd = Math.min(11, Math.max(0, adjustedPlant.indoorEnd));
    }
    adjustedPlant.outdoorStart = Math.min(11, Math.max(0, adjustedPlant.outdoorStart));
    adjustedPlant.outdoorEnd = Math.min(11, Math.max(0, adjustedPlant.outdoorEnd));
    
    return adjustedPlant;
  };
  
  // Handle printing the calendar
  const handlePrintCalendar = () => {
    window.print();
  };
  
  // Filter selected plants by type
  const getFilteredPlants = () => {
    if (typeFilter === 'All') {
      return selectedPlants;
    }
    return selectedPlants.filter(plant => plant.type === typeFilter);
  };

  // Get special germination technique icons
  const getGerminationIcons = (plant) => {
    // Safe check with optional chaining for API plants that might not have germination data
    if (!plant?.germination?.specialTechniques?.length) {
      return null;
    }
    
    const icons = [];
    const techniques = plant.germination.specialTechniques;
    
    // Check if techniques is an array with includes method
    if (!Array.isArray(techniques)) {
      return null;
    }
    
    if (techniques.includes("Cold stratification")) {
      icons.push(<span key="cold" title="Needs cold stratification" className="germ-icon">❄️</span>);
    }
    
    if (techniques.includes("Light exposure needed")) {
      icons.push(<span key="light" title="Needs light to germinate" className="germ-icon">☀️</span>);
    }
    
    if (techniques.includes("Pre-soaking")) {
      icons.push(<span key="soak" title="Pre-soak seeds" className="germ-icon">💧</span>);
    }
    
    if (techniques.includes("Scarification")) {
      icons.push(<span key="scar" title="Scarify seed coat" className="germ-icon">✂️</span>);
    }
    
    if (techniques.includes("Bottom heat")) {
      icons.push(<span key="heat" title="Needs bottom heat" className="germ-icon">🔥</span>);
    }
    
    return icons;
  };
  
  // Germination Modal Component
  const GerminationDetailsModal = ({ plant, onClose }) => {
    if (!plant) return null;
    
    // Make sure germination data exists
    const germination = plant.germination || {
      soilTemp: { min: 55, max: 75, optimal: 65 },
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.25,
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Default germination instructions.",
      notes: "No specific germination data available for this plant."
    };
    
    return (
      <div className="modal-overlay">
        <div className="germination-modal" ref={modalRef}>
          <div className="modal-header">
            <h3>Germination Guide: {plant.name}</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-content">
            <div className="plant-overview">
              {plant.varieties && Array.isArray(plant.varieties) && plant.varieties.length > 0 && (
                <div className="plant-varieties">
                  <strong>Varieties:</strong> {plant.varieties.join(', ')}
                </div>
              )}
              
              {plant.family && (
                <div className="plant-family">
                  <strong>Plant Family:</strong> {plant.family} 
                  {plantFamilies && plantFamilies[plant.family] && (
                    <button 
                      className="info-link" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowFamilyInfo(plant.family);
                      }}
                    >
                      (View Family Info)
                    </button>
                  )}
                </div>
              )}
              
              <div className="difficulty-indicator">
                <strong>Difficulty:</strong> 
                <span className={`difficulty-badge ${plant.difficulty}`}>
                  {plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}
                </span>
              </div>
              
              {plant.seedViability && (
                <div className="seed-viability">
                  <strong>Seed Viability:</strong> {plant.seedViability.years} years
                  <span className="viability-notes">{plant.seedViability.notes}</span>
                </div>
              )}
            </div>
            
            <div className="germination-data">
              <div className="data-group">
                <h4>Optimal Conditions</h4>
                <div className="data-row">
                  <div className="data-item">
                    <span className="label">Soil Temperature:</span>
                    <span className="value">{germination.soilTemp.min}°F - {germination.soilTemp.max}°F</span>
                    <span className="optimal">(Optimal: {germination.soilTemp.optimal}°F)</span>
                  </div>
                  
                  <div className="data-item">
                    <span className="label">Germination Time:</span>
                    <span className="value">{germination.daysToGerminate.min}-{germination.daysToGerminate.max} days</span>
                  </div>
                  
                  <div className="data-item">
                    <span className="label">Seed Depth:</span>
                    <span className="value">{germination.seedDepth} inches</span>
                  </div>
                  
                  <div className="data-item">
                    <span className="label">Light Needed:</span>
                    <span className="value">{germination.lightNeeded ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
              
              {germination.specialTechniques && germination.specialTechniques.length > 0 && (
                <div className="data-group">
                  <h4>Special Techniques</h4>
                  <ul className="techniques-list">
                    {germination.specialTechniques.map((technique, index) => (
                      <li key={index}>{technique}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="data-group">
                <h4>Instructions</h4>
                <p className="instructions">{germination.instructions}</p>
                {germination.notes && (
                  <div className="notes">
                    <strong>Notes:</strong> {germination.notes}
                  </div>
                )}
              </div>
              
              <div className="data-group">
                  <h4>Growing & Harvest Cycle</h4>
                  <div className="data-row">
                    {plant.growingCycle ? (
                      <>
                        <div className="data-item">
                          <span className="label">Days to Maturity:</span>
                          <span className="value">{plant.growingCycle.daysToMaturity.min}-{plant.growingCycle.daysToMaturity.max} days</span>
                        </div>
                        
                        {plant.growingCycle.successionPlanting && (
                          <div className="data-item">
                            <span className="label">Succession Planting:</span>
                            <span className="value">Yes, every {plant.growingCycle.successionInterval.weeks} weeks</span>
                            <button 
                              className="btn btn-small btn-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                createSuccessionPlan(plant);
                              }}
                            >
                              Create Succession Plan
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="data-item">
                          <span className="label">Indoor Sowing:</span>
                          <span className="value">
                            {plant.indoorStart !== null ? `${months[plant.indoorStart]} - ${months[plant.indoorEnd]}` : 'Not recommended'}
                          </span>
                        </div>
                        <div className="data-item">
                          <span className="label">Outdoor Planting:</span>
                          <span className="value">
                            {`${months[plant.outdoorStart]} - ${months[plant.outdoorEnd]}`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Harvest Information */}
                {(plant.variety || plant.harvestInfo) && (
                  <div className="data-group harvest-info">
                    <h4>Harvest Information</h4>
                    
                    {plant.harvestInfo && (
                      <>
                        <div className="data-item">
                          <span className="label">When to Harvest:</span>
                          <span className="value">{plant.harvestInfo.indicators || plant.harvestInfo.instructions}</span>
                        </div>
                        
                        {plant.harvestInfo.timing && (
                          <div className="data-item">
                            <span className="label">Harvest Period:</span>
                            <span className="value">{plant.harvestInfo.timing.period || plant.harvestInfo.timing}</span>
                            {plant.harvestInfo.timing.duration && (
                              <span className="duration">, typically lasting {plant.harvestInfo.timing.duration}</span>
                            )}
                          </div>
                        )}
                        
                        {plant.harvestInfo.storage && (
                          <div className="data-item">
                            <span className="label">Storage:</span>
                            <span className="value">{plant.harvestInfo.storage}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {plant.specifics && plant.specifics.days && !plant.growingCycle && (
                      <div className="data-item">
                        <span className="label">Days to Maturity:</span>
                        <span className="value">{plant.specifics.days} days</span>
                      </div>
                    )}
                  </div>
                )}
              
              <div className="data-group">
                <h4>Research Sources</h4>
                <div className="data-source-info">
                  {plant.dataIntegration ? (
                    <>
                      <span className="confidence-rating">
                        Data Confidence: 
                        <span className={`confidence-tag ${plant.dataIntegration.confidenceRating}`}>
                          {plant.dataIntegration.confidenceRating}
                        </span>
                      </span>
                      <span className="source-count">Based on {plant.dataIntegration.sourceCount} sources</span>
                      <span className="primary-source">Primary: {plant.dataIntegration.primarySource}</span>
                      <span className="update-date">Last updated: {plant.dataIntegration.lastUpdated}</span>
                    </>
                  ) : (
                    <>
                      <span className="confidence-rating">
                        Data Confidence: 
                        <span className={`confidence-tag ${plant.germination?.confidence || 'high'}`}>
                          {plant.germination?.confidence || 'high'}
                        </span>
                      </span>
                      <span className="primary-source">Primary: {plant.source || 'Royal Horticultural Society'}</span>
                      <span className="source-count">Based on {plant.sources ? plant.sources.length : 3} horticultural sources</span>
                      <div className="source-list">
                        {plant.sources && plant.sources.map((source, index) => (
                          <div key={index} className="source-item">
                            • {source.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Plant Family Information Modal
  const FamilyInfoModal = ({ family, familyName, onClose }) => {
    if (!family) return null;
    
    return (
      <div className="modal-overlay">
        <div className="family-modal" ref={modalRef}>
          <div className="modal-header">
            <h3>Plant Family: {family.name} ({familyName})</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-content">
            <div className="family-data">
              <div className="data-group">
                <h4>Overview</h4>
                <p>{family.generalNotes}</p>
              </div>
              
              <div className="data-group">
                <h4>Common Germination Traits</h4>
                <p>{family.commonTraits}</p>
              </div>
              
              <div className="data-group">
                <h4>Common Pests</h4>
                <ul className="family-list">
                  {family.commonPests.map((pest, index) => (
                    <li key={index}>{pest}</li>
                  ))}
                </ul>
              </div>
              
              <div className="data-group">
                <h4>Companion Plants</h4>
                <ul className="family-list">
                  {family.companionPlants.map((plant, index) => (
                    <li key={index}>{plant}</li>
                  ))}
                </ul>
              </div>
              
              <div className="data-group">
                <h4>Plants to Avoid</h4>
                <ul className="family-list">
                  {family.avoidPlanting.map((plant, index) => (
                    <li key={index}>{plant}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Seed Viability Guide Modal
  const SeedViabilityGuideModal = ({ onClose }) => {
    return (
      <div className="modal-overlay">
        <div className="viability-modal" ref={modalRef}>
          <div className="modal-header">
            <h3>Seed Viability Guide</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-content">
            <p className="guide-intro">
              Seed viability refers to how long seeds can be stored while maintaining their ability to germinate.
              Proper storage in cool, dry conditions can significantly extend seed life.
            </p>
            
            <div className="viability-section">
              <h4 className="short-term">Short-Term Seeds (1 year)</h4>
              <div className="viability-grid">
                {seedViabilityGuide.shortTerm.map((item, index) => (
                  <div key={index} className="viability-item">
                    <span className="seed-type">{item.type}</span>
                    <span className="years">{item.years} {item.years === 1 ? 'year' : 'years'}</span>
                    <span className="notes">{item.notes}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="viability-section">
              <h4 className="medium-term">Medium-Term Seeds (2-4 years)</h4>
              <div className="viability-grid">
                {seedViabilityGuide.mediumTerm.map((item, index) => (
                  <div key={index} className="viability-item">
                    <span className="seed-type">{item.type}</span>
                    <span className="years">{item.years} {item.years === 1 ? 'year' : 'years'}</span>
                    <span className="notes">{item.notes}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="viability-section">
              <h4 className="long-term">Long-Term Seeds (5+ years)</h4>
              <div className="viability-grid">
                {seedViabilityGuide.longTerm.map((item, index) => (
                  <div key={index} className="viability-item">
                    <span className="seed-type">{item.type}</span>
                    <span className="years">{item.years} {item.years === 1 ? 'year' : 'years'}</span>
                    <span className="notes">{item.notes}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="storage-tips">
              <h4>Storage Tips</h4>
              <ul>
                <li>Store seeds in airtight containers in a cool, dry place</li>
                <li>Add a desiccant packet to absorb moisture</li>
                <li>Label containers with seed type and date</li>
                <li>Refrigeration can extend viability for many seeds</li>
                <li>Freezing works for some seeds but can damage others</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Succession Planner Modal
  const SuccessionPlannerModal = ({ plans, plant, onClose }) => {
    if (!plans || plans.length === 0) return null;
    
    return (
      <div className="modal-overlay">
        <div className="succession-modal" ref={modalRef}>
          <div className="modal-header">
            <h3>Succession Planting Plan: {plans[0].plantName}</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-content">
            <p className="succession-intro">
              Staggered planting schedule for continuous harvest. Based on your current date and 
              {plans[0].plantName}'s growing cycle.
            </p>
            
            <div className="succession-table">
              <table>
                <thead>
                  <tr>
                    <th>Planting</th>
                    <th>When to Plant</th>
                    <th>Earliest Harvest</th>
                    <th>Latest Harvest</th>
                    <th>Data Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr key={index}>
                      <td>#{plan.plantingNumber}</td>
                      <td>{plan.plantingDate.toLocaleDateString()}</td>
                      <td>{plan.harvestStartDate.toLocaleDateString()}</td>
                      <td>{plan.harvestEndDate.toLocaleDateString()}</td>
                      <td>{plan.isEstimated ? 
                        <span className="estimated-data" title="Based on typical values for this type of plant">Estimated</span> : 
                        <span className="verified-data" title="Based on verified growth data">Verified</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="succession-notes">
              <h4>Notes</h4>
              <ul>
                <li>Adjust dates based on your local conditions</li>
                <li>Weather can accelerate or delay harvest dates</li>
                <li>Consider your first and last frost dates</li>
                <li>For best results, prepare soil between plantings</li>
              </ul>
            </div>
            
            <div className="succession-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                  onClose();
                }}
              >
                Print This Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Find Your Planting Calendar</h2>
        </div>
        
        <form onSubmit={handleLocationSubmit}>
          <div className="form-group">
            <label htmlFor="country" className="form-label">Select Your Country</label>
            <select
              id="country"
              className="form-control"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ marginBottom: '15px' }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            
            <label htmlFor="postalCode" className="form-label">
              Enter Your {country === 'US' ? 'ZIP' : 'Postal'} Code 
              <span className="format-hint"> (Format: {getPostalCodeFormat()})</span>
            </label>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                id="postalCode"
                className="form-control"
                placeholder={`e.g., ${countries.find(c => c.code === country)?.postalFormat}`}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }}>
                Find Zone
              </button>
            </div>
          </div>
        </form>
        
        {loading && (
          <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #4CAF50', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', marginRight: '10px' }}></div>
            <p>Finding your growing zone...</p>
          </div>
        )}
        
        {zoneInfo && (
          <div className="zone-info" style={{ marginTop: '20px' }}>
            <h3>Your Growing Information</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p><strong>Zone System:</strong> {zoneInfo.zoneSystem}</p>
                <p><strong>Zone:</strong> {zoneInfo.zoneName}</p>
                <p><strong>Last Frost Date:</strong> {zoneInfo.lastFrostDate}</p>
                <p><strong>First Frost Date:</strong> {zoneInfo.firstFrostDate}</p>
                <p><strong>Growing Season:</strong> {zoneInfo.growingDays} days</p>
                <p className="data-source"><strong>Data Source:</strong> {dataSource}</p>
              </div>
              
              {showFrostAlert && (
                <div className="frost-alert">
                  <div className="alert-icon">❄️</div>
                  <h4>Frost Alert</h4>
                  <p>Potential frost in your area soon. Protect sensitive plants.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {showCalendar && (
        <div className="card">
          <div className="card-header">
            <h2>Select Plants for Your Calendar</h2>
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <label htmlFor="typeFilter" className="form-label">Filter by Type</label>
                <div className="filter-buttons">
                  {getPlantTypes().map(type => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`btn ${typeFilter === type ? 'btn-primary' : 'btn-outline'}`}
                      style={{ marginRight: '5px', marginBottom: '5px' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          
            <label htmlFor="plantInput" className="form-label">Add Plants to Your Calendar (Search by Name or Variety)</label>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                id="plantInput"
                className="form-control"
                placeholder="e.g., Roma Tomato, Buttercrunch Lettuce, Thai Basil"
                value={plantInput}
                onChange={(e) => setPlantInput(e.target.value)}
              />
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleAddPlant}
                style={{ marginLeft: '10px' }}
              >
                Add
              </button>
            </div>
            
            {/* Plant suggestions with variety highlights */}
            {plantInput.trim() !== '' && (
              <div className="plant-suggestions" style={{ marginTop: '10px' }}>
                {isLoading ? (
                  <p>Loading suggestions...</p>
                ) : suggestions.length > 0 ? (
                  suggestions.map(plant => {
                    // Check if this plant has variety information
                    // eslint-disable-next-line no-unused-vars
                    const hasVariety = plant.varieties && plant.varieties.length > 0;
                    const isVariety = plant.variety !== undefined;
                    
                    return (
                      <button
                        key={plant.id}
                        className={`btn ${isVariety ? 'btn-info' : 'btn-outline'}`}
                        style={{ margin: '0 5px 5px 0' }}
                        onClick={() => handleSuggestionClick(plant)}
                      >
                        {plant.name} ({plant.type})
                        {isVariety && (
                          <span className="variety-badge" style={{marginLeft: '3px', fontSize: '0.8em'}} title="Specific variety with detailed information">🌱</span>
                        )}
                        {/* Safely check for germination special techniques */}
                        {plant.germination?.specialTechniques?.length > 0 && (
                          <span className="special-indicator" title="Special germination requirements">*</span>
                        )}
                        {plant.days_to_maturity && (
                          <span className="maturity-info" style={{marginLeft: '3px', fontSize: '0.8em'}} title={`Days to maturity: ${plant.days_to_maturity.min || 0}-${plant.days_to_maturity.max || 0} days`}>
                            ({plant.days_to_maturity.min || '?'}-{plant.days_to_maturity.max || '?'}d)
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p>No matching plants found. Try a different search term.</p>
                )}
              </div>
            )}
          </div>
          
          {/* Selected plants */}
          <div className="selected-plants">
            <h4>Your Selected Plants:</h4>
            <div style={{ marginTop: '10px' }}>
              {selectedPlants.length === 0 ? (
                <p>No plants selected yet. Add some plants to see your planting calendar.</p>
              ) : (
                selectedPlants.map(plant => (
                  <div key={plant.id} className="plant-chip" data-type={plant.type.toLowerCase()}>
                    {plant.name}
                    <span className="plant-type">({plant.type})</span>
                    {getGerminationIcons(plant)}
                    <button
                      className="info-btn"
                      onClick={() => handleShowGerminationDetails(plant)}
                      title="View germination details"
                    >
                      ℹ️
                    </button>
                    <span 
                      className="remove-icon" 
                      onClick={() => handleRemovePlant(plant.id)}
                    >
                      ✕
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Calendar */}
          {selectedPlants.length > 0 && (
            <div className="planting-calendar" style={{ marginTop: '30px' }}>
              <div className="calendar-header-row">
                <h3>Your Planting Calendar</h3>
                <button 
                  className="btn btn-print"
                  onClick={handlePrintCalendar}
                >
                  🖨️ Print Calendar
                </button>
              </div>
              
              <div className="calendar-legend" style={{ margin: '15px 0', display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', marginBottom: '10px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#E3F2FD', marginRight: '5px', borderRadius: '3px' }}></div>
                  <span>Start indoors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', marginBottom: '10px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#DCEDC8', marginRight: '5px', borderRadius: '3px' }}></div>
                  <span>Direct sow/transplant outdoors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFF9C4', marginRight: '5px', borderRadius: '3px' }}></div>
                    <span>Harvest period</span>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FF69B4', marginRight: '5px', marginLeft: '10px', borderRadius: '3px' }}></div>
                    <span>Bloom period</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="legend-icon">ℹ️</span>
                  <span>Click for germination details</span>
                </div>
              </div>
              
              <div className="calendar-grid">
                {/* Header row */}
                <div className="calendar-header">Plant</div>
                {months.map((month, idx) => (
                  <div key={idx} className="calendar-header">{month}</div>
                ))}
                
                {/* Plant rows - filtered if necessary */}
                {getFilteredPlants().map(plant => {
                  const adjustedPlant = adjustDatesForZone(plant);
                  
                  return (
                    <div key={plant.id} className="calendar-row">
                      <div className="plant-name" onClick={() => handleShowGerminationDetails(plant)}>
                        <div className="plant-name-inner">
                          {plant.name}
                          {plant?.germination?.specialTechniques?.length > 0 && (
                            <div className="technique-indicators">
                              {getGerminationIcons(plant)}
                            </div>
                          )}
                        </div>
                        <div className="plant-type-indicator">
                          {plant.type}
                          <span className="difficulty-dot" data-difficulty={plant.difficulty || 'moderate'} title={`Difficulty: ${plant.difficulty || 'moderate'}`}></span>
                        </div>
                      </div>
                      
                      {months.map((_, idx) => {
                        const isIndoorMonth = adjustedPlant.indoorStart !== null && 
                          idx >= adjustedPlant.indoorStart && 
                          idx <= adjustedPlant.indoorEnd;
                          
                        // Check for spring planting season
                        const isSpringOutdoorMonth = idx >= adjustedPlant.outdoorStart && 
                          idx <= adjustedPlant.outdoorEnd;
                          
                        // Check for fall planting season if defined
                        const isFallOutdoorMonth = adjustedPlant.fall && 
                          idx >= adjustedPlant.fall.outdoorStart && 
                          idx <= adjustedPlant.fall.outdoorEnd;
                          
                        // Combine both seasons
                        let isOutdoorMonth = isSpringOutdoorMonth || isFallOutdoorMonth;
                        
                        // For UK and plants with directSowingNotRecommended, don't show direct sowing in cold regions
                        if (zoneInfo && zoneInfo.country === 'GB' && plant.directSowingNotRecommended && 
                            isIndoorMonth && isOutdoorMonth) {
                          // If a month is both indoor and outdoor, prioritize indoor for UK gardening
                          isOutdoorMonth = false;
                        }
                        
                        // Calculate harvest months based on planting date and days to maturity
                        const calculateHarvestMonths = () => {
                          // Get the planting month (either outdoor sowing or transplant date)
                          let plantingMonth = null;
                          
                          // Prioritize direct sowing date if available - with proper null checks
                          if ((plant.growing_calendar && plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.spring) || 
                              (adjustedPlant && adjustedPlant.direct_sow_spring) || 
                              (plant.direct_sow && plant.direct_sow.spring)) {
                            plantingMonth = adjustedPlant ? adjustedPlant.outdoorStart : null;
                          }
                          // Otherwise use transplant date
                          else if (plant.growing_calendar && plant.growing_calendar.transplant) {
                            // For transplants, use the last frost date + weeks after
                            const weeksAfter = plant.growing_calendar.transplant.weeks_after_last_frost || 2;
                            const lastFrostMonth = 4; // Default to May in Northern Hemisphere
                            plantingMonth = (lastFrostMonth + Math.floor(weeksAfter / 4)) % 12;
                          }
                          // Fall back to outdoor start if we have it
                          else if (adjustedPlant && adjustedPlant.outdoorStart !== null) {
                            plantingMonth = adjustedPlant.outdoorStart;
                          }
                          
                          // For plants with fall planting options, also consider fall planting
                          if (plantingMonth === null && (
                              (plant.growing_calendar && plant.growing_calendar.direct_sow && plant.growing_calendar.direct_sow.fall) || 
                              (adjustedPlant && adjustedPlant.fall && adjustedPlant.fall.outdoorStart !== undefined))) {
                            plantingMonth = (adjustedPlant && adjustedPlant.fall && adjustedPlant.fall.outdoorStart !== undefined) 
                              ? adjustedPlant.fall.outdoorStart 
                              : 7; // Default to August
                          }
                          
                          if (plantingMonth === null) return { harvestBegin: null, harvestEnd: null };
                          
                          // Get days to maturity from API data (days_to_maturity) or growingCycle if available, or use default
                          let daysToMaturity;
                          
                          if (plant.days_to_maturity) {
                            daysToMaturity = plant.days_to_maturity;
                          } else if (plant.growingCycle && plant.growingCycle.daysToMaturity) {
                            daysToMaturity = plant.growingCycle.daysToMaturity;
                          } else if (plant.specifics && plant.specifics.days) {
                            daysToMaturity = { min: plant.specifics.days - 10, max: plant.specifics.days + 10 };
                          } else {
                            daysToMaturity = { min: 60, max: 90 };
                          }
                          
                          // Calculate harvest start month (planting month + days to maturity in months)
                          const harvestBeginMonth = plantingMonth + Math.floor(daysToMaturity.min / 30);
                          
                          // Calculate harvest end month (planting month + max days to maturity in months)
                          const harvestEndMonth = plantingMonth + Math.ceil(daysToMaturity.max / 30);
                          
                          return { 
                            harvestBegin: harvestBeginMonth > 11 ? harvestBeginMonth - 12 : harvestBeginMonth,
                            harvestEnd: harvestEndMonth > 11 ? harvestEndMonth - 12 : harvestEndMonth
                          };
                        };
                        
                        const { harvestBegin, harvestEnd } = calculateHarvestMonths();
                        const isHarvestMonth = harvestBegin !== null && 
                                              idx >= harvestBegin && 
                                              idx <= harvestEnd;

                        // Hard-coded fix for sunflowers in UK to ensure they always show as indoor sow in March
                        let displayIndoorMonth = isIndoorMonth;
                        let displayOutdoorMonth = isOutdoorMonth;
                        
                        // Special case for sunflowers in UK
                        if (zoneInfo && zoneInfo.country === 'GB' && plant.name === 'Sunflower') {
                          // For March (month 2), force indoor sowing
                          if (idx === 2) {
                            displayIndoorMonth = true;
                            displayOutdoorMonth = false;
                          } else if (idx === 3) {
                            // For April (month 3), also force indoor sowing
                            displayIndoorMonth = true;
                            displayOutdoorMonth = false;
                          }
                        }
                        
                        const cellStyle = {
                          backgroundColor: displayIndoorMonth ? '#E3F2FD' : 
                                          displayOutdoorMonth ? '#DCEDC8' : 
                                          isHarvestMonth ? '#FFF9C4' : 'transparent',
                          borderRadius: '5px',
                          margin: '2px',
                          height: '40px',
                          position: 'relative'
                        };
                        
                        // If this is the month to do special treatments, add an indicator
                        const needsPrep = plant?.germination?.specialTechniques && 
                                        Array.isArray(plant.germination.specialTechniques) &&
                                        plant.germination.specialTechniques.includes("Cold stratification") && 
                                        adjustedPlant && 
                                        adjustedPlant.indoorStart !== null && 
                                        idx === adjustedPlant.indoorStart - 1;
                        
                        return (
                          <div key={idx} style={cellStyle}>
                            {needsPrep && <div className="prep-indicator" title="Prepare seeds this month">PREP</div>}
                            {isHarvestMonth && 
                          <div className="harvest-indicator" 
                              title={plant.type === 'Flower' ? "Bloom period" : "Harvest period"} 
                              style={{
                                position: 'absolute', 
                                bottom: '2px', 
                                right: '2px',
                                backgroundColor: plant.type === 'Flower' ? '#FF69B4' : '#FFF9C4',
                                color: plant.type === 'Flower' ? 'white' : 'black',
                                padding: '1px 3px',
                                fontSize: '8px',
                                borderRadius: '3px'
                              }}>
                            {plant.type === 'Flower' ? 'BLOOM' : 'HARVEST'}
                          </div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              
              <div className="data-citation">
                <p><strong>Data Sources:</strong> Plant dates information provided by various agricultural extension services, 
                botanical gardens, and horticultural societies. Local adjustments based on {zoneInfo.zoneSystem} zones and frost dates.</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Top Toolbar with Advanced Features */}
      {showCalendar && (
        <div className="advanced-tools">
          <div className="tool-buttons">
            <button 
              className="btn btn-tool"
              onClick={() => setShowViabilityGuide(true)}
              title="View seed viability information"
            >
              Seed Viability Guide
            </button>
            
            <button 
              className="btn btn-tool"
              onClick={toggleHemisphere}
              title="Toggle between Northern and Southern hemispheres"
            >
              {hemisphere === 'northern' ? 'Northern' : 'Southern'} Hemisphere
            </button>
            
            <button 
              className="btn btn-tool" 
              onClick={() => setShowInventoryModal(true)}
              title="Manage your seed inventory"
            >
              Seed Inventory
            </button>
            
            <div className="subscription-indicator">
              <span className={`tier-badge ${subscriptionTier}`}>
                {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
              </span>
              <span className="plant-limit">
                {selectedPlants.length}/{plantLimit} Plants
              </span>
              {subscriptionTier !== 'market' && (
                <button 
                  className="btn btn-upgrade" 
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showGerminationModal && (
        <GerminationDetailsModal 
          plant={selectedPlantDetails} 
          onClose={() => setShowGerminationModal(false)} 
        />
      )}
      
      {showFamilyInfoModal && (
        <FamilyInfoModal 
          family={selectedFamily}
          familyName={selectedPlantDetails?.family}
          onClose={() => setShowFamilyInfoModal(false)} 
        />
      )}
      
      {showViabilityGuide && (
        <SeedViabilityGuideModal 
          onClose={() => setShowViabilityGuide(false)} 
        />
      )}
      
      {showSuccessionPlanner && (
        <SuccessionPlannerModal 
          plans={successionPlans}
          plant={selectedPlantDetails}
          advancedMode={advancedSuccessionMode}
          onToggleAdvancedMode={() => setAdvancedSuccessionMode(!advancedSuccessionMode)}
          onClose={() => setShowSuccessionPlanner(false)} 
          subscriptionTier={subscriptionTier}
        />
      )}
      
      {showInventoryModal && (
        <SeedInventoryModal
          inventory={seedInventory}
          onUpdateInventory={setSeedInventory}
          onClose={() => setShowInventoryModal(false)}
          subscriptionTier={subscriptionTier}
        />
      )}
      
      {showUpgradeModal && (
        <SubscriptionModal 
          currentTier={subscriptionTier}
          onChangeTier={setSubscriptionTier}
          onClose={() => setShowUpgradeModal(false)}
          onUpdatePlantLimit={setPlantLimit}
        />
      )}
    </div>
  );
};

// New Component: Seed Inventory Modal
const SeedInventoryModal = ({ inventory, onUpdateInventory, onClose, subscriptionTier }) => {
  const [newSeed, setNewSeed] = useState({ name: '', variety: '', purchaseDate: '', expiryDate: '', quantity: 1, notes: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate maximum inventory items based on subscription
  const getMaxInventoryItems = () => {
    switch(subscriptionTier) {
      case 'market': return Infinity;
      case 'pro': return 100;
      case 'starter': return 25;
      default: return 5;
    }
  };
  
  const handleAddSeed = () => {
    if (inventory.length >= getMaxInventoryItems()) {
      alert(`Your ${subscriptionTier} plan allows up to ${getMaxInventoryItems()} inventory items. Please upgrade to add more.`);
      return;
    }
    
    if (!newSeed.name) return;
    
    const today = new Date();
    const purchaseDate = newSeed.purchaseDate || today.toISOString().split('T')[0];
    
    // Calculate expiry date if not provided (default 2 years from purchase)
    let expiryDate = newSeed.expiryDate;
    if (!expiryDate) {
      const twoYearsFromPurchase = new Date(purchaseDate);
      twoYearsFromPurchase.setFullYear(twoYearsFromPurchase.getFullYear() + 2);
      expiryDate = twoYearsFromPurchase.toISOString().split('T')[0];
    }
    
    onUpdateInventory([
      ...inventory,
      {
        id: Date.now(),
        ...newSeed,
        purchaseDate,
        expiryDate
      }
    ]);
    
    setNewSeed({ name: '', variety: '', purchaseDate: '', expiryDate: '', quantity: 1, notes: '' });
  };
  
  const handleRemoveSeed = (id) => {
    onUpdateInventory(inventory.filter(seed => seed.id !== id));
  };
  
  // Filter inventory based on search term
  const filteredInventory = inventory.filter(seed => 
    seed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seed.variety.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="modal-overlay">
      <div className="inventory-modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h3>Seed Inventory Management</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <div className="inventory-stats">
            <p><strong>{inventory.length}</strong> of <strong>{getMaxInventoryItems()}</strong> inventory slots used</p>
            {subscriptionTier !== 'market' && (
              <p className="upgrade-prompt">
                Need more? <button className="btn-link" onClick={() => alert('Upgrade feature')}>Upgrade your plan</button>
              </p>
            )}
          </div>
          
          <div className="inventory-search" style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Search your inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>
          
          <div className="inventory-add-form" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <input
              type="text"
              placeholder="Seed Name"
              value={newSeed.name}
              onChange={(e) => setNewSeed({...newSeed, name: e.target.value})}
              className="form-control"
              style={{ flex: '1 1 200px' }}
            />
            <input
              type="text"
              placeholder="Variety"
              value={newSeed.variety}
              onChange={(e) => setNewSeed({...newSeed, variety: e.target.value})}
              className="form-control"
              style={{ flex: '1 1 200px' }}
            />
            <div style={{ flex: '1 1 150px' }}>
              <label>Purchase Date</label>
              <input
                type="date"
                value={newSeed.purchaseDate}
                onChange={(e) => setNewSeed({...newSeed, purchaseDate: e.target.value})}
                className="form-control"
              />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={newSeed.quantity}
                onChange={(e) => setNewSeed({...newSeed, quantity: e.target.value})}
                className="form-control"
              />
            </div>
            <button 
              onClick={handleAddSeed}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', flex: '0 1 auto' }}
            >
              Add to Inventory
            </button>
          </div>
          
          {filteredInventory.length > 0 ? (
            <div className="inventory-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Seed</th>
                    <th>Variety</th>
                    <th>Purchase Date</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map(seed => (
                    <tr key={seed.id}>
                      <td>{seed.name}</td>
                      <td>{seed.variety}</td>
                      <td>{seed.purchaseDate}</td>
                      <td>{seed.expiryDate}</td>
                      <td>{seed.quantity}</td>
                      <td>
                        <button 
                          onClick={() => handleRemoveSeed(seed.id)}
                          className="btn btn-danger"
                          style={{ padding: '2px 8px' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-inventory" style={{ textAlign: 'center', padding: '30px' }}>
              <p>No seeds in your inventory yet!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// New Component: Subscription Modal
const SubscriptionModal = ({ currentTier, onChangeTier, onUpdatePlantLimit, onClose }) => {
  const plans = [
    { 
      id: 'free', 
      name: 'Free', 
      price: 0, 
      plantLimit: 10,
      features: [
        'Basic planting calendar',
        '10 plants limit',
        '5 seed inventory items',
        'Standard succession planning'
      ] 
    },
    { 
      id: 'starter', 
      name: 'Starter', 
      price: 5, 
      plantLimit: 50,
      features: [
        'All Free features',
        '50 plants limit',
        '25 seed inventory items',
        'Basic PDF export',
        'Standard succession planning'
      ] 
    },
    { 
      id: 'pro', 
      name: 'Garden Pro', 
      price: 10, 
      plantLimit: 200,
      features: [
        'All Starter features',
        'Unlimited plants',
        '100 seed inventory items',
        'Advanced succession planning',
        'Companion planting guide',
        'Premium PDF exports'
      ] 
    },
    { 
      id: 'market', 
      name: 'Market Garden', 
      price: 20, 
      plantLimit: Infinity,
      features: [
        'All Garden Pro features',
        'Unlimited plants & inventory',
        'Commercial grower features',
        'Advanced succession planning',
        'Bulk planting calculations',
        'Priority support'
      ] 
    }
  ];
  
  const handleSelectPlan = (planId) => {
    onChangeTier(planId);
    
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (selectedPlan) {
      onUpdatePlantLimit(selectedPlan.plantLimit);
    }
    
    // In a real app, here you'd redirect to payment gateway for paid plans
    if (planId !== 'free') {
      alert(`This would connect to a payment system for the ${planId} plan in a real application.`);
    }
    
    onClose();
  };
  
  return (
    <div className="modal-overlay">
      <div className="subscription-modal">
        <div className="modal-header">
          <h3>Choose Your Plan</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <div className="plan-cards" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {plans.map(plan => (
              <div 
                key={plan.id} 
                className={`plan-card ${currentTier === plan.id ? 'current-plan' : ''}`}
                style={{ 
                  flex: '1 1 200px', 
                  maxWidth: '250px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: currentTier === plan.id ? '#f0f7ff' : 'white',
                  borderColor: currentTier === plan.id ? '#4a90e2' : '#ddd'
                }}
              >
                <h4 style={{ marginTop: 0 }}>{plan.name}</h4>
                <div className="plan-price" style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                  ${plan.price}<span style={{ fontSize: '14px', fontWeight: 'normal' }}>/month</span>
                </div>
                
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                
                {currentTier === plan.id ? (
                  <button 
                    className="btn btn-outline" 
                    disabled
                    style={{ width: '100%' }}
                  >
                    Current Plan
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleSelectPlan(plan.id)}
                    style={{ width: '100%' }}
                  >
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'} to {plan.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Succession Planner Modal with advanced features
const SuccessionPlannerModal = ({ plans, plant, onClose, advancedMode, onToggleAdvancedMode, subscriptionTier }) => {
  const [customInterval, setCustomInterval] = useState(14); // Default 2 weeks
  const [customPlantings, setCustomPlantings] = useState(3);
  const [adjustForWeather, setAdjustForWeather] = useState(false);
  const [generatePDF, setGeneratePDF] = useState(false);
  
  // Only allow advanced features for paid tiers
  const canUseAdvancedFeatures = subscriptionTier !== 'free';
  
  const handleGenerateCustomPlan = () => {
    if (!canUseAdvancedFeatures) {
      alert("Please upgrade to use advanced succession planning features");
      return;
    }
    
    // In a real implementation, this would recalculate the succession plan
    // based on custom intervals and other settings
    alert("Custom succession planning would be implemented here");
  };
  
  return (
    <div className="modal-overlay">
      <div className="succession-modal" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h3>Succession Planting Plan: {plant?.name}</h3>
          {canUseAdvancedFeatures && (
            <div className="mode-toggle" style={{ marginLeft: '15px' }}>
              <button 
                className={`btn ${advancedMode ? 'btn-primary' : 'btn-outline'}`}
                onClick={onToggleAdvancedMode}
              >
                Advanced Mode
              </button>
            </div>
          )}
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <p className="succession-intro">
            Staggered planting schedule for continuous harvest. Based on your current date and 
            {plans[0]?.plantName}'s growing cycle.
          </p>
          
          {advancedMode && canUseAdvancedFeatures && (
            <div className="advanced-controls" style={{ 
              margin: '15px 0', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '5px' 
            }}>
              <h4 style={{ marginTop: 0 }}>Customize Succession Plan</h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label>Days Between Plantings</label>
                  <input 
                    type="range" 
                    min="7" 
                    max="28" 
                    value={customInterval} 
                    onChange={(e) => setCustomInterval(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>7 days</span>
                    <span>{customInterval} days</span>
                    <span>28 days</span>
                  </div>
                </div>
                
                <div style={{ flex: '1 1 200px' }}>
                  <label>Number of Plantings</label>
                  <input 
                    type="range" 
                    min="2" 
                    max="10" 
                    value={customPlantings} 
                    onChange={(e) => setCustomPlantings(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2</span>
                    <span>{customPlantings}</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                  <input 
                    type="checkbox" 
                    checked={adjustForWeather} 
                    onChange={() => setAdjustForWeather(!adjustForWeather)}
                    style={{ marginRight: '5px' }}
                  />
                  Adjust for weather patterns
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={generatePDF} 
                    onChange={() => setGeneratePDF(!generatePDF)}
                    style={{ marginRight: '5px' }}
                  />
                  Generate detailed PDF
                </label>
              </div>
              
              <button
                className="btn btn-primary"
                onClick={handleGenerateCustomPlan}
              >
                Generate Custom Plan
              </button>
            </div>
          )}
          
          <div className="succession-table">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Planting #</th>
                  <th>When to Plant</th>
                  <th>Earliest Harvest</th>
                  <th>Latest Harvest</th>
                  <th>Data Quality</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr key={index}>
                    <td>#{plan.plantingNumber}</td>
                    <td>{plan.plantingDate.toLocaleDateString()}</td>
                    <td>{plan.harvestStartDate.toLocaleDateString()}</td>
                    <td>{plan.harvestEndDate.toLocaleDateString()}</td>
                    <td>{plan.isEstimated ? 
                      <span className="estimated-data" title="Based on typical values for this type of plant">Estimated</span> : 
                      <span className="verified-data" title="Based on verified growth data">Verified</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="succession-notes">
            <h4>Notes</h4>
            <ul>
              <li>Adjust dates based on your local conditions</li>
              <li>Weather can accelerate or delay harvest dates</li>
              <li>Consider your first and last frost dates</li>
              <li>For best results, prepare soil between plantings</li>
            </ul>
          </div>
          
          <div className="succession-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                window.print();
                onClose();
              }}
            >
              Print This Plan
            </button>
            
            {!canUseAdvancedFeatures && (
              <div className="upgrade-prompt" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Want advanced succession planning?</span>
                <button 
                  className="btn btn-upgrade"
                  onClick={() => alert("This would open the upgrade modal")}
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantingCalendar;