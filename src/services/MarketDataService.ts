import { EventEmitter } from 'events';
import { HttpClient } from '../client/HttpClient';
import { StreamManager } from '../streaming/StreamManager';
import {
    QuoteSnapshot,
    BarsResponse,
    BarStreamParams,
    BarHistoryParams,
    OptionChainParams,
    OptionQuoteParams,
    MarketDepthParams,
    SymbolDetailsResponse,
    SymbolNames,
    Expirations,
    RiskRewardAnalysisInput,
    RiskRewardAnalysis,
    SpreadTypes,
    Strikes
} from '../types/marketData';

export class MarketDataService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly streamManager: StreamManager
    ) { }

    /**
     * Fetches a full snapshot of the latest Quote for the given Symbols.
     * For realtime Quote updates, users should use the Quote Stream endpoint.
     * 
     * The Quote Snapshot endpoint provides the latest price data for one or more symbols.
     * This includes:
     * - Current prices (Last, Ask, Bid)
     * - Daily statistics (Open, High, Low, Close)
     * - Volume information
     * - 52-week high/low data
     * - Market flags (delayed, halted, etc.)
     * 
     * @param symbols - List of valid symbols in comma separated format. For example: "MSFT,BTCUSD".
     *                 No more than 100 symbols per request.
     * @returns A Promise that resolves to a QuoteSnapshot containing both successful quotes and any errors.
     *          The response includes:
     *          - Quotes: Array of successful quote data
     *          - Errors: Array of any errors for invalid symbols
     * @throws Error if more than 100 symbols are requested
     * @throws Error if the request fails due to network issues or invalid authentication
     * 
     * @example
     * ```typescript
     * const snapshot = await marketData.getQuoteSnapshots(['MSFT', 'BTCUSD']);
     * console.log(snapshot.Quotes);
     * // [
     * //   {
     * //     Symbol: 'MSFT',
     * //     Open: '213.65',
     * //     High: '215.77',
     * //     Low: '205.48',
     * //     PreviousClose: '214.46',
     * //     Last: '212.85',
     * //     Ask: '212.87',
     * //     AskSize: '300',
     * //     Bid: '212.85',
     * //     BidSize: '200',
     * //     NetChange: '-1.61',
     * //     NetChangePct: '3.5',
     * //     High52Week: '232.86',
     * //     High52WeekTimestamp: '2020-09-02T00:00:00Z',
     * //     Low52Week: '132.52',
     * //     Low52WeekTimestamp: '2020-03-23T00:00:00Z',
     * //     Volume: '5852511',
     * //     PreviousVolume: '24154112',
     * //     Close: '212.85',
     * //     DailyOpenInterest: '0',
     * //     TradeTime: '2020-11-18T15:19:14Z',
     * //     MarketFlags: {
     * //       IsDelayed: false,
     * //       IsHalted: false,
     * //       IsBats: false,
     * //       IsHardToBorrow: false
     * //     }
     * //   }
     * // ]
     * console.log(snapshot.Errors); // Any errors for invalid symbols
     * ```
     */
    async getQuoteSnapshots(symbols: string[]): Promise<QuoteSnapshot> {
        // Validate maximum symbols
        if (symbols.length > 100) {
            throw new Error('Maximum of 100 symbols allowed per request');
        }

        // Join symbols with commas and make the request
        const response = await this.httpClient.get<QuoteSnapshot>(`/v3/marketdata/quotes/${symbols.join(',')}`);
        return response.data;
    }

    /**
     * Fetches marketdata bars for the given symbol, interval, and timeframe.
     * The maximum amount of intraday bars a user can fetch is 57,600 per request.
     * This is calculated either by the amount of barsback or bars within a timeframe requested.
     * 
     * @param symbol - The valid symbol string.
     * @param params - Parameters for the bar history request
     * @param params.interval - Default: `1`. Interval that each bar will consist of - for minute bars, the number of minutes aggregated in a single bar.
     *                         For bar units other than minute, value must be `1`. For unit `Minute` the max allowed `Interval` is 1440.
     * @param params.unit - Default: `Daily`. The unit of time for each bar interval. Valid values are: `Minute`, `Daily`, `Weekly`, `Monthly`.
     * @param params.barsback - Default: `1`. Number of bars back to fetch. The maximum number of intraday bars back that a user can query is 57,600.
     *                         There is no limit on daily, weekly, or monthly bars. This parameter is mutually exclusive with `firstdate`.
     * @param params.firstdate - The first date formatted as `YYYY-MM-DD` or `2020-04-20T18:00:00Z`. This parameter is mutually exclusive with `barsback`.
     * @param params.lastdate - Defaults to current timestamp. The last date formatted as `YYYY-MM-DD` or `2020-04-20T18:00:00Z`.
     *                         This parameter is mutually exclusive with `startdate` and should be used instead of that parameter.
     * @param params.sessiontemplate - United States (US) stock market session templates, that extend bars returned to include those outside of the regular trading session.
     *                                Ignored for non-US equity symbols. Valid values are: `USEQPre`, `USEQPost`, `USEQPreAndPost`, `USEQ24Hour`, `Default`.
     * @returns A Promise that resolves to a BarsResponse containing an array of Bar objects.
     * @throws Error if the interval is invalid for the specified unit
     * @throws Error if the maximum number of intraday bars is exceeded
     * @throws Error if mutually exclusive parameters are specified
     * @throws Error if the request fails due to network issues or invalid authentication
     * 
     * @example
     * ```typescript
     * // Get daily bars for the last 5 days
     * const bars = await marketData.getBarHistory('MSFT', {
     *   unit: 'Daily',
     *   barsback: 5
     * });
     * console.log(bars.Bars[0]);
     * // {
     * //   High: "218.32",
     * //   Low: "212.42",
     * //   Open: "214.02",
     * //   Close: "216.39",
     * //   TimeStamp: "2020-11-04T21:00:00Z",
     * //   TotalVolume: "42311777",
     * //   DownTicks: 231021,
     * //   DownVolume: 19575455,
     * //   OpenInterest: "0",
     * //   IsRealtime: false,
     * //   IsEndOfHistory: false,
     * //   TotalTicks: 460552,
     * //   UpTicks: 229531,
     * //   UpVolume: 22736321,
     * //   Epoch: 1604523600000,
     * //   BarStatus: "Closed"
     * // }
     * 
     * // Get 1-minute bars for a specific date range with extended hours
     * const bars = await marketData.getBarHistory('MSFT', {
     *   unit: 'Minute',
     *   interval: '1',
     *   firstdate: '2024-01-01T14:30:00Z',
     *   lastdate: '2024-01-01T21:00:00Z',
     *   sessiontemplate: 'USEQPreAndPost'
     * });
     * ```
     */
    async getBarHistory(symbol: string, params: BarHistoryParams = {}): Promise<BarsResponse> {
        // Validate interval for non-minute bars
        if (params.unit && params.unit !== 'Minute' && params.interval && params.interval !== '1') {
            throw new Error('Interval must be 1 for non-minute bars');
        }

        // Validate interval for minute bars
        if (params.unit === 'Minute' && params.interval) {
            const intervalNum = parseInt(params.interval, 10);
            if (intervalNum > 1440) {
                throw new Error('Maximum interval for minute bars is 1440');
            }
        }

        // Validate barsback for intraday
        if (params.unit === 'Minute' && params.barsback && params.barsback > 57600) {
            throw new Error('Maximum of 57,600 intraday bars allowed per request');
        }

        // Validate mutually exclusive parameters
        if (params.barsback && params.firstdate) {
            throw new Error('barsback and firstdate parameters are mutually exclusive');
        }

        if (params.lastdate && 'startdate' in params) {
            throw new Error('lastdate and startdate parameters are mutually exclusive. startdate is deprecated, use lastdate instead');
        }

        const response = await this.httpClient.get<BarsResponse>(`/v3/marketdata/barcharts/${symbol}`, {
            params,
        });
        return response.data;
    }

    /**
     * Fetches symbol details and formatting information for one or more symbols.
     * This endpoint provides comprehensive information about symbols, including:
     * - Asset type (stock, option, future, etc.)
     * - Trading details (exchange, currency, etc.)
     * - Price and quantity formatting rules
     * - Asset-specific information (expiration dates, strike prices, etc.)
     * 
     * The endpoint supports multiple asset types:
     * - Stocks (STOCK)
     * - Stock Options (STOCKOPTION)
     * - Index Options (INDEXOPTION)
     * - Futures (FUTURE)
     * - Forex (FOREX)
     * - Crypto (CRYPTO)
     * 
     * Price Display Formatting:
     * 1. **Decimal Format**: Used for most modern securities.
     *    Example: For a price of `123.2` with 2 decimals, display as `123.20`
     * 
     * 2. **Fraction Format**: Used for some securities that trade in fractions.
     *    Example: For a price of `534.5` with fraction 8, display as `534 4/8`
     *    - The denominator is specified in `PriceFormat.Fraction`
     *    - The numerator is calculated as: `(price - floor(price)) * denominator`
     * 
     * 3. **SubFraction Format**: Used for complex fractional pricing.
     *    Example: For a price of `125.92969` with fraction 32 and subfraction 4,
     *    display as `125'29.7`
     *    ```
     *    Given:
     *    x = Price (125.92969)
     *    y = Fraction (32)
     *    z = SubFraction (4)
     * 
     *    Calculate:
     *    a = trunc(x)                                    // 125
     *    b = trunc(frac(x) * y)                         // 29
     *    c = trunc(((frac(x) - (b/y)) * z * y) / (z/10)) // 7
     *    ```
     * 
     * @param symbols - Single symbol string or array of symbols. Maximum 50 symbols per request.
     *                 Examples of valid symbols:
     *                 - Stocks: "MSFT", "AAPL"
     *                 - Options: "MSFT 240119C400" (MSFT Jan 19 2024 400 Call)
     *                 - Futures: "ESH24" (E-mini S&P 500 March 2024)
     *                 - Forex: "EUR/USD"
     *                 - Crypto: "BTCUSD"
     * 
     * @returns A Promise that resolves to a SymbolDetailsResponse containing:
     *          - Symbols: Array of successfully retrieved symbol details
     *          - Errors: Array of errors for invalid symbols
     * 
     * @throws Error if more than 50 symbols are requested
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Example 1: Get details for a single stock
     * const msftDetails = await marketData.getSymbolDetails('MSFT');
     * console.log(msftDetails.Symbols[0]);
     * // {
     * //   AssetType: 'STOCK',
     * //   Country: 'US',
     * //   Currency: 'USD',
     * //   Description: 'MICROSOFT CORP',
     * //   Exchange: 'NASDAQ',
     * //   PriceFormat: {
     * //     Format: 'Decimal',
     * //     Decimals: '2',
     * //     IncrementStyle: 'Simple',
     * //     Increment: '0.01',
     * //     PointValue: '1'
     * //   },
     * //   QuantityFormat: {
     * //     Format: 'Decimal',
     * //     Decimals: '0',
     * //     IncrementStyle: 'Simple',
     * //     Increment: '1',
     * //     MinimumTradeQuantity: '1'
     * //   },
     * //   Root: 'MSFT',
     * //   Symbol: 'MSFT'
     * // }
     * 
     * // Example 2: Get details for multiple symbols of different types
     * const symbols = [
     *   'MSFT',             // Stock
     *   'MSFT 240119C400',  // Option
     *   'ESH24',            // Future
     *   'EUR/USD',          // Forex
     *   'BTCUSD'            // Crypto
     * ];
     * const details = await marketData.getSymbolDetails(symbols);
     * 
     * // Process successful results
     * details.Symbols.forEach(symbol => {
     *   console.log(`${symbol.Symbol} (${symbol.AssetType}):`, {
     *     description: symbol.Description,
     *     exchange: symbol.Exchange,
     *     priceFormat: {
     *       format: symbol.PriceFormat.Format,
     *       decimals: symbol.PriceFormat.Decimals,
     *       increment: symbol.PriceFormat.Increment
     *     },
     *     // Asset-specific properties
     *     ...(symbol.AssetType === 'STOCKOPTION' && {
     *       expiration: symbol.ExpirationDate,
     *       strike: symbol.StrikePrice,
     *       type: symbol.OptionType
     *     }),
     *     ...(symbol.AssetType === 'FUTURE' && {
     *       expiration: symbol.ExpirationDate,
     *       type: symbol.FutureType
     *     })
     *   });
     * });
     * 
     * // Handle any errors
     * if (details.Errors.length > 0) {
     *   console.log('Errors:', details.Errors);
     * }
     * 
     * // Example 3: Format prices using symbol details
     * const stock = details.Symbols[0];
     * const price = 123.456;
     * 
     * switch (stock.PriceFormat.Format) {
     *   case 'Decimal':
     *     console.log(price.toFixed(parseInt(stock.PriceFormat.Decimals)));
     *     break;
     *   case 'Fraction':
     *     const whole = Math.floor(price);
     *     const fraction = price - whole;
     *     const denominator = parseInt(stock.PriceFormat.Fraction!);
     *     const numerator = Math.round(fraction * denominator);
     *     console.log(`${whole} ${numerator}/${denominator}`);
     *     break;
     * }
     * ```
     */
    async getSymbolDetails(symbols: string | string[]): Promise<SymbolDetailsResponse> {
        // Convert single symbol to array for consistent handling
        const symbolArray = Array.isArray(symbols) ? symbols : [symbols];

        // Validate maximum symbols
        if (symbolArray.length > 50) {
            throw new Error('Maximum of 50 symbols allowed per request');
        }

        const encodedSymbols = symbolArray.map(symbol => encodeURIComponent(symbol));
        const response = await this.httpClient.get<SymbolDetailsResponse>(`/v3/marketdata/symbols/${encodedSymbols.join(',')}`);
        return response.data;
    }

    /**
     * Get the available option contract expiration dates for the underlying symbol.
     * This endpoint returns a list of expiration dates for option contracts on the specified underlying symbol.
     * The list includes weekly, monthly, quarterly, and LEAPS expirations where available.
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/options/expirations/{underlying}
     * 
     * @param underlying - The symbol for the underlying security (stock or index) for which to retrieve option expirations.
     *                    Must be a valid equity or index symbol. For example: 'AAPL', 'MSFT', 'SPX', etc.
     * @param strikePrice - Optional. The strike price to filter expirations. If provided, only returns expirations
     *                     that have options available at this strike price. Must be a positive number.
     * 
     * @returns A Promise that resolves to an Expirations object containing:
     *          - Expirations: Array of expiration dates and their types (Weekly, Monthly, Quarterly)
     *          Each expiration contains:
     *          - Date: The expiration date in ISO 8601 format (e.g., "2024-01-19T00:00:00Z")
     *          - Type: The type of expiration ("Weekly", "Monthly", "Quarterly")
     * 
     * @throws Error if the underlying symbol is invalid or not found
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to authentication issues
     * 
     * @example
     * ```typescript
     * // Get all expirations for AAPL
     * const expirations = await marketData.getOptionExpirations('AAPL');
     * console.log(expirations.Expirations);
     * // [
     * //   { Date: "2024-01-19T00:00:00Z", Type: "Monthly" },
     * //   { Date: "2024-01-26T00:00:00Z", Type: "Weekly" },
     * //   { Date: "2024-02-16T00:00:00Z", Type: "Monthly" }
     * // ]
     * 
     * // Get expirations for MSFT at strike price 400
     * const msftExpirations = await marketData.getOptionExpirations('MSFT', 400);
     * ```
     */
    async getOptionExpirations(underlying: string, strikePrice?: number): Promise<Expirations> {
        if (!underlying) {
            throw new Error('Underlying symbol is required');
        }

        if (strikePrice !== undefined && strikePrice <= 0) {
            throw new Error('Strike price must be a positive number');
        }

        const params: Record<string, number> = {};
        if (strikePrice !== undefined) {
            params.strikePrice = strikePrice;
        }

        const response = await this.httpClient.get<Expirations>(
            `/v3/marketdata/options/expirations/${underlying}`,
            { params }
        );
        return response.data;
    }

    /**
     * Get the available strike prices for option contracts on the specified underlying symbol.
     * This endpoint returns a list of strike prices available for option trading, which can be
     * filtered by expiration date and spread type.
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/options/strikes/{underlying}
     * 
     * @param underlying - The symbol for the underlying security (stock or index).
     *                    Must be a valid equity or index symbol. For example: 'AAPL', 'MSFT', 'SPX', etc.
     * @param expiration - Optional. The expiration date to filter strikes.
     *                    Format: YYYY-MM-DD or ISO8601 (e.g., "2024-01-19" or "2024-01-19T00:00:00Z")
     * @param spreadType - Optional. The type of spread to filter strikes for.
     *                    Valid values include: "Single", "Vertical", "Calendar", "Butterfly", etc.
     *                    If not provided, returns strikes for all spread types.
     * 
     * @returns A Promise that resolves to a Strikes object containing:
     *          - SpreadType: The type of spread these strikes are for
     *          - Strikes: Array of strike price arrays. Each inner array represents
     *                    the strikes needed for a specific spread configuration.
     *                    For example:
     *                    - Single: [["150"], ["155"], ["160"]]
     *                    - Vertical: [["150", "155"], ["155", "160"]]
     *                    - Butterfly: [["145", "150", "155"], ["150", "155", "160"]]
     * 
     * @throws Error if the underlying symbol is invalid
     * @throws Error if the expiration date format is invalid
     * @throws Error if the spread type is invalid
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * // Get all strikes for AAPL
     * const strikes = await marketData.getOptionStrikes('AAPL');
     * 
     * // Get strikes for MSFT options expiring on Jan 19, 2024
     * const msftStrikes = await marketData.getOptionStrikes('MSFT', '2024-01-19');
     * 
     * // Get strikes for SPY butterfly spreads expiring on Jan 19, 2024
     * const butterflyStrikes = await marketData.getOptionStrikes('SPY', '2024-01-19', 'Butterfly');
     * ```
     */
    async getOptionStrikes(
        underlying: string,
        expiration?: string,
        spreadType?: string,
        options?: { expiration2?: string }
    ): Promise<Strikes> {
        if (!underlying) {
            throw new Error('Underlying symbol is required');
        }

        const params: Record<string, string> = {};
        if (expiration) {
            params.expiration = expiration;
        }
        if (spreadType) {
            params.spreadType = spreadType;
        }
        if (spreadType === 'Calendar' && options?.expiration2) {
            params.expiration2 = options.expiration2;
        }

        const response = await this.httpClient.get<Strikes>(
            `/v3/marketdata/options/strikes/${underlying}`,
            { params }
        );
        return response.data;
    }

    /**
     * Streams Quote changes for one or more symbols.
     * 
     * This endpoint provides real-time updates for:
     * - Current prices (Last, Ask, Bid)
     * - Daily statistics (Open, High, Low, Close)
     * - Volume information
     * - 52-week high/low data
     * - Market flags (delayed, halted, etc.)
     * 
     * A heartbeat will be sent after 5 seconds on an idle stream to indicate that the stream is alive.
     * 
     * @param symbols - List of valid symbols in comma separated format. For example: "MSFT,BTCUSD".
     *                 No more than 100 symbols per request.
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - QuoteStream objects for quote updates
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamErrorResponse objects for any errors
     * @throws Error if more than 100 symbols are requested
     * @throws Error if the request fails due to network issues or invalid authentication
     * 
     * @example
     * ```typescript
     * const stream = await marketData.streamQuotes(['MSFT', 'BTCUSD']);
     * 
     * stream.on('data', (data) => {
     *   if ('Ask' in data) {
     *     // Handle quote update
     *     console.log('Quote update:', data);
     *   } else if ('Heartbeat' in data) {
     *     // Handle heartbeat
     *     console.log('Heartbeat:', data);
     *   } else {
     *     // Handle error
     *     console.log('Error:', data);
     *   }
     * });
     * ```
     */
    streamQuotes(symbols: string[]): Promise<EventEmitter> {
        if (symbols.length > 100) {
            return Promise.reject(new Error('Maximum of 100 symbols allowed per request'));
        }
        return this.streamManager.createStream(
            `/v3/marketdata/stream/quotes/${symbols.join(',')}`,
            {},
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    }

    /**
     * Stream real-time and historical bars for a given symbol.
     * The stream will first send any historical bars requested via barsback parameter,
     * followed by real-time bars as trades occur.
     * 
     * The maximum amount of historical bars that can be requested is 57,600.
     * This endpoint uses Server-Sent Events (SSE) to stream data.
     * 
     * @param symbol - The valid symbol string to stream bars for.
     * @param params - Optional parameters for the bar stream
     * @param params.interval - Default: 1. Interval that each bar will consist of.
     *                         For minute bars, the number of minutes aggregated in a single bar.
     *                         For bar units other than minute, value must be 1.
     *                         For unit Minute the max allowed Interval is 1440.
     * @param params.unit - Default: Daily. The unit of time for each bar interval.
     *                      Valid values are: Minute, Daily, Weekly, Monthly.
     * @param params.barsback - Default: 1. Number of historical bars to fetch.
     *                         Maximum of 57,600 bars allowed.
     * @param params.sessiontemplate - US stock market session templates for extended trading hours.
     *                                Ignored for non-US equity symbols.
     *                                Valid values: USEQPre, USEQPost, USEQPreAndPost, USEQ24Hour, Default.
     * @returns A Promise that resolves to an EventEmitter that emits Bar objects, Heartbeats, or StreamErrorResponses.
     * @throws Error if more than 57,600 bars are requested
     * @throws Error if the interval is invalid for the specified unit
     * @throws Error if the request fails due to network issues or invalid authentication
     * 
     * @example
     * ```typescript
     * // Example 1: Stream 1-minute bars with 100 historical bars
     * const minuteStream = await marketData.streamBars('MSFT', {
     *   unit: 'Minute',
     *   interval: '1',
     *   barsback: 100
     * });
     * 
     * // Example 2: Stream daily bars with extended hours
     * const dailyStream = await marketData.streamBars('AAPL', {
     *   unit: 'Daily',
     *   sessiontemplate: 'USEQPreAndPost'
     * });
     * 
     * // Example 3: Stream 5-minute bars for crypto
     * const cryptoStream = await marketData.streamBars('BTCUSD', {
     *   unit: 'Minute',
     *   interval: '5'
     * });
     * 
     * // Handle the stream data
     * stream.on('data', (data: BarStreamResponse) => {
     *   if ('Close' in data) {
     *     // Handle bar data
     *     console.log('Bar:', {
     *       time: data.TimeStamp,
     *       open: data.Open,
     *       high: data.High,
     *       low: data.Low,
     *       close: data.Close,
     *       volume: data.TotalVolume,
     *       status: data.BarStatus,
     *       isRealtime: data.IsRealtime
     *     });
     *   } else if ('Heartbeat' in data) {
     *     console.log('Heartbeat:', data.Timestamp);
     *   } else {
     *     console.log('Error:', data.Message);
     *   }
     * });
     * ```
     */
    streamBars(symbol: string, params: BarStreamParams = {}): Promise<EventEmitter> {
        // Validate interval for non-minute bars
        if (params.unit && params.unit !== 'Minute' && params.interval && params.interval !== '1') {
            throw new Error('Interval must be 1 for non-minute bars');
        }

        // Validate interval for minute bars
        if (params.unit === 'Minute' && params.interval) {
            const intervalNum = parseInt(params.interval, 10);
            if (intervalNum > 1440) {
                throw new Error('Maximum interval for minute bars is 1440');
            }
        }

        // Validate barsback
        if (params.barsback && params.barsback > 57600) {
            throw new Error('Maximum of 57,600 bars allowed per request');
        }

        return this.streamManager.createStream(
            `/v3/marketdata/stream/barcharts/${symbol}`,
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    }

    /**
     * Stream a chain of option spreads for a given underlying symbol, spread type, and expiration.
     * A maximum of 10 concurrent streams is allowed.
     * 
     * For options calculations, the WebAPI uses the following:
     * - 90 days for historical volatility of the underlying
     * - Bjerksund and Stensland option pricing model
     * - Ask price for price of the option
     * 
     * The stream provides real-time updates for:
     * - Greeks (Delta, Gamma, Theta, Vega, Rho)
     * - Implied Volatility
     * - Intrinsic and Extrinsic Values
     * - Theoretical Values (current and IV-based)
     * - Probability Analysis (ITM, OTM, Breakeven)
     * - Market Data (Bid, Ask, Last, Volume, Open Interest)
     * - Spread Configuration (Strikes, Legs)
     * 
     * A heartbeat will be sent after 5 seconds on an idle stream to indicate that the stream is alive.
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/stream/options/chains/{underlying}
     * 
     * @param underlying - The symbol for the underlying security on which the option contracts are based.
     *                    Must be a valid equity or index symbol. For example: 'AAPL', 'MSFT', 'SPX', etc.
     * @param params - Optional parameters for filtering the option chain
     * @param params.expiration - Date on which the option contract expires; must be a valid expiration date.
     *                           Defaults to the next contract expiration date.
     *                           Format: YYYY-MM-DD or ISO8601 (e.g., "2024-01-19" or "2024-01-19T00:00:00Z")
     * @param params.expiration2 - Second contract expiration date required for Calendar and Diagonal spreads.
     *                            Format: YYYY-MM-DD or ISO8601 (e.g., "2024-01-19" or "2024-01-19T00:00:00Z")
     * @param params.strikeProximity - Specifies the number of spreads to display above and below the priceCenter.
     *                                Default: 5
     * @param params.spreadType - Specifies the name of the spread type to use.
     *                           Common values: "Single", "Vertical", "Calendar", "Butterfly", "Condor", "Straddle", "Strangle"
     *                           Default: "Single"
     * @param params.riskFreeRate - The theoretical rate of return of an investment with zero risk.
     *                              Defaults to the current quote for $IRX.X.
     *                              The percentage rate should be specified as a decimal value between 0 and 1.
     *                              For example, to use 4.25% for the rate, pass in 0.0425.
     * @param params.priceCenter - Specifies the strike price center.
     *                            Defaults to the last quoted price for the underlying security.
     * @param params.strikeInterval - Specifies the desired interval between the strike prices in a spread.
     *                               Must be greater than or equal to 1.
     *                               A value of 1 uses consecutive strikes; a value of 2 skips one between strikes; and so on.
     *                               Default: 1
     * @param params.enableGreeks - Specifies whether or not greeks properties are returned.
     *                             Default: true
     * @param params.strikeRange - Filters the chain by intrinsic value:
     *                            - "ITM" (in-the-money): includes only spreads that have an intrinsic value greater than zero
     *                            - "OTM" (out-of-the-money): includes only spreads that have an intrinsic value equal to zero
     *                            - "All": includes all spreads regardless of intrinsic value
     *                            Default: "All"
     * @param params.optionType - Filters the spreads by a specific option type.
     *                           Valid values are "All", "Call", and "Put".
     *                           Default: "All"
     * 
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - Spread objects for option chain updates, containing:
     *            - Greeks (Delta, Gamma, Theta, Vega, Rho)
     *            - Implied Volatility and Standard Deviation
     *            - Value Analysis (Intrinsic, Extrinsic, Theoretical)
     *            - Probability Analysis (ITM, OTM, Breakeven)
     *            - Market Data (Bid, Ask, Last, Volume, Open Interest)
     *            - Spread Configuration (Strikes, Legs)
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamErrorResponse objects for any errors
     * 
     * @throws Error if more than 10 concurrent streams are active
     * @throws Error if the strike interval is less than 1
     * @throws Error if expiration2 is required but not provided for Calendar/Diagonal spreads
     * @throws Error if the risk-free rate is not between 0 and 1
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * // Example 1: Stream butterfly spreads for AAPL
     * const butterflyStream = await marketData.streamOptionChain('AAPL', {
     *   spreadType: 'Butterfly',
     *   strikeInterval: 5,
     *   expiration: '2024-01-19',
     *   strikeProximity: 3
     * });
     * 
     * // Example 2: Stream calendar spreads for MSFT
     * const calendarStream = await marketData.streamOptionChain('MSFT', {
     *   spreadType: 'Calendar',
     *   expiration: '2024-01-19',
     *   expiration2: '2024-02-16',
     *   optionType: 'Call',
     *   strikeRange: 'ITM'
     * });
     * 
     * // Example 3: Stream vertical spreads with custom risk-free rate
     * const verticalStream = await marketData.streamOptionChain('SPY', {
     *   spreadType: 'Vertical',
     *   strikeInterval: 1,
     *   riskFreeRate: 0.0425, // 4.25%
     *   priceCenter: 475.50,
     *   strikeProximity: 10
     * });
     * 
     * // Handle the stream data
     * stream.on('data', (data) => {
     *   if ('Delta' in data) {
     *     // Handle spread data
     *     console.log('Spread:', {
     *       strikes: data.Strikes,
     *       delta: data.Delta,
     *       gamma: data.Gamma,
     *       theta: data.Theta,
     *       vega: data.Vega,
     *       rho: data.Rho,
     *       iv: data.ImpliedVolatility,
     *       probability: {
     *         itm: data.ProbabilityITM,
     *         otm: data.ProbabilityOTM,
     *         breakeven: data.ProbabilityBE
     *       },
     *       value: {
     *         intrinsic: data.IntrinsicValue,
     *         extrinsic: data.ExtrinsicValue,
     *         theoretical: data.TheoreticalValue
     *       },
     *       market: {
     *         bid: data.Bid,
     *         ask: data.Ask,
     *         last: data.Last,
     *         volume: data.Volume
     *       }
     *     });
     *   } else if ('Heartbeat' in data) {
     *     console.log('Heartbeat:', data.Timestamp);
     *   } else {
     *     console.log('Error:', data.Message);
     *   }
     * });
     * ```
     */
    streamOptionChain(underlying: string, params: OptionChainParams = {}): Promise<EventEmitter> {
        // Set defaults
        const defaultParams: OptionChainParams = {
            strikeProximity: 5,
            spreadType: 'Single',
            strikeInterval: 1,
            enableGreeks: true,
            strikeRange: 'All',
            optionType: 'All'
        };

        // Validate Calendar/Diagonal spread requirements
        if (
            (params.spreadType === 'Calendar' || params.spreadType === 'Diagonal') &&
            !params.expiration2
        ) {
            throw new Error('expiration2 is required for Calendar and Diagonal spreads');
        }

        // Validate strike interval
        if (params.strikeInterval !== undefined && params.strikeInterval < 1) {
            throw new Error('strikeInterval must be greater than or equal to 1');
        }

        // Validate risk free rate format
        if (params.riskFreeRate !== undefined && (params.riskFreeRate < 0 || params.riskFreeRate > 1)) {
            throw new Error('riskFreeRate must be a decimal value between 0 and 1');
        }

        return this.streamManager.createStream(
            `/v3/marketdata/stream/options/chains/${underlying}`,
            { ...defaultParams, ...params },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    }

    /**
     * Stream price quotes and greeks for the specified option spread.
     * A maximum of 10 concurrent streams is allowed.
     * 
     * For options calculations, the WebAPI uses the following:
     * - 90 days for historical volatility of the underlying
     * - Bjerksund and Stensland option pricing model
     * - Ask price for price of the option
     * 
     * The stream provides real-time updates for:
     * - Greeks (Delta, Gamma, Theta, Vega, Rho)
     * - Implied Volatility and Standard Deviation
     * - Value Analysis (Intrinsic, Extrinsic, Theoretical)
     * - Probability Analysis (ITM, OTM, Breakeven)
     * - Market Data (Bid, Ask, Last, Volume, Open Interest)
     * - Spread Configuration (Strikes, Legs)
     * 
     * A heartbeat will be sent after 5 seconds on an idle stream to indicate that the stream is alive.
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/stream/options/quotes
     * 
     * @param params - Parameters for the option quotes stream
     * @param params.legs - Array of option legs to stream quotes for. Each leg must have:
     *                     - Symbol: The option symbol (e.g., 'MSFT 240119C400')
     *                              Format: {UNDERLYING} {YYMMDD}{C/P}{STRIKE}
     *                              Example: 'MSFT 240119C400' = MSFT Jan 19 2024 400 Call
     *                     - Ratio: Optional. The number of contracts relative to other legs.
     *                             Use positive for buy trades and negative for sell trades.
     *                             For example, a Butterfly spread would use ratios of 1, -2, 1.
     *                             Default: 1
     * @param params.riskFreeRate - The theoretical rate of return of an investment with zero risk.
     *                             Defaults to the current quote for $IRX.X.
     *                             The percentage rate should be specified as a decimal value between 0 and 1.
     *                             For example, to use 4.25% for the rate, pass in 0.0425.
     * @param params.enableGreeks - Specifies whether or not greeks properties are returned.
     *                             Default: true
     * 
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - Spread objects for option quote updates, containing:
     *            - Greeks (Delta, Gamma, Theta, Vega, Rho)
     *            - Implied Volatility and Standard Deviation
     *            - Value Analysis (Intrinsic, Extrinsic, Theoretical)
     *            - Probability Analysis (ITM, OTM, Breakeven)
     *            - Market Data (Bid, Ask, Last, Volume, Open Interest)
     *            - Spread Configuration (Strikes, Legs)
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamErrorResponse objects for any errors
     * 
     * @throws Error if no legs are provided
     * @throws Error if more than 10 concurrent streams are active
     * @throws Error if the risk-free rate is not between 0 and 1
     * @throws Error if any leg symbol is invalid
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * // Example 1: Stream quotes for a butterfly spread
     * const butterflyStream = await marketData.streamOptionQuotes({
     *   legs: [
     *     { Symbol: 'MSFT 240119C400', Ratio: 1 },  // Buy 1 contract
     *     { Symbol: 'MSFT 240119C405', Ratio: -2 }, // Sell 2 contracts
     *     { Symbol: 'MSFT 240119C410', Ratio: 1 }   // Buy 1 contract
     *   ],
     *   enableGreeks: true,
     *   riskFreeRate: 0.0425 // 4.25%
     * });
     * 
     * // Example 2: Stream quotes for a vertical spread
     * const verticalStream = await marketData.streamOptionQuotes({
     *   legs: [
     *     { Symbol: 'SPY 240119C470', Ratio: 1 },   // Buy 1 contract
     *     { Symbol: 'SPY 240119C475', Ratio: -1 }   // Sell 1 contract
     *   ],
     *   enableGreeks: true
     * });
     * 
     * // Example 3: Stream quotes for a straddle
     * const straddleStream = await marketData.streamOptionQuotes({
     *   legs: [
     *     { Symbol: 'AAPL 240119C190', Ratio: 1 },  // Buy 1 call
     *     { Symbol: 'AAPL 240119P190', Ratio: 1 }   // Buy 1 put
     *   ]
     * });
     * 
     * // Handle the stream data with detailed processing
     * stream.on('data', (data) => {
     *   if ('Delta' in data) {
     *     // Process option analytics
     *     const analytics = {
     *       greeks: {
     *         delta: data.Delta,
     *         gamma: data.Gamma,
     *         theta: data.Theta,
     *         vega: data.Vega,
     *         rho: data.Rho
     *       },
     *       volatility: {
     *         implied: data.ImpliedVolatility,
     *         standardDev: data.StandardDeviation
     *       },
     *       probabilities: {
     *         itm: {
     *           current: data.ProbabilityITM,
     *           withIV: data.ProbabilityITM_IV
     *         },
     *         otm: {
     *           current: data.ProbabilityOTM,
     *           withIV: data.ProbabilityOTM_IV
     *         },
     *         breakeven: {
     *           current: data.ProbabilityBE,
     *           withIV: data.ProbabilityBE_IV
     *         }
     *       },
     *       value: {
     *         intrinsic: data.IntrinsicValue,
     *         extrinsic: data.ExtrinsicValue,
     *         theoretical: {
     *           current: data.TheoreticalValue,
     *           withIV: data.TheoreticalValue_IV
     *         }
     *       },
     *       market: {
     *         last: data.Last,
     *         bid: data.Bid,
     *         ask: data.Ask,
     *         volume: data.Volume,
     *         openInterest: data.DailyOpenInterest
     *       }
     *     };
     *     
     *     console.log('Option Analytics:', analytics);
     *     console.log('Spread Legs:', data.Legs);
     *   } else if ('Heartbeat' in data) {
     *     console.log('Heartbeat:', data.Timestamp);
     *   } else {
     *     console.log('Error:', data.Message);
     *   }
     * });
     * ```
     */
    streamOptionQuotes(params: OptionQuoteParams): Promise<EventEmitter> {
        if (!params.legs.length) {
            throw new Error('At least one leg is required');
        }

        // Validate and transform legs to query parameters
        const queryParams: Record<string, string | number | boolean> = {
            enableGreeks: params.enableGreeks ?? true
        };

        // Validate risk free rate format
        if (params.riskFreeRate !== undefined && (params.riskFreeRate < 0 || params.riskFreeRate > 1)) {
            throw new Error('riskFreeRate must be a decimal value between 0 and 1');
        }

        if (params.riskFreeRate !== undefined) {
            queryParams.riskFreeRate = params.riskFreeRate;
        }

        // Validate option symbols format
        const symbolRegex = /^[A-Z]+\s\d{6}[CP]\d+$/;
        params.legs.forEach(leg => {
            if (!symbolRegex.test(leg.Symbol)) {
                throw new Error(`Invalid option symbol format: ${leg.Symbol}. Expected format: UNDERLYING YYMMDDCSTRIKE or UNDERLYING YYMMDDPSTRIKE`);
            }
        });

        // Add legs with sequential indices
        params.legs.forEach((leg, index) => {
            queryParams[`legs[${index}].Symbol`] = leg.Symbol;
            if (leg.Ratio !== undefined) {
                queryParams[`legs[${index}].Ratio`] = leg.Ratio;
            }
        });

        return this.streamManager.createStream(
            '/v3/marketdata/stream/options/quotes',
            queryParams,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    }

    /**
     * Stream market depth quotes for equities, futures and stock options.
     * A separate quote is returned for each price, side, and participant.
     * 
     * Market depth provides a detailed view of the order book, showing:
     * - Bid and Ask prices at multiple levels
     * - Size (volume) at each price level
     * - Number of orders at each price level
     * - Market participant information
     * 
     * The stream provides real-time updates for:
     * - Bid quotes ordered from high to low price
     * - Ask quotes ordered from low to high price
     * - Timestamp for each quote
     * - Market participant details
     * - Order count and size at each level
     * 
     * A heartbeat will be sent after 5 seconds on an idle stream to indicate that the stream is alive.
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/stream/marketdepth/quotes/{symbol}
     * 
     * @param symbol - A valid symbol for the security.
     *                 Examples: 'MSFT' (stock), 'ESH24' (future), 'MSFT 240119C400' (option)
     * @param params - Optional parameters for the market depth stream
     * @param params.maxlevels - The maximum number of market depth levels to return.
     *                          Must be a positive integer.
     *                          If omitted it defaults to 20.
     * 
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - MarketDepthQuote objects for market depth updates, containing:
     *            - Bids: Array of bid quotes ordered from high to low price
     *            - Asks: Array of ask quotes ordered from low to high price
     *            Each quote contains:
     *            - TimeStamp: When the quote was placed
     *            - Side: 'Bid' or 'Ask'
     *            - Price: The price level
     *            - Size: The size at this level
     *            - OrderCount: Number of orders at this level
     *            - Name: Market participant identifier
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamErrorResponse objects for any errors
     * 
     * @throws Error if maxlevels is not a positive integer
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * // Example 1: Stream market depth with default parameters (20 levels)
     * const stream = await marketData.streamMarketDepth('MSFT');
     * 
     * // Example 2: Stream market depth with custom levels
     * const stream = await marketData.streamMarketDepth('MSFT', { maxlevels: 10 });
     * 
     * stream.on('data', (data) => {
     *   if ('Bids' in data) {
     *     // Handle market depth update
     *     console.log('Market depth update:', data);
     *     // Example data:
     *     // {
     *     //   Bids: [{
     *     //     TimeStamp: '2024-01-24T15:30:00Z',
     *     //     Side: 'Bid',
     *     //     Price: '123.45',
     *     //     Size: '100',
     *     //     OrderCount: 5,
     *     //     Name: 'NSDQ'
     *     //   }],
     *     //   Asks: [{
     *     //     TimeStamp: '2024-01-24T15:30:00Z',
     *     //     Side: 'Ask',
     *     //     Price: '123.46',
     *     //     Size: '200',
     *     //     OrderCount: 3,
     *     //     Name: 'NSDQ'
     *     //   }]
     *     // }
     *   } else if ('Heartbeat' in data) {
     *     // Handle heartbeat
     *     console.log('Heartbeat:', data);
     *   } else {
     *     // Handle error
     *     console.log('Error:', data);
     *   }
     * });
     * ```
     */
    streamMarketDepth(symbol: string, params: MarketDepthParams = {}): Promise<EventEmitter> {
        // Validate maxlevels
        if (params.maxlevels !== undefined && params.maxlevels <= 0) {
            return Promise.reject(new Error('maxlevels must be a positive integer'));
        }

        return this.streamManager.createStream(
            `/v3/marketdata/stream/marketdepth/quotes/${symbol}`,
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    }

    /**
     * Stream aggregate market depth quotes for equities, futures and stock options.
     * A separate quote is returned for each price and side, using aggregated data from all participants.
     * 
     * Market depth aggregates provide a consolidated view of the order book, showing:
     * - Bid and Ask prices at multiple levels
     * - Total size (volume) at each price level
     * - Biggest and smallest order sizes at each level
     * - Number of participants and total order count
     * - Time range for orders at each level
     * 
     * The stream provides real-time updates for:
     * - Bid quotes ordered from high to low price
     * - Ask quotes ordered from low to high price
     * - Earliest and latest timestamps for each level
     * - Total size and order count at each level
     * - Size statistics (biggest, smallest) at each level
     * - Number of market participants at each level
     * 
     * A heartbeat will be sent after 5 seconds on an idle stream to indicate that the stream is alive.
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/stream/marketdepth/aggregates/{symbol}
     * 
     * @param symbol - A valid symbol for the security.
     *                 Examples: 'MSFT' (stock), 'ESH24' (future), 'MSFT 240119C400' (option)
     * @param params - Optional parameters for the market depth stream
     * @param params.maxlevels - The maximum number of market depth levels to return.
     *                          Must be a positive integer.
     *                          If omitted it defaults to 20.
     * 
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - MarketDepthAggregate objects for market depth updates, containing:
     *            - Bids: Array of bid quotes ordered from high to low price
     *            - Asks: Array of ask quotes ordered from low to high price
     *            Each quote contains:
     *            - EarliestTime: First timestamp for orders at this level
     *            - LatestTime: Most recent timestamp for orders at this level
     *            - Side: 'Bid' or 'Ask'
     *            - Price: The price level
     *            - TotalSize: Total size of all orders at this level
     *            - BiggestSize: Size of the largest order at this level
     *            - SmallestSize: Size of the smallest order at this level
     *            - NumParticipants: Number of market participants at this level
     *            - TotalOrderCount: Total number of orders at this level
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamErrorResponse objects for any errors
     * 
     * @throws Error if maxlevels is not a positive integer
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * // Example 1: Stream market depth aggregates with default parameters (20 levels)
     * const stream = await marketData.streamMarketDepthAggregates('MSFT');
     * 
     * // Example 2: Stream market depth aggregates with custom levels
     * const stream = await marketData.streamMarketDepthAggregates('MSFT', { maxlevels: 10 });
     * 
     * stream.on('data', (data) => {
     *   if ('Bids' in data) {
     *     // Handle market depth aggregate update
     *     console.log('Market depth aggregate update:');
     *     
     *     // Display bid side
     *     console.log('\nBids (ordered from high to low price):');
     *     data.Bids.forEach(bid => {
     *       console.log(`Price: ${bid.Price}`);
     *       console.log(`Total Size: ${bid.TotalSize}`);
     *       console.log(`Orders: ${bid.TotalOrderCount} from ${bid.NumParticipants} participants`);
     *       console.log(`Size Range: ${bid.SmallestSize} - ${bid.BiggestSize}`);
     *       console.log(`Time Range: ${bid.EarliestTime} - ${bid.LatestTime}\n`);
     *     });
     * 
     *     // Display ask side
     *     console.log('\nAsks (ordered from low to high price):');
     *     data.Asks.forEach(ask => {
     *       console.log(`Price: ${ask.Price}`);
     *       console.log(`Total Size: ${ask.TotalSize}`);
     *       console.log(`Orders: ${ask.TotalOrderCount} from ${ask.NumParticipants} participants`);
     *       console.log(`Size Range: ${ask.SmallestSize} - ${ask.BiggestSize}`);
     *       console.log(`Time Range: ${ask.EarliestTime} - ${ask.LatestTime}\n`);
     *     });
     * 
     *     // Calculate and display spread
     *     if (data.Asks.length > 0 && data.Bids.length > 0) {
     *       const bestBid = Math.max(...data.Bids.map(b => parseFloat(b.Price)));
     *       const bestAsk = Math.min(...data.Asks.map(a => parseFloat(a.Price)));
     *       const spread = bestAsk - bestBid;
     *       console.log(`\nSpread: ${spread.toFixed(4)}`);
     *     }
     * 
     *     // Display total liquidity at each price level
     *     console.log('\nLiquidity by Price Level:');
     *     const liquidity = new Map<string, { bidSize: number, askSize: number }>();
     * 
     *     data.Bids.forEach(bid => {
     *       liquidity.set(bid.Price, {
     *         bidSize: parseInt(bid.TotalSize),
     *         askSize: 0
     *       });
     *     });
     * 
     *     data.Asks.forEach(ask => {
     *       const current = liquidity.get(ask.Price) || { bidSize: 0, askSize: 0 };
     *       liquidity.set(ask.Price, {
     *         ...current,
     *         askSize: parseInt(ask.TotalSize)
     *       });
     *     });
     * 
     *     Array.from(liquidity.entries())
     *       .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
     *       .forEach(([price, { bidSize, askSize }]) => {
     *         console.log(`${price}: ${bidSize > 0 ? `Bid ${bidSize}` : ''}${bidSize > 0 && askSize > 0 ? ' | ' : ''}${askSize > 0 ? `Ask ${askSize}` : ''}`);
     *       });
     *   } else if ('Heartbeat' in data) {
     *     // Handle heartbeat
     *     console.log('Heartbeat:', data.Timestamp);
     *   } else {
     *     // Handle error
     *     console.log('Error:', data.Message);
     *   }
     * });
     * ```
     */
    streamMarketDepthAggregates(symbol: string, params: MarketDepthParams = {}): Promise<EventEmitter> {
        // Validate maxlevels
        if (params.maxlevels !== undefined && params.maxlevels <= 0) {
            throw new Error('maxlevels must be a positive integer');
        }

        return this.streamManager.createStream(
            `/v3/marketdata/stream/marketdepth/aggregates/${symbol}`,
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    }

    /**
     * Fetches crypto Symbol Names for all available cryptocurrency pairs.
     * This endpoint provides a list of all available cryptocurrency trading pairs
     * that can be used with other market data endpoints.
     * 
     * The endpoint returns a list of cryptocurrency pairs in the format:
     * - BTCUSD (Bitcoin/US Dollar)
     * - ETHUSD (Ethereum/US Dollar)
     * - LTCUSD (Litecoin/US Dollar)
     * - BCHUSD (Bitcoin Cash/US Dollar)
     * 
     * Note: While market data can be obtained for these symbols through various endpoints
     * (quotes, bars, etc.), they cannot be traded through the TradeStation API.
     * 
     * This is a non-streaming GET endpoint that returns a static list of available pairs.
     * For real-time cryptocurrency data, use the Quote Stream or Bar Stream endpoints
     * with these symbols.
     * 
     * @returns A Promise that resolves to a SymbolNames object containing an array of available crypto symbol names.
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Get available crypto pairs
     * const cryptoSymbols = await marketData.getCryptoSymbolNames();
     * console.log(cryptoSymbols.SymbolNames);
     * // ['BTCUSD', 'ETHUSD', 'LTCUSD', 'BCHUSD']
     * 
     * // Use with quote snapshots
     * const quotes = await marketData.getQuoteSnapshots(cryptoSymbols.SymbolNames);
     * quotes.Quotes.forEach(quote => {
     *   console.log(`${quote.Symbol}:`, {
     *     last: quote.Last,
     *     bid: quote.Bid,
     *     ask: quote.Ask,
     *     volume: quote.Volume
     *   });
     * });
     * 
     * // Use with streaming bars
     * const btcStream = await marketData.streamBars('BTCUSD', {
     *   interval: '1',
     *   unit: 'Minute'
     * });
     * btcStream.on('data', data => {
     *   if ('Close' in data) {
     *     console.log('BTC/USD:', {
     *       price: data.Close,
     *       volume: data.TotalVolume,
     *       time: data.TimeStamp
     *     });
     *   }
     * });
     * ```
     */
    async getCryptoSymbolNames(): Promise<SymbolNames> {
        const response = await this.httpClient.get<SymbolNames>('/v3/marketdata/symbollists/cryptopairs/symbolnames');
        return response.data;
    }

    /**
     * Get risk/reward analysis for an option spread.
     * 
     * @category Market Data
     * @endpoint POST /v3/marketdata/options/riskreward
     * 
     * @param analysis - The risk/reward analysis input
     * @returns A Promise that resolves to a RiskRewardAnalysis object
     * 
     * @throws Error if no legs are provided
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * const analysis = await marketData.getOptionRiskReward({
     *   SpreadPrice: '0.24',
     *   Legs: [
     *     {
     *       Symbol: 'AAPL 240119C150',
     *       Ratio: 1,
     *       OpenPrice: '3.50',
     *       TargetPrice: '5.00',
     *       StopPrice: '2.00'
     *     },
     *     {
     *       Symbol: 'AAPL 240119C152.5',
     *       Ratio: -1,
     *       OpenPrice: '2.00',
     *       TargetPrice: '1.00',
     *       StopPrice: '3.00'
     *     }
     *   ]
     * });
     * 
     * // Access the risk/reward metrics
     * console.log(`Max Profit: ${analysis.MaxProfit}`);
     * console.log(`Max Loss: ${analysis.MaxLoss}`);
     * console.log(`Breakeven Points: ${analysis.BreakevenPoints.join(', ')}`);
     * 
     * // Access the profit/loss points
     * analysis.ProfitLossPoints.forEach(point => {
     *   console.log(`At $${point.Price}: ${point.ProfitLoss}`);
     * });
     * // At $150.00: -0.24
     * // At $152.24: 0.00
     * // At $155.00: 2.76
     * // At $157.76: 0.00
     * // At $160.00: -0.24
     * ```
     */
    async getOptionRiskReward(analysis: RiskRewardAnalysisInput): Promise<RiskRewardAnalysis> {
        if (!analysis.Legs || analysis.Legs.length === 0) {
            throw new Error('At least one leg is required');
        }

        const response = await this.httpClient.post<RiskRewardAnalysis & { Error?: string; Message?: string }>(
            '/v3/marketdata/options/riskreward',
            analysis
        );

        if (response.data.Error) {
            throw new Error(response.data.Message);
        }

        return response.data;
    }

    /**
     * Get the available spread types for option chains.
     * This endpoint returns a list of all available option spread types and their configurations.
     * 
     * Each spread type defines:
     * 1. Whether it uses strike intervals between legs (e.g., Vertical spreads)
     * 2. Whether it can use multiple expiration dates (e.g., Calendar spreads)
     * 
     * Common spread types include:
     * - Single: Basic option position (no strike/expiration intervals)
     * - Vertical: Spread using different strikes, same expiration
     * - Calendar: Spread using same strike, different expirations
     * - Butterfly: Three-legged spread with specific strike intervals
     * - Condor: Four-legged spread with specific strike intervals
     * - Straddle: Combination of Call and Put at same strike/expiration
     * - Strangle: Combination of Call and Put at different strikes
     * 
     * @category Market Data
     * @endpoint GET /v3/marketdata/options/spreadtypes
     * 
     * @returns A Promise that resolves to a SpreadTypes object containing:
     *          - SpreadTypes: Array of spread type configurations, each with:
     *            - Name: The name of the spread type
     *            - StrikeInterval: Whether it uses strike intervals
     *            - ExpirationInterval: Whether it uses multiple expirations
     * 
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * 
     * @example
     * ```typescript
     * const spreadTypes = await marketData.getOptionSpreadTypes();
     * console.log(spreadTypes.SpreadTypes);
     * // [
     * //   {
     * //     Name: 'Single',
     * //     StrikeInterval: false,
     * //     ExpirationInterval: false
     * //   },
     * //   {
     * //     Name: 'Vertical',
     * //     StrikeInterval: true,
     * //     ExpirationInterval: false
     * //   },
     * //   ...
     * // ]
     * ```
     */
    async getOptionSpreadTypes(): Promise<SpreadTypes> {
        const response = await this.httpClient.get<SpreadTypes>('/v3/marketdata/options/spreadtypes');
        return response.data;
    }
} 