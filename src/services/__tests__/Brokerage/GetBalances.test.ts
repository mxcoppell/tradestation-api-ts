import { BrokerageService } from '../../BrokerageService';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Balances', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    const mockBalancesResponse = {
        Balances: [
            {
                AccountID: '123456',
                AccountType: 'Cash',
                BuyingPower: '10000.00',
                CashBalance: '5000.00',
                Commission: '0.00',
                Equity: '15000.00',
                MarketValue: '10000.00',
                TodaysProfitLoss: '500.00',
                UnclearedDeposit: '0.00',
                BalanceDetail: {
                    CostOfPositions: '9500.00',
                    DayTradeExcess: '0.00',
                    DayTradeMargin: '0.00',
                    DayTradeOpenOrderMargin: '0.00',
                    DayTrades: '0',
                    InitialMargin: '5000.00',
                    MaintenanceMargin: '2500.00',
                    MaintenanceRate: '0.25',
                    MarginRequirement: '5000.00',
                    UnrealizedProfitLoss: '500.00',
                    UnsettledFunds: '0.00'
                }
            },
            {
                AccountID: '789012',
                AccountType: 'Futures',
                BuyingPower: '50000.00',
                CashBalance: '25000.00',
                Commission: '0.00',
                Equity: '75000.00',
                MarketValue: '50000.00',
                TodaysProfitLoss: '1000.00',
                UnclearedDeposit: '0.00',
                CurrencyDetails: [
                    {
                        Currency: 'USD',
                        BODOpenTradeEquity: '48000.00',
                        CashBalance: '25000.00',
                        Commission: '0.00',
                        MarginRequirement: '10000.00',
                        NonTradeDebit: '0.00',
                        NonTradeNetBalance: '0.00',
                        OptionValue: '0.00',
                        RealTimeUnrealizedGains: '2000.00',
                        TodayRealTimeTradeEquity: '1000.00',
                        TradeEquity: '50000.00'
                    }
                ]
            }
        ]
    };

    it('should fetch balances for a single account', async () => {
        const singleAccountResponse = {
            Balances: [mockBalancesResponse.Balances[0]]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(singleAccountResponse));

        const result = await brokerageService.getBalances('123456');
        expect(result).toEqual(singleAccountResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/balances');
    });

    it('should fetch balances for multiple accounts', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockBalancesResponse));

        const result = await brokerageService.getBalances('123456,789012');
        expect(result).toEqual(mockBalancesResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456,789012/balances');
    });

    it('should handle futures account with currency details', async () => {
        const futuresAccountResponse = {
            Balances: [mockBalancesResponse.Balances[1]]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(futuresAccountResponse));

        const result = await brokerageService.getBalances('789012');
        expect(result).toEqual(futuresAccountResponse);
        expect(result.Balances[0].CurrencyDetails).toBeDefined();
        expect(result.Balances[0].CurrencyDetails![0].Currency).toBe('USD');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/789012/balances');
    });

    it('should handle margin account with balance details', async () => {
        const marginAccountResponse = {
            Balances: [{
                ...mockBalancesResponse.Balances[0],
                AccountType: 'Margin',
                BalanceDetail: {
                    ...mockBalancesResponse.Balances[0].BalanceDetail,
                    DayTradeExcess: '5000.00',
                    DayTradeMargin: '2500.00'
                }
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(marginAccountResponse));

        const result = await brokerageService.getBalances('123456');
        expect(result).toEqual(marginAccountResponse);
        expect(result.Balances[0].AccountType).toBe('Margin');
        expect(result.Balances[0].BalanceDetail?.DayTradeExcess).toBe('5000.00');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/balances');
    });

    it('should handle errors for invalid accounts', async () => {
        const errorResponse = {
            Balances: [],
            Errors: [{
                AccountID: 'INVALID',
                Error: 'INVALID_ACCOUNT',
                Message: 'Account not found'
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(errorResponse));

        const result = await brokerageService.getBalances('INVALID');
        expect(result).toEqual(errorResponse);
        expect(result.Errors).toBeDefined();
        expect(result.Errors![0].Error).toBe('INVALID_ACCOUNT');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/INVALID/balances');
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getBalances('123456'))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/balances');
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getBalances('123456'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/balances');
    });

    it('should handle API rate limit errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('API error: Rate limit exceeded'));

        await expect(brokerageService.getBalances('123456'))
            .rejects
            .toThrow('API error: Rate limit exceeded');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/balances');
    });

    it('should handle empty balances response', async () => {
        const emptyResponse = {
            Balances: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await brokerageService.getBalances('123456');
        expect(result).toEqual(emptyResponse);
        expect(result.Balances).toHaveLength(0);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/balances');
    });
}); 