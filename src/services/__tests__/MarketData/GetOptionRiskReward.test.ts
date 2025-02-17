import { MarketDataService } from '../../MarketDataService';
import { RiskRewardAnalysis, RiskRewardAnalysisInput } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Option Risk Reward', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockInput: RiskRewardAnalysisInput = {
        SpreadPrice: '0.24',
        Legs: [
            {
                Symbol: 'AAPL 240119C150',
                Ratio: 1,
                OpenPrice: '3.50',
                TargetPrice: '5.00',
                StopPrice: '2.00'
            },
            {
                Symbol: 'AAPL 240119C152.5',
                Ratio: -1,
                OpenPrice: '2.00',
                TargetPrice: '1.00',
                StopPrice: '3.00'
            },
            {
                Symbol: 'AAPL 240119C155',
                Ratio: -1,
                OpenPrice: '1.00',
                TargetPrice: '0.50',
                StopPrice: '1.50'
            },
            {
                Symbol: 'AAPL 240119C157.5',
                Ratio: 1,
                OpenPrice: '0.50',
                TargetPrice: '1.00',
                StopPrice: '0.25'
            }
        ]
    };

    const mockResponse: RiskRewardAnalysis = {
        SpreadPrice: '0.24',
        MaxGain: '2.76',
        MaxLoss: '0.24',
        RiskRewardRatio: '11.5',
        Commission: '0.00',
        Legs: [
            {
                Symbol: 'AAPL 240119C150',
                Ratio: 1,
                OpenPrice: '3.50',
                TargetPrice: '5.00',
                StopPrice: '2.00'
            },
            {
                Symbol: 'AAPL 240119C152.5',
                Ratio: -1,
                OpenPrice: '2.00',
                TargetPrice: '1.00',
                StopPrice: '3.00'
            },
            {
                Symbol: 'AAPL 240119C155',
                Ratio: -1,
                OpenPrice: '1.00',
                TargetPrice: '0.50',
                StopPrice: '1.50'
            },
            {
                Symbol: 'AAPL 240119C157.5',
                Ratio: 1,
                OpenPrice: '0.50',
                TargetPrice: '1.00',
                StopPrice: '0.25'
            }
        ]
    };

    it('should analyze risk reward for butterfly spread', async () => {
        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getOptionRiskReward(mockInput);

        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/marketdata/options/riskreward',
            mockInput
        );
    });

    it('should handle empty legs array', async () => {
        const invalidInput: RiskRewardAnalysisInput = {
            SpreadPrice: '0.24',
            Legs: []
        };

        await expect(marketDataService.getOptionRiskReward(invalidInput))
            .rejects
            .toThrow('At least one leg is required');
        expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should handle legs with different expiration dates', async () => {
        const errorMessage = 'All legs must have the same expiration date';
        const invalidInput: RiskRewardAnalysisInput = {
            SpreadPrice: '0.24',
            Legs: [
                {
                    Symbol: 'AAPL 240119C150',
                    Ratio: 1,
                    OpenPrice: '3.50',
                    TargetPrice: '5.00',
                    StopPrice: '2.00'
                },
                {
                    Symbol: 'AAPL 240216C152.5',
                    Ratio: -1,
                    OpenPrice: '2.00',
                    TargetPrice: '1.00',
                    StopPrice: '3.00'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse({
            Error: 'INVALID_EXPIRATION',
            Message: errorMessage
        }));

        await expect(marketDataService.getOptionRiskReward(invalidInput))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/marketdata/options/riskreward',
            invalidInput
        );
    });

    it('should handle invalid symbols', async () => {
        const errorMessage = 'Invalid option symbol format';
        const invalidInput: RiskRewardAnalysisInput = {
            SpreadPrice: '0.24',
            Legs: [
                {
                    Symbol: 'INVALID',
                    Ratio: 1,
                    OpenPrice: '0.00',
                    TargetPrice: '0.00',
                    StopPrice: '0.00'
                }
            ]
        };

        mockHttpClient.post.mockResolvedValueOnce(createAxiosResponse({
            Error: 'INVALID_SYMBOL',
            Message: errorMessage
        }));

        await expect(marketDataService.getOptionRiskReward(invalidInput))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/marketdata/options/riskreward',
            invalidInput
        );
    });

    it('should handle network errors', async () => {
        const errorMessage = 'Network error';
        const invalidInput: RiskRewardAnalysisInput = {
            SpreadPrice: '0.24',
            Legs: [
                {
                    Symbol: 'AAPL 240119C150',
                    Ratio: 1,
                    OpenPrice: '3.50',
                    TargetPrice: '5.00',
                    StopPrice: '2.00'
                },
                {
                    Symbol: 'AAPL 240216C152.5',
                    Ratio: -1,
                    OpenPrice: '2.00',
                    TargetPrice: '1.00',
                    StopPrice: '3.00'
                }
            ]
        };

        mockHttpClient.post.mockRejectedValueOnce(new Error(errorMessage));

        await expect(marketDataService.getOptionRiskReward(invalidInput))
            .rejects
            .toThrow(errorMessage);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/v3/marketdata/options/riskreward',
            invalidInput
        );
    });
}); 