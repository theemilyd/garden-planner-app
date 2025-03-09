import json
import os
import re

# Directories
GARDEN_DATA_DIR = 'garden_data'
DETAILED_DATA_DIR = 'gardenate_detailed_data'
OUTPUT_DIR = 'garden_data_enhanced'

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_json_file(file_path):
    """Load a JSON file and return its contents"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {str(e)}")
        return None

def save_json_file(data, file_path):
    """Save data to a JSON file"""
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {str(e)}")
        return False

def get_zone_code_from_name(zone_name):
    """Map zone name to zone code based on the mapping in scrape_gardenate_details.py"""
    zone_mapping = {
        "Australia - arid": 1,
        "Australia - cool/mountain": 2,
        "Australia - sub-tropical": 3,
        "Australia - temperate": 4,
        "Australia - tropical": 5,
        "Canada - Zone 2a Sub-Arctic": 6,
        "Canada - Zone 2b Sub-Arctic": 7,
        "Canada - Zone 3a Temperate Short Summer": 8,
        "Canada - Zone 3b Temperate Warm Summer": 9,
        "Canada - zone 4a Temperate Warm Summer": 10,
        "Canada - Zone 4b Temperate Warm Summer": 11,
        "Canada - Zone 5a Temperate Warm Summer": 12,
        "Canada - Zone 5b Temperate Warm Summer": 13,
        "Canada - Zone 6a Temperate Warm Summer": 14,
        "Canada - Zone 6b Temperate Warm Summer": 15,
        "Canada - Zone 7a Mild Temperate": 16,
        "Canada - Zone 7b Mild Temperate": 17,
        "Canada - Zone 8a Mild Temperate": 18,
        "New Zealand - cool/mountain": 19,
        "New Zealand - sub-tropical": 20,
        "New Zealand - temperate": 21,
        "South Africa - Dry summer sub-tropical": 22,
        "South Africa - Humid sub-tropical": 23,
        "South Africa - Semi-arid": 24,
        "South Africa - Summer rainfall": 25,
        "United Kingdom - cool/temperate": 26,
        "United Kingdom - warm/temperate": 27,
        "USA - Zone 2a": 101,
        "USA - Zone 2b": 102,
        "USA - Zone 3a": 103,
        "USA - Zone 3b": 104,
        "USA - Zone 4a": 105,
        "USA - Zone 4b": 106,
        "USA - Zone 5a": 107,
        "USA - Zone 5b": 108,
        "USA - Zone 6a": 109,
        "USA - Zone 6b": 110,
        "USA - Zone 7a": 111,
        "USA - Zone 7b": 112,
        "USA - Zone 8a": 113,
        "USA - Zone 8b": 114,
        "USA - Zone 9a": 115,
        "USA - Zone 9b": 116,
        "USA - Zone 10a": 117,
        "USA - Zone 10b": 118,
        "USA - Zone 11a": 119,
        "USA - Zone 11b": 120,
        "USA - Zone 12a": 121,
        "USA - Zone 12b": 122,
        "USA - Zone 13a": 123,
        "USA - Zone 13b": 124
    }
    return zone_mapping.get(zone_name)

def extract_soil_temperature(sowing_text):
    """Extract soil temperature information from sowing text"""
    # Look for patterns like "Best planted at soil temperatures between 12°C and 21°C"
    temp_match = re.search(r'Best planted at soil temperatures between (\d+)°C and (\d+)°C', sowing_text)
    if temp_match:
        min_temp = temp_match.group(1)
        max_temp = temp_match.group(2)
        return f"{min_temp}°C-{max_temp}°C"
    
    # Try Fahrenheit pattern
    temp_match = re.search(r'Best planted at soil temperatures between (\d+)°F and (\d+)°F', sowing_text)
    if temp_match:
        min_temp = temp_match.group(1)
        max_temp = temp_match.group(2)
        return f"{min_temp}°F-{max_temp}°F"
    
    return ""

def extract_spacing(spacing_text):
    """Extract spacing information from spacing text"""
    # Look for patterns like "Space plants: 15 - 30 cm apart"
    spacing_match = re.search(r'Space plants:\s*(\d+)\s*-\s*(\d+)\s*(cm|in) apart', spacing_text)
    if spacing_match:
        min_space = spacing_match.group(1)
        max_space = spacing_match.group(2)
        unit = spacing_match.group(3)
        return f"{min_space}-{max_space} {unit}"
    
    return spacing_text

def extract_harvest_time(harvest_text):
    """Extract harvest time information from harvest text"""
    # Look for patterns like "Harvest in 17-18 weeks"
    harvest_match = re.search(r'Harvest in (\d+)(?:-(\d+))? weeks', harvest_text)
    if harvest_match:
        min_weeks = harvest_match.group(1)
        max_weeks = harvest_match.group(2) if harvest_match.group(2) else min_weeks
        return f"{min_weeks}-{max_weeks} weeks"
    
    return harvest_text

def extract_companion_plants(companion_text):
    """Extract companion plants from companion text"""
    if "Not applicable" in companion_text or not companion_text:
        return []
    
    # Remove the prefix
    if "Compatible with (can grow beside): " in companion_text:
        companion_text = companion_text.replace("Compatible with (can grow beside): ", "")
    
    # Split by commas and clean up
    companions = [plant.strip() for plant in companion_text.split(',')]
    return companions

def extract_avoid_plants(avoid_text):
    """Extract plants to avoid from avoid text"""
    if not avoid_text:
        return []
    
    # Remove the prefix
    if "Avoid growing close to: " in avoid_text:
        avoid_text = avoid_text.replace("Avoid growing close to: ", "")
    
    # Split by commas and clean up
    avoid_plants = [plant.strip() for plant in avoid_text.split(',')]
    return avoid_plants

def integrate_detailed_data():
    """Integrate detailed data with existing data"""
    # Get list of all plant files in garden_data directory
    plant_files = [f for f in os.listdir(GARDEN_DATA_DIR) if f.startswith('all_') and f.endswith('.json')]
    
    # Load detailed data if available
    detailed_data_file = os.path.join(DETAILED_DATA_DIR, 'all_detailed_data.json')
    all_detailed_data = load_json_file(detailed_data_file) if os.path.exists(detailed_data_file) else {}
    
    for plant_file in plant_files:
        plant_name = plant_file.replace('all_', '').replace('.json', '')
        print(f"Processing {plant_name}...")
        
        # Load existing data
        existing_data = load_json_file(os.path.join(GARDEN_DATA_DIR, plant_file))
        if not existing_data:
            continue
        
        # Get detailed data for this plant
        plant_detailed_data = {}
        
        # Try to find the plant in the all_detailed_data
        for detailed_plant_name, detailed_data in all_detailed_data.items():
            if detailed_plant_name.lower() == plant_name.lower():
                plant_detailed_data = detailed_data
                break
        
        # If not found in all_detailed_data, try to load from individual file
        if not plant_detailed_data:
            detailed_file = os.path.join(DETAILED_DATA_DIR, f"{plant_name.replace('/', '-')}.json")
            if os.path.exists(detailed_file):
                plant_detailed_data = load_json_file(detailed_file)
        
        # If we have detailed data, integrate it
        if plant_detailed_data:
            # Update each zone with detailed information
            for zone_data in existing_data.get('zones', []):
                zone_name = zone_data.get('zone_name', '')
                
                # Find matching detailed data for this zone
                zone_detailed_data = plant_detailed_data.get(zone_name, {})
                
                if zone_detailed_data:
                    # Extract and add detailed information
                    growing_info = zone_data.get('data', {}).get('growing_info', {})
                    
                    # Update soil temperature
                    soil_temp = extract_soil_temperature(zone_detailed_data.get('sowing', ''))
                    if soil_temp:
                        growing_info['soil_temperature'] = soil_temp
                    
                    # Update spacing
                    spacing = extract_spacing(zone_detailed_data.get('spacing', ''))
                    if spacing:
                        growing_info['spacing'] = spacing
                    
                    # Update harvest time
                    harvest_time = extract_harvest_time(zone_detailed_data.get('harvest', ''))
                    if harvest_time:
                        growing_info['harvest_time'] = harvest_time
                    
                    # Update companion plants
                    companion_plants = extract_companion_plants(zone_detailed_data.get('companion', ''))
                    if companion_plants:
                        zone_data['data']['companion_plants'] = companion_plants
                    
                    # Update plants to avoid
                    avoid_plants = extract_avoid_plants(zone_detailed_data.get('avoid', ''))
                    if avoid_plants:
                        zone_data['data']['avoid_plants'] = avoid_plants
                    
                    # Add the full detailed text to additional notes
                    additional_notes = growing_info.get('additional_notes', [])
                    
                    if zone_detailed_data.get('sowing', ''):
                        additional_notes.append(f"Sowing: {zone_detailed_data['sowing']}")
                    
                    if zone_detailed_data.get('spacing', ''):
                        additional_notes.append(f"Spacing: {zone_detailed_data['spacing']}")
                    
                    if zone_detailed_data.get('harvest', ''):
                        additional_notes.append(f"Harvest: {zone_detailed_data['harvest']}")
                    
                    growing_info['additional_notes'] = additional_notes
                    
                    # Update the growing_info in the data
                    zone_data['data']['growing_info'] = growing_info
        
        # Save the enhanced data
        output_file = os.path.join(OUTPUT_DIR, plant_file)
        save_json_file(existing_data, output_file)
    
    print("Integration complete!")

if __name__ == "__main__":
    # Check if detailed data directory exists
    if not os.path.exists(DETAILED_DATA_DIR):
        print(f"Detailed data directory '{DETAILED_DATA_DIR}' not found. Please run scrape_gardenate_details.py first.")
    else:
        integrate_detailed_data() 