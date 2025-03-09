# Email Setup Guide

This document explains how to set up and configure the email features in the Garden App.

## Development Environment

For development purposes, the app uses Nodemailer with Ethereal, a fake SMTP service that lets you see emails that would be sent without actually sending them to real recipients.

### How it works in development:

1. When the server starts, it automatically creates a test account with Ethereal
2. All emails are captured by Ethereal instead of being sent to real recipients
3. The console will output a preview URL where you can see how the email would look
4. No configuration is required for this development setup to work

Example console output:
```
Created test email account: user123@ethereal.email
Email sent successfully
Preview URL: https://ethereal.email/message/XYZ123...
```

## Production Environment

For production, you'll need to update the `.env` file with your email service details:

```
# Email Configuration
EMAIL_SERVICE=gmail  # or another service like 'outlook', 'yahoo', etc.
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # For Gmail, use an App Password
EMAIL_FROM=noreply@yourdomain.com
```

### Common Email Services:

1. **Gmail**:
   - Set `EMAIL_SERVICE=gmail`
   - For `EMAIL_PASSWORD`, you need to use an "App Password"
   - To create an App Password:
     1. Enable 2-Step Verification on your Google account
     2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
     3. Select "Mail" and your device
     4. Use the generated 16-character password

2. **Outlook/Hotmail**:
   - Set `EMAIL_SERVICE=outlook`
   - Use your regular account password or create an app password

3. **Custom SMTP Server**:
   - Instead of using `EMAIL_SERVICE`, you can configure:
   ```
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_SECURE=false  # true for port 465, false for other ports
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-password
   ```

## Email Features Implementation

The Garden App includes these email-related features:

1. **Email Verification**:
   - Verifies user email addresses during signup
   - Verifies email subscribers who download resources

2. **Planting Calendar**:
   - Generates a personalized PDF planting calendar by zone
   - Sends the calendar by email and provides a download link
   - Captures email addresses for marketing

3. **Garden Recommendations**:
   - Provides personalized plant recommendations
   - Sends recommendations by email
   - Captures email addresses for marketing

## Troubleshooting

If emails aren't sending properly:

1. Check the server logs for error messages
2. Verify your email service credentials
3. If using Gmail, ensure you're using an App Password and have 2-Step Verification enabled
4. Try sending a test email using the API endpoint: `POST /api/newsletter/test-email`

## Testing the Email Service

To test if your email configuration is working:

1. Start the server with your email settings in place
2. Use the Planting Calendar or Garden Recommendations features
3. Check the console for preview URLs (in development) or confirmation messages
4. In production, check the inbox of the email address you provided

## Email Templates

The emails sent by the application include:

1. **Verification Email**: Sent when a user signs up or subscribes
2. **Planting Calendar Email**: Includes the custom calendar as an attachment
3. **Garden Recommendations Email**: Contains personalized plant recommendations