import events = require("@aws-cdk/aws-events");
import targets = require("@aws-cdk/aws-events-targets");
import lambda = require("@aws-cdk/aws-lambda");
import cdk = require("@aws-cdk/core");

require("dotenv").config();

const {
  API_KEY = "",
  API_SECRET = "",
  SYMBOL = "fUSD",
  EACH_OFFER = "300",
  LOWEST_OFFER = "100",
  BASE_RATE = "0.04",
  JUMP_RATE = "0.06",
  KEEP_MONEY = "0"
} = process.env;

export class LambdaCronStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = {
      NODE_ENV: "production",
      API_KEY,
      API_SECRET,
      SYMBOL,
      EACH_OFFER,
      LOWEST_OFFER,
      BASE_RATE,
      JUMP_RATE,
      KEEP_MONEY
    };
    console.log(env);

    const symbols = SYMBOL.split(",");
    const eachOffers = EACH_OFFER.split(",");
    const lowestOffers = LOWEST_OFFER.split(",");
    const baseRates = BASE_RATE.split(",");
    const jumpRates = JUMP_RATE.split(",");
    const keepMoneys = KEEP_MONEY.split(",");
    const lambdaFns = symbols.map((symbol, i) => {
      return new lambda.Function(this, symbol, {
        code: lambda.Code.fromAsset("./lambda.zip"),
        handler: "index.handler",
        runtime: lambda.Runtime.NODEJS_12_X,
        environment: {
          API_KEY,
          API_SECRET,
          SYMBOL: symbol,
          EACH_OFFER: eachOffers[i],
          LOWEST_OFFER: lowestOffers[i],
          BASE_RATE: baseRates[i],
          JUMP_RATE: jumpRates[i],
          KEEP_MONEY: keepMoneys[i],
        },
        timeout: cdk.Duration.seconds(10),
        retryAttempts: 0
      });
    });

    const rule = new events.Rule(this, "Rule", {
      schedule: events.Schedule.expression("rate(5 minutes)")
    });

    for (let i = 0; i < lambdaFns.length; i++) {
      rule.addTarget(new targets.LambdaFunction(lambdaFns[i]));
    }
  }
}

const app = new cdk.App();
new LambdaCronStack(app, "bfx-lending-bot");
app.synth();
