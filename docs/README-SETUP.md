# Aster API - Get Positions and Balances (v3 Pro API Support)

Node.js script to fetch your account balances and positions from Aster's API.

## ✅ What You Have

You've created a Pro API wallet (v3):
- **API Wallet Address (signer)**: `0x6419b6194E1Dab06BEBf7A20a8A855E42a59c174`
- **API Wallet Private Key**: `YOUR_API_WALLET_PRIVATE_KEY` (set via environment variable)

## ⚠️ What You Still Need

You need to provide your **main account wallet address** (the "user" parameter). This is the wallet address you use to login and trade on Aster, NOT the API wallet address.

### How to Find Your Main Account Address:

1. Login to Aster Dex: https://www.asterdex.com
2. Your main account address should be visible in your account settings or wallet section
3. This is the address you use for trading (different from the API wallet)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Edit `get-positions-balances.js` and update the configuration:

```javascript
const config = {
  // Spot API (optional - if you have spot API keys)
  spot: {
    apiKey: 'YOUR_SPOT_API_KEY',
    apiSecret: 'YOUR_SPOT_API_SECRET',
    baseURL: 'https://sapi.asterdex.com'
  },
  // Futures API v3 (Pro API) - Web3 signing
  futuresV3: {
    user: 'YOUR_MAIN_ACCOUNT_WALLET_ADDRESS', // ⚠️ ADD THIS!
    signer: '0x6419b6194E1Dab06BEBf7A20a8A855E42a59c174', // ✅ Already set
    signerPrivateKey: process.env.ASTER_SIGNER_PRIVATE_KEY || 'YOUR_API_WALLET_PRIVATE_KEY', // ⚠️ Set via environment variable
    baseURL: 'https://fapi.asterdex.com'
  },
  // Futures API v2 (optional - if you have standard API keys)
  futuresV2: {
    apiKey: 'YOUR_FUTURES_API_KEY',
    apiSecret: 'YOUR_FUTURES_API_SECRET',
    baseURL: 'https://fapi.asterdex.com'
  }
};
```

## Usage

Run the script:
```bash
node get-positions-balances.js
```

## Features

- ✅ **Futures API v3 Support**: Uses Web3 signing with your API wallet
- ✅ **Futures API v2 Support**: Falls back to HMAC SHA256 if configured
- ✅ **Spot API Support**: Uses HMAC SHA256 authentication
- ✅ **Automatic Fallback**: Tries v3 first, falls back to v2 if needed

## API Endpoints Used

- Spot Balance: `GET /api/v1/account` (HMAC SHA256)
- Futures Balance: `GET /fapi/v3/balance` (Web3 signing)
- Futures Positions: `GET /fapi/v3/positionRisk` (Web3 signing)

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your private keys or API secrets to version control
- Keep your API wallet private key secure
- The API wallet is already configured in the script, but you still need to add your main account address

## Troubleshooting

If you get authentication errors:
1. Verify your main account wallet address is correct
2. Make sure the API wallet is still valid (expires 2026-11-03)
3. Check that your IP is whitelisted (if IP whitelisting is enabled)
4. Ensure your API wallet has the necessary permissions

