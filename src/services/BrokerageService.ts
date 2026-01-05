import { EventEmitter } from 'events';
import { HttpClient } from '../client/HttpClient';
import { StreamManager } from '../streaming/StreamManager';
import {
    Account,
    Activity,
    ActivityFilter,
    HistoricalOrdersById,
    Orders,
    OrdersById,
    Positions,
    PositionResponse
} from '../types/brokerage';

export class BrokerageService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly streamManager: StreamManager
    ) { }

    /**
     * Fetches the list of Brokerage Accounts available for the current user.
     * This endpoint returns all brokerage accounts that the authenticated user has access to.
     * 
     * Account types include:
     * - Cash: Standard cash account
     * - Margin: Margin account with borrowing capabilities
     * - Futures: Futures trading account
     * - DVP: Delivery versus Payment account
     * - IRA: Individual Retirement Account
     * 
     * Each account includes:
     * - Basic information (ID, type, alias, currency, status)
     * - Account details (option approval level, day trading status, etc.)
     * - Trading capabilities and restrictions
     * 
     * @category Brokerage
     * @endpoint GET /v3/brokerage/accounts
     * 
     * @returns A Promise that resolves to an array of Account objects containing:
     *          - AccountID: Unique identifier for the account
     *          - AccountType: Type of account (Cash, Margin, Futures, DVP, etc.)
     *          - Alias: User-defined name for the account
     *          - Currency: Base currency for the account (e.g., USD)
     *          - Status: Account status (Active, Closed, etc.)
     *          - AccountDetail: Additional account details including:
     *            - IsStockLocateEligible: Whether account can locate hard-to-borrow stocks
     *            - EnrolledInRegTProgram: Whether enrolled in Regulation T program
     *            - RequiresBuyingPowerWarning: Whether buying power warnings are required
     *            - DayTradingQualified: Whether qualified for day trading
     *            - OptionApprovalLevel: Level of option trading approval (0-5)
     *            - PatternDayTrader: Whether flagged as a pattern day trader
     * 
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Get all available accounts
     * const accounts = await brokerageService.getAccounts();
     * 
     * // Process account information
     * accounts.forEach(account => {
     *   console.log(`Account ${account.AccountID}:`);
     *   console.log(`- Type: ${account.AccountType}`);
     *   console.log(`- Alias: ${account.Alias}`);
     *   console.log(`- Status: ${account.Status}`);
     *   console.log('- Details:');
     *   console.log(`  - Option Level: ${account.AccountDetail.OptionApprovalLevel}`);
     *   console.log(`  - Day Trading: ${account.AccountDetail.DayTradingQualified ? 'Yes' : 'No'}`);
     *   console.log(`  - Pattern Day Trader: ${account.AccountDetail.PatternDayTrader ? 'Yes' : 'No'}`);
     * });
     * 
     * // Example response:
     * // [
     * //   {
     * //     AccountID: "123456",
     * //     AccountType: "Margin",
     * //     Alias: "Main Trading",
     * //     Currency: "USD",
     * //     Status: "Active",
     * //     AccountDetail: {
     * //       IsStockLocateEligible: false,
     * //       EnrolledInRegTProgram: true,
     * //       RequiresBuyingPowerWarning: false,
     * //       DayTradingQualified: true,
     * //       OptionApprovalLevel: 3,
     * //       PatternDayTrader: false
     * //     }
     * //   }
     * // ]
     * ```
     */
    async getAccounts(): Promise<Account[]> {
        const response = await this.httpClient.get<{ Accounts: Account[] }>('/v3/brokerage/accounts');
        return response.data.Accounts;
    }

    async getAccount(accountId: string): Promise<Account> {
        const response = await this.httpClient.get<Account>(`/v3/accounts/${accountId}`);
        return response.data;
    }

    /**
     * Fetches the brokerage account Balances for one or more given accounts.
     * Request valid for Cash, Margin, Futures, and DVP account types.
     * 
     * @category Brokerage
     * @endpoint GET /v3/brokerage/accounts/{accountIds}/balances
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * 
     * @returns A Promise that resolves to an object containing:
     *          - Balances: Array of balance information for each account, including:
     *            - AccountID: Unique identifier for the account
     *            - AccountType: Type of account (Cash, Margin, Futures, DVP)
     *            - BuyingPower: Available buying power
     *            - CashBalance: Current cash balance
     *            - Commission: Total commissions
     *            - Equity: Total account equity
     *            - MarketValue: Total market value of positions
     *            - TodaysProfitLoss: Profit/loss for the current day
     *            - UnclearedDeposit: Amount of uncleared deposits
     *            - BalanceDetail: Additional balance details including:
     *              - CostOfPositions: Total cost basis of positions
     *              - DayTradeExcess: Excess day trading buying power
     *              - DayTradeMargin: Day trading margin requirement
     *              - DayTradeOpenOrderMargin: Open order margin for day trades
     *              - DayTrades: Number of day trades
     *              - InitialMargin: Initial margin requirement
     *              - MaintenanceMargin: Maintenance margin requirement
     *              - MaintenanceRate: Maintenance margin rate
     *              - MarginRequirement: Total margin requirement
     *              - UnrealizedProfitLoss: Unrealized P/L
     *              - UnsettledFunds: Amount of unsettled funds
     *            - CurrencyDetails: Array of currency-specific details (for Futures accounts):
     *              - Currency: Currency code (e.g., USD)
     *              - BODOpenTradeEquity: Beginning of day open trade equity
     *              - CashBalance: Cash balance in this currency
     *              - Commission: Commissions in this currency
     *              - MarginRequirement: Margin requirement in this currency
     *              - NonTradeDebit: Non-trade related debits
     *              - NonTradeNetBalance: Net balance of non-trade activity
     *              - OptionValue: Value of options
     *              - RealTimeUnrealizedGains: Real-time unrealized gains/losses
     *              - TodayRealTimeTradeEquity: Today's real-time trade equity
     *              - TradeEquity: Total trade equity
     *          - Errors: Optional array of errors that occurred, each containing:
     *            - AccountID: ID of the account that had an error
     *            - Error: Error code
     *            - Message: Detailed error message
     * 
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Get balances for a single account
     * const singleBalance = await brokerageService.getBalances("123456789");
     * console.log(singleBalance.Balances[0].CashBalance);
     * 
     * // Get balances for multiple accounts
     * const multiBalances = await brokerageService.getBalances("123456789,987654321");
     * multiBalances.Balances.forEach(balance => {
     *     console.log(`Account ${balance.AccountID}: Cash Balance = ${balance.CashBalance}`);
     * });
     * 
     * // Example response:
     * // {
     * //   "Balances": [
     * //     {
     * //       "AccountID": "123456789",
     * //       "AccountType": "Margin",
     * //       "BuyingPower": "20000.00",
     * //       "CashBalance": "10000.00",
     * //       "Commission": "0.00",
     * //       "Equity": "15000.00",
     * //       "MarketValue": "5000.00",
     * //       "TodaysProfitLoss": "500.00",
     * //       "UnclearedDeposit": "0.00",
     * //       "BalanceDetail": {
     * //         "CostOfPositions": "4500.00",
     * //         "DayTradeExcess": "0.00",
     * //         "DayTradeMargin": "0.00",
     * //         "DayTradeOpenOrderMargin": "0.00",
     * //         "DayTrades": "0",
     * //         "InitialMargin": "2500.00",
     * //         "MaintenanceMargin": "1250.00",
     * //         "MaintenanceRate": "0.25",
     * //         "MarginRequirement": "2500.00",
     * //         "UnrealizedProfitLoss": "500.00",
     * //         "UnsettledFunds": "0.00"
     * //       }
     * //     }
     * //   ]
     * // }
     * ```
     */
    async getBalances(accountIds: string): Promise<{
        Balances: Array<{
            AccountID: string;
            AccountType?: string;
            BalanceDetail?: {
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
            };
            BuyingPower?: string;
            CashBalance?: string;
            Commission?: string;
            CurrencyDetails?: Array<{
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
            }>;
            Equity?: string;
            MarketValue?: string;
            TodaysProfitLoss?: string;
            UnclearedDeposit?: string;
        }>;
        Errors?: Array<{
            AccountID: string;
            Error: string;
            Message: string;
        }>;
    }> {
        const response = await this.httpClient.get<{
            Balances: Array<{
                AccountID: string;
                AccountType?: string;
                BalanceDetail?: {
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
                };
                BuyingPower?: string;
                CashBalance?: string;
                Commission?: string;
                CurrencyDetails?: Array<{
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
                }>;
                Equity?: string;
                MarketValue?: string;
                TodaysProfitLoss?: string;
                UnclearedDeposit?: string;
            }>;
            Errors?: Array<{
                AccountID: string;
                Error: string;
                Message: string;
            }>;
        }>(`/v3/brokerage/accounts/${accountIds}/balances`);
        return response.data;
    }

    /**
     * Fetches the Beginning of Day Balances for the given Accounts.
     * Request valid for Cash, Margin, Futures, and DVP account types.
     * 
     * Beginning of Day (BOD) balances represent the account balances at market open,
     * providing a baseline for tracking intraday changes. This is particularly useful for:
     * - Calculating intraday P/L
     * - Monitoring trading activity impact
     * - Determining day trading buying power
     * - Analyzing overnight position impact
     * 
     * @category Brokerage
     * @endpoint GET /v3/brokerage/accounts/{accountIds}/bodbalances
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * 
     * @returns A Promise that resolves to an object containing:
     *          - BODBalances: Array of beginning of day balance information for each account, including:
     *            - AccountID: Unique identifier for the account
     *            - AccountType: Type of account (Cash, Margin, Futures, DVP)
     *            - BalanceDetail: Additional balance details including:
     *              - AccountBalance: Total account balance at market open
     *              - CashAvailableToWithdraw: Amount available for withdrawal
     *              - DayTrades: Number of day trades at market open
     *              - DayTradingMarginableBuyingPower: Available day trading buying power
     *              - Equity: Total account equity at market open
     *              - NetCash: Net cash balance
     *              - OptionBuyingPower: Available buying power for options
     *              - OptionValue: Total value of option positions
     *              - OvernightBuyingPower: Available buying power for overnight positions
     *            - CurrencyDetails: Array of currency-specific details (for Futures accounts):
     *              - Currency: Currency code (e.g., USD)
     *              - AccountMarginRequirement: Margin requirement for the account
     *              - AccountOpenTradeEquity: Open trade equity at market open
     *              - AccountSecurities: Value of securities in the account
     *              - CashBalance: Cash balance in this currency
     *              - MarginRequirement: Margin requirement in this currency
     *          - Errors: Optional array of errors that occurred, each containing:
     *            - AccountID: ID of the account that had an error
     *            - Error: Error code
     *            - Message: Detailed error message
     * 
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Get BOD balances for a single account
     * const singleBOD = await brokerageService.getBalancesBOD("123456789");
     * console.log(singleBOD.BODBalances[0].BalanceDetail?.AccountBalance);
     * 
     * // Get BOD balances for multiple accounts
     * const multiBOD = await brokerageService.getBalancesBOD("123456789,987654321");
     * multiBOD.BODBalances.forEach(balance => {
     *     console.log(`Account ${balance.AccountID}:`);
     *     console.log(`  Equity: ${balance.BalanceDetail?.Equity}`);
     *     console.log(`  Net Cash: ${balance.BalanceDetail?.NetCash}`);
     * });
     * 
     * // Example response:
     * // {
     * //   "BODBalances": [
     * //     {
     * //       "AccountID": "123456789",
     * //       "AccountType": "Margin",
     * //       "BalanceDetail": {
     * //         "AccountBalance": "10000.00",
     * //         "CashAvailableToWithdraw": "5000.00",
     * //         "DayTrades": "0",
     * //         "DayTradingMarginableBuyingPower": "20000.00",
     * //         "Equity": "15000.00",
     * //         "NetCash": "5000.00",
     * //         "OptionBuyingPower": "10000.00",
     * //         "OptionValue": "0.00",
     * //         "OvernightBuyingPower": "10000.00"
     * //       }
     * //     }
     * //   ]
     * // }
     * ```
     */
    async getBalancesBOD(accountIds: string): Promise<{
        BODBalances: Array<{
            AccountID: string;
            AccountType?: string;
            BalanceDetail?: {
                AccountBalance?: string;
                CashAvailableToWithdraw?: string;
                DayTrades?: string;
                DayTradingMarginableBuyingPower?: string;
                Equity?: string;
                NetCash?: string;
                OptionBuyingPower?: string;
                OptionValue?: string;
                OvernightBuyingPower?: string;
            };
            CurrencyDetails?: Array<{
                Currency: string;
                AccountMarginRequirement?: string;
                AccountOpenTradeEquity?: string;
                AccountSecurities?: string;
                CashBalance?: string;
                MarginRequirement?: string;
            }>;
        }>;
        Errors?: Array<{
            AccountID: string;
            Error: string;
            Message: string;
        }>;
    }> {
        const response = await this.httpClient.get<{
            BODBalances: Array<{
                AccountID: string;
                AccountType?: string;
                BalanceDetail?: {
                    AccountBalance?: string;
                    CashAvailableToWithdraw?: string;
                    DayTrades?: string;
                    DayTradingMarginableBuyingPower?: string;
                    Equity?: string;
                    NetCash?: string;
                    OptionBuyingPower?: string;
                    OptionValue?: string;
                    OvernightBuyingPower?: string;
                };
                CurrencyDetails?: Array<{
                    Currency: string;
                    AccountMarginRequirement?: string;
                    AccountOpenTradeEquity?: string;
                    AccountSecurities?: string;
                    CashBalance?: string;
                    MarginRequirement?: string;
                }>;
            }>;
            Errors?: Array<{
                AccountID: string;
                Error: string;
                Message: string;
            }>;
        }>(`/v3/brokerage/accounts/${accountIds}/bodbalances`);
        return response.data;
    }

    /**
     * Fetches positions for the given Accounts. Request valid for Cash, Margin, Futures, and DVP account types.
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param symbol - Optional. List of valid symbols in comma separated format (e.g. "MSFT,MSFT *,AAPL").
     *                You can use an * as wildcard to make more complex filters.
     *                Examples of the wildcard being used:
     *                - Get all options for MSFT: symbol="MSFT *"
     *                - Get MSFT and all its options: symbol="MSFT,MSFT *"
     *                - Get all MSFT options expiring in 2023: symbol="MSFT 23*"
     *                - Get all MSFT options expiring in March 2023: symbol="MSFT 2303*"
     *                - Get all options expiring in March 2023: symbol="* 2303*"
     *                - Get all call options expiring in March 2023: symbol="* 2303*C*"
     *                - Get BHM*: symbol="BHM**"
     * @returns A promise that resolves to a Positions object containing position information and any errors
     * @throws {ErrorResponse} When the request fails with error details
     * 
     * @example
     * ```typescript
     * // Get positions for a single account
     * const positions = await brokerageService.getPositions("123456789");
     * console.log(positions.Positions[0].Symbol);
     * 
     * // Get positions for multiple accounts
     * const multiPositions = await brokerageService.getPositions("123456789,987654321");
     * multiPositions.Positions.forEach(position => {
     *     console.log(`Account ${position.AccountID}: ${position.Symbol} - ${position.Quantity}`);
     * });
     * 
     * // Get all MSFT positions including options
     * const msftPositions = await brokerageService.getPositions("123456789", "MSFT,MSFT *");
     * ```
     */
    async getPositions(accountIds: string, symbol?: string): Promise<Positions> {
        const params: Record<string, string> = {};
        if (symbol !== undefined) params.symbol = symbol;

        const response = await this.httpClient.get<Positions>(
            `/v3/brokerage/accounts/${accountIds}/positions`,
            { params }
        );
        return response.data;
    }

    async getPosition(accountId: string, symbol: string): Promise<PositionResponse> {
        const response = await this.httpClient.get<PositionResponse>(
            `/v3/accounts/${accountId}/positions/${symbol}`
        );
        return response.data;
    }

    async getActivities(accountId: string, filter?: ActivityFilter): Promise<Activity[]> {
        const response = await this.httpClient.get<Activity[]>(
            `/v3/accounts/${accountId}/activities`,
            { params: filter }
        );
        return response.data;
    }

    /**
     * Stream positions for the given accounts. Request valid for Cash, Margin, Futures, and DVP account types.
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param changes - Optional. A boolean value that specifies whether or not position updates are streamed as changes.
     *                 When a stream is first opened with changes=true, streaming positions will return the full snapshot
     *                 first for all positions, and then any changes after that. When changes=true, the PositionID field
     *                 is returned with each change, along with the fields that changed.
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - Position objects for position updates
     *          - StreamStatus objects for stream status updates
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamPositionsErrorResponse objects for any errors
     * @throws {ErrorResponse} When the request fails with error details
     * 
     * @example
     * ```typescript
     * // Stream positions for a single account
     * const stream = await brokerageService.streamPositions("123456789");
     * 
     * // Stream positions for multiple accounts
     * const stream = await brokerageService.streamPositions("123456789,987654321");
     * 
     * // Stream position changes only
     * const stream = await brokerageService.streamPositions("123456789", true);
     * 
     * stream.on('data', (data) => {
     *   if ('PositionID' in data) {
     *     // Handle position update
     *     console.log('Position update:', data);
     *     // Example data:
     *     // {
     *     //   AccountID: "123456789",
     *     //   AssetType: "STOCK",
     *     //   AveragePrice: "216.68",
     *     //   Last: "216.63",
     *     //   Bid: "216.62",
     *     //   Ask: "216.64",
     *     //   ConversionRate: "1",
     *     //   DayTradeRequirement: "0",
     *     //   InitialRequirement: "0",
     *     //   MaintenanceMargin: "0",
     *     //   PositionID: "64630792",
     *     //   LongShort: "Long",
     *     //   Quantity: "10",
     *     //   Symbol: "MSFT",
     *     //   Timestamp: "2020-11-16T16:53:37Z",
     *     //   TodaysProfitLoss: "-0.5",
     *     //   TotalCost: "2166.8",
     *     //   MarketValue: "2166.3",
     *     //   MarkToMarketPrice: "216.68",
     *     //   UnrealizedProfitLoss: "-0.5",
     *     //   UnrealizedProfitLossPercent: "-0.023",
     *     //   UnrealizedProfitLossQty: "-0.05"
     *     // }
     *   } else if ('StreamStatus' in data) {
     *     // Handle stream status update
     *     console.log('Stream status:', data);
     *   } else if ('Heartbeat' in data) {
     *     // Handle heartbeat
     *     console.log('Heartbeat:', data);
     *   } else if ('Error' in data) {
     *     // Handle error
     *     console.log('Error:', data);
     *   }
     * });
     * ```
     */
    streamPositions(accountIds: string, changes?: boolean): Promise<EventEmitter> {
        const params: Record<string, string | boolean> = {};
        if (changes !== undefined) params.changes = changes;

        return this.streamManager.createStream(
            `/v3/brokerage/stream/accounts/${accountIds}/positions`,
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    }

    streamBalances(accountId: string): Promise<EventEmitter> {
        return this.streamManager.createStream(
            `/v3/accounts/${accountId}/balances/stream`,
            undefined,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    }

    /**
     * Stream orders for the given accounts. Request valid for Cash, Margin, Futures, and DVP account types.
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - Order objects for order updates
     *          - StreamStatus objects for stream status updates
     *          - Heartbeat objects every 5 seconds when idle
     *          - StreamOrderErrorResponse objects for any errors
     * @throws {ErrorResponse} When the request fails with error details
     * 
     * @example
     * ```typescript
     * // Stream orders for a single account
     * const stream = await brokerageService.streamOrders("123456789");
     * 
     * // Stream orders for multiple accounts
     * const stream = await brokerageService.streamOrders("123456789,987654321");
     * 
     * stream.on('data', (data) => {
     *   if ('OrderID' in data) {
     *     // Handle order update
     *     console.log('Order update:', data);
     *     // Example data:
     *     // {
     *     //   AccountID: "123456789",
     *     //   OrderID: "286234131",
     *     //   Status: "OPN",
     *     //   StatusDescription: "Sent",
     *     //   OrderType: "Market",
     *     //   Symbol: "MSFT",
     *     //   Quantity: "100",
     *     //   FilledQuantity: "0",
     *     //   RemainingQuantity: "100"
     *     // }
     *   } else if ('Heartbeat' in data) {
     *     // Handle heartbeat
     *     console.log('Heartbeat:', data);
     *   } else if ('Error' in data) {
     *     // Handle error
     *     console.log('Error:', data);
     *   }
     * });
     * ```
     */
    streamOrders(accountIds: string): Promise<EventEmitter> {
        return this.streamManager.createStream(
            `/v3/brokerage/stream/accounts/${accountIds}/orders`,
            undefined,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    }

    /**
     * Stream orders for the given accounts and orders. Request valid for Cash, Margin, Futures, and DVP account types.
     * This endpoint streams real-time order updates for specific orders, providing detailed information about order status,
     * execution, and any changes that occur.
     * 
     * The stream will emit:
     * - Order updates when any changes occur to the specified orders
     * - Status updates about the stream connection
     * - Heartbeat messages every 5 seconds when there are no updates
     * - Error messages if any issues occur
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param orderIds - List of valid Order IDs in comma separated format (e.g. "812767578,812941051").
     *                  1 to 50 Order IDs can be specified.
     * @returns A Promise that resolves to an EventEmitter that emits:
     *          - StreamOrderResponse objects for order updates
     *          - StreamStatus objects for stream status updates
     *          - StreamHeartbeat objects every 5 seconds when idle
     *          - StreamOrderErrorResponse objects for any errors
     * @throws {ErrorResponse} When the request fails with error details
     * 
     * @example
     * ```typescript
     * // Stream specific orders
     * const stream = await brokerageService.streamOrdersByOrderID(
     *     "123456789",
     *     "286234131,286179863"
     * );
     * 
     * stream.on('data', (data) => {
     *   if ('OrderID' in data) {
     *     // Handle order update
     *     const order = data as StreamOrderResponse;
     *     console.log('Order update:', order);
     *     // Example data:
     *     // {
     *     //   AccountID: "123456789",
     *     //   OrderID: "286234131",
     *     //   Status: "FLL",
     *     //   StatusDescription: "Filled",
     *     //   OrderType: "Market",
     *     //   Symbol: "MSFT",
     *     //   Quantity: "100",
     *     //   FilledQuantity: "100",
     *     //   RemainingQuantity: "0"
     *     // }
     *   } else if ('StreamStatus' in data) {
     *     // Handle stream status update
     *     const status = data as StreamStatus;
     *     console.log('Stream status:', status);
     *   } else if ('Heartbeat' in data) {
     *     // Handle heartbeat
     *     const heartbeat = data as StreamHeartbeat;
     *     console.log('Heartbeat:', heartbeat);
     *   } else if ('Error' in data) {
     *     // Handle error
     *     const error = data as StreamOrderErrorResponse;
     *     console.log('Error:', error);
     *   }
     * });
     * 
     * // Handle stream errors
     * stream.on('error', (error) => {
     *   console.error('Stream error:', error);
     * });
     * 
     * // Handle stream end
     * stream.on('end', () => {
     *   console.log('Stream ended');
     * });
     * ```
     */
    streamOrdersByOrderID(accountIds: string, orderIds: string): Promise<EventEmitter> {
        return this.streamManager.createStream(
            `/v3/brokerage/stream/accounts/${accountIds}/orders/${orderIds}`,
            undefined,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v3+json' } }
        );
    }

    /**
     * Fetches Historical Orders for the given Accounts except open orders, sorted in descending order of time closed.
     * Request valid for all account types.
     * 
     * This endpoint provides historical order information including:
     * - Order details (ID, type, status, timestamps)
     * - Execution details (filled quantity, execution price)
     * - Order legs for complex orders (spreads, multi-leg orders)
     * - Order routing and venue information
     * 
     * @category Brokerage
     * @endpoint GET /v3/brokerage/accounts/{accountIds}/historicalorders
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param since - Historical orders since date (e.g. "2006-01-13", "01-13-2006", "2006/01/13", "01/13/2006").
     *               Limited to 90 days prior to the current date.
     * @param pageSize - Optional. The number of requests returned per page when paginating responses.
     *                  If not provided, results will not be paginated and a maximum of 600 orders is returned.
     *                  Must be between 1 and 600.
     * @param nextToken - Optional. An encrypted token for paginated results to retrieve the next page.
     *                   This is returned with paginated results and has a lifetime of 1 hour.
     * 
     * @returns A Promise that resolves to an object containing:
     *          - Orders: Array of historical order information, each containing:
     *            - AccountID: Account that placed the order
     *            - ClosedDateTime: When the order was closed/filled
     *            - Duration: Order duration (DAY, GTC, etc.)
     *            - Legs: Array of order legs, each containing:
     *              - AssetType: Type of asset (STOCK, OPTION, etc.)
     *              - BuyOrSell: Buy or Sell action
     *              - ExecQuantity: Quantity that was executed
     *              - ExecutionPrice: Price at which the order was executed
     *              - OpenOrClose: Whether opening or closing a position
     *              - QuantityOrdered: Original quantity ordered
     *              - QuantityRemaining: Quantity still to be filled
     *              - Symbol: Symbol being traded
     *            - OpenedDateTime: When the order was placed
     *            - OrderID: Unique identifier for the order
     *            - OrderType: Type of order (Market, Limit, etc.)
     *            - Status: Current status of the order
     *            - StatusDescription: Detailed status description
     *          - NextToken: Optional token for retrieving the next page of results
     *          - Errors: Optional array of errors that occurred, each containing:
     *            - AccountID: ID of the account that had an error
     *            - Error: Error code
     *            - Message: Detailed error message
     * 
     * @throws Error if more than 25 account IDs are specified
     * @throws Error if the date range exceeds 90 days
     * @throws Error if pageSize is outside the valid range (1-600)
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Get historical orders for a single account
     * const orders = await brokerageService.getHistoricalOrders(
     *     "123456789",
     *     "2024-01-01"
     * );
     * console.log(orders.Orders[0].OrderID);
     * 
     * // Get historical orders for multiple accounts with pagination
     * const paginatedOrders = await brokerageService.getHistoricalOrders(
     *     "123456789,987654321",
     *     "2024-01-01",
     *     100
     * );
     * 
     * // Get next page using the nextToken
     * if (paginatedOrders.NextToken) {
     *     const nextPage = await brokerageService.getHistoricalOrders(
     *         "123456789,987654321",
     *         "2024-01-01",
     *         100,
     *         paginatedOrders.NextToken
     *     );
     * }
     * 
     * // Example response:
     * // {
     * //   "Orders": [
     * //     {
     * //       "AccountID": "123456789",
     * //       "ClosedDateTime": "2024-01-19T15:30:00Z",
     * //       "Duration": "DAY",
     * //       "Legs": [
     * //         {
     * //           "AssetType": "STOCK",
     * //           "BuyOrSell": "Buy",
     * //           "ExecQuantity": "100",
     * //           "ExecutionPrice": "150.25",
     * //           "OpenOrClose": "Open",
     * //           "QuantityOrdered": "100",
     * //           "QuantityRemaining": "0",
     * //           "Symbol": "MSFT"
     * //         }
     * //       ],
     * //       "OpenedDateTime": "2024-01-19T14:30:00Z",
     * //       "OrderID": "123456",
     * //       "OrderType": "Market",
     * //       "Status": "FLL",
     * //       "StatusDescription": "Filled"
     * //     }
     * //   ],
     * //   "NextToken": "abc123..."
     * // }
     * ```
     */
    async getHistoricalOrders(
        accountIds: string,
        since: string,
        pageSize?: number,
        nextToken?: string
    ): Promise<{
        Orders: Array<{
            AccountID: string;
            ClosedDateTime?: string;
            Duration: string;
            Legs?: Array<{
                AssetType: string;
                BuyOrSell: string;
                ExecQuantity: string;
                ExecutionPrice: string;
                OpenOrClose: string;
                QuantityOrdered: string;
                QuantityRemaining: string;
                Symbol: string;
                ExpirationDate?: string;
                OptionType?: string;
                StrikePrice?: string;
                Underlying?: string;
            }>;
            OpenedDateTime: string;
            OrderID: string;
            OrderType: string;
            Status: string;
            StatusDescription: string;
            LimitPrice?: string;
            StopPrice?: string;
            AdvancedOptions?: {
                TrailingStop?: string;
                TrailingStopAmount?: string;
            };
        }>;
        NextToken?: string;
        Errors?: Array<{
            AccountID: string;
            Error: string;
            Message: string;
        }>;
    }> {
        // Validate maximum accounts
        if (accountIds.split(',').length > 25) {
            throw new Error('Maximum of 25 accounts allowed per request');
        }

        // Validate date range
        const sinceDate = new Date(since);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (sinceDate < ninetyDaysAgo) {
            throw new Error('Date range cannot exceed 90 days');
        }

        // Validate pageSize
        if (pageSize !== undefined && (pageSize < 1 || pageSize > 600)) {
            throw new Error('Page size must be between 1 and 600');
        }

        const params: Record<string, string | number> = { since };
        if (pageSize !== undefined) params.pageSize = pageSize;
        if (nextToken !== undefined) params.nextToken = nextToken;

        const response = await this.httpClient.get<{
            Orders: Array<{
                AccountID: string;
                ClosedDateTime?: string;
                Duration: string;
                Legs?: Array<{
                    AssetType: string;
                    BuyOrSell: string;
                    ExecQuantity: string;
                    ExecutionPrice: string;
                    OpenOrClose: string;
                    QuantityOrdered: string;
                    QuantityRemaining: string;
                    Symbol: string;
                    ExpirationDate?: string;
                    OptionType?: string;
                    StrikePrice?: string;
                    Underlying?: string;
                }>;
                OpenedDateTime: string;
                OrderID: string;
                OrderType: string;
                Status: string;
                StatusDescription: string;
                LimitPrice?: string;
                StopPrice?: string;
                AdvancedOptions?: {
                    TrailingStop?: string;
                    TrailingStopAmount?: string;
                };
            }>;
            NextToken?: string;
            Errors?: Array<{
                AccountID: string;
                Error: string;
                Message: string;
            }>;
        }>(`/v3/brokerage/accounts/${accountIds}/historicalorders`, { params });
        return response.data;
    }

    /**
     * Fetches Historical Orders for the given Accounts except open orders, filtered by given Order IDs prior to current date,
     * sorted in descending order of time closed. Request valid for all account types.
     * 
     * This endpoint provides historical order information for specific orders, including:
     * - Order details (ID, type, status, timestamps)
     * - Execution details (filled quantity, execution price)
     * - Order legs for complex orders (spreads, multi-leg orders)
     * - Order routing and venue information
     * 
     * @category Brokerage
     * @endpoint GET /v3/brokerage/accounts/{accountIds}/historicalorders/{orderIds}
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param orderIds - List of valid Order IDs in comma separated format (e.g. "123456789,286179863").
     *                  1 to 50 Order IDs can be specified.
     * @param since - Historical orders since date (e.g. "2006-01-13", "01-13-2006", "2006/01/13", "01/13/2006").
     *               Limited to 90 days prior to the current date.
     * 
     * @returns A Promise that resolves to an object containing:
     *          - Orders: Array of historical order information, each containing:
     *            - AccountID: Account that placed the order
     *            - ClosedDateTime: When the order was closed/filled
     *            - Duration: Order duration (DAY, GTC, etc.)
     *            - Legs: Array of order legs, each containing:
     *              - AssetType: Type of asset (STOCK, OPTION, etc.)
     *              - BuyOrSell: Buy or Sell action
     *              - ExecQuantity: Quantity that was executed
     *              - ExecutionPrice: Price at which the order was executed
     *              - OpenOrClose: Whether opening or closing a position
     *              - QuantityOrdered: Original quantity ordered
     *              - QuantityRemaining: Quantity still to be filled
     *              - Symbol: Symbol being traded
     *              - ExpirationDate: Option expiration date (for options)
     *              - OptionType: Call or Put (for options)
     *              - StrikePrice: Strike price (for options)
     *              - Underlying: Underlying symbol (for options)
     *            - OpenedDateTime: When the order was placed
     *            - OrderID: Unique identifier for the order
     *            - OrderType: Type of order (Market, Limit, etc.)
     *            - Status: Current status of the order
     *            - StatusDescription: Detailed status description
     *            - LimitPrice: Limit price for limit orders
     *            - StopPrice: Stop price for stop orders
     *            - AdvancedOptions: Advanced order options including:
     *              - TrailingStop: Whether trailing stop is enabled
     *              - TrailingStopAmount: Amount for trailing stop
     *          - Errors: Optional array of errors that occurred, each containing:
     *            - AccountID: ID of the account that had an error
     *            - Error: Error code
     *            - Message: Detailed error message
     * 
     * @throws Error if more than 25 account IDs are specified
     * @throws Error if more than 50 order IDs are specified
     * @throws Error if the date range exceeds 90 days
     * @throws Error if the request fails due to network issues
     * @throws Error if the request fails due to invalid authentication
     * @throws Error if the API returns an error response
     * 
     * @example
     * ```typescript
     * // Get historical orders for specific order IDs
     * const orders = await brokerageService.getHistoricalOrdersByOrderID(
     *     "123456789",
     *     "286234131,286179863",
     *     "2024-01-01"
     * );
     * 
     * // Process orders
     * orders.Orders.forEach(order => {
     *     console.log(`Order ${order.OrderID}: ${order.Status} - ${order.StatusDescription}`);
     * });
     * 
     * // Example response:
     * // {
     * //   "Orders": [
     * //     {
     * //       "AccountID": "123456789",
     * //       "ClosedDateTime": "2024-01-19T15:30:00Z",
     * //       "Duration": "DAY",
     * //       "Legs": [
     * //         {
     * //           "AssetType": "STOCK",
     * //           "BuyOrSell": "Buy",
     * //           "ExecQuantity": "100",
     * //           "ExecutionPrice": "150.25",
     * //           "OpenOrClose": "Open",
     * //           "QuantityOrdered": "100",
     * //           "QuantityRemaining": "0",
     * //           "Symbol": "MSFT"
     * //         }
     * //       ],
     * //       "OpenedDateTime": "2024-01-19T14:30:00Z",
     * //       "OrderID": "286234131",
     * //       "OrderType": "Market",
     * //       "Status": "FLL",
     * //       "StatusDescription": "Filled"
     * //     }
     * //   ]
     * // }
     */
    async getHistoricalOrdersByOrderID(
        accountIds: string,
        orderIds: string,
        since: string
    ): Promise<HistoricalOrdersById> {
        // Validate date range
        const sinceDate = new Date(since);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (sinceDate < ninetyDaysAgo) {
            throw new Error('Date range cannot exceed 90 days');
        }

        const response = await this.httpClient.get<HistoricalOrdersById>(
            `/v3/brokerage/accounts/${accountIds}/historicalorders/${orderIds}`,
            {
                params: {
                    since
                }
            }
        );
        return response.data;
    }

    /**
     * Fetches today's orders and open orders for the given Accounts, sorted in descending order of time placed for open and time executed for closed.
     * Request valid for all account types.
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param pageSize - Optional. The number of requests returned per page when paginating responses.
     *                  If not provided, results will not be paginated and a maximum of 600 orders is returned.
     *                  Must be between 1 and 600.
     * @param nextToken - Optional. An encrypted token with a lifetime of 1 hour for use with paginated order responses.
     *                   This is returned with paginated results and used in only the subsequent request which will return
     *                   a new nextToken until there are fewer returned orders than the requested pageSize.
     * @returns A promise that resolves to an Orders object containing order information and any errors
     * @throws {ErrorResponse} When the request fails with error details
     * 
     * @example
     * ```typescript
     * // Get orders for a single account
     * const orders = await brokerageService.getOrders("123456789");
     * console.log(orders.Orders[0].OrderID);
     * 
     * // Get orders for multiple accounts with pagination
     * const paginatedOrders = await brokerageService.getOrders(
     *     "123456789,987654321",
     *     100
     * );
     * 
     * // Get next page using the nextToken
     * if (paginatedOrders.NextToken) {
     *     const nextPage = await brokerageService.getOrders(
     *         "123456789,987654321",
     *         100,
     *         paginatedOrders.NextToken
     *     );
     * }
     * ```
     */
    async getOrders(
        accountIds: string,
        pageSize?: number,
        nextToken?: string
    ): Promise<Orders> {
        const params: Record<string, string | number> = {};
        if (pageSize !== undefined) params.pageSize = pageSize;
        if (nextToken !== undefined) params.nextToken = nextToken;

        const response = await this.httpClient.get<Orders>(
            `/v3/brokerage/accounts/${accountIds}/orders`,
            { params }
        );
        return response.data;
    }

    /**
     * Fetches today's orders and open orders for the given Accounts, filtered by given Order IDs,
     * sorted in descending order of time placed for open and time executed for closed.
     * Request valid for all account types.
     * 
     * @param accountIds - List of valid Account IDs in comma separated format (e.g. "61999124,68910124").
     *                    1 to 25 Account IDs can be specified. Recommended batch size is 10.
     * @param orderIds - List of valid Order IDs in comma separated format (e.g. "123456789,286179863").
     *                  1 to 50 Order IDs can be specified.
     * @returns A promise that resolves to an OrdersById object containing order information and any errors
     * @throws {ErrorResponse} When the request fails with error details
     * 
     * @example
     * ```typescript
     * // Get orders for specific order IDs
     * const orders = await brokerageService.getOrdersByOrderID(
     *     "123456789",
     *     "286234131,286179863"
     * );
     * 
     * // Process orders
     * orders.Orders.forEach(order => {
     *     console.log(`Order ${order.OrderID}: ${order.Status} - ${order.StatusDescription}`);
     * });
     * 
     * // Handle any errors
     * if (orders.Errors) {
     *     orders.Errors.forEach(error => {
     *         console.log(`Error for Account ${error.AccountID}, Order ${error.OrderID}: ${error.Message}`);
     *     });
     * }
     * ```
     */
    async getOrdersByOrderID(
        accountIds: string,
        orderIds: string
    ): Promise<OrdersById> {
        const response = await this.httpClient.get<OrdersById>(
            `/v3/brokerage/accounts/${accountIds}/orders/${orderIds}`
        );
        return response.data;
    }
} 