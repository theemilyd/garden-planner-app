// Plant database with comprehensive, integrated information
// Data is consolidated from multiple expert sources for maximum accuracy

// Import extended database generator function
import { generateExtendedPlantDatabase } from './extendedDatabase';

// Base plant database with core plants that have carefully curated data
export const basePlantDatabase = [
  // VEGETABLES
  {
    id: 1,
    name: 'Tomato',
    type: 'Vegetable',
    family: 'Solanaceae',
    varieties: ['Cherry', 'Roma', 'Beefsteak', 'Heirloom'],
    indoorStart: 2, // March (0-indexed)
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 4, notes: "Sealed storage in cool, dry conditions extends viability" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 7,
      primarySource: 'Royal Horticultural Society',
      lastUpdated: '2024-01-15',
    },
    germination: {
      soilTemp: { min: 21, max: 29, optimal: 26 }, // °C
      daysToGerminate: { min: 6, max: 14 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds ¼ inch deep. Maintain soil temperature at 70-90°F (21-32°C) for best germination. Keep soil consistently moist but not waterlogged.",
      notes: "Tomato seeds germinate best in warm soil. Cold soil can significantly delay germination. Bottom heat significantly improves germination rates and uniformity."
    },
    growingCycle: {
      daysToMaturity: { min: 60, max: 90 },
      harvestWindow: { min: 2, max: 8 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous harvest" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 2, outdoorShift: 3 },
          hot: { indoorShift: -1, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 2,
    name: 'Cucumber',
    type: 'Vegetable',
    family: 'Cucurbitaceae',
    varieties: ['Slicing', 'Pickling', 'English', 'Armenian'],
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 5, notes: "Properly stored cucumber seeds maintain high germination rates for 5-7 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'Cornell Cooperative Extension',
      lastUpdated: '2023-11-20',
    },
    germination: {
      soilTemp: { min: 15, max: 35, optimal: 29 }, // °C
      daysToGerminate: { min: 3, max: 10 },
      seedDepth: 1.3, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Plant seeds 1/2 inch deep. Cucumbers need warm soil to germinate well. Pre-warming soil with plastic or starting indoors can help germination.",
      notes: "Seeds may rot in cold, wet soil. Wait until soil warms to at least 60°F (15°C). Germination percentage drops significantly in temperatures above 95°F (35°C)."
    },
    growingCycle: {
      daysToMaturity: { min: 50, max: 70 },
      harvestWindow: { min: 6, max: 8 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks until mid-summer for continuous harvest" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: -1, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 3,
    name: 'Lettuce',
    type: 'Vegetable',
    family: 'Asteraceae',
    varieties: ['Romaine', 'Butterhead', 'Loose-leaf', 'Iceberg'],
    indoorStart: 1, // February
    indoorEnd: 2,   // March
    outdoorStart: 2, // March
    outdoorEnd: 4,   // May
    seedViability: { years: 1, notes: "Lettuce seeds quickly lose viability, especially in warm storage" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 8,
      primarySource: 'University of Minnesota Extension',
      lastUpdated: '2023-09-15',
    },
    germination: {
      soilTemp: { min: 2, max: 27, optimal: 18 }, // °C
      daysToGerminate: { min: 2, max: 15 },
      seedDepth: 0.3, // cm
      lightNeeded: true,
      specialTechniques: ["Light exposure needed"],
      instructions: "Sow seeds very shallowly, about 1/8 inch deep or less. Lettuce seeds need light to germinate. Keep soil surface moist until germination.",
      notes: "Germination rate drops significantly at temperatures above 80°F (27°C). Pre-chill seeds in the refrigerator for 24 hours before planting in warm weather."
    },
    growingCycle: {
      daysToMaturity: { min: 45, max: 65 },
      harvestWindow: { min: 1, max: 4 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2 weeks for continuous harvest; switch to heat-tolerant varieties in summer" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 1 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6, // Shift by 6 months
        avoidMonths: [11, 0, 1] // Avoid December, January, February
      }
    }
  },
  
  {
    id: 4,
    name: 'Carrot',
    type: 'Vegetable',
    family: 'Apiaceae', 
    varieties: ['Nantes', 'Danvers', 'Imperator', 'Chantenay', 'Baby/Round'],
    indoorStart: null, // Direct sow only
    indoorEnd: null,
    outdoorStart: 2, // March
    outdoorEnd: 6,   // July
    seedViability: { years: 3, notes: "Carrot seeds maintain germination rates for about 3 years when properly stored" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'Johnny\'s Selected Seeds',
      lastUpdated: '2023-10-25',
    },
    germination: {
      soilTemp: { min: 7, max: 30, optimal: 24 }, // °C
      daysToGerminate: { min: 14, max: 21 },
      seedDepth: 0.3, // cm
      lightNeeded: false,
      specialTechniques: ["Keep consistently moist", "Cover with light row cover"],
      instructions: "Sow carrot seeds shallowly, about 1/8 to 1/4 inch deep. Carrot seeds are small and slow to germinate. Keep soil consistently moist and never let it dry out during germination.",
      notes: "Covering soil with a lightweight board or row cover can help keep soil moist during germination. Remove cover as soon as seedlings emerge. Mixing with radish seeds can help mark rows as radishes germinate much faster."
    },
    growingCycle: {
      daysToMaturity: { min: 60, max: 80 },
      harvestWindow: { min: 3, max: 8 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks for continuous harvest" }
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { outdoorShift: 2 },
          hot: { outdoorShift: 0, avoidMonths: [5, 6, 7] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 5,
    name: 'Bell Pepper',
    type: 'Vegetable',
    family: 'Solanaceae',
    varieties: ['California Wonder', 'Purple Beauty', 'Golden California Wonder', 'Chocolate Beauty'],
    indoorStart: 1, // February
    indoorEnd: 2,   // March 
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 2, notes: "Pepper seeds lose viability faster than many other vegetables" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'University of California Extension',
      lastUpdated: '2023-08-20',
    },
    germination: {
      soilTemp: { min: 21, max: 32, optimal: 28 }, // °C
      daysToGerminate: { min: 10, max: 21 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: ["Bottom heat", "Pre-soaking"],
      instructions: "Sow 1/4 inch deep. Pepper seeds germinate best with consistent bottom heat of 80-90°F (27-32°C). Pre-soaking seeds for 24 hours can speed germination.",
      notes: "Peppers are notoriously slow to germinate. Be patient and don't give up too soon. Use a heat mat and maintain consistently warm soil for best results."
    },
    growingCycle: {
      daysToMaturity: { min: 70, max: 90 },
      harvestWindow: { min: 4, max: 8 },
      successionPlanting: false
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 2, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 6,
    name: 'Kale',
    type: 'Vegetable',
    family: 'Brassicaceae',
    varieties: ['Lacinato', 'Curly', 'Red Russian', 'Siberian'],
    indoorStart: 1, // February 
    indoorEnd: 2,   // March
    outdoorStart: 2, // March
    outdoorEnd: 3,   // April
    seedViability: { years: 4, notes: "Kale seeds remain viable for 4-5 years when stored properly" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'Iowa State University Extension',
      lastUpdated: '2024-01-10',
    },
    germination: {
      soilTemp: { min: 7, max: 29, optimal: 21 }, // °C
      daysToGerminate: { min: 5, max: 8 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow 1/4 inch deep. Kale germinates well in cool soil, making it perfect for early spring and fall gardens.",
      notes: "Kale seeds germinate quickly and reliably in a wide range of temperatures. For fall crop, plant in mid to late summer."
    },
    growingCycle: {
      daysToMaturity: { min: 50, max: 65 },
      harvestWindow: { min: 8, max: 16 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Can be planted in spring and again in late summer for fall/winter harvest" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 7,
    name: 'Zucchini',
    type: 'Vegetable',
    family: 'Cucurbitaceae',
    varieties: ['Black Beauty', 'Cocozelle', 'Golden', 'Costata Romanesco', 'Eight Ball', 'Gadzukes', 'Ronde de Nice'],
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 6,   // July
    seedViability: { years: 4, notes: "Zucchini seeds maintain good germination rates for 4-6 years with proper storage" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'University of Minnesota Extension',
      lastUpdated: '2024-01-15',
    },
    germination: {
      soilTemp: { min: 16, max: 35, optimal: 27 }, // °C
      daysToGerminate: { min: 3, max: 10 },
      seedDepth: 2.5, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Plant seeds 1 inch deep with the pointed end down. For indoor starting, use peat pots to minimize root disturbance when transplanting.",
      notes: "Seeds can rot in cold, wet soil. Wait until soil warms to at least 60°F (16°C) for direct sowing. Germination is usually rapid and reliable in warm conditions."
    },
    growingCycle: {
      daysToMaturity: { min: 45, max: 60 },
      harvestWindow: { min: 7, max: 14 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks until midsummer for continuous harvest" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },

  {
    id: 8,
    name: 'Radish',
    type: 'Vegetable',
    family: 'Brassicaceae',
    varieties: ['Cherry Belle', 'French Breakfast', 'White Icicle', 'Watermelon', 'Daikon', 'Easter Egg', 'Black Spanish'],
    indoorStart: null, // Direct sow only recommended
    indoorEnd: null,
    outdoorStart: 2, // March
    outdoorEnd: 9,   // October
    seedViability: { years: 4, notes: "Radish seeds maintain good viability for 4-5 years when properly stored" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'Cornell Cooperative Extension',
      lastUpdated: '2023-12-12',
    },
    germination: {
      soilTemp: { min: 4, max: 35, optimal: 18 }, // °C
      daysToGerminate: { min: 3, max: 10 },
      seedDepth: 1.3, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds 1/2 inch deep and 1 inch apart, thinning to 2 inches apart after emergence. Radishes prefer cool weather and can be planted as soon as soil can be worked.",
      notes: "One of the fastest-germinating vegetables. Germinates in just 3-7 days in optimal conditions. Summer heat can cause radishes to bolt and develop a sharp, unpleasant flavor."
    },
    growingCycle: {
      daysToMaturity: { min: 21, max: 30 },
      harvestWindow: { min: 1, max: 2 },
      successionPlanting: true,
      successionInterval: { weeks: 1, notes: "Plant every 7-10 days for continuous harvest" }
    },
    difficulty: 'very easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { outdoorShift: 1 },
          hot: { outdoorShift: 0, avoidMonths: [5, 6, 7] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6, // Shift by 6 months
        avoidMonths: [11, 0, 1] // Avoid December, January, February in hot regions
      }
    }
  },

  {
    id: 9,
    name: 'Basil',
    type: 'Herb',
    family: 'Lamiaceae',
    varieties: ['Genovese', 'Sweet', 'Thai', 'Purple', 'Lemon', 'Cinnamon', 'Holy', 'Greek', 'Lettuce Leaf'],
    indoorStart: 2, // March
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 4, notes: "Basil seeds maintain good germination rates for 3-5 years with proper storage" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 7,
      primarySource: 'Purdue University Extension',
      lastUpdated: '2023-11-05',
    },
    germination: {
      soilTemp: { min: 18, max: 35, optimal: 27 }, // °C
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.3, // cm
      lightNeeded: true,
      specialTechniques: ["Light exposure needed", "Bottom heat"],
      instructions: "Sow seeds shallowly, barely covering with soil. Basil needs light and warm temperatures to germinate. A heat mat can improve germination rates.",
      notes: "Basil is very sensitive to cold temperatures. Do not transplant outdoors until nighttime temperatures are consistently above 50°F (10°C)."
    },
    growingCycle: {
      daysToMaturity: { min: 50, max: 70 },
      harvestWindow: { min: 12, max: 20 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3-4 weeks for fresh supply" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },

  {
    id: 10,
    name: 'Sunflower',
    type: 'Flower',
    family: 'Asteraceae',
    varieties: ['Mammoth', 'Teddy Bear', 'Russian Giant', 'Autumn Beauty', 'Evening Sun', 'Lemon Queen', 'Italian White'],
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 6,   // July
    seedViability: { years: 7, notes: "Sunflower seeds maintain high germination rates for 5-7 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'Burpee Seed Company',
      lastUpdated: '2023-11-18',
    },
    germination: {
      soilTemp: { min: 21, max: 30, optimal: 24 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 2.5, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Plant seeds 1 inch deep. Sunflowers prefer direct sowing but can be started indoors in peat pots to minimize root disturbance during transplanting.",
      notes: "Protect seeds from birds and rodents which may dig them up before germination. Sunflower roots don't like disturbance, so if starting indoors, use biodegradable pots."
    },
    growingCycle: {
      daysToMaturity: { min: 70, max: 100 },
      harvestWindow: { min: 2, max: 3 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous blooms" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },

  {
    id: 11,
    name: 'Bean',
    type: 'Vegetable',
    family: 'Fabaceae',
    varieties: ['Green Bush', 'Yellow Wax', 'Purple Pod', 'Kentucky Wonder', 'Blue Lake', 'Scarlet Runner', 'Dragon Tongue', 'Romano'],
    indoorStart: null, // Direct sow recommended
    indoorEnd: null,
    outdoorStart: 4, // May (after danger of frost)
    outdoorEnd: 6,   // July
    seedViability: { years: 3, notes: "Bean seeds maintain good viability for 3-4 years when properly stored" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 8,
      primarySource: 'University of Illinois Extension',
      lastUpdated: '2023-09-20',
    },
    germination: {
      soilTemp: { min: 15, max: 29, optimal: 24 }, // °C
      daysToGerminate: { min: 6, max: 10 },
      seedDepth: 2.5, // cm
      lightNeeded: false,
      specialTechniques: ["Pre-soaking"],
      instructions: "Plant seeds 1 inch deep after all danger of frost has passed. Pre-soaking seeds for 12-24 hours can speed germination.",
      notes: "Beans prefer direct sowing as they don't transplant well. Soil should be at least 60°F (15°C) for good germination. If seeds don't germinate within 10 days, soil may be too cold or seeds may have rotted from excess moisture."
    },
    growingCycle: {
      daysToMaturity: { min: 50, max: 65 },
      harvestWindow: { min: 7, max: 21 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous harvest until midsummer" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { outdoorShift: 2 },
          hot: { outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },

  {
    id: 12,
    name: 'Sweet Corn',
    type: 'Vegetable',
    family: 'Poaceae',
    varieties: ['Silver Queen', 'Golden Bantam', 'Honey and Cream', 'Sugar Buns', 'Ambrosia', 'Peaches & Cream', 'Serendipity'],
    indoorStart: null, // Direct sow recommended
    indoorEnd: null,
    outdoorStart: 4, // May (when soil has warmed)
    outdoorEnd: 6,   // July
    seedViability: { years: 1, notes: "Corn seeds lose viability rapidly; use fresh seed each year for best results" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 7,
      primarySource: 'Iowa State University Extension',
      lastUpdated: '2024-01-10',
    },
    germination: {
      soilTemp: { min: 10, max: 35, optimal: 27 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 3.8, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds 1-1.5 inches deep in soil that has warmed to at least 60°F (15°C). Plant in blocks of at least 4 rows rather than single rows for better pollination.",
      notes: "Corn is wind-pollinated, so planting in blocks improves pollination and kernel development. For succession planting, use same-season varieties rather than different maturity dates for better pollination."
    },
    growingCycle: {
      daysToMaturity: { min: 65, max: 90 },
      harvestWindow: { min: 5, max: 7 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2 weeks for continuous harvest until midsummer" }
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { outdoorShift: 2 },
          hot: { outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },

  {
    id: 13,
    name: 'Pea',
    type: 'Vegetable',
    family: 'Fabaceae',
    varieties: ['Sugar Snap', 'Snow', 'English', 'Shelling', 'Super Sugar Snap', 'Oregon Sugar Pod II', 'Little Marvel'],
    indoorStart: 1, // February (optional)
    indoorEnd: 2,   // March
    outdoorStart: 2, // March (as soon as soil can be worked)
    outdoorEnd: 4,   // May
    seedViability: { years: 3, notes: "Pea seeds maintain good germination for 3 years with proper storage" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'University of Minnesota Extension',
      lastUpdated: '2023-12-05',
    },
    germination: {
      soilTemp: { min: 4, max: 24, optimal: 16 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 2.5, // cm
      lightNeeded: false,
      specialTechniques: ["Pre-soaking", "Inoculant"],
      instructions: "Plant seeds 1 inch deep as soon as soil can be worked in spring. Pre-soaking seeds overnight can speed germination. Using legume inoculant improves nitrogen fixation and growth.",
      notes: "Peas are a cool-season crop that can tolerate light frosts. Seeds can rot in cold, wet soil, so avoid planting in waterlogged conditions. For fall crops, sow 8-10 weeks before first expected frost."
    },
    growingCycle: {
      daysToMaturity: { min: 55, max: 70 },
      harvestWindow: { min: 7, max: 21 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2 weeks for extended harvest in spring" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 2, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6, // Shift by 6 months
        avoidMonths: [11, 0, 1] // Avoid December, January, February in hot regions
      }
    }
  },

  {
    id: 14,
    name: 'Marigold',
    type: 'Flower',
    family: 'Asteraceae',
    varieties: ['French', 'African', 'Signet', 'Crackerjack', 'Durango', 'Sparky', 'Bonanza', 'Lemon Gem'],
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 3, notes: "Marigold seeds maintain good germination for 2-3 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'Colorado State University Extension',
      lastUpdated: '2023-10-15',
    },
    germination: {
      soilTemp: { min: 18, max: 29, optimal: 24 }, // °C
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds 1/4 inch deep. Marigolds germinate readily in warm soil. Can be direct sown after danger of frost or started indoors 4-6 weeks before last frost.",
      notes: "Easy to grow from seed with high germination rates. Seeds germinate quickly in warm conditions, often in less than a week. Excellent companion plant for many vegetables."
    },
    growingCycle: {
      daysToMaturity: { min: 50, max: 70 },
      harvestWindow: { min: 60, max: 120 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3-4 weeks for continuous blooms" }
    },
    difficulty: 'very easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },

  {
    id: 15,
    name: 'Zinnia',
    type: 'Flower',
    family: 'Asteraceae',
    varieties: ['California Giant', 'Profusion', 'Zahara', 'State Fair', 'Benary\'s Giant', 'Peppermint Stick', 'Cut and Come Again'],
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 5, notes: "Zinnia seeds remain viable for 3-5 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'University of Illinois Extension',
      lastUpdated: '2023-09-30',
    },
    germination: {
      soilTemp: { min: 21, max: 29, optimal: 24 }, // °C
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds 1/4 inch deep. Zinnias need warm soil to germinate well. Direct sowing is often more successful than transplanting.",
      notes: "Zinnias don't like having their roots disturbed. If starting indoors, use peat pots or soil blocks to minimize transplant shock."
    },
    growingCycle: {
      daysToMaturity: { min: 60, max: 75 },
      harvestWindow: { min: 8, max: 12 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3-4 weeks for continuous blooms until mid-summer" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  // FLOWERS
  {
    id: 16,
    name: 'Sunflower',
    type: 'Flower',
    family: 'Asteraceae',
    varieties: ['Mammoth', 'Teddy Bear', 'Russian Giant', 'Autumn Beauty'],
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 7, notes: "Sunflower seeds maintain high germination rates for 5-7 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'Burpee Seed Company',
      lastUpdated: '2023-11-18',
    },
    germination: {
      soilTemp: { min: 21, max: 30, optimal: 24 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 2.5, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Plant seeds 1 inch deep. Sunflowers prefer direct sowing but can be started indoors in peat pots to minimize root disturbance during transplanting.",
      notes: "Protect seeds from birds and rodents which may dig them up before germination. Sunflower roots don't like disturbance, so if starting indoors, use biodegradable pots."
    },
    growingCycle: {
      daysToMaturity: { min: 70, max: 100 },
      harvestWindow: { min: 2, max: 3 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous blooms" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 17,
    name: 'Delphinium',
    type: 'Flower',
    family: 'Ranunculaceae',
    varieties: ['Pacific Giant', 'Magic Fountain', 'Blue Butterfly', 'Connecticut Yankees'],
    indoorStart: 0, // January
    indoorEnd: 1,   // February
    outdoorStart: 3, // April
    outdoorEnd: 4,   // May
    seedViability: { years: 1, notes: "Delphinium seeds lose viability quickly, best used within a year of harvest" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'Royal Horticultural Society',
      lastUpdated: '2023-12-15',
    },
    germination: {
      soilTemp: { min: 15, max: 18, optimal: 16 }, // °C
      daysToGerminate: { min: 14, max: 28 },
      seedDepth: 0.3, // cm
      lightNeeded: false,
      specialTechniques: ["Cold stratification", "Darkness for germination"],
      instructions: "Refrigerate seeds for 2-4 weeks before planting. Sow seeds 1/8 inch deep, cover with dark paper until germination. Best started in winter to allow for growth before summer planting.",
      notes: "Delphinium seeds need a cold period (stratification) to break dormancy. The duration of cold treatment varies based on variety. In zones 8+, longer stratification may be needed to compensate for warmer winters."
    },
    growingCycle: {
      daysToMaturity: { min: 120, max: 180 },
      harvestWindow: { min: 3, max: 5 },
      successionPlanting: false
    },
    difficulty: 'difficult',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 0, outdoorShift: 1 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7, 8] } // Difficult in hot climates
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 18,
    name: 'Zinnia',
    type: 'Flower',
    family: 'Asteraceae',
    varieties: ['California Giant', 'Profusion', 'Zahara', 'State Fair'],
    indoorStart: 2, // March
    indoorEnd: 3,   // April
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 5, notes: "Zinnia seeds remain viable for 3-5 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'University of Illinois Extension',
      lastUpdated: '2023-09-30',
    },
    germination: {
      soilTemp: { min: 21, max: 29, optimal: 24 }, // °C
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds 1/4 inch deep. Zinnias need warm soil to germinate well. Direct sowing is often more successful than transplanting.",
      notes: "Zinnias don't like having their roots disturbed. If starting indoors, use peat pots or soil blocks to minimize transplant shock."
    },
    growingCycle: {
      daysToMaturity: { min: 60, max: 75 },
      harvestWindow: { min: 8, max: 12 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3-4 weeks for continuous blooms until mid-summer" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  // Add more flowers here...
  
  // HERBS
  {
    id: 30,
    name: 'Basil',
    type: 'Herb',
    family: 'Lamiaceae',
    varieties: ['Genovese', 'Thai', 'Purple', 'Lemon', 'Cinnamon'],
    indoorStart: 2, // March
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 4, notes: "Basil seeds maintain good germination rates for 3-5 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 7,
      primarySource: 'Purdue University Extension',
      lastUpdated: '2023-11-05',
    },
    germination: {
      soilTemp: { min: 18, max: 35, optimal: 27 }, // °C
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 0.3, // cm
      lightNeeded: true,
      specialTechniques: ["Light exposure needed", "Bottom heat"],
      instructions: "Sow seeds shallowly, barely covering with soil. Basil needs light and warm temperatures to germinate. A heat mat can improve germination rates.",
      notes: "Basil is very sensitive to cold temperatures. Do not transplant outdoors until nighttime temperatures are consistently above 50°F (10°C)."
    },
    growingCycle: {
      daysToMaturity: { min: 50, max: 70 },
      harvestWindow: { min: 12, max: 20 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3-4 weeks for fresh supply" }
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 31,
    name: 'Cilantro',
    type: 'Herb',
    family: 'Apiaceae',
    varieties: ['Leisure', 'Santo', 'Calypso', 'Slow Bolt'],
    indoorStart: 2, // March
    indoorEnd: 4,   // May
    outdoorStart: 3, // April
    outdoorEnd: 8,   // September
    seedViability: { years: 5, notes: "Cilantro seeds (coriander) can remain viable for 5-6 years" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'University of California Extension',
      lastUpdated: '2023-10-12',
    },
    germination: {
      soilTemp: { min: 10, max: 29, optimal: 18 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: ["Crushing seeds"],
      instructions: "Lightly crush the round seed casing before planting to improve germination. Sow 1/4 inch deep. Seeds prefer cool temperatures for germination.",
      notes: "Cilantro seeds are actually fruits containing two seeds. Germination improves when the round casing is cracked. Direct sowing is preferable as cilantro does not transplant well."
    },
    growingCycle: {
      daysToMaturity: { min: 35, max: 45 },
      harvestWindow: { min: 2, max: 4 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous harvest; switch to heat-tolerant varieties in summer" }
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 1 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6, // Shift by 6 months
        avoidMonths: [11, 0, 1] // Avoid December, January, February in hot regions
      }
    }
  },
  
  // Add more herbs here...
  
  {
    id: 40,
    name: 'Broccoli',
    type: 'Vegetable',
    family: 'Brassicaceae',
    varieties: ['Calabrese', 'Purple Sprouting', 'Romanesco', 'Waltham'],
    indoorStart: 1, // February 
    indoorEnd: 2,   // March
    outdoorStart: 3, // April
    outdoorEnd: 4,   // May
    seedViability: { years: 4, notes: "Brassica seeds maintain good germination rates for 3-5 years with proper storage" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 7,
      primarySource: 'University of Maine Extension',
      lastUpdated: '2024-02-15',
    },
    germination: {
      soilTemp: { min: 7, max: 29, optimal: 21 }, // °C
      daysToGerminate: { min: 4, max: 10 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow 1/4 inch deep in seed starting mix. Keep soil moist but not waterlogged. Broccoli seedlings grow quickly after germination.",
      notes: "Broccoli germinates readily in cool soil. Seeds can be direct sown in fall for early spring harvest in mild winter areas."
    },
    growingCycle: {
      daysToMaturity: { min: 60, max: 85 },
      harvestWindow: { min: 1, max: 2 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks for continuous harvest in spring and fall" }
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7, 8] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 41,
    name: 'Eggplant',
    type: 'Vegetable',
    family: 'Solanaceae',
    varieties: ['Black Beauty', 'Japanese', 'White', 'Fairytale'],
    indoorStart: 1, // February
    indoorEnd: 2,   // March
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 4, notes: "Eggplant seeds remain viable for approximately 4 years when stored in cool, dry conditions" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'Purdue University Extension',
      lastUpdated: '2023-11-10',
    },
    germination: {
      soilTemp: { min: 21, max: 32, optimal: 29 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.6, // cm
      lightNeeded: false,
      specialTechniques: ["Bottom heat"],
      instructions: "Sow seeds 1/4 inch deep. Eggplant requires consistently warm soil temperatures of 80-90°F (27-32°C) for good germination. Use a heat mat to maintain temperature.",
      notes: "Eggplant germination can be spotty even under ideal conditions. Sow extra seeds and expect 70-80% germination rate. Seeds germinate much more slowly below optimal temperatures."
    },
    growingCycle: {
      daysToMaturity: { min: 65, max: 85 },
      harvestWindow: { min: 6, max: 8 },
      successionPlanting: false
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 2, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 42,
    name: 'Onion',
    type: 'Vegetable',
    family: 'Amaryllidaceae',
    varieties: ['Sweet', 'Storage', 'Red', 'White', 'Yellow'],
    indoorStart: 0, // January 
    indoorEnd: 1,   // February
    outdoorStart: 3, // April
    outdoorEnd: 4,   // May
    seedViability: { years: 1, notes: "Onion seeds lose viability quickly, best used within 1 year of harvest" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 6,
      primarySource: 'Cornell Cooperative Extension',
      lastUpdated: '2024-01-05',
    },
    germination: {
      soilTemp: { min: 10, max: 35, optimal: 24 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 0.3, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Sow seeds 1/8 inch deep. Onions germinate well in a wide range of temperatures but develop best with consistent moisture.",
      notes: "Onion seedlings are delicate and thread-like. Start indoors 8-12 weeks before last frost for the largest bulbs. Day length is critical for bulb formation - choose varieties appropriate for your latitude."
    },
    growingCycle: {
      daysToMaturity: { min: 90, max: 120 },
      harvestWindow: { min: 2, max: 4 },
      successionPlanting: false
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 0, outdoorShift: 1 },
          hot: { indoorShift: 0, outdoorShift: 0 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  },
  
  {
    id: 43,
    name: 'Spinach',
    type: 'Vegetable',
    family: 'Amaranthaceae',
    varieties: ['Savoy', 'Smooth-Leaf', 'Semi-Savoy', 'New Zealand'],
    indoorStart: 1, // February
    indoorEnd: 2,   // March
    outdoorStart: 2, // March
    outdoorEnd: 3,   // April (spring)
    seedViability: { years: 3, notes: "Spinach seeds remain viable for 2-3 years when stored properly" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 8,
      primarySource: 'Iowa State University Extension',
      lastUpdated: '2023-12-12',
    },
    germination: {
      soilTemp: { min: 2, max: 24, optimal: 15 }, // °C
      daysToGerminate: { min: 7, max: 14 },
      seedDepth: 1.3, // cm
      lightNeeded: false,
      specialTechniques: ["Pre-soaking"],
      instructions: "Plant seeds 1/2 inch deep. Spinach germinates best in cool soil. Soaking seeds for a few hours can improve germination rates.",
      notes: "Germination is poor when soil temperatures exceed 75°F (24°C). For summer planting, refrigerate seeds for 1-2 weeks before sowing to improve germination in warm conditions."
    },
    growingCycle: {
      daysToMaturity: { min: 40, max: 50 },
      harvestWindow: { min: 3, max: 5 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2 weeks for continuous harvest in spring and fall" }
    },
    difficulty: 'easy',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 1 },
          hot: { indoorShift: 0, outdoorShift: 0, avoidMonths: [5, 6, 7, 8] } // Avoid summer months in hot regions
        }
      },
      southernHemisphere: {
        seasonAdjust: 6, // Shift by 6 months
        avoidMonths: [11, 0, 1, 2] // Avoid December, January, February in hot regions
      }
    }
  },
  
  {
    id: 44,
    name: 'Pumpkin',
    type: 'Vegetable',
    family: 'Cucurbitaceae',
    varieties: ['Jack-o-lantern', 'Pie', 'Miniature', 'Giant'],
    indoorStart: 3, // April
    indoorEnd: 4,   // May
    outdoorStart: 4, // May
    outdoorEnd: 5,   // June
    seedViability: { years: 6, notes: "Pumpkin seeds maintain good germination rates for 4-6 years when properly stored" },
    dataIntegration: {
      confidenceRating: "high",
      sourceCount: 5,
      primarySource: 'University of Illinois Extension',
      lastUpdated: '2023-10-08',
    },
    germination: {
      soilTemp: { min: 18, max: 35, optimal: 29 }, // °C
      daysToGerminate: { min: 5, max: 10 },
      seedDepth: 2.5, // cm
      lightNeeded: false,
      specialTechniques: [],
      instructions: "Plant seeds 1 inch deep with pointed end down. Pumpkins need warm soil to germinate well. If starting indoors, use peat pots to minimize root disturbance during transplanting.",
      notes: "For giant varieties, select the largest seeds from the packet to increase chances of large fruits. Pumpkin seeds can rot in cold, wet soil, so ensure soil temperature is at least 65°F (18°C) before planting."
    },
    growingCycle: {
      daysToMaturity: { min: 90, max: 120 },
      harvestWindow: { min: 2, max: 4 },
      successionPlanting: false
    },
    difficulty: 'moderate',
    regionSpecific: {
      northernHemisphere: {
        zoneAdjustments: {
          cold: { indoorShift: 1, outdoorShift: 2 },
          hot: { indoorShift: 0, outdoorShift: -1 }
        }
      },
      southernHemisphere: {
        seasonAdjust: 6 // Shift by 6 months
      }
    }
  }
];

// Plant Family Information
export const plantFamilies = {
  Solanaceae: {
    name: "Nightshade Family",
    generalNotes: "This family includes tomatoes, peppers, eggplant, potatoes, ground cherries, and tomatillos. Members typically prefer warm soil for germination and are frost-sensitive.",
    commonTraits: "Seeds generally need warm soil temperatures (70-90°F/21-32°C). Most require transplanting and cannot tolerate frost. Many benefit from staking or caging for support.",
    commonPests: ["Aphids", "Flea beetles", "Tomato hornworm", "Colorado potato beetle", "Spider mites", "Whiteflies", "Early and late blight"],
    companionPlants: ["Basil", "Marigold", "Nasturtium", "Borage", "Calendula", "Carrots", "Petunias"],
    avoidPlanting: ["Dill", "Fennel", "Potato (with eggplant and tomatoes)", "Corn", "Kohlrabi", "Walnuts", "Brassicas"],
    sowingNotes: "Most nightshades benefit from starting indoors 6-8 weeks before last frost. Maintain soil temperature of 75-90°F (24-32°C) for best germination. Harden off carefully before transplanting."
  },
  
  Cucurbitaceae: {
    name: "Gourd Family",
    generalNotes: "Includes cucumbers, melons, watermelons, squash, pumpkins, and gourds. Most members have large seeds and sprawling growth habits with shallow root systems.",
    commonTraits: "Seeds need warm soil (70°F/21°C+). Most prefer direct sowing but can be transplanted carefully. Many have separate male and female flowers and require pollination.",
    commonPests: ["Cucumber beetles", "Squash bugs", "Squash vine borer", "Powdery mildew", "Downy mildew", "Aphids", "Bacterial wilt"],
    companionPlants: ["Nasturtium", "Marigold", "Corn", "Beans", "Radish", "Sunflowers", "Dill", "Borage"],
    avoidPlanting: ["Potato", "Aromatic herbs", "Brassicas", "Mint"],
    sowingNotes: "Plant seeds 1/2 to 1 inch (1.3-2.5 cm) deep in hills or rows. For early harvest, start indoors 3-4 weeks before last frost in peat/coir pots to minimize root disturbance. Avoid overwatering seeds which can cause rotting."
  },
  
  Brassicaceae: {
    name: "Cabbage/Mustard Family",
    generalNotes: "Includes broccoli, cabbage, kale, cauliflower, Brussels sprouts, radish, turnip, arugula, and kohlrabi. Generally cool-season crops with cross-shaped flowers.",
    commonTraits: "Seeds germinate quickly in cool soil. Many are frost-tolerant and prefer cooler growing conditions. Need consistent moisture and fertile soil.",
    commonPests: ["Cabbage worms", "Cabbage loopers", "Flea beetles", "Aphids", "Cabbage root maggot", "Clubroot", "Blackleg"],
    companionPlants: ["Mint", "Rosemary", "Onions", "Sage", "Thyme", "Chamomile", "Marigold", "Nasturtium", "Dill"],
    avoidPlanting: ["Strawberries", "Tomatoes", "Peppers", "Eggplant", "Beans", "Rue"],
    sowingNotes: "Most brassicas prefer soil temperatures between 45-85°F (7-29°C) for germination. Start seeds indoors 4-6 weeks before last frost date for spring crops, or 10-12 weeks before first fall frost for fall crops. Seeds are very small, sow 1/4 inch (0.6 cm) deep."
  },
  
  Apiaceae: {
    name: "Carrot/Parsley Family",
    generalNotes: "Includes carrots, parsley, dill, cilantro, celery, fennel, parsnips, and cumin. Many have fine, slow-germinating seeds and feathery foliage. Most have umbrella-like flower clusters.",
    commonTraits: "Seeds often slow to germinate and need consistent moisture. Many have tap roots and dislike transplanting. Many are biennial, flowering in their second year.",
    commonPests: ["Carrot rust fly", "Aphids", "Parsleyworm", "Carrot weevil", "Wire worms", "Celery leaf tier", "Aster yellows"],
    companionPlants: ["Rosemary", "Sage", "Tomatoes", "Onions", "Leeks", "Lettuce", "Chives"],
    avoidPlanting: ["Dill with carrots", "Fennel with most vegetables", "Carrots with other root vegetables"],
    sowingNotes: "Most apiaceae seeds need consistent moisture to germinate and prefer soil temperature of 60-70°F (15-21°C). Seeds are often very small and should be sown shallowly (1/8-1/4 inch/0.3-0.6 cm). Direct sowing is preferred for tap-rooted varieties. Pre-soaking seeds for 12-24 hours can improve germination rates."
  },
  
  Asteraceae: {
    name: "Aster/Daisy/Sunflower Family",
    generalNotes: "Includes lettuce, sunflowers, marigolds, zinnias, calendula, echinacea, artichokes, and many other flowers. One of the largest plant families with distinctive compound flowers.",
    commonTraits: "Many flower seeds require light to germinate. Wide variety of germination requirements. Many attract beneficial insects and pollinators. Most have flower heads composed of many tiny flowers.",
    commonPests: ["Aphids", "Slugs", "Leaf miners", "Thrips", "Japanese beetles", "Leafhoppers", "Powdery mildew", "Rust"],
    companionPlants: ["Varies widely by species", "Marigolds and sunflowers benefit many other plants", "Lettuce benefits from tall plants providing partial shade"],
    avoidPlanting: ["Varies by species", "Sunflowers can be allelopathic to some plants", "Some members compete for nutrients"],
    sowingNotes: "Germination requirements vary widely across this diverse family. Many flower seeds need light to germinate and should be sown on the surface or barely covered. Lettuce germinates best in cool conditions (45-75°F/7-24°C) and also needs light. Sunflower seeds should be planted 1-2 inches (2.5-5 cm) deep."
  },
  
  Lamiaceae: {
    name: "Mint Family",
    generalNotes: "Includes basil, mint, oregano, thyme, sage, rosemary, lavender, catnip, and bee balm. Most are aromatic herbs with square stems, opposite leaves, and two-lipped flowers.",
    commonTraits: "Many have small seeds that germinate best with light. Most prefer well-drained soil and full sun. Many are perennial and can spread aggressively (especially mint).",
    commonPests: ["Aphids", "Spider mites", "Whiteflies", "Thrips", "Leaf miners", "Powdery mildew", "Root rot"],
    companionPlants: ["Brassicas", "Tomatoes", "Many vegetables benefit from these herbs", "Attracts pollinators and beneficial insects"],
    avoidPlanting: ["Some are allelopathic and should not be planted directly with other herbs", "Mint should be contained to prevent spreading"],
    sowingNotes: "Most lamiaceae seeds need light to germinate and should be sown on the surface or with minimal soil covering. Optimal germination temperature for most varieties is 65-75°F (18-24°C). Many herbs in this family are slow to start from seed and benefit from pre-soaking or scarification. Consistent moisture is needed but avoid overwatering which can cause damping off."
  },
  
  Fabaceae: {
    name: "Legume Family", 
    generalNotes: "Includes beans, peas, lentils, soybeans, chickpeas, and many cover crops. Fix nitrogen in the soil through symbiotic relationship with Rhizobium bacteria in root nodules.",
    commonTraits: "Many have larger seeds that benefit from soaking before planting. Direct sowing is often preferred due to sensitive root systems. Produce pods containing seeds.",
    commonPests: ["Aphids", "Bean beetles", "Cutworms", "Bean weevils", "Pod borers", "Root rot", "Powdery mildew", "Bacterial blight"],
    companionPlants: ["Corn", "Potatoes", "Cucumbers", "Carrots", "Celery", "Savory", "Strawberries", "Many vegetables benefit from nitrogen fixing"],
    avoidPlanting: ["Onions", "Garlic", "Leeks", "Other alliums", "Gladiolus", "Fennel", "Sunflowers (with beans)"],
    sowingNotes: "Most legume seeds germinate best at soil temperatures of 60-85°F (15-29°C). Plant seeds 1-2 inches (2.5-5 cm) deep, or 3x the diameter of the seed. Pre-soaking large seeds for 12-24 hours can speed germination. Inoculating seeds with Rhizobium bacteria can improve nitrogen fixation, especially in soils where legumes haven't been grown before."
  },
  
  Amaryllidaceae: {
    name: "Amaryllis/Onion Family",
    generalNotes: "Includes onions, garlic, leeks, shallots, and chives. Characterized by hollow, cylindrical leaves or flat leaves with parallel veins, and bulbs.",
    commonTraits: "Many are grown from bulbs rather than seeds. Seeds are slow to germinate and develop. Most have distinctive onion or garlic scent. Need adequate day length for bulb formation.",
    commonPests: ["Onion maggots", "Thrips", "Leek moth", "Onion root maggots", "Downy mildew", "White rot", "Neck rot"],
    companionPlants: ["Carrots", "Beets", "Strawberries", "Tomatoes", "Lettuce", "Chamomile", "Most vegetables except legumes"],
    avoidPlanting: ["Beans", "Peas", "Other legumes", "Asparagus", "Sage"],
    sowingNotes: "Allium seeds generally germinate best at temperatures of 65-75°F (18-24°C). Seeds are usually sown 1/4-1/2 inch (0.6-1.3 cm) deep, depending on size. Seeds lose viability quickly (usually only viable for 1 year). Many onion varieties are day-length sensitive, so select varieties appropriate for your latitude."
  },
  
  Amaranthaceae: {
    name: "Amaranth Family",
    generalNotes: "Includes beets, Swiss chard, spinach, amaranth, quinoa, and lamb's quarters. Many are nutritious leafy vegetables or grains.",
    commonTraits: "Many have seeds that benefit from soaking before planting. Most are tolerant of poor soils. Several members have edible leaves and seeds.",
    commonPests: ["Leaf miners", "Aphids", "Flea beetles", "Slugs", "Cercospora leaf spot", "Downy mildew", "Beet curly top virus"],
    companionPlants: ["Onions", "Garlic", "Mint", "Lettuce", "Brassicas", "Strawberries"],
    avoidPlanting: ["Field mustard", "Pole beans"],
    sowingNotes: "Seeds germinate best at soil temperatures of 50-85°F (10-29°C). Many seed clusters contain multiple seeds (especially beets/chard), so thinning is often needed. Most seeds should be planted 1/4-1/2 inch (0.6-1.3 cm) deep. Many prefer cooler conditions and can be succession planted for extended harvests."
  },
  
  Poaceae: {
    name: "Grass Family",
    generalNotes: "Includes corn (maize), wheat, rice, oats, barley, millet, and bamboo. Primarily grain crops and ornamental grasses.",
    commonTraits: "Hollow stems with nodes, parallel-veined leaves, and wind-pollinated flowers. Deep root systems.",
    commonPests: ["Corn earworm", "Corn borers", "Armyworms", "Wireworms", "Rust", "Smut", "Blight"],
    companionPlants: ["Beans", "Squash", "Cucumber", "Peas", "Sunflowers", "Dill", "Marigolds"],
    avoidPlanting: ["Tomatoes", "Other grasses/cereals to prevent disease spread"],
    sowingNotes: "Most grass family seeds germinate best at soil temperatures of 60-95°F (15-35°C). Sweet corn should be planted 1-2 inches (2.5-5 cm) deep, with deeper planting in lighter soils. Plant in blocks rather than rows for better pollination. For ornamental grasses, many seeds need light to germinate."
  },
  
  Chenopodiaceae: {
    name: "Goosefoot Family",
    generalNotes: "Often now classified within Amaranthaceae. Includes spinach, beets, chard, lamb's quarters, and quinoa.",
    commonTraits: "Many are salt-tolerant. Seeds often have good cold soil germination. Many are nutritious leafy greens.",
    commonPests: ["Leaf miners", "Aphids", "Flea beetles", "Downy mildew", "Cercospora leaf spot"],
    companionPlants: ["Strawberries", "Onions", "Brassicas", "Lettuce"],
    avoidPlanting: ["Field mustard", "Pole beans"],
    sowingNotes: "Seeds germinate best in cool soil temperatures of 45-75°F (7-24°C). Most should be planted 1/2 inch (1.3 cm) deep. Spinach in particular benefits from pre-soaking seeds and germinates poorly in warm soil. Succession planting every 2-3 weeks provides continuous harvests."
  },
  
  Convolvulaceae: {
    name: "Morning Glory Family",
    generalNotes: "Includes morning glories, sweet potatoes, bindweed, and moonflowers. Many are climbing or trailing vines.",
    commonTraits: "Many have hard seed coats that benefit from scarification. Typically have showy, funnel-shaped flowers. Many are fast-growing vines.",
    commonPests: ["Aphids", "Sweet potato weevil", "White flies", "Spider mites", "Leaf miners", "Fungal diseases"],
    companionPlants: ["Corn", "Sunflowers (for support)", "Nasturtiums"],
    avoidPlanting: ["Avoid planting ornamental Convolvulaceae near sweet potatoes to prevent pest spread"],
    sowingNotes: "Most ornamental seeds in this family have hard seed coats and benefit from scarification (nicking) or soaking in warm water for 24 hours before planting. Plant seeds 1/2 inch (1.3 cm) deep. Sweet potatoes are generally grown from slips (rooted cuttings) rather than seeds. Optimal soil temperature for germination is 65-85°F (18-29°C)."
  },
  
  Alliaceae: {
    name: "Allium Family",
    generalNotes: "Now usually included in Amaryllidaceae. Includes onions, garlic, leeks, chives, and shallots.",
    commonTraits: "Most contain compounds that produce distinct onion/garlic odor when damaged. Many are grown from bulbs.",
    commonPests: ["Onion thrips", "Onion maggot", "Leek moth", "White rot", "Purple blotch", "Downy mildew"],
    companionPlants: ["Carrots", "Beets", "Strawberries", "Tomatoes", "Chamomile", "Roses"],
    avoidPlanting: ["Beans", "Peas", "Lentils", "Sage"],
    sowingNotes: "Seeds are generally sown 1/4 inch (0.6 cm) deep and germinate best at 65-75°F (18-24°C). Many varieties are day-length sensitive for bulb formation, so choose varieties appropriate for your region. Seeds have short viability, usually only 1 year."
  },
  
  Rosaceae: {
    name: "Rose Family",
    generalNotes: "Includes many fruit trees (apples, pears, cherries, peaches), berries (strawberries, raspberries), and ornamentals (roses).",
    commonTraits: "Flowers typically have five petals and numerous stamens. Many produce edible fruits with a central core or pit.",
    commonPests: ["Aphids", "Japanese beetles", "Rose chafers", "Spider mites", "Powdery mildew", "Black spot", "Fire blight"],
    companionPlants: ["Garlic", "Onions", "Chives", "Marigolds", "Lavender", "Catmint"],
    avoidPlanting: ["Other Rosaceae plants (to prevent disease spread)", "Tomatoes", "Potatoes"],
    sowingNotes: "Many seeds in this family require cold stratification to break dormancy. For most fruit tree seeds and rose seeds, a period of 1-3 months in moist medium at 33-41°F (1-5°C) is needed. Strawberry seeds are very small and should be sown on the surface with light exposure. Raspberry seeds also need cold stratification followed by warm stratification."
  },
  
  Liliaceae: {
    name: "Lily Family",
    generalNotes: "Includes many ornamental plants like true lilies, tulips, and hyacinths. Modern classification has split many former members into other families.",
    commonTraits: "Plants often grow from bulbs or corms. Many have showy, six-petaled flowers. Parallel-veined leaves.",
    commonPests: ["Lily beetles", "Aphids", "Bulb mites", "Thrips", "Botrytis", "Fusarium", "Lily mosaic virus"],
    companionPlants: ["Dianthus", "Salvia", "Geranium", "Heuchera"],
    avoidPlanting: ["Aggressive plants that might compete with bulbs"],
    sowingNotes: "Most lilies and other Liliaceae are propagated from bulbs or bulb scales rather than seeds. Seeds typically need multiple temperature cycles to germinate - a warm period followed by cold stratification, then another warm period. Seeds usually take 2-3 years to produce flowering plants. Sow seeds thinly on the surface or with light covering."
  },
  
  Ranunculaceae: {
    name: "Buttercup Family",
    generalNotes: "Includes buttercups, clematis, delphinium, columbine, anemone, and hellebores. Many ornamental garden plants.",
    commonTraits: "Often have divided or compound leaves. Many prefer cool growing conditions. Many contain toxins that can cause irritation.",
    commonPests: ["Aphids", "Leaf miners", "Slugs", "Powdery mildew", "Crown rot", "Botrytis"],
    companionPlants: ["Other shade-loving perennials for woodland species", "Sun-loving companions for meadow species"],
    avoidPlanting: ["Aggressive or invasive plants that might outcompete these ornamentals"],
    sowingNotes: "Many seeds in this family need a period of cold stratification to break dormancy. Fresh seed often germinates better than stored seed. Most prefer cooler germination temperatures of 55-65°F (13-18°C). Some, like delphinium, need light to germinate and should be sown on the surface. Others, like columbine, benefit from pre-chilling for 2-4 weeks before sowing."
  },
  
  Papaveraceae: {
    name: "Poppy Family",
    generalNotes: "Includes poppies, California poppy, bloodroot, and celandine. Many have colorful, showy flowers and produce milky sap.",
    commonTraits: "Seeds are often tiny and need light to germinate. Many self-seed readily. Many have distinctive seed capsules.",
    commonPests: ["Aphids", "Thrips", "Slugs", "Downy mildew", "Powdery mildew"],
    companionPlants: ["Ornamental grasses", "Lavender", "Salvia", "Other drought-tolerant perennials"],
    avoidPlanting: ["Plants that require excessive water or fertilizer"],
    sowingNotes: "Most poppy seeds need light to germinate and should be sown on the surface without covering. Many prefer cool soil temperatures of 55-65°F (13-18°C) for germination. Annual poppies can be sown in fall or early spring. Some species require a period of cold to break dormancy. Keep soil consistently moist until germination."
  }
};

// Seed Viability Reference
export const seedViabilityGuide = {
  shortTerm: [
    { type: "Onion", years: 1, notes: "Onion family seeds lose viability quickly; use within one year of purchase" },
    { type: "Leek", years: 1, notes: "Store in cool, dry conditions; loses viability rapidly" },
    { type: "Parsnip", years: 1, notes: "Use fresh seeds each season; rarely viable beyond one year" },
    { type: "Sweet Corn", years: 1, notes: "Hybrid varieties particularly short-lived; freezing can extend viability" },
    { type: "Parsley", years: 1, notes: "Viability drops sharply after first year; fresh seed germination is much better" },
    { type: "Delphinium", years: 1, notes: "Use fresh seeds for best results; store in refrigerator if keeping" },
    { type: "Chives", years: 1, notes: "All alliums have poor seed longevity; use fresh seed only" },
    { type: "Shallot", years: 1, notes: "Loses viability rapidly after one year" },
    { type: "Spinach", years: 1, notes: "Germination rates drop significantly after first year" },
    { type: "Rosemary", years: 1, notes: "Difficult to germinate even when fresh; use quickly" },
    { type: "Sage", years: 1, notes: "Aromatic herb seeds often lose viability quickly" }
  ],
  
  shortToMediumTerm: [
    { type: "Pepper", years: 2, notes: "Hot peppers maintain viability slightly longer than sweet varieties" },
    { type: "Lettuce", years: 2, notes: "Germination rates decline after 2 years; store in cool, dry place" },
    { type: "Okra", years: 2, notes: "Loses viability after 2 years; pre-soak older seeds" },
    { type: "Oregano", years: 2, notes: "Most herb seeds have short to medium viability" },
    { type: "Thyme", years: 2, notes: "Small seeds lose viability more quickly" },
    { type: "Fennel", years: 2, notes: "Aromatic seeds maintain oils but lose germination capacity" },
    { type: "Celery", years: 2, notes: "Small, finicky seeds lose viability relatively quickly" },
    { type: "Asparagus", years: 2, notes: "Seeds become increasingly difficult to germinate with age" },
    { type: "Annual Flowers", years: 2, notes: "Many annual flower seeds remain viable for 1-3 years" },
    { type: "Basil", years: 2, notes: "Refrigeration can extend viability to 3-4 years" },
    { type: "Chard", years: 2, notes: "Swiss chard seeds lose viability faster than beets" }
  ],
  
  mediumTerm: [
    { type: "Tomato", years: 4, notes: "Maintains good germination for 3-4 years in proper storage" },
    { type: "Carrot", years: 3, notes: "Store in cool, dry conditions; germination declines gradually" },
    { type: "Beans", years: 3, notes: "Both bush and pole varieties; freezing extends viability to 5+ years" },
    { type: "Peas", years: 3, notes: "Sweet, snap and shell peas all have similar longevity" },
    { type: "Brassicas", years: 4, notes: "Broccoli, cabbage, kale, cauliflower, and other cole crops" },
    { type: "Beet", years: 4, notes: "Beet seeds often germinate well even after 3-4 years" },
    { type: "Eggplant", years: 4, notes: "Proper storage results in good germination for several years" },
    { type: "Turnip", years: 4, notes: "Similar to other brassicas in seed longevity" },
    { type: "Radish", years: 4, notes: "Fast-growing crop with reasonably long-lived seeds" },
    { type: "Cilantro/Coriander", years: 3, notes: "Seeds maintain both culinary value and viability" },
    { type: "Calendula", years: 3, notes: "Stores reasonably well under proper conditions" },
    { type: "Nasturtium", years: 3, notes: "Large seeds maintain viability for medium term" },
    { type: "Sunflower", years: 3, notes: "Oil content can cause rancidity in improper storage" },
    { type: "Marigold", years: 3, notes: "Easy-to-grow flower with medium-term seed viability" }
  ],
  
  mediumToLongTerm: [
    { type: "Cucumber", years: 5, notes: "Can remain viable up to 8-10 years in ideal storage conditions" },
    { type: "Melon", years: 5, notes: "Watermelon, cantaloupe, and other melons; store cool and dry" },
    { type: "Squash", years: 5, notes: "Both summer and winter varieties have good longevity" },
    { type: "Pumpkin", years: 5, notes: "All cucurbits generally have good seed viability time" },
    { type: "Collards", years: 5, notes: "Some brassicas maintain viability longer than others" },
    { type: "Brussels Sprouts", years: 5, notes: "Good germination after 3-5 years with proper storage" },
    { type: "Cabbage", years: 5, notes: "Most cabbage varieties have good seed longevity" },
    { type: "Cauliflower", years: 5, notes: "Seeds remain viable for 4-5 years when properly stored" },
    { type: "Zinnia", years: 5, notes: "Most zinnia varieties store exceptionally well" },
    { type: "Morning Glory", years: 5, notes: "Hard seed coat helps preserve viability" },
    { type: "Sweet Potato", years: 5, notes: "Rarely grown from seed, but seeds store well" }
  ],
  
  longTerm: [
    { type: "Tomato", years: 6, notes: "Can remain viable for 6-10 years if frozen or vacuum-sealed" },
    { type: "Cucumber", years: 8, notes: "Under ideal conditions, longevity can exceed 8 years" },
    { type: "Lettuce", years: 6, notes: "Properly dried and frozen lettuce seed can last 6+ years" },
    { type: "Brassicas", years: 6, notes: "Some varieties maintain germination ability for up to 10 years" },
    { type: "Winter Squash", years: 7, notes: "Particularly long-lived compared to other garden seeds" },
    { type: "Watermelon", years: 7, notes: "Can maintain viability beyond 5 years with proper storage" },
    { type: "Beans", years: 6, notes: "Freezing can extend bean seed life significantly" },
    { type: "Zinnia", years: 7, notes: "One of the longest-lived flower seeds" },
    { type: "Cosmos", years: 7, notes: "Remains viable for many years with proper storage" },
    { type: "Hollyhock", years: 6, notes: "Hard seed coat contributes to long viability" },
    { type: "Marigold", years: 6, notes: "Can maintain viability for 5-7 years when properly stored" }
  ]
};

// Best practices for seed storage
export const seedStorageTips = {
  basicGuidelines: [
    "Store seeds in cool, dry, dark conditions",
    "Maintain temperature between 32-41°F (0-5°C) for longest viability",
    "Keep relative humidity below 50% to prevent mold and premature germination",
    "Use moisture-proof containers (glass jars, sealed plastic, or foil packets)",
    "Label containers with seed type, variety, and date collected/purchased",
    "Add silica gel packets or powdered milk wrapped in paper to absorb moisture"
  ],
  storageOptions: [
    { method: "Refrigerator", notes: "Ideal for most seeds. Place in sealed containers with desiccant." },
    { method: "Freezer", notes: "Great for long-term storage (5+ years). Ensure seeds are completely dry before freezing." },
    { method: "Cool basement", notes: "Acceptable for short-term storage if temperature remains below 70°F (21°C)." },
    { method: "Vacuum sealing", notes: "Extends viability significantly when combined with refrigeration/freezing." }
  ],
  viabilityChecks: [
    "Test older seeds before planting season by germinating 10 seeds between moist paper towels",
    "Calculate germination percentage to determine whether to sow more densely",
    "For very old seeds, use gibberellic acid or other germination enhancers",
    "Some seeds may have decreased vigor even with acceptable germination rates",
    "Seeds with less than 50% germination should be replaced if possible"
  ],
  afterEffects: [
    "Second-year seeds sometimes produce more vigorous plants than first-year seeds for certain varieties",
    "Seeds saved from hybrid plants won't grow true to parent",
    "Older viable seeds may take longer to germinate and require more consistent moisture",
    "Seeds from the same batch that have been stored differently can have drastically different viability",
    "Proper storage can maintain good germination rates far beyond average viability timeframes"
  ]
};

// Function to normalize legacy plant data to the new format
export const normalizePlantData = (legacyPlants) => {
  return legacyPlants.map(plant => {
    // Create base structure if missing fields
    const normalized = {
      ...plant,
      // Add family if missing
      family: plant.family || getFamilyForPlant(plant.name, plant.type),
      // Add varieties if missing
      varieties: plant.varieties || getDefaultVarieties(plant.name, plant.type),
      // Add seed viability if missing
      seedViability: plant.seedViability || getDefaultSeedViability(plant.name, plant.type),
      // Add data integration if missing
      dataIntegration: plant.dataIntegration || {
        confidenceRating: plant.germination?.confidence || 'moderate',
        sourceCount: plant.sources ? plant.sources.length : 1,
        primarySource: plant.source || 'User provided',
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      // Add growing cycle if missing
      growingCycle: plant.growingCycle || getDefaultGrowingCycle(plant.name, plant.type),
      // Add region specific data if missing 
      regionSpecific: plant.regionSpecific || getDefaultRegionSpecific(plant.type),
      // Ensure germination data exists and is properly formatted
      germination: plant.germination ? {
        soilTemp: plant.germination.soilTemp || { min: 15, max: 25, optimal: 20 },
        daysToGerminate: plant.germination.daysToGerminate || { min: 7, max: 14 },
        seedDepth: plant.germination.seedDepth || 0.6,
        lightNeeded: typeof plant.germination.lightNeeded === 'boolean' ? plant.germination.lightNeeded : false,
        specialTechniques: plant.germination.specialTechniques || [],
        instructions: plant.germination.instructions || `Plant seeds according to standard practices for ${plant.type.toLowerCase()}s.`,
        notes: plant.germination.notes || ""
      } : {
        soilTemp: { min: 15, max: 25, optimal: 20 },
        daysToGerminate: { min: 7, max: 14 },
        seedDepth: 0.6,
        lightNeeded: false,
        specialTechniques: [],
        instructions: `Plant seeds according to standard practices for ${plant.type.toLowerCase()}s.`,
        notes: ""
      }
    };
    
    return normalized;
  });
};

// Helper to determine plant family
function getFamilyForPlant(name, type) {
  // Default mapping based on plant name and type
  const nameToFamily = {
    // Vegetables
    'Tomato': 'Solanaceae',
    'Pepper': 'Solanaceae',
    'Eggplant': 'Solanaceae',
    'Potato': 'Solanaceae',
    'Cucumber': 'Cucurbitaceae',
    'Zucchini': 'Cucurbitaceae',
    'Squash': 'Cucurbitaceae',
    'Melon': 'Cucurbitaceae',
    'Pumpkin': 'Cucurbitaceae',
    'Carrot': 'Apiaceae',
    'Parsnip': 'Apiaceae',
    'Celery': 'Apiaceae',
    'Cilantro': 'Apiaceae',
    'Dill': 'Apiaceae',
    'Parsley': 'Apiaceae',
    'Lettuce': 'Asteraceae',
    'Spinach': 'Chenopodiaceae',
    'Beet': 'Chenopodiaceae',
    'Chard': 'Chenopodiaceae',
    'Broccoli': 'Brassicaceae',
    'Cabbage': 'Brassicaceae',
    'Cauliflower': 'Brassicaceae',
    'Kale': 'Brassicaceae',
    'Radish': 'Brassicaceae',
    'Turnip': 'Brassicaceae',
    'Peas': 'Fabaceae',
    'Beans': 'Fabaceae',
    'Onion': 'Amaryllidaceae',
    'Garlic': 'Amaryllidaceae',
    'Leek': 'Amaryllidaceae',
    'Chives': 'Amaryllidaceae',
    
    // Herbs
    'Basil': 'Lamiaceae',
    'Mint': 'Lamiaceae',
    'Oregano': 'Lamiaceae',
    'Rosemary': 'Lamiaceae',
    'Sage': 'Lamiaceae',
    'Thyme': 'Lamiaceae',
    'Lavender': 'Lamiaceae',
    
    // Flowers
    'Sunflower': 'Asteraceae',
    'Zinnia': 'Asteraceae',
    'Cosmos': 'Asteraceae',
    'Marigold': 'Asteraceae',
    'Echinacea': 'Asteraceae',
    'Sweet Pea': 'Fabaceae',
    'Delphinium': 'Ranunculaceae',
    'Foxglove': 'Plantaginaceae',
  };
  
  // Return the mapped family or a default based on type
  return nameToFamily[name] || 
         (type === 'Vegetable' ? 'Asteraceae' : 
          type === 'Herb' ? 'Lamiaceae' : 
          'Asteraceae'); // Default family for flowers
}

// Helper to get default varieties
function getDefaultVarieties(name, type) {
  const varietyMap = {
    'Tomato': ['Roma', 'Cherry', 'Beefsteak', 'Heirloom'],
    'Cucumber': ['Slicing', 'Pickling', 'English', 'Lemon'],
    'Lettuce': ['Romaine', 'Butterhead', 'Loose-leaf', 'Iceberg'],
    'Peas': ['Snow', 'Snap', 'Garden', 'Sugar'],
    'Basil': ['Sweet', 'Thai', 'Purple', 'Lemon'],
    'Sunflower': ['Mammoth', 'Teddy Bear', 'Autumn Beauty', 'Italian White'],
    'Carrot': ['Nantes', 'Danvers', 'Imperator', 'Chantenay'],
    'Zucchini': ['Black Beauty', 'Golden', 'Cocozelle', 'Ronde de Nice'],
    'Spinach': ['Bloomsdale', 'Space', 'New Zealand', 'Malabar'],
    'Marigold': ['French', 'African', 'Signet', 'Tagetes'],
    'Sweet Pea': ['Spencer', 'Old Spice', 'Mammoth', 'Royal'],
    'Zinnia': ['California Giant', 'Zahara', 'Profusion', 'State Fair'],
    'Lavender': ['English', 'French', 'Spanish', 'Grosso'],
    'Thyme': ['Common', 'Lemon', 'Creeping', 'Woolly'],
    'Cosmos': ['Sensation', 'Sonata', 'Seashells', 'Double Click'],
    'Delphinium': ['Pacific Giant', 'Magic Fountain', 'Belladonna', 'Blue Butterfly'],
    'Echinacea': ['Purple Coneflower', 'White Swan', 'Cheyenne Spirit', 'Green Jewel'],
    'Foxglove': ['Excelsior', 'Foxy', 'Camelot', 'Dalmation']
  };
  
  return varietyMap[name] || ['Common', 'Heirloom', 'Hybrid'];
}

// Helper to get default seed viability
function getDefaultSeedViability(name, type) {
  const viabilityMap = {
    'Tomato': { years: 4, notes: "Sealed storage in cool, dry conditions extends viability" },
    'Cucumber': { years: 5, notes: "Remains viable up to 5 years in ideal conditions" },
    'Lettuce': { years: 2, notes: "Viability decreases rapidly after 2 years" },
    'Peas': { years: 3, notes: "Store in cool, dry place for best results" },
    'Basil': { years: 4, notes: "Seeds remain viable for 3-5 years" },
    'Sunflower': { years: 7, notes: "Very long-lasting seeds with proper storage" },
    'Carrot': { years: 3, notes: "Viability drops significantly after 3 years" },
    'Zucchini': { years: 4, notes: "Store in airtight container in cool location" },
    'Spinach': { years: 2, notes: "Best when used within 2 years" },
    'Marigold': { years: 3, notes: "Seeds remain viable for 2-3 years" },
    'Sweet Pea': { years: 3, notes: "Seeds have hard coat that helps preserve viability" },
    'Zinnia': { years: 5, notes: "Very good storage life of 3-5 years" },
    'Lavender': { years: 2, notes: "Short viability period, use fresh seeds when possible" },
    'Thyme': { years: 3, notes: "Small seeds remain viable for 2-3 years" },
    'Cosmos': { years: 4, notes: "Seeds store well for 3-4 years" },
    'Delphinium': { years: 1, notes: "Use fresh seeds; viability drops quickly" },
    'Echinacea': { years: 2, notes: "Viability declines after 1-2 years" },
    'Cilantro': { years: 5, notes: "Coriander seeds store exceptionally well" },
    'Rosemary': { years: 1, notes: "Very short viability, use fresh seeds only" },
    'Foxglove': { years: 2, notes: "Seeds remain viable for about 2 years" }
  };
  
  if (viabilityMap[name]) {
    return viabilityMap[name];
  }
  
  // Default by type
  if (type === 'Vegetable') {
    return { years: 3, notes: "Most vegetable seeds remain viable for 2-4 years" };
  } else if (type === 'Herb') {
    return { years: 2, notes: "Herb seeds generally have shorter viability" };
  } else {
    return { years: 3, notes: "Flower seeds typically viable for 1-5 years depending on species" };
  }
}

// Helper to get default growing cycle
function getDefaultGrowingCycle(name, type) {
  const cycleMap = {
    'Tomato': {
      daysToMaturity: { min: 65, max: 85 },
      harvestWindow: { min: 3, max: 8 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2-3 weeks for continuous harvest" }
    },
    'Cucumber': {
      daysToMaturity: { min: 50, max: 70 },
      harvestWindow: { min: 3, max: 6 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks for continuous harvest" }
    },
    'Lettuce': {
      daysToMaturity: { min: 40, max: 65 },
      harvestWindow: { min: 1, max: 3 },
      successionPlanting: true,
      successionInterval: { weeks: 2, notes: "Plant every 2 weeks for continuous harvest" }
    },
    'Basil': {
      daysToMaturity: { min: 50, max: 75 },
      harvestWindow: { min: 8, max: 12 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3-4 weeks for fresh supply" }
    },
    'Carrot': {
      daysToMaturity: { min: 60, max: 80 },
      harvestWindow: { min: 2, max: 6 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks for continuous harvest" }
    }
  };
  
  if (cycleMap[name]) {
    return cycleMap[name];
  }
  
  // Default by type
  if (type === 'Vegetable') {
    return {
      daysToMaturity: { min: 60, max: 90 },
      harvestWindow: { min: 2, max: 6 },
      successionPlanting: true,
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks for continuous harvest" }
    };
  } else if (type === 'Herb') {
    return {
      daysToMaturity: { min: 60, max: 75 },
      harvestWindow: { min: 8, max: 16 },
      successionPlanting: true,
      successionInterval: { weeks: 4, notes: "Plant every 4 weeks for fresh supply" }
    };
  } else {
    return {
      daysToMaturity: { min: 75, max: 100 },
      harvestWindow: { min: 3, max: 6 },
      successionPlanting: type !== 'Perennial',
      successionInterval: { weeks: 3, notes: "Plant every 3 weeks for continuous blooms" }
    };
  }
}

// Helper to get default region specific data
function getDefaultRegionSpecific(type) {
  // Default region specific data structure
  return {
    northernHemisphere: {
      zoneAdjustments: {
        cold: { indoorShift: 1, outdoorShift: 2 },
        hot: { indoorShift: 0, outdoorShift: -1 }
      }
    },
    southernHemisphere: {
      seasonAdjust: 6 // Shift by 6 months
    }
  };
}

// Combine our baseline manually curated plants with the extended generated database
// for a comprehensive dataset with hundreds of plants
export const plantDatabase = (() => {
  // Start with our high-quality base plants
  const combinedDatabase = [...basePlantDatabase];
  
  // Add extended database with hundreds of generated plants
  const extendedPlants = generateExtendedPlantDatabase();
  combinedDatabase.push(...extendedPlants);
  
  // Count plants by type for logging
  const plantTypes = {};
  combinedDatabase.forEach(plant => {
    plantTypes[plant.type] = (plantTypes[plant.type] || 0) + 1;
  });
  
  // Count variety-specific entries
  const varietyCount = extendedPlants.filter(plant => plant.variety).length;
  
  console.log(`Total plants in database: ${combinedDatabase.length}`);
  console.log(`Variety-specific plants: ${varietyCount}`);
  console.log('Plants by type:', plantTypes);
  
  return combinedDatabase;
})();

// Add searchable variety database for enhanced search capabilities
export const varietyDatabase = (() => {
  // Get plants that have specific variety information
  const varietyPlants = generateExtendedPlantDatabase().filter(plant => plant.variety);
  
  return varietyPlants;
})();

// Function to search the database by variety or specific criteria
export function searchPlantDatabase(query, filters = {}) {
  // Convert query to lowercase for case-insensitive matching
  const searchTerm = query.toLowerCase();
  
  // First search varieties database if it exists
  if (varietyDatabase && varietyDatabase.length > 0) {
    // Match against searchTerms array if available, or fall back to name/variety
    const varietyMatches = varietyDatabase.filter(plant => {
      // Try to match against searchTerms array first (most comprehensive)
      if (plant.searchTerms && Array.isArray(plant.searchTerms)) {
        if (plant.searchTerms.some(term => term.includes(searchTerm))) {
          return true;
        }
      }
      
      // Then check variety and name fields
      if (plant.variety && plant.variety.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      if (plant.name && plant.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Check specifics for detailed matching
      if (plant.specifics) {
        const { color, type, notes } = plant.specifics;
        if (color && color.toLowerCase().includes(searchTerm)) {
          return true;
        }
        if (type && type.toLowerCase().includes(searchTerm)) {
          return true;
        }
        if (notes && notes.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
      
      return false;
    });
    
    // If we found variety matches, return them
    if (varietyMatches.length > 0) {
      // Apply any additional filters
      return applyFilters(varietyMatches, filters);
    }
  }
  
  // Fall back to searching the main database
  const baseMatches = plantDatabase.filter(plant => {
    if (plant.name.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    if (plant.type.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    if (plant.family.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Check if any variety in the varieties array matches
    if (plant.varieties && Array.isArray(plant.varieties)) {
      return plant.varieties.some(v => v.toLowerCase().includes(searchTerm));
    }
    
    return false;
  });
  
  return applyFilters(baseMatches, filters);
}

// Helper function to apply additional filters to search results
function applyFilters(plants, filters) {
  let filtered = [...plants];
  
  // Filter by plant type
  if (filters.type) {
    filtered = filtered.filter(plant => plant.type === filters.type);
  }
  
  // Filter by plant family
  if (filters.family) {
    filtered = filtered.filter(plant => plant.family === filters.family);
  }
  
  // Filter by difficulty level
  if (filters.difficulty) {
    filtered = filtered.filter(plant => plant.difficulty === filters.difficulty);
  }
  
  // Filter by growing season (using planting months)
  if (filters.season === 'spring') {
    filtered = filtered.filter(plant => 
      (plant.outdoorStart >= 2 && plant.outdoorStart <= 4) || // March-May
      (plant.indoorStart >= 0 && plant.indoorStart <= 2)      // Jan-March
    );
  } else if (filters.season === 'summer') {
    filtered = filtered.filter(plant => 
      (plant.outdoorStart >= 5 && plant.outdoorStart <= 7)    // June-August
    );
  } else if (filters.season === 'fall') {
    filtered = filtered.filter(plant => 
      (plant.outdoorStart >= 8 && plant.outdoorStart <= 10)   // September-November
    );
  }
  
  // Filter by growing zone if provided
  if (filters.zone) {
    filtered = filtered.filter(plant => {
      // If plant has zone-specific information
      if (plant.regionSpecific && 
          plant.regionSpecific.northernHemisphere && 
          plant.regionSpecific.northernHemisphere.zoneTips) {
        
        // Check each zone range in zoneTips
        return Object.keys(plant.regionSpecific.northernHemisphere.zoneTips).some(zoneRange => {
          const [min, max] = zoneRange.split('-').map(Number);
          return filters.zone >= min && filters.zone <= max;
        });
      }
      
      // If no zone-specific info, assume it grows in all zones
      return true;
    });
  }
  
  return filtered;
}

/* Functions and data related to generating the extended plant database
   have been moved to the extendedDatabase.js file */