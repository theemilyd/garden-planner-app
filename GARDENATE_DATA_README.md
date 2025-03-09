# Gardenate Data Scraping

This directory contains scripts and data related to scraping detailed plant information from Gardenate.com.

## Overview

The purpose of these scripts is to collect detailed growing information for various plants from Gardenate.com, including:

- Sowing instructions and soil temperature requirements
- Plant spacing information
- Harvest time
- Compatible companion plants
- Plants to avoid growing nearby

This data is then integrated with the existing plant data to provide more comprehensive growing information for the garden planner application.

## Scripts

### 1. `scrape_gardenate_details.py`

This script scrapes detailed plant information from Gardenate.com for all plants and climate zones. It saves the data to individual JSON files in the `gardenate_detailed_data` directory, as well as a combined file `all_detailed_data.json`.

Usage:
```
python scrape_gardenate_details.py
```

### 2. `test_scrape_celery.py`

A test script that scrapes detailed information for Celery only, in a few selected climate zones. This is useful for testing the scraping functionality without running the full script.

Usage:
```
python test_scrape_celery.py
```

### 3. `integrate_detailed_data.py`

This script integrates the scraped detailed data with the existing plant data in the `garden_data` directory. It enhances the existing data with the additional information and saves the result to the `garden_data_enhanced` directory.

Usage:
```
python integrate_detailed_data.py
```

## Data Structure

The scraped data is stored in JSON format with the following structure:

```json
{
  "Plant Name": {
    "Zone Name": {
      "sowing": "Detailed sowing instructions...",
      "spacing": "Plant spacing information...",
      "harvest": "Harvest time information...",
      "companion": "Compatible companion plants...",
      "avoid": "Plants to avoid growing nearby...",
      "plant_name": "Plant Name",
      "zone_name": "Zone Name",
      "zone_code": 123,
      "url": "https://www.gardenate.com/plant/..."
    },
    ...more zones...
  },
  ...more plants...
}
```

## Directories

- `gardenate_detailed_data/`: Contains the scraped detailed data for all plants
- `test_data/`: Contains test data and raw HTML files for debugging
- `garden_data_enhanced/`: Contains the integrated data with enhanced information

## Notes

- The scraping process is designed to be respectful of the Gardenate.com server by including delays between requests.
- Some plants may not have complete information for all fields or in all climate zones.
- The integration process extracts structured data from the text fields where possible, such as soil temperature ranges, spacing measurements, and harvest times.

## Requirements

- Python 3.6+
- requests
- beautifulsoup4

Install requirements:
```
pip install requests beautifulsoup4
``` 