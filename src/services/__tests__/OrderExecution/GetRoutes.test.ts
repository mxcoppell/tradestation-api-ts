import { OrderExecutionService } from '../../OrderExecutionService';
import { Routes } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Get Routes', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should fetch available routes', async () => {
        const mockResponse: Routes = {
            Routes: [
                {
                    Id: 'Intelligent',
                    Name: 'Intelligent',
                    AssetTypes: ['STOCK', 'STOCKOPTION', 'INDEXOPTION']
                },
                {
                    Id: 'ARCA',
                    Name: 'NYSE ARCA',
                    AssetTypes: ['STOCK']
                },
                {
                    Id: 'NSDQ',
                    Name: 'NASDAQ',
                    AssetTypes: ['STOCK']
                },
                {
                    Id: 'AMEX',
                    Name: 'NYSE American',
                    AssetTypes: ['STOCK']
                },
                {
                    Id: 'NYSE',
                    Name: 'New York Stock Exchange',
                    AssetTypes: ['STOCK']
                },
                {
                    Id: 'BATS',
                    Name: 'BATS',
                    AssetTypes: ['STOCK']
                },
                {
                    Id: 'EDGX',
                    Name: 'EDGX',
                    AssetTypes: ['STOCK']
                },
                {
                    Id: 'OPRA',
                    Name: 'Options Price Reporting Authority',
                    AssetTypes: ['STOCKOPTION', 'INDEXOPTION']
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.getRoutes();
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/routes');
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(orderExecutionService.getRoutes())
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/routes');
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(orderExecutionService.getRoutes())
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/routes');
    });

    it('should handle service unavailable', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Service unavailable'));

        await expect(orderExecutionService.getRoutes())
            .rejects
            .toThrow('Service unavailable');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/routes');
    });
}); 