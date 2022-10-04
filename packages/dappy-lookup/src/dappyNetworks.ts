import { DappyNetworkId, DappyNetworkMember } from '@fabcotech/dappy-model';

export const dappyNetworks: Record<DappyNetworkId, DappyNetworkMember[]> = {
  d: [
    {
      ip: '143.244.205.40',
      port: '443',
      hostname: 'node1.d.fabco.dappy',
      scheme: 'https',
      caCert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM4akNDQWRxZ0F3SUJBZ0lKQUx4SGZEQy85US9KTUEwR0NTcUdTSWIzRFFFQkN3VUFNQjR4SERBYUJnTlYKQkFNTUUyNXZaR1V4TG1RdVptRmlZMjh1WkdGd2NIa3dIaGNOTWpJd09USTJNVE13TmpNMVdoY05NekF4TWpFegpNVE13TmpNMVdqQWVNUnd3R2dZRFZRUUREQk51YjJSbE1TNWtMbVpoWW1OdkxtUmhjSEI1TUlJQklqQU5CZ2txCmhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBbFVKYmZwQkZJYmxFajZMQUhiVlYxZUs1YTBZWEVpWnQKU1hRSFFFSFpyM1ZZUEdNYk1NaWRYSWhQNEtxRWNITEMvTU9DelY3dFY1ZzlkczVzaTBXa0VXa1RlNm9rQWtBUApkMGhBUk9hc2ROVWdPL2FlYmtDQkVHNDVVVFo0WDQ0ZktraEFldkx5NHpBVmhiSmpyOGdGcGM3ZDN1ZFhINzhSCmtYb2xtbHNiZ3M0NjkrME0rTUxTNUwrNE1UbktqODArWWl0MXIxMnVMOXNhb2VqVUdSd0s5aHUvNStMMjlKb0UKVWZNNUhwZDR2WDNLREdJQzlKUVJlczJZamJZZ0QwSGZKVGZnRms0VlBXTUZIaXV1TGFOS3NqZXdrRm82RnNUYwozdHJlRUt2VEJWRlBwZjRUOWZET1RwYThYZWRFQlZDb09Pa2Z4cko4dWhmbmE1Y3lTMWVHWlFJREFRQUJvek13Ck1UQVBCZ05WSFJNQkFmOEVCVEFEQVFIL01CNEdBMVVkRVFRWE1CV0NFMjV2WkdVeExtUXVabUZpWTI4dVpHRncKY0hrd0RRWUpLb1pJaHZjTkFRRUxCUUFEZ2dFQkFJcHpOaFNZblN4Sk45UFA2U00zQitGYXFWL2c5bjFFK3V2UAora0RNQ2hBdjlvQnE5U1ZOZHFtUzM3Z1JJWDhSNVpidFBGeTdTQ1VVOUdia3pNUHJXNmdSY2ZZMkNQNzA1cktqClBBUFB4UEZ4VW5vS2NqUFAvVk52TXcyejFiUE1DaCtySDluU1dxR2RNOUJBcFc5R0ZuK1NzZFNBRHd5Z0lFR28KY2wzQUdUdWJxRVNKNFFvK3pXc2J1RVNTcnJENy9JelRwSndxcnArenE1ZTNUN3FEWitrT0IrQVZlQ3dObis1Qwp1ODlMS2hzREpWL3dwU2pva2oxWXZJcFQzQXVUTXUrUU1oZFRjMTNuODFNM3RVUFBlT3EzbXIrL29IbmJlaWx2CndmYUVaeThWeTdHQ2ptM3MrWTN4cVNGcTNFcVNyR0s4ZE5MR1lJa2VpM0ZEOHdDVzZmRT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=',
    },
  ],
  gamma: [
    {
      ip: '104.248.101.247',
      port: '443',
      hostname: 'node1.gamma.fabco.dappy',
      scheme: 'https',
      caCert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMvakNDQWVhZ0F3SUJBZ0lKQU9YaHVHZUtqWFV1TUEwR0NTcUdTSWIzRFFFQkN3VUFNQ0l4SURBZUJnTlYKQkFNTUYyNXZaR1V4TG1kaGJXMWhMbVpoWW1OdkxtUmhjSEI1TUI0WERUSXlNRGt5TXpJek1URXlNMW9YRFRNdwpNVEl4TURJek1URXlNMW93SWpFZ01CNEdBMVVFQXd3WGJtOWtaVEV1WjJGdGJXRXVabUZpWTI4dVpHRndjSGt3CmdnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURlTlg5eDE0QW9XV0oyVGRLVmYzNXgKYWpnS29Ld1VhcmlmYXJlZXBzQ2tQRkhBNXVnZTlsUnduVm5TSlBYR3ZXUFJJQUh4M052TjQ2ODlKaWIrcmhiZwpGeWtlRmNoNmJKZnM2SWhwbmpzL0J0UDlpTDhqalN6ekhqSEJwNUNkNHMyK1lxbFEzc0NocVhVQUkvNHcyTFFBClkvTVpHU1UzeDBmWmZaYzFWN1YyWmU5bVVXWUpkWFN3cG5Pa0dTRkd2UU8vcVJxeHpmS0FUSXRpM1RqMkJVU0YKUFl4NnUzM01MWnE2Q0pHSFhBWXRXeUQwb0RMMTdrMkZodjI1dktlS2hSVFJaanYvdmJVOE5Ibm9TN1Q3NWFxOApOWnBIVWNMbHZKdW9GZ2VMa1JxY1IxaEk3OGRwRG8xOTVjTm5jMkhtSDVXc3dzWVZrYXhqZXFVTGRRNHpmazJMCkFnTUJBQUdqTnpBMU1BOEdBMVVkRXdFQi93UUZNQU1CQWY4d0lnWURWUjBSQkJzd0dZSVhibTlrWlRFdVoyRnQKYldFdVptRmlZMjh1WkdGd2NIa3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBRkdwdnVhbEtHR2JyMzV1bVk1VgpsTytRbFlPNWdoRm5hcWhha1hZcFdJZnFXVENTUWszMXFGelJiQmI2d094YTFnWmZqRkNyaFNLdVlWeEVnYytBCjZ2STkwcnNpVkRYcFFwS0hpTVc1REdEQWRVWWdZaG1HTmRYZVNLVHJHNlQwOGVQNzFZVG10UVhRZmUwQUNSbFYKaWZ1QmVyQktDOVIyZk9TdWNYMzFER3hlV2pmUlYxSkI5U1VQT1p4YjYvLzU2QWFQNGdmdHNtL3loc3FSTitFTwpuZWczZlZybEhBWkV0UnhZbDcxWGkxekZQdml4RkgwNDc4T0FOZlJoRWZralc4K1YzdGJacFdsTXF1ZFJGSVo0CmxzZW95Q3ZyUi9vUUtxM285c05OeXlSNEU5MjIyL1dVYWUrUHFXK2pXSG1EaTVZWGZnWDFRMGRCYnJuQXB6MFQKWXVNPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==',
    },
    {
      ip: '104.248.101.247',
      port: '443',
      hostname: 'node2.gamma.fabco.dappy',
      scheme: 'https',
      caCert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMvakNDQWVhZ0F3SUJBZ0lKQU4veURtdllUd1g5TUEwR0NTcUdTSWIzRFFFQkN3VUFNQ0l4SURBZUJnTlYKQkFNTUYyNXZaR1V5TG1kaGJXMWhMbVpoWW1OdkxtUmhjSEI1TUI0WERUSXlNRGt5TXpJek1UVTFNbG9YRFRNdwpNVEl4TURJek1UVTFNbG93SWpFZ01CNEdBMVVFQXd3WGJtOWtaVEl1WjJGdGJXRXVabUZpWTI4dVpHRndjSGt3CmdnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURVd1h6UUhTMU9pRTJ3czgvN3RmQnMKMGdUdHgxeTJ2dzFrd2lHcGFTMEI4b0hCUVM4MjRjVFE1c2VLVVFEdnU4M1ltSHMxcktpb0V6THU1MThITTBxRwpIWHh4S2UwdHJwWWtQb3VEMEZQTExndlNwb215c2VOMHQ0NnVLZXNIRXh0RGFHZmNVbWo2OXhQOVNoYTYrRU45Cm1kSE9TbnV6QVdQVXBhMjZid2plVkhGbDlkSmNmMFEveS9qS1pHYjhsYThGTmRQN2tNQU10eWdpZk5EaFVGVngKZ2Z0K3VwczB4NFV2aWRNNmFzWCtScFFqRnRwTTZuMi9xUU9vSWdkSnNJdGYzQlM1NngwS1VFYmNEelkyb2RPdwpnVE5SN3pLVHdBdll1Wmg5TXViUGZReVpPM1ZHY1JhR1lxQWhQbDdTWTh0eXE3Q0Q4M3poOWtORWZTdVM2c20vCkFnTUJBQUdqTnpBMU1BOEdBMVVkRXdFQi93UUZNQU1CQWY4d0lnWURWUjBSQkJzd0dZSVhibTlrWlRJdVoyRnQKYldFdVptRmlZMjh1WkdGd2NIa3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBTHRGSkVVRnpoMUFiOFAvSEVLZgpTRmVKempuZVNCU3J3eEtrNVBhcnkrejVtRzc1NkkzUzdyTnRzemwwZlc0WEdzWldZZHNjMU5sOVpPRmswUEVuCmlXS21QeW9DT3UxY3hJcDRpamN4VUtmRXFlZ2dJSE9ydlVlajdYUDBTMHhScjFSRkoxT1NSSjZLSE1FYWM2aXkKQmRRcFlCNzhDODMyZk9JWWJPbzFHLytKamxmTERRdnhXdGxYVENHajhNUWNyaGtaQVkxOG1RR3pHZi9rRDRIbQo2Y3dSUmdoYVFxdktaQ1FMQ1JuNDBSNnI3R2pUQjB6d0R2aGE4bGZ4Z2hmUjQwbGRJWkR0ZlJ3TVd5T2RoWVVNCk5tdWdZcldMVjA2YVlQZFplSjRFdkVVYjEyRlhaTUt0L0dUWlpzeVJUbWFLc290VzJ2eTlIckJNaStsbGZlSWsKUjB3PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==',
    },
  ],
};
