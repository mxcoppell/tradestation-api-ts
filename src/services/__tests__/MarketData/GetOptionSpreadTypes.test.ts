import { MarketDataService } from '../../MarketDataService';
import { SpreadTypes } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Option Spread Types', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockResponse: SpreadTypes = {
        SpreadTypes: [
            { Name: 'Single', StrikeInterval: false, ExpirationInterval: false },
            { Name: 'Straddle', StrikeInterval: false, ExpirationInterval: false },
            { Name: 'Strangle', StrikeInterval: true, ExpirationInterval: false },
            { Name: 'Vertical', StrikeInterval: true, ExpirationInterval: false },
            { Name: 'Calendar', StrikeInterval: false, ExpirationInterval: true },
            { Name: 'Diagonal', StrikeInterval: true, ExpirationInterval: true },
            { Name: 'Butterfly', StrikeInterval: true, ExpirationInterval: false },
            { Name: 'Condor', StrikeInterval: true, ExpirationInterval: false },
            { Name: 'IronButterfly', StrikeInterval: true, ExpirationInterval: false },
            { Name: 'IronCondor', StrikeInterval: true, ExpirationInterval: false }
        ]
    };

    it('should fetch option spread types successfully', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getOptionSpreadTypes();

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/options/spreadtypes');
    });

    it('should handle empty spread types list', async () => {
        const emptyResponse: SpreadTypes = {
            SpreadTypes: []
        };
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await marketDataService.getOptionSpreadTypes();

        expect(result).toEqual(emptyResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/options/spreadtypes');
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionSpreadTypes())
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/options/spreadtypes');
    });

    it('should handle authentication errors', async () => {
        const errorMessage = 'Unauthorized';
        mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionSpreadTypes())
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/options/spreadtypes');
    });
}); 