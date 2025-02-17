import { OrderExecutionService } from '../../OrderExecutionService';
import { CancelOrderResponse } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Cancel Order', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should cancel an order', async () => {
        const mockResponse: CancelOrderResponse = {
            OrderID: 'ORDER123',
            Message: 'Order cancelled successfully'
        };

        mockHttpClient.delete.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.cancelOrder('ORDER123');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });

    it('should handle order not found', async () => {
        const mockResponse: CancelOrderResponse = {
            OrderID: 'ORDER123',
            Error: 'ORDER_NOT_FOUND',
            Message: 'Order not found'
        };

        mockHttpClient.delete.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.cancelOrder('ORDER123');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });

    it('should handle network errors', async () => {
        mockHttpClient.delete.mockRejectedValueOnce(new Error('Network error'));

        await expect(orderExecutionService.cancelOrder('ORDER123'))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.delete.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(orderExecutionService.cancelOrder('ORDER123'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });

    it('should handle rate limit exceeded', async () => {
        mockHttpClient.delete.mockRejectedValueOnce(new Error('Rate limit exceeded'));

        await expect(orderExecutionService.cancelOrder('ORDER123'))
            .rejects
            .toThrow('Rate limit exceeded');
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });

    it('should handle service unavailable', async () => {
        mockHttpClient.delete.mockRejectedValueOnce(new Error('Service unavailable'));

        await expect(orderExecutionService.cancelOrder('ORDER123'))
            .rejects
            .toThrow('Service unavailable');
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });

    it('should handle gateway timeout', async () => {
        mockHttpClient.delete.mockRejectedValueOnce(new Error('Gateway timeout'));

        await expect(orderExecutionService.cancelOrder('ORDER123'))
            .rejects
            .toThrow('Gateway timeout');
        expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/v3/orderexecution/orders/ORDER123'
        );
    });
}); 