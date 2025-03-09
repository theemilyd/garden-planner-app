import requests
from bs4 import BeautifulSoup
import json
import time
import os
from urllib.parse import quote_plus

# Create directory for test data
os.makedirs('test_data', exist_ok=True)

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
        print(f"Found sowing info: {sowing_info}")
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
        print(f"Found companion info: {companion_info}")
    else:
        print("No companion info found")
    
    # Extract plants to avoid information
    avoid_li = info_div.select_one('li.avoid')
    if avoid_li:
        avoid_info = avoid_li.get_text(strip=True)
        print(f"Found avoid info: {avoid_info}")
    else:
        print("No avoid info found")
    
    # Print the raw HTML of the info div for debugging
    print("\nRaw HTML of info div:")
    print(info_div.prettify())
    
    return {
        "sowing": sowing_info,
        "spacing": spacing_info,
        "harvest": harvest_info,
        "companion": companion_info,
        "avoid": avoid_info
    }

def scrape_celery_details():
    """Scrape detailed information for Celery in various zones"""
    plant_name = "Celery"
    formatted_plant_name = quote_plus(plant_name)
    
    # Test with a few different zones
    test_zones = {
        "United Kingdom - cool/temperate": 26,
        "USA - Zone 6b": 110,
        "Australia - temperate": 4
    }
    
    all_data = {}
    
    for zone_name, zone_code in test_zones.items():
        url = f"https://www.gardenate.com/plant/{formatted_plant_name}?zone={zone_code}"
        print(f"\nScraping {plant_name} in {zone_name} (zone code: {zone_code})...")
        print(f"URL: {url}")
        
        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Failed to retrieve data: Status code {response.status_code}")
                continue
            
            print("Successfully retrieved page")
            
            # Save the raw HTML for debugging
            with open(f"test_data/celery_{zone_code}_raw.html", 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            # Extract detailed information
            detailed_info = extract_detailed_info(response.text)
            
            # Add metadata
            detailed_info["plant_name"] = plant_name
            detailed_info["zone_name"] = zone_name
            detailed_info["zone_code"] = zone_code
            detailed_info["url"] = url
            
            all_data[zone_name] = detailed_info
            
            # Add a delay to avoid overwhelming the server
            time.sleep(2)
            
        except Exception as e:
            print(f"Error scraping: {str(e)}")
    
    # Save the collected data
    with open("test_data/celery_detailed.json", 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print("\nTest scraping complete. Data saved to test_data/celery_detailed.json")

if __name__ == "__main__":
    scrape_celery_details() 