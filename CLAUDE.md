# Garden Planning Application

## Build and Test Commands

### Server
```bash
# Install server dependencies
cd server
npm install

# Run server in development mode
npm run dev

# Run server in production mode
npm start

# Run server tests
npm test
```

### Client
```bash
# Install client dependencies
cd client
npm install

# Run client in development mode
npm start

# Build client for production
npm run build

# Run client tests
npm test

# Run client linting
npm run lint

# Run client typechecking
npm run typecheck
```

## Development Notes

### Code Style Preferences
- Use camelCase for variables and functions
- Use PascalCase for component names and class names
- Use arrow functions for React components
- Use functional components with hooks instead of class components
- Use CSS-in-JS (styled-components or CSS modules) for styling
- Prefer async/await over promises with then/catch

### Important Directories
- Server controllers: `/server/controllers`
- Server models: `/server/models`
- Server routes: `/server/routes`
- Client components: `/client/src/components`
- Client pages: `/client/src/pages`
- Client utils: `/client/src/utils`

### Database Schema
The application uses MongoDB with the following main collections:
- Users: Authentication and user data
- Plants: Plant database with growing information
- Gardens: User's garden layouts and plants
- Zones: USDA hardiness zone data

### Authentication
The application uses JWT for authentication:
- Tokens are stored in localStorage
- Token expiration is set to 24 hours
- Protected routes are secured via middleware

### API Endpoints
Main API endpoints are:
- `/api/users` - User management
- `/api/plants` - Plant database access
- `/api/gardens` - Garden management
- `/api/zones` - Hardiness zone lookup
- `/api/weather` - Weather data
- `/api/ai` - AI plant recommendations