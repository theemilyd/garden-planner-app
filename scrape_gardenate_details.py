import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
from urllib.parse import quote_plus

# Create directory for detailed data
os.makedirs('gardenate_detailed_data', exist_ok=True)

# List of all plants from the website
plants = [
    "Amaranth", "Angelica", "Artichokes (Globe)", "Asparagus", "Asparagus Pea",
    "Basil", "Beans - climbing", "Beans - dwarf", "Beetroot", "Borage", "Broad Beans",
    "Broccoli", "Brussels sprouts", "Burdock", "Cabbage", "Cape Gooseberry", "Capsicum",
    "Cardoon", "Carrot", "Cauliflower", "Celeriac", "Celery", "Chicory", "Chilli peppers",
    "Chinese cabbage", "Chives", "Choko/Chayote", "Collards", "Coriander", "Corn Salad",
    "Cowpeas", "Cucumber", "Daikon", "Dill", "Eggplant", "Endive", "Fennel", "Florence Fennel",
    "French tarragon", "Garlic", "Ginger", "Horseradish", "Jerusalem Artichokes", "Kale",
    "Kohlrabi", "Leeks", "Lemon Balm", "Lettuce", "Luffa", "Marrow", "Mint", "Mizuna",
    "Mustard greens", "NZ Spinach", "Okra", "Onion", "Oregano", "Pak Choy", "Parsley",
    "Parsnip", "Peas", "Potato", "Pumpkin", "Radish", "Rhubarb", "Rocket", "Rockmelon",
    "Rosella", "Rosemary", "Rutabaga", "Sage", "Salsify", "Savory - summer savory",
    "Savory - winter savory", "Shallots", "Silverbeet", "Snow Peas", "Spinach", "Spring onions",
    "Squash", "Strawberries (from seeds)", "Strawberry Plants", "Sunflower", "Sweet corn",
    "Sweet Marjoram", "Sweet Potato", "Taro", "Thyme", "Tomatillo", "Tomato", "Turnip",
    "Watermelon", "Yacon", "Yam/Oca", "Zucchini"
]

# Climate zones with their zone codes
climate_zones = {
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

def extract_detailed_info(html_content):
    """Extract detailed growing information from the HTML content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the info div with detailed growing instructions
    info_div = soup.select_one('div.info')
    if not info_div:
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
    
    # Extract spacing information
    spacing_li = info_div.select_one('li.spacing')
    if spacing_li:
        spacing_info = spacing_li.get_text(strip=True)
    
    # Extract harvest information
    harvest_li = info_div.select_one('li.harvest')
    if harvest_li:
        harvest_info = harvest_li.get_text(strip=True)
    
    # Extract companion plants information
    companion_li = info_div.select_one('li.companion')
    if companion_li:
        companion_info = companion_li.get_text(strip=True)
    
    # Extract plants to avoid information
    avoid_li = info_div.select_one('li.avoid')
    if avoid_li:
        avoid_info = avoid_li.get_text(strip=True)
    
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
    """Main function to scrape all plants and zones"""
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
    with open("gardenate_detailed_data/all_detailed_data.json", 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print("Completed scraping detailed plant information")

if __name__ == "__main__":
    main() 