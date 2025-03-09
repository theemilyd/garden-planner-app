import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
from urllib.parse import quote_plus

# Create directory for detailed data
os.makedirs('gardenate_detailed_data', exist_ok=True)

# List of plants to scrape (just a few for testing)
plants = [
    "Celery", "Tomato", "Carrot", "Lettuce", "Basil"
]

# Climate zones with their zone codes (just a few for testing)
climate_zones = {
    "United Kingdom - cool/temperate": 26,
    "USA - Zone 6b": 110,
    "Australia - temperate": 4
}

def extract_detailed_info(html_content):
    """Extract detailed growing information from the HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the info div with detailed growing instructions
    info_div = soup.select_one('div.info')
    if not info_div:
        print("No info div found in the HTML content")
        return {
            "sowing": "",
            "spacing": "",
            "harvest": "",
            "companion": "",
            "avoid": ""
        }
    
    # Extract each piece of information
    sowing_info = ""
    spacing_info = ""
    harvest_info = ""
    companion_info = ""
    avoid_info = ""
    
    # Extract sowing information
    sowing_li = info_div.select_one('li.sowing')
    if sowing_li:
        # Remove any span elements (like temperature conversion links)
        for span in sowing_li.select('span'):
            span.decompose()
        sowing_info = sowing_li.get_text(strip=True)
        print(f"Found sowing info: {sowing_info[:50]}...")
    else:
        print("No sowing info found")
    
    # Extract spacing information
    spacing_li = info_div.select_one('li.spacing')
    if spacing_li:
        spacing_info = spacing_li.get_text(strip=True)
        print(f"Found spacing info: {spacing_info}")
    else:
        print("No spacing info found")
    
    # Extract harvest information
    harvest_li = info_div.select_one('li.harvest')
    if harvest_li:
        harvest_info = harvest_li.get_text(strip=True)
        print(f"Found harvest info: {harvest_info}")
    else:
        print("No harvest info found")
    
    # Extract companion plants information
    companion_li = info_div.select_one('li.companion')
    if companion_li:
        companion_info = companion_li.get_text(strip=True)
        print(f"Found companion info: {companion_info[:50]}...")
    else:
        print("No companion info found")
    
    # Extract plants to avoid information
    avoid_li = info_div.select_one('li.avoid')
    if avoid_li:
        avoid_info = avoid_li.get_text(strip=True)
        print(f"Found avoid info: {avoid_info}")
    else:
        print("No avoid info found")
    
    return {
        "sowing": sowing_info,
        "spacing": spacing_info,
        "harvest": harvest_info,
        "companion": companion_info,
        "avoid": avoid_info
    }

def scrape_plant_details(plant_name, zone_name, zone_code):
    """Scrape detailed plant information for a specific plant and zone"""
    # Format plant name for URL
    formatted_plant_name = quote_plus(plant_name)
    url = f"https://www.gardenate.com/plant/{formatted_plant_name}?zone={zone_code}"
    
    print(f"Scraping detailed info for {plant_name} in {zone_name} (zone code: {zone_code})...")
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to retrieve data for {plant_name} in {zone_name}")
            return None
        
        print(f"Successfully retrieved page for {plant_name} in {zone_name}")
        
        # Extract detailed information
        detailed_info = extract_detailed_info(response.text)
        
        # Add metadata
        detailed_info["plant_name"] = plant_name
        detailed_info["zone_name"] = zone_name
        detailed_info["zone_code"] = zone_code
        detailed_info["url"] = url
        
        return detailed_info
    
    except Exception as e:
        print(f"Error scraping {plant_name} in {zone_name}: {str(e)}")
        return None

def main():
    """Main function to scrape selected plants and zones"""
    all_data = {}
    
    for plant_name in plants:
        plant_data = {}
        
        for zone_name, zone_code in climate_zones.items():
            # Add a delay to avoid overwhelming the server
            time.sleep(1)
            
            detailed_info = scrape_plant_details(plant_name, zone_name, zone_code)
            if detailed_info:
                plant_data[zone_name] = detailed_info
        
        # Save data for this plant
        if plant_data:
            all_data[plant_name] = plant_data
            
            # Save individual plant data
            filename = f"gardenate_detailed_data/{plant_name.replace('/', '-')}.json"
            with open(filename, 'w') as f:
                json.dump(plant_data, f, indent=2)
            
            print(f"Saved detailed data for {plant_name}")
    
    # Save all data to a single file
    with open("gardenate_detailed_data/selected_plants_data.json", 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print("Completed scraping detailed plant information for selected plants")

if __name__ == "__main__":
    main() 