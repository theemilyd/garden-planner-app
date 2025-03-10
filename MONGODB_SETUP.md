# Setting Up MongoDB Atlas for PlantPerfectly

This guide will walk you through setting up a MongoDB Atlas database for your PlantPerfectly application deployment.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and click "Try Free"
2. Sign up for a new account or log in if you already have one

## Step 2: Create a New Cluster

1. After logging in, click "Build a Database"
2. Choose the "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure) and region
   - Choose a region closest to your Render.com deployment region for best performance
4. Click "Create Cluster" (this may take a few minutes to provision)

## Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access" under the Security section
2. Click "Add New Database User"
3. Create a new user with a secure password
   - Username: `plantperfectly_admin` (or your preferred username)
   - Password: Generate a secure password
   - Database User Privileges: "Read and write to any database"
4. Click "Add User"

## Step 4: Configure Network Access

1. In the left sidebar, click "Network Access" under the Security section
2. Click "Add IP Address"
3. For development, you can add your current IP address
4. For production with Render.com, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: This is less secure but necessary for services like Render with dynamic IPs
5. Click "Confirm"

## Step 5: Get Your Connection String

1. In the left sidebar, click "Database" under the Deployments section
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user's password
6. Replace `<dbname>` with `plantperfectly`

Your connection string should look like:
```
mongodb+srv://plantperfectly_admin:<password>@cluster0.xxxxx.mongodb.net/plantperfectly?retryWrites=true&w=majority
```

## Step 6: Add the Connection String to Render.com

1. In your Render.com dashboard, go to your PlantPerfectly API service
2. Click on "Environment" in the left sidebar
3. Add a new environment variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
4. Click "Save Changes"

## Step 7: Seed Your Database (Optional)

If you need to seed your database with initial data:

1. Connect to your MongoDB Atlas cluster using MongoDB Compass or the MongoDB Shell
2. Import your seed data using the appropriate commands or tools
3. Verify that your data has been imported correctly

## Troubleshooting

- **Connection Issues**: Ensure your IP is whitelisted in the Network Access settings
- **Authentication Errors**: Double-check your username and password in the connection string
- **Database Not Found**: Make sure you've replaced `<dbname>` with `plantperfectly` in the connection string

## Next Steps

Once your MongoDB Atlas database is set up and connected to your Render.com deployment, your PlantPerfectly application should be able to store and retrieve data from the cloud database. 