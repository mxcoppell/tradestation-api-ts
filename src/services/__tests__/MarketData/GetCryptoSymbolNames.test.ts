import { MarketDataService } from '../../MarketDataService';
import { SymbolNames } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Crypto Symbol Names', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockResponse: SymbolNames = {
        SymbolNames: ['BTCUSD', 'ETHUSD', 'LTCUSD', 'BCHUSD']
    };

    it('should fetch crypto symbol names successfully', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getCryptoSymbolNames();

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbollists/cryptopairs/symbolnames');
    });

    it('should handle empty symbol list', async () => {
        const emptyResponse: SymbolNames = {
            SymbolNames: []
        };
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await marketDataService.getCryptoSymbolNames();

        expect(result).toEqual(emptyResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbollists/cryptopairs/symbolnames');
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getCryptoSymbolNames())
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbollists/cryptopairs/symbolnames');
    });

    it('should handle authentication errors', async () => {
        const errorMessage = 'Unauthorized';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getCryptoSymbolNames())
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/symbollists/cryptopairs/symbolnames');
    });
}); 