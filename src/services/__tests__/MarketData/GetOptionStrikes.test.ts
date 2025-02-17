import { MarketDataService } from '../../MarketDataService';
import { Strikes } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Option Strikes', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    // Mock response for single options
    const mockSingleResponse: Strikes = {
        SpreadType: 'Single',
        Strikes: [
            ['150.00'],
            ['152.50'],
            ['155.00'],
            ['157.50'],
            ['160.00']
        ]
    };

    // Mock response for vertical spreads
    const mockVerticalResponse: Strikes = {
        SpreadType: 'Vertical',
        Strikes: [
            ['150.00', '152.50'],
            ['152.50', '155.00'],
            ['155.00', '157.50'],
            ['157.50', '160.00']
        ]
    };

    // Mock response for butterfly spreads
    const mockButterflyResponse: Strikes = {
        SpreadType: 'Butterfly',
        Strikes: [
            ['150.00', '152.50', '155.00'],
            ['152.50', '155.00', '157.50'],
            ['155.00', '157.50', '160.00']
        ]
    };

    it('should fetch strikes for single options successfully', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockSingleResponse));

        const result = await marketDataService.getOptionStrikes('AAPL');

        expect(result).toEqual(mockSingleResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/strikes/AAPL',
            { params: {} }
        );
    });

    it('should fetch strikes with expiration date filter', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockSingleResponse));

        const expiration = '2024-01-19';
        const result = await marketDataService.getOptionStrikes('MSFT', expiration);

        expect(result).toEqual(mockSingleResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/strikes/MSFT',
            { params: { expiration } }
        );
    });

    it('should fetch strikes for specific spread type', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockButterflyResponse));

        const expiration = '2024-01-19';
        const spreadType = 'Butterfly';
        const result = await marketDataService.getOptionStrikes('SPY', expiration, spreadType);

        expect(result).toEqual(mockButterflyResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/strikes/SPY',
            { params: { expiration, spreadType } }
        );
    });

    it('should handle empty underlying symbol', async () => {
        await expect(marketDataService.getOptionStrikes('')).rejects.toThrow('Underlying symbol is required');
        expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionStrikes('AAPL')).rejects.toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/strikes/AAPL',
            { params: {} }
        );
    });

    it('should handle authentication errors', async () => {
        const errorMessage = 'Unauthorized';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionStrikes('AAPL')).rejects.toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith(
            '/v3/marketdata/options/strikes/AAPL',
            { params: {} }
        );
    });
}); 