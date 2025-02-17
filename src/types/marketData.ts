export interface MarketFlags {
    IsBats: boolean;
    IsDelayed: boolean;
    IsHalted: boolean;
    IsHardToBorrow: boolean;
}

export interface Quote {
    Symbol: string;
    Ask: string;
    AskSize: string;
    Bid: string;
    BidSize: string;
    Close: string;
    DailyOpenInterest: string;
    High: string;
    Low: string;
    High52Week: string;
    High52WeekTimestamp: string;
    Last: string;
    MinPrice?: string;
    MaxPrice?: string;
    FirstNoticeDate?: string;
    LastTradingDate?: string;
    Low52Week: string;
    Low52WeekTimestamp: string;
    MarketFlags: MarketFlags;
    NetChange: string;
    NetChangePct: string;
    Open: string;
    PreviousClose: string;
    PreviousVolume: string;
    Restrictions?: string[];
    TickSizeTier: string;
    TradeTime: string;
    Volume: string;
    LastSize: string;
    LastVenue: string;
    VWAP: string;
}

export interface QuoteError {
    Symbol: string;
    Error: string;
}

export interface QuoteSnapshot {
    Quotes: Quote[];
    Errors: QuoteError[];
}

/** Valid time units for bar intervals */
export type BarUnit = 'Minute' | 'Daily' | 'Weekly' | 'Monthly';

/** US stock market session templates for extended trading hours */
export type SessionTemplate = 'USEQPre' | 'USEQPost' | 'USEQPreAndPost' | 'USEQ24Hour' | 'Default';

/**
 * Represents a single price bar with OHLC and volume data
 */
export interface Bar {
    /** The closing price of the current bar */
    Close: string;
    /** A trade made at a price less than the previous trade price or at a price equal to the previous trade price */
    DownTicks: number;
    /** Volume traded on downticks. A tick is considered a downtick if the previous tick was a downtick or the price is lower than the previous tick */
    DownVolume: number;
    /** The Epoch time */
    Epoch: number;
    /** The high price of the current bar */
    High: string;
    /** Conveys that all historical bars in the request have been delivered */
    IsEndOfHistory: boolean;
    /** Set when there is data in the bar and the data is being built in "real time" from a trade */
    IsRealtime: boolean;
    /** The low price of the current bar */
    Low: string;
    /** The open price of the current bar */
    Open: string;
    /** The total number of open contracts (futures/options) */
    OpenInterest: string;
    /** ISO8601 formatted timestamp */
    TimeStamp: string;
    /** Total number of trades in the bar */
    TotalTicks: number;
    /** Total volume for the bar */
    TotalVolume: string;
    /** @deprecated Number of trades with no price change */
    UnchangedTicks?: number;
    /** @deprecated Volume of trades with no price change */
    UnchangedVolume?: number;
    /** Number of trades that moved the price up */
    UpTicks: number;
    /** Volume of trades that moved the price up */
    UpVolume: number;
    /** Status of the bar */
    BarStatus: 'Open' | 'Closed';
}

/**
 * Contains a list of barchart data
 */
export interface BarsResponse {
    /** Array of price bars */
    Bars: Bar[];
}

/**
 * Parameters for requesting historical bars
 */
export interface BarHistoryParams {
    /** 
     * Default: 1. Interval that each bar will consist of.
     * For minute bars, the number of minutes aggregated in a single bar.
     * For bar units other than minute, value must be 1.
     * For unit Minute the max allowed Interval is 1440.
     */
    interval?: string;

    /** 
     * Default: Daily. The unit of time for each bar interval.
     * Valid values are: Minute, Daily, Weekly, Monthly.
     */
    unit?: BarUnit;

    /**
     * Default: 1. Number of bars back to fetch.
     * Maximum of 57,600 bars for intraday requests.
     * No limit for daily, weekly, or monthly bars.
     * Mutually exclusive with firstdate.
     */
    barsback?: number;

    /**
     * The first date to fetch bars from.
     * Format: YYYY-MM-DD or ISO8601 (e.g. 2020-04-20T18:00:00Z)
     * Mutually exclusive with barsback.
     */
    firstdate?: string;

    /**
     * The last date to fetch bars to. Defaults to current time.
     * Format: YYYY-MM-DD or ISO8601 (e.g. 2020-04-20T18:00:00Z)
     * Mutually exclusive with startdate (deprecated).
     */
    lastdate?: string;

    /**
     * US stock market session template for extended trading hours.
     * Ignored for non-US equity symbols.
     */
    sessiontemplate?: SessionTemplate;
}

export interface OptionChain {
    UnderlyingSymbol: string;
    Expirations: string[];
    Strikes: number[];
    Greeks: OptionGreeks;
}

export interface OptionGreeks {
    Delta: number;
    Gamma: number;
    Theta: number;
    Vega: number;
    Rho: number;
    ImpliedVolatility: number;
}

export interface OptionQuote extends Quote {
    StrikePrice: number;
    ExpirationDate: string;
    Type: 'Call' | 'Put';
    Greeks: OptionGreeks;
}

export interface MarketDepthQuoteData {
    TimeStamp: string;
    Side: 'Bid' | 'Ask';
    Price: string;
    Size: string;
    OrderCount: number;
    Name: string;
}

export interface MarketDepthQuote {
    Bids: MarketDepthQuoteData[];
    Asks: MarketDepthQuoteData[];
}

export interface MarketDepthParams {
    maxlevels?: number;  // Default: 20
}

export type MarketDepthStreamResponse = MarketDepthQuote | Heartbeat | StreamErrorResponse;

export type AssetType = 'STOCK' | 'FUTURE' | 'STOCKOPTION' | 'INDEXOPTION' | 'FOREX' | 'CRYPTO';
export type CallPut = 'Call' | 'Put';

export interface PriceFormat {
    Format: 'Decimal' | 'Fraction' | 'SubFraction';
    Decimals?: string;
    Fraction?: string;
    SubFraction?: string;
    IncrementStyle: 'Simple';
    Increment: string;
    PointValue: string;
}

export interface QuantityFormat {
    Format: 'Decimal';
    Decimals: string;
    IncrementStyle: 'Simple';
    Increment: string;
    MinimumTradeQuantity: string;
}

export interface SymbolDetail {
    AssetType: AssetType;
    Country: string;
    Currency: string;
    Description: string;
    Exchange: string;
    ExpirationDate?: string;
    FutureType?: string;
    OptionType?: CallPut;
    PriceFormat: PriceFormat;
    QuantityFormat: QuantityFormat;
    Root: string;
    StrikePrice?: string;
    Symbol: string;
    Underlying?: string;
}

export interface SymbolDetailsErrorResponse {
    Symbol: string;
    Message: string;
}

export interface SymbolDetailsResponse {
    Symbols: SymbolDetail[];
    Errors: SymbolDetailsErrorResponse[];
}

export interface Heartbeat {
    Heartbeat: number;
    Timestamp: string;
}

export interface StreamErrorResponse {
    Error: string;
    Message: string;
}

export interface QuoteStream extends Omit<Quote, 'Restrictions' | 'LastSize' | 'LastVenue' | 'VWAP'> {
    Error?: string;
}

export type QuoteStreamResponse = QuoteStream | Heartbeat | StreamErrorResponse;

export type BarStreamResponse = Bar | Heartbeat | StreamErrorResponse;

/**
 * Parameters for streaming bar data
 */
export interface BarStreamParams {
    /** 
     * Default: 1. Interval that each bar will consist of.
     * For minute bars, the number of minutes aggregated in a single bar.
     * For bar units other than minute, value must be 1.
     */
    interval?: string;

    /** 
     * Default: Daily. Unit of time for each bar interval.
     * Valid values are: minute, daily, weekly, and monthly.
     */
    unit?: BarUnit;

    /**
     * The bars back - the max value is 57600.
     */
    barsback?: number;

    /**
     * US stock market session template for extended trading hours.
     * Ignored for non-US equity symbols.
     */
    sessiontemplate?: SessionTemplate;
}

export interface SpreadLeg {
    Symbol: string;
    Ratio: number;
    StrikePrice: string;
    Expiration: string;
    OptionType: 'Call' | 'Put';
}

export interface Spread {
    Delta: string;
    Theta: string;
    Gamma: string;
    Rho: string;
    Vega: string;
    ImpliedVolatility: string;
    IntrinsicValue: string;
    ExtrinsicValue: string;
    TheoreticalValue: string;
    ProbabilityITM: string;
    ProbabilityOTM: string;
    ProbabilityBE: string;
    ProbabilityITM_IV: string;
    ProbabilityOTM_IV: string;
    ProbabilityBE_IV: string;
    TheoreticalValue_IV: string;
    StandardDeviation: string;
    DailyOpenInterest: number;
    Ask: string;
    Bid: string;
    Mid: string;
    AskSize: number;
    BidSize: number;
    Close: string;
    High: string;
    Last: string;
    Low: string;
    NetChange: string;
    NetChangePct: string;
    Open: string;
    PreviousClose: string;
    Volume: number;
    Side: 'Call' | 'Put' | 'Both';
    Strikes: string[];
    Legs: SpreadLeg[];
}

export type OptionChainStreamResponse = Spread | Heartbeat | StreamErrorResponse;

export interface OptionChainParams {
    /**
     * Date on which the option contract expires; must be a valid expiration date.
     * Defaults to the next contract expiration date.
     * Format: YYYY-MM-DD or ISO8601 (e.g., "2024-01-19" or "2024-01-19T00:00:00Z")
     */
    expiration?: string;

    /**
     * Second contract expiration date required for Calendar and Diagonal spreads.
     * Format: YYYY-MM-DD or ISO8601 (e.g., "2024-01-19" or "2024-01-19T00:00:00Z")
     */
    expiration2?: string;

    /**
     * Specifies the number of spreads to display above and below the priceCenter.
     * Default: 5
     */
    strikeProximity?: number;

    /**
     * Specifies the name of the spread type to use.
     * Common values: "Single", "Vertical", "Calendar", "Butterfly", "Condor", "Straddle", "Strangle"
     * Default: "Single"
     */
    spreadType?: string;

    /**
     * The theoretical rate of return of an investment with zero risk.
     * Defaults to the current quote for $IRX.X.
     * The percentage rate should be specified as a decimal value between 0 and 1.
     * For example, to use 2% for the rate, pass in 0.02.
     */
    riskFreeRate?: number;

    /**
     * Specifies the strike price center.
     * Defaults to the last quoted price for the underlying security.
     */
    priceCenter?: number;

    /**
     * Specifies the desired interval between the strike prices in a spread.
     * Must be greater than or equal to 1.
     * A value of 1 uses consecutive strikes; a value of 2 skips one between strikes; and so on.
     * Default: 1
     */
    strikeInterval?: number;

    /**
     * Specifies whether or not greeks properties are returned.
     * Default: true
     */
    enableGreeks?: boolean;

    /**
     * Filters the chain by intrinsic value:
     * - "ITM" (in-the-money): includes only spreads that have an intrinsic value greater than zero
     * - "OTM" (out-of-the-money): includes only spreads that have an intrinsic value equal to zero
     * - "All": includes all spreads regardless of intrinsic value
     * Default: "All"
     */
    strikeRange?: 'All' | 'ITM' | 'OTM';

    /**
     * Filters the spreads by a specific option type.
     * Valid values are "All", "Call", and "Put".
     * Default: "All"
     */
    optionType?: 'All' | 'Call' | 'Put';
}

export interface OptionQuoteLeg {
    Symbol: string;
    Ratio?: number;  // Default: 1
}

export interface OptionQuoteParams {
    legs: OptionQuoteLeg[];
    riskFreeRate?: number;
    enableGreeks?: boolean;  // Default: true
}

export type OptionQuoteStreamResponse = Spread | Heartbeat | StreamErrorResponse;

export interface AggregatedQuoteData {
    EarliestTime: string;
    LatestTime: string;
    Side: 'Bid' | 'Ask';
    Price: string;
    TotalSize: string;
    BiggestSize: string;
    SmallestSize: string;
    NumParticipants: number;
    TotalOrderCount: number;
}

export interface MarketDepthAggregate {
    Bids: AggregatedQuoteData[];
    Asks: AggregatedQuoteData[];
}

export type MarketDepthAggregateStreamResponse = MarketDepthAggregate | Heartbeat | StreamErrorResponse;

/**
 * A collection of Symbol names.
 */
export interface SymbolNames {
    /** Array of symbol names */
    SymbolNames: string[];
}

/**
 * Represents a single option expiration date with its type
 */
export interface Expiration {
    /** The expiration date in ISO8601 format */
    Date: string;
    /** The type of expiration (Monthly, Weekly, Quarterly) */
    Type: 'Monthly' | 'Weekly' | 'Quarterly';
}

/**
 * Response containing available option expiration dates
 */
export interface Expirations {
    /** Array of available expiration dates */
    Expirations: Expiration[];
}

/**
 * Provides information about one leg of a potential option spread trade.
 */
export interface RiskRewardLeg {
    Symbol: string;
    Ratio: number;
    OpenPrice: string;
    TargetPrice: string;
    StopPrice: string;
}

/**
 * Provides the required information to analyze the risk vs. reward of a potential option spread trade.
 */
export interface RiskRewardAnalysisInput {
    SpreadPrice: string;
    Legs: RiskRewardLeg[];
}

/**
 * Result of analyzing the risk vs. reward of a potential option spread trade.
 */
export interface RiskRewardAnalysis {
    SpreadPrice: string;
    MaxGain: string;
    MaxLoss: string;
    RiskRewardRatio: string;
    Commission: string;
    Legs: RiskRewardLeg[];
}

/**
 * Represents an option spread type configuration.
 * Each spread type defines whether it uses strike intervals and/or multiple expirations.
 */
export interface SpreadType {
    /** The name of the spread type (e.g., 'Single', 'Butterfly', 'Calendar', etc.) */
    Name: string;
    /** Whether the spread type uses strike intervals between legs */
    StrikeInterval: boolean;
    /** Whether the spread type can use multiple expiration dates */
    ExpirationInterval: boolean;
}

/**
 * Response from the Get Option Spread Types endpoint.
 * Contains a list of available option spread types and their configurations.
 */
export interface SpreadTypes {
    /** Array of available spread types and their configurations */
    SpreadTypes: SpreadType[];
}

/**
 * Response containing available strike prices for a specific spread type.
 */
export interface Strikes {
    /** Name of the spread type for these strikes */
    SpreadType: string;
    /** 
     * Array of the strike prices for this spread type.
     * Each element in the Strikes array is an array of strike prices for a single spread.
     * For example, for a Butterfly spread, each inner array contains three strikes:
     * [["145", "150", "155"], ["150", "155", "160"]]
     */
    Strikes: string[][];
}

export interface OptionExpiration {
    ExpirationDate: string;
    DaysToExpiration: number;
    IsWeekly: boolean;
    IsMonthlies: boolean;
    IsQuarterly: boolean;
    IsLeaps: boolean;
    StrikePrices: string[];
}

export interface OptionExpirations {
    Expirations: OptionExpiration[];
}

export interface OptionRiskRewardRequest {
    Symbol: string;
    Quantity: number;
    OpenPrice: string;
    TargetPrice: string;
    StopPrice: string;
}

export interface OptionRiskReward {
    Symbol: string;
    Quantity: number;
    OpenPrice: string;
    TargetPrice: string;
    StopPrice: string;
    MaxGain: string;
    MaxLoss: string;
    RiskRewardRatio: string;
    Commission: string;
} 