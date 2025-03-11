# PlantPerfectly - Garden Planning Application

PlantPerfectly is a comprehensive garden planning application that helps users plan their gardens based on their location, climate, and preferences. The application provides personalized planting calendars, plant recommendations, and gardening tips.

## Features

- **Personalized Planting Calendars**: Generate custom planting calendars based on your location and climate zone
- **Plant Database**: Access a comprehensive database of plants with detailed growing information
- **Garden Planning**: Plan your garden layout and track your plants
- **PDF Export**: Export your planting calendar as a PDF
- **Weather Integration**: Get weather forecasts for your garden location
- **Mobile Responsive**: Use the application on any device

## Tech Stack

- **Frontend**: React.js, Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Email**: Brevo (Sendinblue)
- **Weather API**: OpenWeatherMap
- **PDF Generation**: Puppeteer

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/theemilyd/garden-planner-app.git
   cd garden-planner-app
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key
   MONGODB_URI=mongodb://localhost:27017/gardenplanner
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_brevo_smtp_username
   EMAIL_PASS=your_brevo_smtp_password
   EMAIL_FROM=noreply@plantperfectly.com
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Install client dependencies:
   ```
   cd client
   npm install
   ```

2. Create a `.env` file in the client directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_ENV=development
   ```

3. Start the client:
   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Deployment on Render

### Prerequisites

- A Render account (https://render.com)
- A MongoDB Atlas account for the database
- An OpenWeatherMap API key
- A Brevo (Sendinblue) account for email

### Deployment Steps

1. Fork or clone this repository to your GitHub account.

2. Log in to your Render account and navigate to the Dashboard.

3. Click on "New" and select "Blueprint" from the dropdown menu.

4. Connect your GitHub repository.

5. Render will automatically detect the `render.yaml` file and create the services defined in it.

6. Configure the environment variables in the Render dashboard for both services:
   - For the API service:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT token generation
     - `OPENWEATHER_API_KEY`: Your OpenWeatherMap API key
     - `EMAIL_USER`: Your Brevo SMTP username
     - `EMAIL_PASS`: Your Brevo SMTP password

7. Deploy the services by clicking "Create Blueprint Instance".

8. Wait for the deployment to complete. Render will provide URLs for both services.

9. Access your application using the client service URL.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Plant data sourced from Gardenate
- Weather data provided by OpenWeatherMap
- Email services provided by Brevo (Sendinblue)