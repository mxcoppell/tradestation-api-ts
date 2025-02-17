import { MarketDataService } from '../../MarketDataService';
import { Bar, BarsResponse, BarHistoryParams } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Get Bars', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    const mockBar: Bar = {
        Close: '216.39',
        DownTicks: 231021,
        DownVolume: 19575455,
        Epoch: 1604523600000,
        High: '218.32',
        IsEndOfHistory: false,
        IsRealtime: false,
        Low: '212.42',
        Open: '214.02',
        OpenInterest: '0',
        TimeStamp: '2020-11-04T21:00:00Z',
        TotalTicks: 460552,
        TotalVolume: '42311777',
        UpTicks: 229531,
        UpVolume: 22736321,
        BarStatus: 'Closed'
    };

    it('should fetch bar history with all parameters', async () => {
        const mockResponse: BarsResponse = {
            Bars: [mockBar]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const params: BarHistoryParams = {
            interval: '1',
            unit: 'Daily',
            barsback: 5,
            sessiontemplate: 'USEQPreAndPost'
        };

        const result = await marketDataService.getBarHistory('AAPL', params);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/barcharts/AAPL', {
            params
        });
    });

    it('should fetch bar history with date range parameters', async () => {
        const mockResponse: BarsResponse = {
            Bars: [mockBar]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const params: BarHistoryParams = {
            interval: '1',
            unit: 'Minute',
            firstdate: '2024-01-01T14:30:00Z',
            lastdate: '2024-01-01T21:00:00Z',
            sessiontemplate: 'USEQPreAndPost'
        };

        const result = await marketDataService.getBarHistory('AAPL', params);
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/barcharts/AAPL', {
            params
        });
    });

    it('should use default parameters when none provided', async () => {
        const mockResponse: BarsResponse = {
            Bars: [mockBar]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockResponse));

        const result = await marketDataService.getBarHistory('AAPL');
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/marketdata/barcharts/AAPL', {
            params: {}
        });
    });

    it('should throw error for invalid minute interval', async () => {
        const params = {
            interval: '1441',
            unit: 'Minute' as const
        };

        await expect(async () => {
            await marketDataService.getBarHistory('AAPL', params);
        }).rejects.toThrowError('Maximum interval for minute bars is 1440');
    });

    it('should throw error for too many intraday bars', async () => {
        const params = {
            unit: 'Minute' as const,
            barsback: 57601
        };

        await expect(async () => {
            await marketDataService.getBarHistory('AAPL', params);
        }).rejects.toThrowError('Maximum of 57,600 intraday bars allowed per request');
    });

    it('should throw error when both barsback and firstdate are specified', async () => {
        const params = {
            barsback: 100,
            firstdate: '2024-01-01'
        };

        await expect(async () => {
            await marketDataService.getBarHistory('AAPL', params);
        }).rejects.toThrowError('barsback and firstdate parameters are mutually exclusive');
    });

    it('should throw error when both lastdate and startdate are specified', async () => {
        const params = {
            lastdate: '2024-01-01',
            startdate: '2024-01-01'
        };

        await expect(async () => {
            await marketDataService.getBarHistory('AAPL', params);
        }).rejects.toThrowError('lastdate and startdate parameters are mutually exclusive. startdate is deprecated, use lastdate instead');
    });

    it('should throw error for non-minute bars with interval not 1', async () => {
        const params = {
            interval: '5',
            unit: 'Daily' as const
        };

        await expect(async () => {
            await marketDataService.getBarHistory('AAPL', params);
        }).rejects.toThrowError('Interval must be 1 for non-minute bars');
    });
}); 