import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
from urllib.parse import quote_plus

# Create directory for data
os.makedirs('garden_data', exist_ok=True)

# Test with a subset of plants
test_plants = [
    "Amaranth", "Basil", "Carrot", "Lettuce", "Tomato"
]

# Climate zones with their zone numbers
climate_zones = {
    "Australia - arid": 0,
    "Australia - cool/mountain": 1,
    "Australia - sub-tropical": 2,
    "Australia - temperate": 3,
    "Australia - tropical": 4,
    "New Zealand - cool/mountain": 5,
    "New Zealand - sub-tropical": 6,
    "New Zealand - temperate": 7,
    "United Kingdom - cool/temperate": 8,
    "United Kingdom - warm/temperate": 9,
}

# Function to extract data from a plant page
def extract_plant_data(plant_name, zone_number):
    # Format plant name for URL
    formatted_plant_name = quote_plus(plant_name)
    url = f"https://www.gardenate.com/plant/{formatted_plant_name}?zone={zone_number}"
    
    print(f"Extracting data for {plant_name} in zone {zone_number}...")
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to retrieve data for {plant_name} in zone {zone_number}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract climate zone
        zone_text = soup.select_one('table caption')
        climate_zone = ""
        if zone_text:
            zone_text = zone_text.text.strip()
            climate_match = re.search(r'in _(.*?)_ regions', zone_text)
            if climate_match:
                climate_zone = climate_match.group(1)
            else:
                # Try another pattern
                climate_match = re.search(r'Best months for growing .* in (.*?) regions', zone_text)
                if climate_match:
                    climate_zone = climate_match.group(1)
                else:
                    # Try to get it from the zone_number
                    for name, number in climate_zones.items():
                        if number == zone_number:
                            climate_zone = name
                            break
                    if not climate_zone:
                        climate_zone = "Unknown"
        else:
            # Try to get it from the zone_number
            for name, number in climate_zones.items():
                if number == zone_number:
                    climate_zone = name
                    break
            if not climate_zone:
                climate_zone = "Unknown"
        
        # Extract plant name and scientific name
        plant_header = soup.select_one('h1')
        if plant_header:
            display_name = plant_header.text.strip().replace("Growing ", "")
        else:
            display_name = plant_name
        
        # Use the original plant name if we couldn't extract it properly
        if display_name == "Gardenate":
            display_name = plant_name
        
        scientific_name_elem = soup.select_one('h4')
        scientific_name = "Unknown"
        family = "Unknown"
        if scientific_name_elem:
            scientific_info = scientific_name_elem.text.strip()
            parts = scientific_info.split(':')
            if len(parts) >= 2:
                scientific_name = parts[0].strip()
                family = parts[1].strip()
            else:
                scientific_name = scientific_info
        
        # Extract monthly planting calendar
        monthly_calendar = {
            "jan": [], "feb": [], "mar": [], "apr": [], "may": [], "jun": [],
            "jul": [], "aug": [], "sep": [], "oct": [], "nov": [], "dec": []
        }
        
        # Find the table with the planting calendar
        calendar_table = soup.select_one('table')
        if calendar_table:
            rows = calendar_table.select('tr')
            if len(rows) >= 2:  # Header row + data rows
                months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
                
                for i in range(1, len(rows)):  # Skip header row
                    cells = rows[i].select('td')
                    planting_type = ""
                    
                    # Determine planting type based on the legend below the table
                    if i == 1:
                        planting_type = "S"  # Seed trays
                    elif i == 2:
                        planting_type = "T"  # Transplant
                    elif i == 3:
                        planting_type = "P"  # Direct sow
                    
                    for j, cell in enumerate(cells):
                        if j < len(months) and cell.text.strip():
                            monthly_calendar[months[j]].append(planting_type)
        
        # Extract growing information
        growing_info = {
            "soil_temperature": "",
            "spacing": "",
            "harvest_time": "",
            "additional_notes": []
        }
        
        # Look for growing information in paragraphs
        paragraphs = soup.select('p')
        for p in paragraphs:
            text = p.text.strip()
            
            # Soil temperature
            if "soil temperatures between" in text.lower():
                temp_match = re.search(r'between (\d+°C and \d+°C)', text)
                if temp_match:
                    growing_info["soil_temperature"] = temp_match.group(1)
            
            # Spacing
            if "space plants:" in text.lower():
                spacing_match = re.search(r'Space plants: (.*?)$', text, re.IGNORECASE)
                if spacing_match:
                    growing_info["spacing"] = spacing_match.group(1).strip()
            
            # Harvest time
            if "harvest in" in text.lower():
                harvest_match = re.search(r'Harvest in (.*?)\.', text, re.IGNORECASE)
                if harvest_match:
                    growing_info["harvest_time"] = harvest_match.group(1).strip()
            
            # Additional notes - collect any other useful information
            if (text and len(text) > 10 and 
                not text.startswith("Compatible with") and 
                not text.startswith("Avoid growing") and
                not "Your name" in text and
                not "Email address" in text and
                not "Please provide your email" in text and
                not "Post your question" in text and
                not "All comments are reviewed" in text and
                not "Your donation will help" in text):
                
                # Skip the legend for the planting calendar
                if not (text.startswith("S = Plant undercover") or 
                        text.startswith("T = Plant out") or 
                        text.startswith("P = Sow seed")):
                    growing_info["additional_notes"].append(text)
        
        # Extract companion plants and plants to avoid
        companion_plants = []
        avoid_plants = []
        
        for p in paragraphs:
            text = p.text.strip()
            
            if "Compatible with" in text:
                companions = text.replace("Compatible with (can grow beside):", "").strip()
                if companions:
                    companion_plants = [c.strip() for c in companions.split(',') if c.strip()]
            
            if "Avoid growing" in text:
                avoids = text.replace("Avoid growing close to:", "").strip()
                if avoids:
                    avoid_plants = [a.strip() for a in avoids.split(',') if a.strip()]
        
        # Extract culinary hints
        culinary_hints = []
        culinary_section = soup.find(lambda tag: tag.name == 'h3' and 'Culinary hints' in tag.text)
        if culinary_section:
            next_elem = culinary_section.find_next('p')
            while next_elem and next_elem.name == 'p':
                hint_text = next_elem.text.strip()
                if hint_text and len(hint_text) > 5:
                    culinary_hints.append(hint_text)
                next_elem = next_elem.find_next_sibling()
                if next_elem and next_elem.name != 'p':
                    break
        
        # Extract alternative names
        alternative_names = []
        if "also" in display_name:
            main_name, alt_names = display_name.split("also", 1)
            display_name = main_name.strip()
            # Clean up alternative names
            alt_names = alt_names.strip()
            if alt_names.startswith("("):
                alt_names = alt_names[1:]
            if alt_names.endswith(")"):
                alt_names = alt_names[:-1]
            alternative_names = [name.strip() for name in alt_names.split(',') if name.strip()]
        
        # Compile all data
        plant_data = {
            "plant_name": display_name,
            "alternative_names": alternative_names,
            "scientific_name": scientific_name,
            "family": family,
            "climate_zone": climate_zone,
            "monthly_calendar": monthly_calendar,
            "growing_info": growing_info,
            "companion_plants": companion_plants,
            "avoid_plants": avoid_plants,
            "culinary_hints": culinary_hints
        }
        
        return plant_data
    
    except Exception as e:
        print(f"Error extracting data for {plant_name} in zone {zone_number}: {str(e)}")
        return None

# Main function to extract data for test plants in all zones
def extract_test_data():
    all_data = []
    
    for plant in test_plants:
        plant_data_across_zones = {
            "name": plant,
            "zones": []
        }
        
        for zone_name, zone_number in climate_zones.items():
            plant_data = extract_plant_data(plant, zone_number)
            if plant_data:
                plant_data_across_zones["zones"].append({
                    "zone_name": zone_name,
                    "zone_number": zone_number,
                    "data": plant_data
                })
            
            # Be nice to the server - add a delay between requests
            time.sleep(1)
        
        all_data.append(plant_data_across_zones)
        
        # Save data after each plant to avoid losing progress
        with open(f'garden_data/final_{plant.replace("/", "-")}.json', 'w') as f:
            json.dump(plant_data_across_zones, f, indent=2)
    
    # Save all test data to a single file
    with open('garden_data/final_test_plants.json', 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print("Final test data extraction complete!")

if __name__ == "__main__":
    extract_test_data() 