import { BrokerageService } from '../../BrokerageService';
import { Account } from '../../../types/brokerage';
import { createMockHttpClient, createMockStreamManager, createAxiosResponse } from '../../testUtils';
import { HttpClient } from '../../../client/HttpClient';
import { StreamManager } from '../../../streaming/StreamManager';

describe('BrokerageService - Get Accounts', () => {
    let brokerageService: BrokerageService;
    let mockHttpClient: jest.Mocked<HttpClient>;
    let mockStreamManager: jest.Mocked<StreamManager>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        mockStreamManager = createMockStreamManager(mockHttpClient);
        brokerageService = new BrokerageService(mockHttpClient, mockStreamManager);
    });

    const mockAccounts: { Accounts: Account[] } = {
        Accounts: [
            {
                AccountID: '123456',
                AccountType: 'Cash',
                Alias: 'Main Trading',
                Currency: 'USD',
                Status: 'Active',
                AccountDetail: {
                    IsStockLocateEligible: false,
                    EnrolledInRegTProgram: false,
                    RequiresBuyingPowerWarning: false,
                    DayTradingQualified: false,
                    OptionApprovalLevel: 2,
                    PatternDayTrader: false
                }
            },
            {
                AccountID: '789012',
                AccountType: 'Margin',
                Alias: 'Options Trading',
                Currency: 'USD',
                Status: 'Active',
                AccountDetail: {
                    IsStockLocateEligible: true,
                    EnrolledInRegTProgram: true,
                    RequiresBuyingPowerWarning: false,
                    DayTradingQualified: true,
                    OptionApprovalLevel: 4,
                    PatternDayTrader: true
                }
            },
            {
                AccountID: '345678',
                AccountType: 'Futures',
                Alias: 'Futures Trading',
                Currency: 'USD',
                Status: 'Active',
                AccountDetail: {
                    IsStockLocateEligible: false,
                    EnrolledInRegTProgram: false,
                    RequiresBuyingPowerWarning: true,
                    DayTradingQualified: true,
                    OptionApprovalLevel: 0,
                    PatternDayTrader: false
                }
            }
        ]
    };

    it('should fetch all accounts successfully', async () => {
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(mockAccounts));

        const result = await brokerageService.getAccounts();
        expect(result).toEqual(mockAccounts.Accounts);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts');
    });

    it('should handle empty accounts list', async () => {
        const emptyResponse = { Accounts: [] };
        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(emptyResponse));

        const result = await brokerageService.getAccounts();
        expect(result).toEqual([]);
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts');
    });

    it('should handle accounts with different option approval levels', async () => {
        const accountsWithOptions = {
            Accounts: mockAccounts.Accounts.map(acc => ({
                ...acc,
                AccountDetail: {
                    ...acc.AccountDetail,
                    OptionApprovalLevel: [1, 3, 5][mockAccounts.Accounts.indexOf(acc)]
                }
            }))
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(accountsWithOptions));

        const result = await brokerageService.getAccounts();
        expect(result).toEqual(accountsWithOptions.Accounts);
        expect(result.map(acc => acc.AccountDetail?.OptionApprovalLevel)).toEqual([1, 3, 5]);
    });

    it('should handle accounts with different trading qualifications', async () => {
        const accountsWithQualifications = {
            Accounts: [
                {
                    ...mockAccounts.Accounts[0],
                    AccountDetail: {
                        ...mockAccounts.Accounts[0].AccountDetail,
                        DayTradingQualified: true,
                        PatternDayTrader: true
                    }
                },
                {
                    ...mockAccounts.Accounts[1],
                    AccountDetail: {
                        ...mockAccounts.Accounts[1].AccountDetail,
                        DayTradingQualified: false,
                        PatternDayTrader: false
                    }
                }
            ]
        };

        mockHttpClient.get.mockResolvedValueOnce(createAxiosResponse(accountsWithQualifications));

        const result = await brokerageService.getAccounts();
        expect(result).toEqual(accountsWithQualifications.Accounts);
        expect(result[0].AccountDetail?.DayTradingQualified).toBe(true);
        expect(result[0].AccountDetail?.PatternDayTrader).toBe(true);
        expect(result[1].AccountDetail?.DayTradingQualified).toBe(false);
        expect(result[1].AccountDetail?.PatternDayTrader).toBe(false);
    });

    it('should handle network errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(brokerageService.getAccounts())
            .rejects
            .toThrow('Network error');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts');
    });

    it('should handle unauthorized access', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(brokerageService.getAccounts())
            .rejects
            .toThrow('Unauthorized');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts');
    });

    it('should handle API errors', async () => {
        mockHttpClient.get.mockRejectedValueOnce(new Error('API error: Rate limit exceeded'));

        await expect(brokerageService.getAccounts())
            .rejects
            .toThrow('API error: Rate limit exceeded');
        expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/brokerage/accounts');
    });
}); 