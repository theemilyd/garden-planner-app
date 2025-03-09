# SaaS Email Delivery System

This document explains how to configure the production-grade email delivery system for the Garden App SaaS platform.

## Architecture

The Garden App uses a robust and scalable email architecture with:

1. **Multiple Provider Support**: SendGrid (primary), Mailgun (backup), and Mailtrap (testing)
2. **Automatic Failover**: If one provider fails, the system tries the next one
3. **Health Monitoring**: Temporarily disables problematic providers
4. **Environment-Specific Routing**: Uses test providers in development, production providers in production
5. **PDF Attachment Support**: Automatically attaches generated PDFs to emails

## Configuration (.env file)

```
# Default email settings
EMAIL_FROM=no-reply@yourdomain.com
NODE_ENV=production  # Use 'development' for testing

# SendGrid (primary production provider)
SENDGRID_API_KEY=SG.yourSendGridKeyHere

# Mailgun (backup production provider)
MAILGUN_API_KEY=key-yourMailgunKeyHere
MAILGUN_DOMAIN=mail.yourdomain.com

# Mailtrap (development testing)
MAILTRAP_USER=your-mailtrap-user
MAILTRAP_PASS=your-mailtrap-password
```

## Provider Priorities

1. **Production Environment** (`NODE_ENV=production`):
   - SendGrid → Mailgun → Mailtrap
   
2. **Development Environment** (`NODE_ENV=development`):
   - Mailtrap → SendGrid → Mailgun
   
3. **Force Production Providers** in development:
   - Set `FORCE_PRODUCTION_EMAIL=true` in your `.env`

## Setting Up Production Providers

### SendGrid (Primary Provider)

1. Create an account at [SendGrid](https://sendgrid.com/) (free tier available)
2. Generate an API key with "Mail Send" permissions
3. Add to your `.env`: `SENDGRID_API_KEY=SG.your-key-here`
4. For production, verify your domain in SendGrid

### Mailgun (Backup Provider)

1. Create an account at [Mailgun](https://www.mailgun.com/) (free tier available)
2. Get your API key and verify your domain
3. Add to your `.env`:
   ```
   MAILGUN_API_KEY=key-your-key-here
   MAILGUN_DOMAIN=mail.yourdomain.com
   ```

## Development Testing

For local development, the system automatically uses Mailtrap:

1. Sign up at [Mailtrap.io](https://mailtrap.io/) (free)
2. Create an inbox and get credentials
3. Add to your `.env`:
   ```
   MAILTRAP_USER=your-user
   MAILTRAP_PASS=your-pass
   ```
4. All emails in development will be captured in your Mailtrap inbox

## Troubleshooting

If emails are not being delivered:

1. Check server logs for detailed error messages
2. Verify API keys and credentials in your `.env` file
3. Ensure domain verification if using custom domains
4. Test the connection using the `/api/newsletter/test-direct-email` endpoint
5. Check your email provider dashboard for delivery status and potential issues

## Monitoring & Analytics

For production use, we recommend:

1. Set up webhook endpoints for delivery events
2. Monitor send rates and bounces via provider dashboards
3. Implement email analytics using provider tracking features
4. Set up alerts for high bounce rates or delivery failures

## Health Checks

The system automatically manages provider health:

1. Failed providers are marked unhealthy for 5 minutes
2. System automatically retries previously failed providers after the penalty period
3. All delivery attempts are logged for debugging