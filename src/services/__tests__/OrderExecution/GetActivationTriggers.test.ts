import { OrderExecutionService } from '../../OrderExecutionService';
import { ActivationTriggers } from '../../../types/orderExecution';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('OrderExecutionService - Get Activation Triggers', () => {
    let orderExecutionService: OrderExecutionService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        orderExecutionService = new OrderExecutionService(mockHttpClient, mockStreamManager);
    });

    it('should fetch available activation triggers', async () => {
        const mockResponse: ActivationTriggers = {
            ActivationTriggers: [
                {
                    Key: 'STT',
                    Name: 'Single Trade Tick',
                    Description: 'Triggers on a single trade tick'
                },
                {
                    Key: 'STTN',
                    Name: 'Single Trade Tick Number',
                    Description: 'Triggers on a specific number of trade ticks'
                },
                {
                    Key: 'SBA',
                    Name: 'Single Bid Ask',
                    Description: 'Triggers on a single bid/ask update'
                },
                {
                    Key: 'SAB',
                    Name: 'Single Ask Bid',
                    Description: 'Triggers on a single ask/bid update'
                },
                {
                    Key: 'DTT',
                    Name: 'Double Trade Tick',
                    Description: 'Triggers on two consecutive trade ticks'
                },
                {
                    Key: 'DTTN',
                    Name: 'Double Trade Tick Number',
                    Description: 'Triggers on a specific number of double trade ticks'
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await orderExecutionService.getActivationTriggers();
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/activationtriggers');
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(orderExecutionService.getActivationTriggers())
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/activationtriggers');
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(orderExecutionService.getActivationTriggers())
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/activationtriggers');
    });

    it('should handle service unavailable', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Service unavailable'));

        await expect(orderExecutionService.getActivationTriggers())
            .rejects
            .toThrow('Service unavailable');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/orderexecution/activationtriggers');
    });
}); 