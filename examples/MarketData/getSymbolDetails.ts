import { TradeStationClient } from '../../src';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
    // Initialize the TradeStation client with refresh token from environment variables
    const client = new TradeStationClient({
        refresh_token: process.env.REFRESH_TOKEN,
        environment: (process.env.ENVIRONMENT || 'Simulation') as 'Simulation' | 'Live'
    });

    try {
        // Example 1: Get details for a single stock
        const msftDetails = await client.marketData.getSymbolDetails('MSFT');
        console.log('\nDetails for MSFT:');
        const msftSymbol = msftDetails.Symbols[0];
        console.log(`Asset Type: ${msftSymbol.AssetType}`);
        console.log(`Description: ${msftSymbol.Description}`);
        console.log(`Exchange: ${msftSymbol.Exchange}`);
        console.log(`Currency: ${msftSymbol.Currency}`);
        console.log('Price Format:', {
            format: msftSymbol.PriceFormat.Format,
            decimals: msftSymbol.PriceFormat.Decimals || 'N/A',
            increment: msftSymbol.PriceFormat.Increment
        });

        // Example 2: Get details for multiple symbols of different types
        const symbols = [
            'MSFT',              // Stock
            'MSFT 240119C400',   // Option
            'ESH24',             // Future
            'EUR/USD',           // Forex
            'BTCUSD'            // Crypto
        ];
        const details = await client.marketData.getSymbolDetails(symbols);

        // Process successful results
        console.log('\nDetails for Multiple Symbols:');
        details.Symbols.forEach(symbol => {
            console.log(`\n${symbol.Symbol} (${symbol.AssetType}):`);
            console.log(`Description: ${symbol.Description}`);
            console.log(`Exchange: ${symbol.Exchange}`);
            console.log(`Price Format: ${symbol.PriceFormat.Format} (${symbol.PriceFormat.Decimals || 'N/A'} decimals)`);

            // Asset-specific properties
            if (symbol.AssetType === 'STOCKOPTION') {
                console.log(`Expiration: ${symbol.ExpirationDate}`);
                console.log(`Strike: ${symbol.StrikePrice}`);
                console.log(`Type: ${symbol.OptionType}`);
            } else if (symbol.AssetType === 'FUTURE') {
                console.log(`Expiration: ${symbol.ExpirationDate}`);
                console.log(`Type: ${symbol.FutureType}`);
            }
            console.log('---');
        });

        // Handle any errors
        if (details.Errors.length > 0) {
            console.log('\nErrors:');
            details.Errors.forEach(error => {
                console.log(`${error.Symbol}: ${error.Message}`);
            });
        }

        // Example 3: Format prices using symbol details
        const stock = details.Symbols[0];
        const price = 123.456;

        console.log('\nPrice Formatting Example:');
        switch (stock.PriceFormat.Format) {
            case 'Decimal':
                if (stock.PriceFormat.Decimals) {
                    console.log(`Formatted Price: ${price.toFixed(parseInt(stock.PriceFormat.Decimals))}`);
                } else {
                    console.log('Decimal format specified but no decimals provided');
                }
                break;
            case 'Fraction':
                if (stock.PriceFormat.Fraction) {
                    const whole = Math.floor(price);
                    const fraction = price - whole;
                    const denominator = parseInt(stock.PriceFormat.Fraction);
                    const numerator = Math.round(fraction * denominator);
                    console.log(`Formatted Price: ${whole} ${numerator}/${denominator}`);
                } else {
                    console.log('Fraction format specified but no denominator provided');
                }
                break;
            case 'SubFraction':
                if (stock.PriceFormat.Fraction && stock.PriceFormat.SubFraction) {
                    const whole = Math.floor(price);
                    const fraction = price - whole;
                    const denominator = parseInt(stock.PriceFormat.Fraction);
                    const subFraction = parseInt(stock.PriceFormat.SubFraction);
                    const mainFraction = Math.floor(fraction * denominator);
                    const subFractionValue = Math.round(((fraction - (mainFraction / denominator)) * subFraction * denominator) / (subFraction / 10));
                    console.log(`Formatted Price: ${whole}'${mainFraction}.${subFractionValue}`);
                } else {
                    console.log('SubFraction format specified but missing fraction or subfraction values');
                }
                break;
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 