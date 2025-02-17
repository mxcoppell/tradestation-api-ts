import { EventEmitter } from 'events';
import { MarketDataService } from '../../MarketDataService';
import { OptionChainParams, Spread, Heartbeat, StreamErrorResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Stream Option Chain', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    it('should create option chain stream with default parameters', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await marketDataService.streamOptionChain('MSFT');
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/options/chains/MSFT',
            {
                strikeProximity: 5,
                strikeInterval: 1,
                strikeRange: 'All',
                optionType: 'All',
                spreadType: 'Single',
                enableGreeks: true
            },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should create option chain stream with custom parameters', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const params: OptionChainParams = {
            spreadType: 'Butterfly',
            strikeInterval: 5,
            expiration: '2024-01-19',
            strikeProximity: 3,
            enableGreeks: true,
            strikeRange: 'ITM',
            optionType: 'Call',
            riskFreeRate: 0.02,
            priceCenter: 150
        };

        const stream = await marketDataService.streamOptionChain('MSFT', params);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/options/chains/MSFT',
            params,
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should handle stream events correctly', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const stream = await marketDataService.streamOptionChain('MSFT');

        // Test spread update
        const mockSpreadUpdate: Spread = {
            Delta: '0.50',
            Theta: '-0.15',
            Gamma: '0.02',
            Rho: '0.10',
            Vega: '0.20',
            ImpliedVolatility: '0.30',
            IntrinsicValue: '2.50',
            ExtrinsicValue: '1.50',
            TheoreticalValue: '4.00',
            ProbabilityITM: '0.60',
            ProbabilityOTM: '0.40',
            ProbabilityBE: '0.55',
            ProbabilityITM_IV: '0.58',
            ProbabilityOTM_IV: '0.42',
            ProbabilityBE_IV: '0.53',
            TheoreticalValue_IV: '4.10',
            StandardDeviation: '0.25',
            DailyOpenInterest: 1000,
            Ask: '4.20',
            Bid: '4.00',
            Mid: '4.10',
            AskSize: 10,
            BidSize: 15,
            Close: '4.05',
            High: '4.25',
            Last: '4.15',
            Low: '3.95',
            NetChange: '0.10',
            NetChangePct: '2.5',
            Open: '4.05',
            PreviousClose: '4.05',
            Volume: 500,
            Side: 'Call',
            Strikes: ['150', '155'],
            Legs: [
                {
                    Symbol: 'MSFT 240119C150',
                    Ratio: 1,
                    StrikePrice: '150',
                    Expiration: '2024-01-19',
                    OptionType: 'Call'
                }
            ]
        };

        // Test heartbeat
        const mockHeartbeat: Heartbeat = {
            Heartbeat: 1,
            Timestamp: '2024-01-19T12:00:00Z'
        };

        // Test error
        const mockError: StreamErrorResponse = {
            Error: 'INVALID_SYMBOL',
            Message: 'Invalid symbol'
        };

        // Simulate events
        let spreadReceived = false;
        let heartbeatReceived = false;
        let errorReceived = false;

        stream.on('data', (data) => {
            if ('Delta' in data) {
                expect(data).toEqual(mockSpreadUpdate);
                spreadReceived = true;
            } else if ('Heartbeat' in data) {
                expect(data).toEqual(mockHeartbeat);
                heartbeatReceived = true;
            } else if ('Error' in data) {
                expect(data).toEqual(mockError);
                errorReceived = true;
            }
        });

        // Emit events
        mockEmitter.emit('data', mockSpreadUpdate);
        mockEmitter.emit('data', mockHeartbeat);
        mockEmitter.emit('data', mockError);

        // Verify all events were received
        expect(spreadReceived).toBe(true);
        expect(heartbeatReceived).toBe(true);
        expect(errorReceived).toBe(true);
    });

    it('should throw error for Calendar spread without expiration2', async () => {
        const params: OptionChainParams = {
            spreadType: 'Calendar',
            expiration: '2024-01-19'
        };

        await expect(async () => {
            await marketDataService.streamOptionChain('MSFT', params);
        }).rejects.toThrowError('expiration2 is required for Calendar and Diagonal spreads');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should throw error for Diagonal spread without expiration2', async () => {
        const params: OptionChainParams = {
            spreadType: 'Diagonal',
            expiration: '2024-01-19'
        };

        await expect(async () => {
            await marketDataService.streamOptionChain('MSFT', params);
        }).rejects.toThrowError('expiration2 is required for Calendar and Diagonal spreads');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should throw error for invalid strike interval', async () => {
        const params: OptionChainParams = {
            strikeInterval: 0
        };

        await expect(async () => {
            await marketDataService.streamOptionChain('MSFT', params);
        }).rejects.toThrowError('strikeInterval must be greater than or equal to 1');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should throw error for invalid risk free rate', async () => {
        const params: OptionChainParams = {
            riskFreeRate: 1.5
        };

        await expect(async () => {
            await marketDataService.streamOptionChain('MSFT', params);
        }).rejects.toThrowError('riskFreeRate must be a decimal value between 0 and 1');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });
}); 