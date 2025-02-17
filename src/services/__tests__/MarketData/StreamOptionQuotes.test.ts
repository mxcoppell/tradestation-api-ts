import { EventEmitter } from 'events';
import { MarketDataService } from '../../MarketDataService';
import { OptionQuoteParams, Spread, Heartbeat, StreamErrorResponse } from '../../../types/marketData';
import { createMockHttpClient, createMockStreamManager } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('MarketDataService - Stream Option Quotes', () => {
    let marketDataService: MarketDataService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        marketDataService = new MarketDataService(mockHttpClient, mockStreamManager);
    });

    it('should create option quotes stream with single leg', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const params: OptionQuoteParams = {
            legs: [
                { Symbol: 'MSFT 240119C400', Ratio: 1 }
            ],
            enableGreeks: true
        };

        const stream = await marketDataService.streamOptionQuotes(params);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/options/quotes',
            {
                'legs[0].Symbol': 'MSFT 240119C400',
                'legs[0].Ratio': 1,
                enableGreeks: true
            },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should create option quotes stream for butterfly spread', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const params: OptionQuoteParams = {
            legs: [
                { Symbol: 'MSFT 240119C400', Ratio: 1 },
                { Symbol: 'MSFT 240119C405', Ratio: -2 },
                { Symbol: 'MSFT 240119C410', Ratio: 1 }
            ],
            enableGreeks: true,
            riskFreeRate: 0.0425
        };

        const stream = await marketDataService.streamOptionQuotes(params);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/options/quotes',
            {
                'legs[0].Symbol': 'MSFT 240119C400',
                'legs[0].Ratio': 1,
                'legs[1].Symbol': 'MSFT 240119C405',
                'legs[1].Ratio': -2,
                'legs[2].Symbol': 'MSFT 240119C410',
                'legs[2].Ratio': 1,
                enableGreeks: true,
                riskFreeRate: 0.0425
            },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should create option quotes stream for straddle', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const params: OptionQuoteParams = {
            legs: [
                { Symbol: 'AAPL 240119C190', Ratio: 1 },
                { Symbol: 'AAPL 240119P190', Ratio: 1 }
            ],
            enableGreeks: true
        };

        const stream = await marketDataService.streamOptionQuotes(params);
        expect(stream).toBe(mockEmitter);
        expect(mockStreamManager.createStream).toHaveBeenCalledWith(
            '/v3/marketdata/stream/options/quotes',
            {
                'legs[0].Symbol': 'AAPL 240119C190',
                'legs[0].Ratio': 1,
                'legs[1].Symbol': 'AAPL 240119P190',
                'legs[1].Ratio': 1,
                enableGreeks: true
            },
            { headers: { 'Accept': 'application/vnd.tradestation.streams.v2+json' } }
        );
    });

    it('should handle stream events correctly', async () => {
        const mockEmitter = new EventEmitter();
        mockStreamManager.createStream.mockResolvedValueOnce(mockEmitter);

        const params: OptionQuoteParams = {
            legs: [{ Symbol: 'MSFT 240119C400', Ratio: 1 }]
        };

        const stream = await marketDataService.streamOptionQuotes(params);

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
            Strikes: ['400'],
            Legs: [
                {
                    Symbol: 'MSFT 240119C400',
                    Ratio: 1,
                    StrikePrice: '400',
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

    it('should throw error when no legs are provided', async () => {
        const params: OptionQuoteParams = {
            legs: [],
            enableGreeks: true
        };

        await expect(async () => {
            await marketDataService.streamOptionQuotes(params);
        }).rejects.toThrowError('At least one leg is required');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });

    it('should throw error for invalid risk free rate', async () => {
        const params: OptionQuoteParams = {
            legs: [{ Symbol: 'MSFT 240119C400' }],
            riskFreeRate: 1.5
        };

        await expect(async () => {
            await marketDataService.streamOptionQuotes(params);
        }).rejects.toThrowError('riskFreeRate must be a decimal value between 0 and 1');
        expect(mockStreamManager.createStream).not.toHaveBeenCalled();
    });
}); 