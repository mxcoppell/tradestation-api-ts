import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient();

    try {
        // Get available routes
        console.log('\nGetting available routes:');
        const routes = await client.orderExecution.getRoutes();

        // Example 1: Display all routes
        console.log('\nAll Available Routes:');
        routes.Routes.forEach(route => {
            console.log('\nRoute:');
            console.log(`ID: ${route.Id}`);
            console.log(`Name: ${route.Name}`);
            console.log(`Asset Types: ${route.AssetTypes.join(', ')}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 