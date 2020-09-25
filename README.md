# BFX Lending Bot

BFX lending bot runs automatic funding offer for Bitfinex. (AWS based)

## Prerequisites

### Prepare Required Tools and Configurations

1. Install required tools

   ```sh
   brew install awscli aws-cdk
   ```

1. Create a AWS IAM user account with `AWSLambdaFullAccess`, `IAMFullAccess` and `AWSCloudFormationFullAccess` permission policy.

1. Create access keys in security creadential tab.

1. Configure local environment with awscli.

   ```sh
   aws configure
   ```

1. Initialize CDK toolkit

   ```
   cdk bootstrap
   ```

### Define Bot Configurations

1. [Create a Bitfinex account](https://www.bitfinex.com/?refcode=u_ymELCkS) and create access keys.

1. Copy `.env.example` to `.env` and fill the env variables.

   ```sh
   # Bitfinex API access keys
   API_KEY=
   API_SECRET=

   # config
   SYMBOL=fUSD
   EACH_OFFER=200
   LOWEST_OFFER=100
   BASE_RATE=0.04
   JUMP_RATE=0.06
   KEEP_MONEY=0
   ```
1. Support multiple currencies.

   ```sh
   # config
   SYMBOL=fUSD,fUST
   EACH_OFFER=500,500
   LOWEST_OFFER=400,200
   BASE_RATE=0.03,0.04
   JUMP_RATE=0.06,0.06
   KEEP_MONEY=2000,0
   ```

## Usage

Deploy whole stack onto AWS cloud with a single command.

```sh
yarn deploy
```

## Support

It will be nice if you can support me by using the promo code to register Bitfinex.

Promo Code: `u_ymELCkS`

![promo](https://user-images.githubusercontent.com/579145/90334426-15e25e00-e000-11ea-9b21-3be7a0a36205.jpeg)
