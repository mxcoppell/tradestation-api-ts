import { BrokerageService } from '../../BrokerageService';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Balances BOD', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    const mockBODBalancesResponse = {
        BODBalances: [
            {
                AccountID: '123456',
                AccountType: 'Cash',
                BalanceDetail: {
                    AccountBalance: '10000.00',
                    CashAvailableToWithdraw: '5000.00',
                    DayTrades: '0',
                    DayTradingMarginableBuyingPower: '20000.00',
                    Equity: '15000.00',
                    NetCash: '5000.00',
                    OptionBuyingPower: '10000.00',
                    OptionValue: '0.00',
                    OvernightBuyingPower: '10000.00'
                }
            },
            {
                AccountID: '789012',
                AccountType: 'Futures',
                CurrencyDetails: [
                    {
                        Currency: 'USD',
                        AccountMarginRequirement: '10000.00',
                        AccountOpenTradeEquity: '48000.00',
                        AccountSecurities: '0.00',
                        CashBalance: '25000.00',
                        MarginRequirement: '10000.00'
                    }
                ]
            }
        ]
    };

    it('should fetch BOD balances for a single account', async () => {
        const singleAccountResponse = {
            BODBalances: [mockBODBalancesResponse.BODBalances[0]]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(singleAccountResponse));

        const result = await brokerageService.getBalancesBOD('123456');
        expect(result).toEqual(singleAccountResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/bodbalances');
    });

    it('should fetch BOD balances for multiple accounts', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockBODBalancesResponse));

        const result = await brokerageService.getBalancesBOD('123456,789012');
        expect(result).toEqual(mockBODBalancesResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456,789012/bodbalances');
    });

    it('should handle futures account with currency details', async () => {
        const futuresAccountResponse = {
            BODBalances: [mockBODBalancesResponse.BODBalances[1]]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(futuresAccountResponse));

        const result = await brokerageService.getBalancesBOD('789012');
        expect(result).toEqual(futuresAccountResponse);
        expect(result.BODBalances[0].CurrencyDetails).toBeDefined();
        expect(result.BODBalances[0].CurrencyDetails![0].Currency).toBe('USD');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/789012/bodbalances');
    });

    it('should handle margin account with day trading details', async () => {
        const marginAccountResponse = {
            BODBalances: [{
                ...mockBODBalancesResponse.BODBalances[0],
                AccountType: 'Margin',
                BalanceDetail: {
                    ...mockBODBalancesResponse.BODBalances[0].BalanceDetail,
                    DayTradingMarginableBuyingPower: '40000.00',
                    OvernightBuyingPower: '20000.00'
                }
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(marginAccountResponse));

        const result = await brokerageService.getBalancesBOD('123456');
        expect(result).toEqual(marginAccountResponse);
        expect(result.BODBalances[0].AccountType).toBe('Margin');
        expect(result.BODBalances[0].BalanceDetail?.DayTradingMarginableBuyingPower).toBe('40000.00');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/bodbalances');
    });

    it('should handle errors for invalid accounts', async () => {
        const errorResponse = {
            BODBalances: [],
            Errors: [{
                AccountID: 'INVALID',
                Error: 'INVALID_ACCOUNT',
                Message: 'Account not found'
            }]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(errorResponse));

        const result = await brokerageService.getBalancesBOD('INVALID');
        expect(result).toEqual(errorResponse);
        expect(result.Errors).toBeDefined();
        expect(result.Errors![0].Error).toBe('INVALID_ACCOUNT');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/INVALID/bodbalances');
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getBalancesBOD('123456'))
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/bodbalances');
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getBalancesBOD('123456'))
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/bodbalances');
    });

    it('should handle API rate limit errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('API error: Rate limit exceeded'));

        await expect(brokerageService.getBalancesBOD('123456'))
            .rejects
            .toThrow('API error: Rate limit exceeded');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/bodbalances');
    });

    it('should handle empty BOD balances response', async () => {
        const emptyResponse = {
            BODBalances: []
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await brokerageService.getBalancesBOD('123456');
        expect(result).toEqual(emptyResponse);
        expect(result.BODBalances).toHaveLength(0);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts/123456/bodbalances');
    });
}); 