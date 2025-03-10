# PlantPerfectly Application

A comprehensive PlantPerfectly web application that helps users determine optimal planting times based on their location and plant preferences.

## Features

- **Location-based planting calendar** that determines optimal planting windows based on:
  - USDA hardiness zone
  - First/last frost dates
  - Local weather patterns and microclimate data
  - Soil temperature requirements for specific plants

- **Comprehensive plant database** including:
  - Growth requirements (sun, water, soil pH)
  - Days to maturity
  - Spacing requirements
  - Companion planting recommendations
  - Pest and disease susceptibility

- **User interface features**:
  - Location input (address, zip code, or map selection)
  - Plant selection interface with search and filtering
  - Visual calendar showing planting windows
  - Garden layout planning tool with drag-and-drop functionality
  - Responsive design for mobile and desktop use

- **Advanced features**:
  - Succession planting recommendations
  - Harvest date predictions
  - Companion planting suggestions
  - Notifications for planting dates, watering, and maintenance
  - Weather alerts affecting garden plans
  - Garden journal functionality for notes and observations

- **AI integration** with Claude 3.7:
  - Personalized recommendations based on user experience level
  - Climate change adjustments to traditional planting calendars
  - Adaptation to user feedback on what grows well in their specific microclimate
  - Natural language processing for garden planning questions

## Technology Stack

- **Frontend**: React.js with Bootstrap for responsive UI
- **Backend**: Node.js with Express
- **Database**: MongoDB for plant data and user profiles
- **APIs**: 
  - Weather data integration
  - USDA plant hardiness zone data
  - Claude 3.7 for AI-powered recommendations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- API keys for weather services and Claude 3.7

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/garden-planner.git
   cd garden-planner
   ```

2. Install dependencies for both server and client:
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/garden-planner
   JWT_SECRET=your_jwt_secret_here
   WEATHER_API_KEY=your_weather_api_key_here
   CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. Start the development servers:
   ```
   # Start the server (from server directory)
   npm run dev

   # Start the client (from client directory)
   npm start
   ```

5. Access the application at `http://localhost:3000`

## Data Collection and Processing

The application uses detailed plant data collected from Gardenate.com, which provides growing information for various plants across different climate zones.

### Data Scraping Scripts

The following Python scripts are used to collect and process the plant data:

1. **scrape_gardenate_details.py**
   - Scrapes detailed plant information from Gardenate.com for all plants and climate zones
   - Extracts sowing instructions, spacing, harvest time, companion plants, and plants to avoid
   - Saves the data to individual JSON files in the `gardenate_detailed_data` directory

2. **test_scrape_celery.py**
   - A test script that scrapes detailed information for Celery only
   - Useful for testing the scraping functionality without running the full script

3. **scrape_few_plants.py**
   - Scrapes data for a selected subset of plants
   - Useful for testing and development

4. **integrate_detailed_data.py**
   - Integrates the scraped detailed data with the existing plant data
   - Extracts structured data from the text fields (soil temperature, spacing, harvest time)
   - Enhances the existing data with companion plants and plants to avoid information
   - Saves the enhanced data to the `garden_data_enhanced` directory

### Running the Data Collection Scripts

1. Create a Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required packages:
   ```
   pip install requests beautifulsoup4
   ```

3. Run the scripts in the following order:
   ```
   python scrape_gardenate_details.py
   python integrate_detailed_data.py
   ```

4. The enhanced data will be available in the `garden_data_enhanced` directory

For more detailed information about the data scraping process, see [GARDENATE_DATA_README.md](GARDENATE_DATA_README.md).

## Project Structure

```
garden-planner/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # React source files
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── utils/          # Utility functions and context
│       ├── api/            # API integration
│       ├── assets/         # Images and other assets
│       └── styles/         # CSS styles
├── server/                 # Backend Node.js/Express application
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   └── services/           # External service integration
└── README.md               # Project documentation
```

## API Documentation

The PlantPerfectly API provides endpoints for:

- User authentication and profile management
- Plant database access and searching
- Garden creation and management
- Weather data integration
- AI-powered recommendations and assistance

For detailed API documentation, see [API_DOCS.md](API_DOCS.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- USDA Plant Hardiness Zone Map
- Weather data providers
- Claude 3.7 AI integration
- The open-source gardening community

## Deployment

### Deploying to Render.com

This application is configured for easy deployment on [Render.com](https://render.com) using Render's Blueprint feature.

#### Prerequisites for Deployment

1. A GitHub repository containing your PlantPerfectly application code
2. A Render.com account
3. A MongoDB Atlas database (or other MongoDB provider)

#### Deployment Steps

1. **Push your code to GitHub**:
   ```
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**:
   - Log in to your Render.com account
   - Click on "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration file

3. **Configure Environment Variables**:
   - After the Blueprint is created, you'll need to set up the environment variables
   - Go to each service (API and client) and add the required environment variables:
     - For the API service: `MONGODB_URI`, `JWT_SECRET`, `EMAIL_SERVICE`, etc.
     - For the client service: `REACT_APP_API_URL` (should point to your API service URL)

4. **Deploy the Services**:
   - Render will automatically build and deploy both the API and client services
   - You can monitor the deployment progress in the Render dashboard

5. **Access Your Deployed Application**:
   - Once deployment is complete, you can access your application at the URL provided by Render
   - The client application will be available at `https://plantperfectly-client.onrender.com`
   - The API will be available at `https://plantperfectly-api.onrender.com`

#### Updating Your Deployed Application

To update your deployed application, simply push changes to your GitHub repository:

```
git add .
git commit -m "Update application"
git push origin main
```

Render will automatically detect the changes and redeploy your application.