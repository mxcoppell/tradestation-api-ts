import { TradeStationClient } from '../TradeStationClient';
import { HttpClient } from '../HttpClient';
import { StreamManager } from '../../streaming/StreamManager';
import { MarketDataService } from '../../services/MarketDataService';
import { OrderExecutionService } from '../../services/OrderExecutionService';
import { BrokerageService } from '../../services/BrokerageService';
import { ClientConfig } from '../../types/config';

// Mock dependencies
jest.mock('../HttpClient');
jest.mock('../../streaming/StreamManager');
jest.mock('../../services/MarketDataService');
jest.mock('../../services/OrderExecutionService');
jest.mock('../../services/BrokerageService');

describe('TradeStationClient', () => {
    let client: TradeStationClient;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;
    let config: ClientConfig;
    let originalEnv: string | undefined;

    beforeEach(() => {
        jest.clearAllMocks();

        // Store original environment
        originalEnv = process.env.ENVIRONMENT;

        // Set up mock HttpClient
        mockHttpClient = {
            getRefreshToken: jest.fn().mockReturnValue('test-refresh-token'),
        } as unknown as jest.Mocked<HttpClient>;
        (HttpClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // Set up mock StreamManager
        mockStreamManager = {
            closeAllStreams: jest.fn(),
        } as unknown as jest.Mocked<StreamManager>;
        (StreamManager as jest.Mock).mockImplementation(() => mockStreamManager);

        // Mock the service constructors
        (MarketDataService as jest.Mock).mockImplementation(() => ({}));
        (OrderExecutionService as jest.Mock).mockImplementation(() => ({}));
        (BrokerageService as jest.Mock).mockImplementation(() => ({}));

        // Set up config
        config = {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            refresh_token: 'test-refresh-token',
            environment: 'Simulation',
        };

        // Create client
        client = new TradeStationClient(config);
    });

    afterEach(() => {
        // Restore original environment
        process.env.ENVIRONMENT = originalEnv;
    });

    describe('constructor', () => {
        it('should create client with proper services', () => {
            expect(HttpClient).toHaveBeenCalledWith(expect.objectContaining({
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                refresh_token: 'test-refresh-token',
                environment: 'Simulation',
            }));
            expect(StreamManager).toHaveBeenCalledWith(mockHttpClient, expect.any(Object));
            expect(MarketDataService).toHaveBeenCalledWith(mockHttpClient, expect.any(Object));
            expect(OrderExecutionService).toHaveBeenCalledWith(mockHttpClient, expect.any(Object));
            expect(BrokerageService).toHaveBeenCalledWith(mockHttpClient, expect.any(Object));
        });

        it('should normalize environment value', () => {
            const clientWithLowercaseEnv = new TradeStationClient({
                ...config,
                environment: 'simulation' as any, // lowercase, cast to any to bypass type checking
            });

            expect(HttpClient).toHaveBeenCalledWith(expect.objectContaining({
                environment: 'Simulation', // should be normalized to proper case
            }));
        });

        it('should throw error when environment is not specified', () => {
            // Save original process.env object
            const originalProcessEnv = process.env;

            // Create a new process.env object without the ENVIRONMENT property
            const newEnv = { ...originalProcessEnv };
            delete newEnv.ENVIRONMENT;
            process.env = newEnv;

            try {
                const invalidConfig = { ...config };
                delete invalidConfig.environment;

                expect(() => new TradeStationClient(invalidConfig)).toThrow('Environment must be specified');
            } finally {
                // Restore original process.env
                process.env = originalProcessEnv;
            }
        });
    });

    describe('getRefreshToken', () => {
        it('should return the refresh token from http client', () => {
            mockHttpClient.getRefreshToken.mockReturnValue('test-refresh-token');

            const refreshToken = client.getRefreshToken();

            expect(refreshToken).toBe('test-refresh-token');
            expect(mockHttpClient.getRefreshToken).toHaveBeenCalled();
        });

        it('should return null when no refresh token is available', () => {
            mockHttpClient.getRefreshToken.mockReturnValue(null);

            const refreshToken = client.getRefreshToken();

            expect(refreshToken).toBeNull();
        });
    });

    describe('closeAllStreams', () => {
        it('should call closeAllStreams on stream manager', () => {
            client.closeAllStreams();

            expect(mockStreamManager.closeAllStreams).toHaveBeenCalled();
        });
    });
}); 