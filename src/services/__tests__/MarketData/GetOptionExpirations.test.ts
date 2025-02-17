import { MarketDataService } from '../../MarketDataService';
import { Expirations } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Option Expirations', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockResponse: Expirations = {
        Expirations: [
            { Date: '2024-01-19T00:00:00Z', Type: 'Monthly' },
            { Date: '2024-01-26T00:00:00Z', Type: 'Weekly' },
            { Date: '2024-02-16T00:00:00Z', Type: 'Monthly' },
            { Date: '2024-03-15T00:00:00Z', Type: 'Quarterly' }
        ]
    };

    it('should fetch option expirations without strike price', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getOptionExpirations('MSFT');

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/expirations/MSFT',
            { params: {} }
        );
    });

    it('should fetch option expirations with strike price', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getOptionExpirations('MSFT', 400);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/expirations/MSFT',
            { params: { strikePrice: 400 } }
        );
    });

    it('should handle empty expirations list', async () => {
        const emptyResponse: Expirations = {
            Expirations: []
        };
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await marketDataService.getOptionExpirations('MSFT');

        expect(result).toEqual(emptyResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/expirations/MSFT',
            { params: {} }
        );
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionExpirations('MSFT'))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/expirations/MSFT',
            { params: {} }
        );
    });

    it('should handle invalid underlying symbol', async () => {
        const errorMessage = 'Invalid symbol';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionExpirations('INVALID'))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/expirations/INVALID',
            { params: {} }
        );
    });
}); 