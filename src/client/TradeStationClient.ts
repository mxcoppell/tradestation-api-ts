import { ClientConfig } from '../types/config';
import { HttpClient } from './HttpClient';
import { StreamManager } from '../streaming/StreamManager';
import { MarketDataService } from '../services/MarketDataService';
import { OrderExecutionService } from '../services/OrderExecutionService';
import { BrokerageService } from '../services/BrokerageService';

export class TradeStationClient {
    private readonly httpClient: HttpClient;
    private readonly streamManager: StreamManager;

    readonly marketData: MarketDataService;
    readonly orderExecution: OrderExecutionService;
    readonly brokerage: BrokerageService;

    /**
     * Creates a new TradeStationClient instance
     * @param config Optional configuration object. If not provided, values will be read from environment variables
     * @example
     * // Using environment variables
     * const client = new TradeStationClient();
     * 
     * // Using explicit configuration
     * const client = new TradeStationClient({
     *   clientId: 'your_client_id',
     *   clientSecret: 'your_client_secret',
     *   username: 'your_username',
     *   password: 'your_password',
     *   scope: 'your scopes',
     *   environment: 'Simulation' // or 'Live'
     * });
     */
    constructor(config?: ClientConfig) {
        // Get environment from config or env var
        let environment: 'Simulation' | 'Live' | undefined = config?.environment || process.env.ENVIRONMENT as 'Simulation' | 'Live';

        // Normalize environment to proper case
        if (environment) {
            environment = environment.toLowerCase() === 'simulation' ? 'Simulation' : 'Live';
        } else {
            throw new Error('Environment must be specified either in config or ENVIRONMENT env var');
        }

        // Create final config with normalized environment
        const finalConfig: ClientConfig = {
            ...config,
            environment
        };

        this.httpClient = new HttpClient(finalConfig);
        this.streamManager = new StreamManager(this.httpClient, finalConfig);

        // Initialize services
        this.marketData = new MarketDataService(this.httpClient, this.streamManager);
        this.orderExecution = new OrderExecutionService(this.httpClient, this.streamManager);
        this.brokerage = new BrokerageService(this.httpClient, this.streamManager);
    }

    /**
     * Authenticates with the TradeStation API
     * This is called automatically when needed, but can be called explicitly to pre-authenticate
     */
    async authenticate(): Promise<void> {
        await this.httpClient.authenticate();
    }

    /**
     * Closes all active streams
     */
    closeAllStreams(): void {
        this.streamManager.closeAllStreams();
    }
}