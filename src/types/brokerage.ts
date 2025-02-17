/**
 * Contains brokerage account information for individual brokerage accounts.
 */
export interface Account {
    /** The unique identifier for the account */
    AccountID: string;
    /** The type of the TradeStation Account. Valid values are: Cash, Margin, Futures, and DVP */
    AccountType: 'Cash' | 'Margin' | 'Futures' | 'DVP';
    /** A user specified name that identifies a TradeStation account. Omits if not set */
    Alias?: string;
    /** TradeStation account ID for accounts based in Japan. Omits if not set */
    AltID?: string;
    /** Currency associated with this account */
    Currency: string;
    /** 
     * Status of a specific account:
     * - Active
     * - Closed
     * - Closing Transaction Only
     * - Margin Call - Closing Transactions Only
     * - Inactive
     * - Liquidating Transactions Only
     * - Restricted
     * - 90 Day Restriction-Closing Transaction Only
     */
    Status: string;
    /** Detailed account information */
    AccountDetail?: AccountDetail;
}

/**
 * Contains detailed account information
 */
export interface AccountDetail {
    /** Indicates if the account is eligible for stock locate */
    IsStockLocateEligible: boolean;
    /** Indicates if the account is enrolled in RegT program */
    EnrolledInRegTProgram: boolean;
    /** Indicates if buying power warning is required */
    RequiresBuyingPowerWarning: boolean;
    /** Indicates if the account is qualified for day trading */
    DayTradingQualified: boolean;
    /** The option approval level for the account */
    OptionApprovalLevel: number;
    /** Indicates if the account is flagged as a pattern day trader */
    PatternDayTrader: boolean;
}

export type AccountType = 'Cash' | 'Margin' | 'Futures' | 'Crypto';
export type TradingType = 'Equities' | 'Options' | 'Futures' | 'Forex' | 'Crypto';
export type AccountStatus = 'Active' | 'Closed' | 'Suspended';
export type MarginType = 'Reg T' | 'Portfolio Margin';

/**
 * Contains realtime balance information for a single account.
 */
export interface Balance {
    AccountID: string;
    AccountType?: string;
    BalanceDetail?: BalanceDetail;
    BuyingPower?: string;
    CashBalance?: string;
    Commission?: string;
    CurrencyDetails?: CurrencyDetail[];
    Equity?: string;
    MarketValue?: string;
    TodaysProfitLoss?: string;
    UnclearedDeposit?: string;
}

/**
 * Contains real-time balance information that varies according to account type.
 */
export interface BalanceDetail {
    CostOfPositions?: string;
    DayTradeExcess?: string;
    DayTradeMargin?: string;
    DayTradeOpenOrderMargin?: string;
    DayTrades?: string;
    InitialMargin?: string;
    MaintenanceMargin?: string;
    MaintenanceRate?: string;
    MarginRequirement?: string;
    UnrealizedProfitLoss?: string;
    UnsettledFunds?: string;
}

/**
 * Contains currency-specific balance information (only applies to futures).
 */
export interface CurrencyDetail {
    Currency: string;
    BODOpenTradeEquity?: string;
    CashBalance?: string;
    Commission?: string;
    MarginRequirement?: string;
    NonTradeDebit?: string;
    NonTradeNetBalance?: string;
    OptionValue?: string;
    RealTimeUnrealizedGains?: string;
    TodayRealTimeTradeEquity?: string;
    TradeEquity?: string;
}

/**
 * Contains a collection of realtime balance information.
 */
export interface Balances {
    Balances: Balance[];
    Errors?: BalanceError[];
}

/**
 * Contains error details for partial success responses.
 */
export interface BalanceError {
    AccountID: string;
    Error: string;
    Message: string;
}

/**
 * Contains a collection of positions for the requested accounts.
 */
export interface Positions {
    /** Array of positions */
    Positions: PositionResponse[];
    /** Array of errors that occurred during the request */
    Errors?: PositionError[];
}

/**
 * Position represents a position that is returned for an Account.
 */
export interface PositionResponse {
    /** The unique identifier for the account */
    AccountID: string;
    /** Indicates the asset type of the position */
    AssetType: 'STOCK' | 'STOCKOPTION' | 'FUTURE' | 'INDEXOPTION';
    /** The average price of the position currently held */
    AveragePrice: string;
    /** The highest price a prospective buyer is prepared to pay at a particular time for a trading unit of a given symbol */
    Bid: string;
    /** The price at which a security, futures contract, or other financial instrument is offered for sale */
    Ask: string;
    /** The currency conversion rate that is used in order to convert from the currency of the symbol to the currency of the account */
    ConversionRate: string;
    /** (Futures) DayTradeMargin used on open positions. Currently only calculated for futures positions. Other asset classes will have a 0 for this value */
    DayTradeRequirement: string;
    /** The UTC formatted expiration date of the future or option symbol, in the country the contract is traded in. The time portion of the value should be ignored */
    ExpirationDate?: string;
    /** Only applies to future and option positions. The margin account balance denominated in the symbol currency required for entering a position on margin */
    InitialRequirement: string;
    /** The margin account balance denominated in the account currency required for maintaining a position on margin */
    MaintenanceMargin: string;
    /** The last price at which the symbol traded */
    Last: string;
    /** Specifies if the position is Long or Short */
    LongShort: 'Long' | 'Short';
    /** Only applies to equity and option positions. The MarkToMarketPrice value is the weighted average of the previous close price for the position quantity held overnight and the purchase price of the position quantity opened during the current market session. This value is used to calculate TodaysProfitLoss */
    MarkToMarketPrice: string;
    /** The actual market value denominated in the symbol currency of the open position. This value is updated in real-time */
    MarketValue: string;
    /** A unique identifier for the position */
    PositionID: string;
    /** The number of shares or contracts for a particular position. This value is negative for short positions */
    Quantity: string;
    /** Symbol of the position */
    Symbol: string;
    /** Time the position was entered */
    Timestamp: string;
    /** Only applies to equity and option positions. This value will be included in the payload to convey the unrealized profit or loss denominated in the account currency on the position held, calculated using the MarkToMarketPrice */
    TodaysProfitLoss: string;
    /** The total cost denominated in the account currency of the open position */
    TotalCost: string;
    /** The unrealized profit or loss denominated in the symbol currency on the position held, calculated based on the average price of the position */
    UnrealizedProfitLoss: string;
    /** The unrealized profit or loss on the position expressed as a percentage of the initial value of the position */
    UnrealizedProfitLossPercent: string;
    /** The unrealized profit or loss denominated in the account currency divided by the number of shares, contracts or units held */
    UnrealizedProfitLossQty: string;
}

/**
 * Error information for position requests.
 */
export interface PositionError {
    /** The AccountID of the error, may contain multiple Account IDs in comma separated format */
    AccountID: string;
    /** The Error */
    Error: string;
    /** The error message */
    Message: string;
}

export interface Activity {
    AccountID: string;
    ActivityType: ActivityType;
    Symbol?: string;
    Description: string;
    Amount: number;
    TradeDate?: string;
    SettleDate?: string;
    TransactionID: string;
    OrderID?: string;
}

export type ActivityType =
    | 'Trade'
    | 'Dividend'
    | 'Interest'
    | 'Transfer'
    | 'Fee'
    | 'Journal'
    | 'Deposit'
    | 'Withdrawal';

export interface ActivityFilter {
    startDate?: string;
    endDate?: string;
    activityType?: ActivityType[];
    symbol?: string;
    pageSize?: number;
    pageNumber?: number;
}

/**
 * Contains error details when a request fails.
 */
export interface ErrorResponse {
    /** 
     * Error Title, can be any of:
     * - BadRequest
     * - Unauthorized
     * - Forbidden
     * - TooManyRequests
     * - InternalServerError
     * - NotImplemented
     * - ServiceUnavailable
     * - GatewayTimeout
     */
    Error: string;
    /** The description of the error */
    Message: string;
}

/**
 * Contains a collection of beginning of day balance information.
 */
export interface BalancesBOD {
    BODBalances: BODBalance[];
    Errors?: BalanceError[];
}

/**
 * Contains beginning of day balance information for a single account.
 */
export interface BODBalance {
    AccountID: string;
    AccountType?: string;
    BalanceDetail?: BODBalanceDetail;
    CurrencyDetails?: BODCurrencyDetail[];
}

/**
 * Contains detailed beginning of day balance information which varies according to account type.
 */
export interface BODBalanceDetail {
    /** Only applies to equities. The amount of cash in the account at the beginning of the day. */
    AccountBalance?: string;
    /** Beginning of day value for cash available to withdraw. */
    CashAvailableToWithdraw?: string;
    /** Only applies to equities. The number of day trades placed in the account within the previous 4 trading days. */
    DayTrades?: string;
    /** Only applies to equities. The Intraday Buying Power with which the account started the trading day. */
    DayTradingMarginableBuyingPower?: string;
    /** The total amount of equity with which you started the current trading day. */
    Equity?: string;
    /** The amount of cash in the account at the beginning of the day. */
    NetCash?: string;
    /** Only applies to futures. Unrealized profit and loss at the beginning of the day. */
    OpenTradeEquity?: string;
    /** Only applies to equities. Option buying power at the start of the trading day. */
    OptionBuyingPower?: string;
    /** Only applies to equities. Intraday liquidation value of option positions. */
    OptionValue?: string;
    /** (Equities) Overnight Buying Power (Regulation T) at the start of the trading day. */
    OvernightBuyingPower?: string;
    /** (Futures) The value of special securities that are deposited by the customer with the clearing firm. */
    SecurityOnDeposit?: string;
}

/**
 * Contains beginning of day currency detail information (only applies to futures).
 */
export interface BODCurrencyDetail {
    /** The dollar amount of Beginning Day Margin for the given forex account. */
    AccountMarginRequirement?: string;
    /** The dollar amount of Beginning Day Trade Equity for the given account. */
    AccountOpenTradeEquity?: string;
    /** The value of special securities that are deposited by the customer. */
    AccountSecurities?: string;
    /** The dollar amount of the Beginning Day Cash Balance for the given account. */
    CashBalance?: string;
    /** The currency of the entity. */
    Currency: string;
    /** The dollar amount of Beginning Day Margin for the given forex account. */
    MarginRequirement?: string;
}

/**
 * Contains a collection of historical orders for the requested accounts.
 */
export interface HistoricalOrders {
    /** Array of historical orders */
    Orders: HistoricalOrder[];
    /** Array of errors that occurred during the request */
    Errors?: OrderError[];
    /** Token for paginated results to retrieve the next page */
    NextToken?: string;
}

/**
 * Base order information shared by all order types.
 */
export interface OrderBase {
    /** The account ID associated with the order */
    AccountID: string;
    /** The commission fee for the order */
    CommissionFee?: string;
    /** The currency of the order */
    Currency?: string;
    /** The duration of the order (e.g., "DAY", "GTC") */
    Duration?: string;
    /** The good till date for GTD orders */
    GoodTillDate?: string;
    /** The legs of the order for multi-leg orders */
    Legs?: OrderLeg[];
    /** Market activation rules for conditional orders */
    MarketActivationRules?: MarketActivationRule[];
    /** The unique identifier for the order */
    OrderID: string;
    /** The date and time when the order was opened */
    OpenedDateTime?: string;
    /** The type of order (e.g., "Market", "Limit") */
    OrderType?: string;
    /** The price used for buying power calculations */
    PriceUsedForBuyingPower?: string;
    /** The routing destination for the order */
    Routing?: string;
    /** Advanced options string for complex orders */
    AdvancedOptions?: string;
}

/**
 * Historical order information extending the base order.
 */
export interface HistoricalOrder extends OrderBase {
    /** The status of the historical order */
    Status?: HistoricalOrderStatus;
    /** Description of the order status */
    StatusDescription?: string;
    /** The stop price for stop and stop-limit orders */
    StopPrice?: string;
    /** Trailing stop information */
    TrailingStop?: TrailingStop;
    /** Only applies to equities. Will contain a value if the order has received a routing fee */
    UnbundledRouteFee?: string;
    /** Conditional orders associated with this order */
    ConditionalOrders?: Array<{
        /** The relationship type (e.g., "OCO" for One-Cancels-Other) */
        Relationship: string;
        /** The ID of the related order */
        OrderID: string;
    }>;
}

/**
 * Represents a leg in a multi-leg order.
 */
export interface OrderLeg {
    /** The type of asset (e.g., "STOCK", "OPTION") */
    AssetType: string;
    /** Buy or sell action */
    BuyOrSell: 'Buy' | 'Sell';
    /** Quantity that has been executed */
    ExecQuantity: string;
    /** Price at which the order was executed */
    ExecutionPrice: string;
    /** Expiration date for options */
    ExpirationDate?: string;
    /** Whether the position is being opened or closed */
    OpenOrClose: 'Open' | 'Close';
    /** Type of option (CALL or PUT) */
    OptionType?: string;
    /** Total quantity ordered */
    QuantityOrdered: string;
    /** Quantity still remaining to be filled */
    QuantityRemaining: string;
    /** Strike price for options */
    StrikePrice?: string;
    /** The symbol being traded */
    Symbol: string;
    /** The underlying symbol for options */
    Underlying?: string;
}

/**
 * Market activation rule for conditional orders.
 */
export interface MarketActivationRule {
    /** Type of rule (e.g., "Price") */
    RuleType: string;
    /** Symbol the rule is based on */
    Symbol: string;
    /** Predicate for the rule (e.g., "gt" for greater than) */
    Predicate: string;
    /** Key used for triggering */
    TriggerKey: string;
    /** Price level for the rule */
    Price: string;
}

/**
 * Trailing stop information for orders.
 */
export interface TrailingStop {
    /** Amount of the trailing stop */
    Amount?: string;
    /** Type of trailing stop */
    AmountType?: string;
}

/**
 * Error information for order requests.
 */
export interface OrderError {
    /** The account ID associated with the error */
    AccountID: string;
    /** The type of error that occurred */
    Error: string;
    /** Detailed error message */
    Message: string;
}

/**
 * Status values for historical orders.
 */
export type HistoricalOrderStatus =
    // Open statuses
    | 'ACK'    // Received
    | 'ASS'    // Option Assignment
    | 'BRC'    // Bracket Canceled
    | 'BRF'    // Bracket Filled
    | 'BRO'    // Broken
    | 'CHG'    // Change
    | 'CND'    // Condition Met
    | 'COR'    // Fill Corrected
    | 'DIS'    // Dispatched
    | 'DOA'    // Dead
    | 'DON'    // Queued
    | 'ECN'    // Expiration Cancel Request
    | 'EXE'    // Option Exercise
    | 'FPR'    // Partial Fill (Alive)
    | 'LAT'    // Too Late to Cancel
    | 'OPN'    // Sent
    | 'OSO'    // OSO Order
    | 'OTHER'  // OrderStatus not mapped
    | 'PLA'    // Sending
    | 'REC'    // Big Brother Recall Request
    | 'RJC'    // Cancel Request Rejected
    | 'RPD'    // Replace Pending
    | 'RSN'    // Replace Sent
    | 'STP'    // Stop Hit
    | 'STT'    // OrderStatus Message
    | 'SUS'    // Suspended
    | 'UCN'    // Cancel Sent
    // Canceled statuses
    | 'CAN'    // Canceled
    | 'EXP'    // Expired
    | 'OUT'    // UROut
    | 'RJR'    // Change Request Rejected
    | 'SCN'    // Big Brother Recall
    | 'TSC'    // Trade Server Canceled
    | 'UCH'    // Replaced
    // Rejected status
    | 'REJ'    // Rejected
    // Filled statuses
    | 'FLL'    // Filled
    | 'FLP';   // Partial Fill (UROut)

/**
 * Contains a collection of historical orders for specific order IDs.
 */
export interface HistoricalOrdersById {
    /** Array of historical orders */
    Orders: HistoricalOrder[];
    /** Array of errors that occurred during the request */
    Errors?: OrderByIDError[];
}

/**
 * Error information for order by ID requests.
 */
export interface OrderByIDError {
    /** The AccountID of the error, may contain multiple Account IDs in comma separated format */
    AccountID: string;
    /** The OrderID of the error */
    OrderID: string;
    /** The Error */
    Error: string;
    /** The error message */
    Message: string;
}

/**
 * Contains a collection of today's orders and open orders.
 */
export interface Orders {
    /** Array of orders */
    Orders: Order[];
    /** Array of errors that occurred during the request */
    Errors?: OrderError[];
    /** Token for paginated results to retrieve the next page */
    NextToken?: string;
}

/**
 * Contains order information for today's orders and open orders.
 */
export interface Order extends OrderBase {
    /** The status of the order */
    Status?: OrderStatus;
    /** Description of the status */
    StatusDescription?: string;
    /** The stop price for StopLimit and StopMarket orders */
    StopPrice?: string;
    /** Trailing stop information */
    TrailingStop?: TrailingStop;
    /** Only applies to equities. Will contain a value if the order has received a routing fee */
    UnbundledRouteFee?: string;
    /** The limit price for this order */
    LimitPrice?: string;
}

/**
 * Status values for orders.
 */
export type OrderStatus =
    // Open statuses
    | 'ACK'    // Received
    | 'ASS'    // Option Assignment
    | 'BRC'    // Bracket Canceled
    | 'BRF'    // Bracket Filled
    | 'BRO'    // Broken
    | 'CHG'    // Change
    | 'CND'    // Condition Met
    | 'COR'    // Fill Corrected
    | 'DIS'    // Dispatched
    | 'DOA'    // Dead
    | 'DON'    // Queued
    | 'ECN'    // Expiration Cancel Request
    | 'EXE'    // Option Exercise
    | 'FPR'    // Partial Fill (Alive)
    | 'LAT'    // Too Late to Cancel
    | 'OPN'    // Sent
    | 'OSO'    // OSO Order
    | 'OTHER'  // OrderStatus not mapped
    | 'PLA'    // Sending
    | 'REC'    // Big Brother Recall Request
    | 'RJC'    // Cancel Request Rejected
    | 'RPD'    // Replace Pending
    | 'RSN'    // Replace Sent
    | 'STP'    // Stop Hit
    | 'STT'    // OrderStatus Message
    | 'SUS'    // Suspended
    | 'UCN'    // Cancel Sent
    // Canceled statuses
    | 'CAN'    // Canceled
    | 'EXP'    // Expired
    | 'OUT'    // UROut
    | 'RJR'    // Change Request Rejected
    | 'SCN'    // Big Brother Recall
    | 'TSC'    // Trade Server Canceled
    // Rejected status
    | 'REJ'    // Rejected
    // Filled statuses
    | 'FLL'    // Filled
    | 'FLP';   // Partial Fill (UROut)

/**
 * Contains a collection of today's orders and open orders for specific order IDs.
 */
export interface OrdersById {
    /** Array of orders */
    Orders: Order[];
    /** Array of errors that occurred during the request */
    Errors?: OrderByIDError[];
}

/**
 * Response data for order streams.
 */
export type StreamOrderResponse = {
    /** The unique identifier for the order */
    OrderID: string;
    /** The account ID associated with the order */
    AccountID: string;
    /** The status of the order */
    Status: OrderStatus;
    /** Description of the order status */
    StatusDescription: string;
    /** The type of order (e.g., "Market", "Limit") */
    OrderType: string;
    /** The symbol being traded */
    Symbol: string;
    /** Total quantity ordered */
    Quantity: string;
    /** Quantity that has been filled */
    FilledQuantity: string;
    /** Quantity remaining to be filled */
    RemainingQuantity: string;
    /** The commission fee for the order */
    CommissionFee?: string;
    /** The currency of the order */
    Currency?: string;
    /** The duration of the order (e.g., "DAY", "GTC") */
    Duration?: string;
    /** The good till date for GTD orders */
    GoodTillDate?: string;
    /** The legs of the order for multi-leg orders */
    Legs?: OrderLeg[];
    /** Market activation rules for conditional orders */
    MarketActivationRules?: MarketActivationRule[];
    /** The date and time when the order was opened */
    OpenedDateTime?: string;
    /** The price used for buying power calculations */
    PriceUsedForBuyingPower?: string;
    /** The routing destination for the order */
    Routing?: string;
    /** Advanced options string for complex orders */
    AdvancedOptions?: string;
    /** The stop price for stop and stop-limit orders */
    StopPrice?: string;
    /** The limit price for limit orders */
    LimitPrice?: string;
    /** Only applies to equities. Will contain a value if the order has received a routing fee */
    UnbundledRouteFee?: string;
} | StreamOrderErrorResponse;

/**
 * Stream status update.
 */
export interface StreamStatus {
    /** The status of the stream */
    StreamStatus: 'Connected' | 'Disconnected';
    /** Additional status message */
    Message?: string;
}

/**
 * Stream heartbeat.
 */
export interface StreamHeartbeat {
    /** Heartbeat timestamp */
    Heartbeat: string;
}

/**
 * Stream error response.
 */
export interface StreamOrderErrorResponse {
    /** The type of error */
    Error: string;
    /** The error message */
    Message: string;
    /** The account ID associated with the error */
    AccountID?: string;
    /** The order ID associated with the error */
    OrderID?: string;
} 