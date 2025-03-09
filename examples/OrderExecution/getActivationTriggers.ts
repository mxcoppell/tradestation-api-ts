import { TradeStationClient, MarketActivationRule, TimeActivationRule, AdvancedOptions } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient({
        refresh_token: process.env.REFRESH_TOKEN,
        environment: (process.env.ENVIRONMENT || "Simulation") as "Simulation" | "Live"
    });

    try {
        // Example 1: Get available activation triggers
        console.log('\nGetting Available Activation Triggers:');
        const triggers = await client.orderExecution.getActivationTriggers();

        console.log('\nAvailable Triggers:');
        triggers.ActivationTriggers.forEach(trigger => {
            console.log(`\nTrigger Key: ${trigger.Key}`);
            console.log(`Name: ${trigger.Name}`);
            console.log(`Description: ${trigger.Description}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 