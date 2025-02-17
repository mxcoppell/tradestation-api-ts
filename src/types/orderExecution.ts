export type OrderType = 'Market' | 'Limit' | 'StopMarket' | 'StopLimit';
export type OrderDuration =
    | 'DAY'    // Day, valid until the end of the regular trading session
    | 'DYP'    // Day Plus; valid until the end of the extended trading session
    | 'GTC'    // Good till canceled
    | 'GCP'    // Good till canceled plus
    | 'GTD'    // Good through date
    | 'GDP'    // Good through date plus
    | 'OPG'    // At the opening; only valid for listed stocks at the opening session Price
    | 'CLO'    // On Close; orders that target the closing session of an exchange
    | 'IOC'    // Immediate or Cancel; filled immediately or canceled, partial fills are accepted
    | 'FOK'    // Fill or Kill; orders are filled entirely or canceled, partial fills are not accepted
    | '1'      // 1 minute; expires after the 1 minute
    | '1 MIN'  // 1 minute; expires after the 1 minute
    | '3'      // 3 minutes; expires after the 3 minutes
    | '3 MIN'  // 3 minutes; expires after the 3 minutes
    | '5'      // 5 minutes; expires after the 5 minutes
    | '5 MIN'; // 5 minutes; expires after the 5 minutes
export type OrderStatus =
    | 'ACK'   // Received
    | 'ASS'   // Option Assignment
    | 'BRC'   // Bracket Canceled
    | 'BRF'   // Bracket Filled
    | 'BRO'   // Broken
    | 'CHG'   // Change
    | 'CND'   // Condition Met
    | 'COR'   // Fill Corrected
    | 'DIS'   // Dispatched
    | 'DOA'   // Dead
    | 'DON'   // Queued
    | 'ECN'   // Expiration Cancel Request
    | 'EXE'   // Option Exercise
    | 'FPR'   // Partial Fill (Alive)
    | 'LAT'   // Too Late to Cancel
    | 'OPN'   // Sent
    | 'OSO'   // OSO Order
    | 'OTHER' // OrderStatus not mapped
    | 'PLA'   // Sending
    | 'REC'   // Big Brother Recall Request
    | 'RJC'   // Cancel Request Rejected
    | 'RPD'   // Replace Pending
    | 'RSN'   // Replace Sent
    | 'STP'   // Stop Hit
    | 'STT'   // OrderStatus Message
    | 'SUS'   // Suspended
    | 'UCN'   // Cancel Sent
    | 'CAN'   // Canceled
    | 'EXP'   // Expired
    | 'OUT'   // UROut
    | 'RJR'   // Change Request Rejected
    | 'SCN'   // Big Brother Recall
    | 'TSC'   // Trade Server Canceled
    | 'UCH'   // Replaced
    | 'REJ'   // Rejected
    | 'FLL'   // Filled
    | 'FLP';  // Partial Fill (UROut)
export type OrderSide =
    | 'BUY'         // equities and futures
    | 'SELL'        // equities and futures
    | 'BUYTOCOVER'  // equities
    | 'SELLSHORT'   // equities
    | 'BUYTOOPEN'   // options
    | 'BUYTOCLOSE'  // options
    | 'SELLTOOPEN'  // options
    | 'SELLTOCLOSE';// options

/**
 * Market Activation Rule for conditional orders
 */
export interface MarketActivationRule {
    RuleType: 'Price';
    Symbol: string;
    Predicate: 'Gt' | 'Lt' | 'Eq';
    TriggerKey: string;
    Price: string;
    LogicOperator?: 'And' | 'Or';
}

/**
 * Time Activation Rule for scheduled orders
 */
export interface TimeActivationRule {
    TimeUtc: string;
}

/**
 * Advanced options for order placement
 */
export interface AdvancedOptions {
    /** Trailing stop settings */
    TrailingStop?: {
        Amount: number;
        IsPercentage: boolean;
        Percent?: number;  // For backward compatibility with API examples
    };
    /** Market activation rules for conditional orders */
    MarketActivationRules?: MarketActivationRule[];
    /** Time activation rules for scheduled orders */
    TimeActivationRules?: TimeActivationRule[];
    /** Commission fee override */
    CommissionFee?: number;
    /** Do not reduce flag */
    DoNotReduceFlag?: boolean;
    /** All or none flag */
    AllOrNone?: boolean;
    /** Minimum quantity for execution */
    MinimumQuantity?: number;
}

/**
 * Order leg for multi-leg orders (options spreads, covered stock)
 */
export interface OrderLeg {
    Symbol: string;
    Quantity: number;
    TradeAction: OrderSide;
}

/**
 * One-Sends-Other (OSO) order group
 */
export interface OSO {
    Type: 'NORMAL' | 'BRK' | 'OCO';
    Orders: OrderRequest[];
}

/**
 * Request to place a new order
 */
export interface OrderRequest {
    /** Account ID to place the order for */
    AccountID: string;
    /** Symbol to trade */
    Symbol: string;
    /** Quantity of shares/contracts */
    Quantity: string;
    /** Type of order (Market, Limit, etc) */
    OrderType: OrderType;
    /** Buy/Sell action */
    TradeAction: OrderSide;
    /** Time in force settings */
    TimeInForce: {
        Duration: OrderDuration;
        ExpirationDate?: string;
    };
    /** Route for order execution */
    Route: string;
    /** Limit price for limit orders */
    LimitPrice?: string;
    /** Stop price for stop orders */
    StopPrice?: string;
    /** Advanced order options */
    AdvancedOptions?: AdvancedOptions;
}

/**
 * Response from placing an order (POST /orders)
 */
export interface OrderResponse {
    /** Array of successful orders */
    Orders?: {
        /** Unique order identifier */
        OrderID: string;
        /** Additional message about the order */
        Message: string;
    }[];
    /** Array of failed orders */
    Errors?: {
        /** Unique order identifier */
        OrderID: string;
        /** Error code */
        Error: string;
        /** Error message */
        Message: string;
    }[];
}

/**
 * Response from canceling an order (DELETE /orders/{id})
 */
export interface CancelOrderResponse {
    /** Unique order identifier */
    OrderID: string;
    /** Error message */
    Error?: string;
    /** Additional message about the order */
    Message?: string;
}

/**
 * Request to replace an existing order.
 * You cannot update an order that has been filled.
 * Valid for Cash, Margin, Futures, and DVP account types.
 * 
 * @example Limit Order
 * {
 *   Quantity: "10",
 *   LimitPrice: "132.52"
 * }
 * 
 * @example Stop Market Order
 * {
 *   Quantity: "10",
 *   StopPrice: "50.60"
 * }
 * 
 * @example Stop Limit Order
 * {
 *   Quantity: "10",
 *   LimitPrice: "200.00",
 *   StopPrice: "215.00"
 * }
 * 
 * @example Trailing Stop (Amount)
 * {
 *   Quantity: "10",
 *   AdvancedOptions: {
 *     TrailingStop: {
 *       Amount: "2.11"
 *     }
 *   }
 * }
 * 
 * @example Trailing Stop (Percent)
 * {
 *   Quantity: "10",
 *   AdvancedOptions: {
 *     TrailingStop: {
 *       Percent: "5.0"
 *     }
 *   }
 * }
 * 
 * @example Convert to Market
 * {
 *   OrderType: "Market"
 * }
 */
export interface OrderReplaceRequest {
    /** New quantity for the order */
    Quantity?: string;
    /** New limit price for limit orders */
    LimitPrice?: string;
    /** New stop price for stop orders */
    StopPrice?: string;
    /** Convert order to a different type (e.g., "Market") */
    OrderType?: OrderType;
    /** New time in force settings */
    TimeInForce?: {
        Duration: OrderDuration;
    };
    /** New advanced options */
    AdvancedOptions?: {
        /** Trailing stop settings */
        TrailingStop?: {
            /** Fixed amount for trailing stop */
            Amount?: string;
            /** Percentage for trailing stop */
            Percent?: string;
        };
    };
}

export interface OrderConfirmationResponse {
    Route: string;
    Duration: string;
    Account: string;
    SummaryMessage: string;
    EstimatedPrice?: string;
    EstimatedPriceDisplay?: string;
    EstimatedCommission?: string;
    EstimatedCommissionDisplay?: string;
    InitialMarginDisplay?: string;
    ProductCurrency?: string;
    AccountCurrency?: string;
}

export type GroupOrderType = 'BRK' | 'OCO' | 'NORMAL';

/**
 * The request for placing a group trade.
 * @property Type - The group order type. Valid values are: BRK (Bracket), OCO (Order Cancels Order), and NORMAL.
 * @property Orders - Array of orders in the group.
 */
export interface GroupOrderRequest {
    /**
     * The group order type.
     * - BRK: Bracket orders are used to exit an existing position. They are designed to limit loss and lock in profit by "bracketing" an order with a simultaneous stop and limit order.
     * - OCO: Order Cancels Order - if one order is filled or partially-filled, all other orders in the group are cancelled.
     * - NORMAL: Regular group of orders without special handling.
     */
    Type: 'BRK' | 'OCO';
    /**
     * Array of orders in the group.
     * For BRK orders: All orders must be for the same symbol and same side (all sell or all cover).
     * For OCO orders: Orders can be for different symbols and sides.
     */
    Orders: OrderRequest[];
}

/**
 * The trigger type allows you to specify the type of tick, number, and pattern of ticks 
 * that will trigger a specific row of an activation rule.
 */
export interface ActivationTrigger {
    /**
     * Value used in the `TriggerKey` property of `MarketActivationRules` in the `AdvancedOptions` for an order.
     * Valid Values are: `STT`, `STTN`, `SBA`, `SAB`, `DTT`, `DTTN`, `DBA`, `DAB`, `TTT`, `TTTN`, `TBA`, and `TAB`.
     */
    Key: string;

    /** The name of the trigger type */
    Name: string;

    /** Description of how the trigger type works */
    Description: string;
}

/**
 * Response type for the Get Activation Triggers endpoint.
 * The trigger type allows you to specify the type of tick, number, and pattern of ticks 
 * that will trigger a specific row of an activation rule.
 */
export interface ActivationTriggers {
    /** Array of available activation trigger types */
    ActivationTriggers: ActivationTrigger[];
}

/**
 * A route that can be specified when placing an order.
 */
export interface Route {
    /** The ID that must be sent in the optional Route property of a POST order request */
    Id: string;
    /** The name of the route */
    Name: string;
    /** The asset type of the route. Valid Values are: STOCK, FUTURE, STOCKOPTION, and INDEXOPTION */
    AssetTypes: string[];
}

/**
 * Response type for the Get Routes endpoint.
 * Contains a list of valid routes that a client can specify when posting an order.
 */
export interface Routes {
    /** Array of available routes */
    Routes: Route[];
}

export interface GroupOrderResponse {
    Orders: {
        OrderID: string;
        Message: string;
    }[];
    Errors?: {
        OrderID: string;
        Error: string;
        Message: string;
    }[];
}

export interface GroupOrderConfirmationResponse {
    Orders: {
        OrderID: string;
        Message: string;
    }[];
    Errors?: {
        OrderID: string;
        Error: string;
        Message: string;
    }[];
}

export interface RoutesResponse {
    Routes: Route[];
} 