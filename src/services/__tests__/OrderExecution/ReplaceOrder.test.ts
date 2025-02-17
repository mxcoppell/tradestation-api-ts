import { OrderExecutionService } from '../../OrderExecutionService';
import { OrderReplaceRequest, OrderResponse } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Replace Order', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should replace order quantity', async () => {
        const orderId = 'ORDER123';
        const request: OrderReplaceRequest = {
            Quantity: '200'
        };

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order quantity updated successfully'
            }]
        };

        mockHttpClient.put.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.replaceOrder(orderId, request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.put).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/' + orderId,
            request
        );
    });

    it('should replace limit price', async () => {
        const orderId = 'ORDER123';
        const request: OrderReplaceRequest = {
            LimitPrice: '155.00'
        };

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order limit price updated successfully'
            }]
        };

        mockHttpClient.put.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.replaceOrder(orderId, request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.put).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/' + orderId,
            request
        );
    });

    it('should replace stop price', async () => {
        const orderId = 'ORDER123';
        const request: OrderReplaceRequest = {
            StopPrice: '145.00'
        };

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order stop price updated successfully'
            }]
        };

        mockHttpClient.put.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.replaceOrder(orderId, request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.put).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/' + orderId,
            request
        );
    });

    it('should convert to market order', async () => {
        const orderId = 'ORDER123';
        const request: OrderReplaceRequest = {
            OrderType: 'Market'
        };

        const mockResponse: OrderResponse = {
            Orders: [{
                OrderID: 'ORDER123',
                Message: 'Order converted to market order'
            }]
        };

        mockHttpClient.put.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.replaceOrder(orderId, request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.put).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/' + orderId,
            request
        );
    });

    it('should handle validation errors', async () => {
        const orderId = 'ORDER123';
        const request: OrderReplaceRequest = {
            Quantity: '-100' // Invalid quantity
        };

        const mockResponse: OrderResponse = {
            Errors: [{
                OrderID: 'ORDER123',
                Error: 'INVALID_QUANTITY',
                Message: 'Invalid order: Quantity must be greater than 0'
            }]
        };

        mockHttpClient.put.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.replaceOrder(orderId, request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.put).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/' + orderId,
            request
        );
    });

    it('should handle order not found', async () => {
        const orderId = 'ORDER123';
        const request: OrderReplaceRequest = {
            Quantity: '100'
        };

        const mockResponse: OrderResponse = {
            Errors: [{
                OrderID: 'ORDER123',
                Error: 'ORDER_NOT_FOUND',
                Message: 'Order not found'
            }]
        };

        mockHttpClient.put.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.replaceOrder(orderId, request);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.put).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/' + orderId,
            request
        );
    });
}); 