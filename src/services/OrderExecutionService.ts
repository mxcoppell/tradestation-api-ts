import { EventEmitter } from 'events';
import { HttpClient } from '../client/HttpClient';
import { StreamManager } from '../streaming/StreamManager';
import {
    OrderRequest,
    OrderResponse,
    OrderReplaceRequest,
    OrderConfirmationResponse,
    GroupOrderRequest,
    ActivationTriggers,
    Routes,
    GroupOrderConfirmationResponse,
    GroupOrderResponse,
    CancelOrderResponse
} from '../types/orderExecution';

export class OrderExecutionService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly streamManager: StreamManager
    ) { }

    /**
     * Places an order with the specified parameters.
     * Valid for Market, Limit, Stop Market, Stop Limit, and Options order types.
     * @param request The order request containing all necessary parameters
     * @returns A promise that resolves to the order response containing order ID and status
     */
    async placeOrder(request: OrderRequest): Promise<OrderResponse> {
        const response = await this.httpClient.post<OrderResponse>('/v3/orderexecution/orders', request);
        return response.data;
    }

    /**
     * Replaces an existing order with new parameters.
     * Valid for all account types.
     * @param orderId The ID of the order to replace
     * @param request The new order parameters
     * @returns A promise that resolves to the order response containing order ID and status
     */
    async replaceOrder(orderId: string, request: OrderReplaceRequest): Promise<OrderResponse> {
        const response = await this.httpClient.put<OrderResponse>('/v3/orderexecution/orders/' + orderId, request);
        return response.data;
    }

    /**
     * Confirms an order without actually placing it. Returns estimated cost and commission information.
     * Valid for Market, Limit, Stop Market, Stop Limit, Options, and Order Sends Order (OSO) order types.
     * @param order The order to confirm
     * @returns Estimated cost and commission information
     */
    async confirmOrder(request: OrderRequest): Promise<OrderConfirmationResponse> {
        const response = await this.httpClient.post<OrderConfirmationResponse>('/v3/orderexecution/orderconfirm', request);
        return response.data;
    }

    /**
     * Creates an Order Confirmation for a group order without actually placing it.
     * Returns estimated cost and commission information for each order in the group.
     * 
     * Valid for all account types and the following group types:
     * - OCO (Order Cancels Order): If one order is filled/partially-filled, all others are cancelled
     * - BRK (Bracket): Used to exit positions, combining stop and limit orders
     * - NORMAL: Regular group of orders
     * 
     * Note: When a group order is submitted, each sibling order is treated as individual.
     * The system does not validate that each order has the same Quantity, and
     * bracket orders cannot be updated as one transaction (must update each order separately).
     * 
     * @param request The group order request containing type and array of orders
     * @returns Array of estimated cost and commission information for each order
     */
    async confirmGroupOrder(request: GroupOrderRequest): Promise<GroupOrderConfirmationResponse> {
        const response = await this.httpClient.post<GroupOrderConfirmationResponse>('/v3/orderexecution/ordergroupconfirm', request);
        return response.data;
    }

    /**
     * Places a group order with the specified parameters.
     * Valid for all account types and the following group types:
     * - OCO (Order Cancels Order): If one order is filled/partially-filled, all others are cancelled
     * - BRK (Bracket): Used to exit positions, combining stop and limit orders
     * - NORMAL: Regular group of orders
     * 
     * Note: When a group order is submitted, each sibling order is treated as individual.
     * The system does not validate that each order has the same Quantity, and
     * bracket orders cannot be updated as one transaction (must update each order separately).
     * 
     * @param request The group order request containing type and array of orders
     * @returns Array of order responses for each order in the group
     */
    async placeGroupOrder(request: GroupOrderRequest): Promise<GroupOrderResponse> {
        const response = await this.httpClient.post<GroupOrderResponse>('/v3/orderexecution/ordergroups', request);
        return response.data;
    }

    /**
     * Sends a cancellation request to the relevant exchange.
     * Valid for all account types.
     * 
     * @param orderId - Order ID for cancellation request. Equity, option or future orderIDs should not include dashes.
     *                  Example: Use "123456789" instead of "1-2345-6789"
     * @returns A promise that resolves to the cancel order response containing order ID and status
     * @throws Will throw an error if:
     *         - The order doesn't exist (404)
     *         - The order cannot be cancelled (400)
     *         - The request is unauthorized (401)
     *         - The request is forbidden (403)
     *         - Rate limit is exceeded (429)
     *         - Service is unavailable (503)
     *         - Gateway timeout (504)
     */
    async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
        const response = await this.httpClient.delete<CancelOrderResponse>(`/v3/orderexecution/orders/${orderId}`);
        return response.data;
    }

    /**
     * Gets a list of activation triggers that can be used when placing orders.
     * @returns A promise that resolves to an array of activation triggers
     */
    async getActivationTriggers(): Promise<ActivationTriggers> {
        const response = await this.httpClient.get<ActivationTriggers>('/v3/orderexecution/activationtriggers');
        return response.data;
    }

    /**
     * Returns a list of valid routes that a client can specify when posting an order.
     * Routes are used to specify where an order should be sent for execution.
     * 
     * For Stocks and Options, if no route is specified in the order request,
     * the route will default to 'Intelligent'.
     * 
     * @returns A promise that resolves to an object containing an array of available routes
     * @throws Will throw an error if:
     *         - The request is unauthorized (401)
     *         - The request is forbidden (403)
     *         - Bad request (400)
     * 
     * @example
     * // Get available routes
     * const routes = await service.getRoutes();
     * console.log(routes.Routes);
     * // Example output:
     * // [
     * //   {
     * //     Id: "AMEX",
     * //     AssetTypes: ["STOCK"],
     * //     Name: "AMEX"
     * //   },
     * //   {
     * //     Id: "ARCA",
     * //     AssetTypes: ["STOCK"],
     * //     Name: "ARCX"
     * //   }
     * // ]
     */
    async getRoutes(): Promise<Routes> {
        const response = await this.httpClient.get<Routes>('/v3/orderexecution/routes');
        return response.data;
    }
} 