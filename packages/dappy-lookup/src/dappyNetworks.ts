import { DappyNetworkId, DappyNetworkMember } from './types';

export const dappyNetworks: Record<DappyNetworkId, DappyNetworkMember[]> = {
  d: [
    {
      ip: '195.154.70.253',
      port: '443',
      hostname: 'dappybetanetwork',
      scheme: 'https',
      caCert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM3akNDQWRhZ0F3SUJBZ0lKQU5wamR1U25BTlFLTUEwR0NTcUdTSWIzRFFFQkN3VUFNQnN4R1RBWEJnTlYKQkFNTUVHUmhjSEI1WW1WMFlXNWxkSGR2Y21zd0hoY05NakV4TVRFNE1Ea3pNek15V2hjTk16QXdNakEwTURregpNek15V2pBYk1Sa3dGd1lEVlFRRERCQmtZWEJ3ZVdKbGRHRnVaWFIzYjNKck1JSUJJakFOQmdrcWhraUc5dzBCCkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW1hYmkrdUlad0c2UkROcUVyTjZISTRmbVBDbVkxVFN1cnpuYzZZN1gKcmVQTEJkOTJRYlRmR0ZObUFFRWEvU1BBZnhzL2ZzeHh2V3RjdWJDSyt1a3ZiUTlDbFhGckZkam16Z3R6eUhxNApyc1MvaWEyNGJjRlNEY3FpOWVnK2Y4a1VPUUo1TnlpZktUKzRZdWdBa2VEMGhVaEM3TTJhZllTTXBrajZvRW56CjFmNlVpZEU1aGljb2hxamlWOUl5b3JKQ0RFWkV1NWRBSTJYa0pWS1ZYcGdsbk1kdEtxZHU2RUp2cWRUamhtTWoKMDU4VkFKRHJhaWMrMHhyQlo1QWxJWlFRL21laXltb1c5LzZnM1gxUkJlRWNOdjVwTWo0UWRub3gyOHptQllHRwpSdUFoTWd5UzBMbWlwcWM0a25rdVF4c1NKZ2dvV1VQL0kwa2VkRlVMaTdlcUx3SURBUUFCb3pVd016QXhCZ05WCkhSRUVLakFvZ2dsc2IyTmhiR2h2YzNTQ0NXUmhjSEI1Ym05a1pZSVFaR0Z3Y0hsaVpYUmhibVYwZDI5eWF6QU4KQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBSmh2RjlZNm5EOEtkajY5WVZ0MThFaWxzRk4vL1NUbjNibCtnWVY3dwpwcUxCTTJYNDNCeWRnS2dmNWF3c2xGbEthNi9CWk5KNThhcXk5NHBXRSsvSEMyTHNKNGt1NHJOZThPbUY5Vi9aCjc2eXlEZk9mY1BhK0JCRFphOGo5VUZBQ1VXS0RVY2x0UDZ4dWFRZnVWT0JDWDBhVEtCRmgyMUxBQkUzU0JEbEkKL1owckphanREaVd3MzQvVzdMbVpZTzJlSE5kQTRWVjd1cXNvUVZCN2s1aktRZU4xY0Q5Q292UTZ1VDRwYmtYVgpiSUxuM3RWbkJqdVcxajAvbWVnUnNkVlJkRTJQcXNJa1BIeHNFZ0lBNGNVOTdIM3FYaVQycUhrcng2NWVZNGZFCm9PdXlzejd4bWIrVkVscWFLVFdHSlhLS0MrM0lFdjhxbzNDWTFHZGM5VWFCOVE9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0t=',
    },
  ],
  gamma: [
    {
      ip: '104.248.101.247',
      port: '443',
      hostname: 'node1.gamma.fabco',
      scheme: 'https',
      caCert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM3RENDQWRTZ0F3SUJBZ0lKQVB6MFdqZHZPd1A1TUEwR0NTcUdTSWIzRFFFQkN3VUFNQnd4R2pBWUJnTlYKQkFNTUVXNXZaR1V4TG1kaGJXMWhMbVpoWW1Odk1CNFhEVEl5TURreU16RXpNVE13TjFvWERUTXdNVEl4TURFegpNVE13TjFvd0hERWFNQmdHQTFVRUF3d1JibTlrWlRFdVoyRnRiV0V1Wm1GaVkyOHdnZ0VpTUEwR0NTcUdTSWIzCkRRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRREI0NTkvelBPTmlWaXE2U1VNWS9TL25tT2ppSmczd0ticytBMEUKU1Nlc3paL0syeDM1ZGFFd2l4Q09aR1dRWXUrem9ZVFBXVVpYVFZveGlkckhlMXM5RUczb1Z3T2JIKytyMVZJVQo0RmVaTUxGamtpdHpobVIrVXp2emRNVm01Y2l5TTJSTHlVK3d1dFBHMFU1dWlSbkxZTUdIZHhpa3pzR2hXdmYwCm1FT2pudWYyM1pOQzVkM2VJWW92cVdYazNhYmtVS08yL25PMktaendYd0NGUE5wM3ZVRm5DZlRVNElHMmtpanAKRDV5aUlIWS9OUUIyK2s4Vzh0VDJmbDBiVU1RVG1oZXBJc2FLK29BWVZqWEwvQWRaRHlhUnZXUWJrTERiZFVaZwpIWjVteVZVbGtHMTU2b00yK29uNFJ5QXV3OFFTQ2EraDRqajBMNmZxTU91dEwyR0RBZ01CQUFHak1UQXZNQThHCkExVWRFd0VCL3dRRk1BTUJBZjh3SEFZRFZSMFJCQlV3RTRJUmJtOWtaVEV1WjJGdGJXRXVabUZpWTI4d0RRWUoKS29aSWh2Y05BUUVMQlFBRGdnRUJBREdNMnluaDFzdEJqWHBJWmJ6d1R2Q3pKUWNSK2ovRnBIUkZHKzlaS1UxMAordTVSTVVYQjRyZ1ltUlh2cEh1MUhOdHBDVGQyZjVzZVN5TXF1SnBlVmVnZ2d6UmlhRFI3UkNwZnBFT29PWlIzCmNlcnBLNTI1WUlRY3hrNkwrM3h3ZXRWSk5HVFhEMDFSRVFJKzRoUXhCZS8rbXEwSmpuNTQ2MkNHc2Noc1VVRUkKSnpUTDJUTGdidURzWmNUNEJ4VkFmWTJOVHZqOXV2blk3NnNwMmVJdWJDdWdiV0JmQU51eWlKbURJVXNIME5tVgpGY2tJVjZYdW1VVG5iK1pRMEcxY0llSXI3RXArQTRwVm5ta2ZEd1crR1I5UkNuSmJlTHZvQUU2aFRwMzVXY041CmNmczBYQW1BclR3ZDViRG94ekNsSmgxMVZqRWdHWU1qRlZ4Q0NWSGUxSWM9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K',
    },
    {
      ip: '104.248.101.247',
      port: '443',
      hostname: 'node2.gamma.fabco',
      scheme: 'https',
      caCert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM3RENDQWRTZ0F3SUJBZ0lKQUpEU21jKzlnRGtoTUEwR0NTcUdTSWIzRFFFQkN3VUFNQnd4R2pBWUJnTlYKQkFNTUVXNXZaR1V5TG1kaGJXMWhMbVpoWW1Odk1CNFhEVEl5TURreU16RXpNemd5TmxvWERUTXdNVEl4TURFegpNemd5Tmxvd0hERWFNQmdHQTFVRUF3d1JibTlrWlRJdVoyRnRiV0V1Wm1GaVkyOHdnZ0VpTUEwR0NTcUdTSWIzCkRRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRRENSS0Mra2p4cHZzR3Q5L3NTRHBMVGxZUUc4b1pRQ1FKRlhDZUwKNjc5eUNJT09zK0EyLzB2ckRzbXAzSDhMNzdRNmh2aWp3b3JxZ0ZyOVUzaWY5dkN3SGh4WVJabDhRYjUrZGVodworMzRDNVJHcVhCOEF3VUZJUUJDZWNSWmhDUEJYczQ0a2FxSjZvUG5NNEFGZ2p6RTYweHVxeXNhMUkxdXZoeWY2CjRmQm5hR0xMbUQvS2lTSXFpZ1BiUFVBbmtOeUY0WVNMZ0xJZDlxTzhpZzYwczZhbjNUZVR5ZnplaE1SMVUxeE8KOGpzUTB3bTRkK2ZrWStyZThJM3E2SytFemZwZkJTS1ptYXF2M0Nldlp2M2FsdjVlbENlQlJLYUtuTjBTSlA1egpkVyt3eVpPOVRJRGpBY0F6blUxbFI1ZG9QV2wzMHNUbEpHUnpzbEZsRW9kb1FlckRBZ01CQUFHak1UQXZNQThHCkExVWRFd0VCL3dRRk1BTUJBZjh3SEFZRFZSMFJCQlV3RTRJUmJtOWtaVEl1WjJGdGJXRXVabUZpWTI4d0RRWUoKS29aSWh2Y05BUUVMQlFBRGdnRUJBQzB6ODdvNzVOdUhPb0ZCTWw4Nno3Rk9FMlRBVTdNVU9vZE5ERjJDOEN4agpLT09XQmlSVGRuN3V3S2dCTWxpWUlLZDRkYVpEOUQxRGNua25FaENlSlRhaXVmMVM5YWgwTWJ4VEtudkxxNTZyCkNBdERwMUFIeHR4MkFyNm92OGxFRmcyRzlNNjZmaENXdzdDT2U0ZDVjT2JLbzBqSVdYOHdGZUFFQ2dpeHZBMzQKRUtPeHhaWm53ZEtwU1lFTm54N3AyRDZydnpyVWF4Q1FLdjVSY0JPSTBjR1VobWVkbnlBVWdheEtkeU5rYnhHYQplT2QrR0tEQU96Rk9iS2MrbGdEMzNBK05tck5EMDR3ZVpMdFNRbitaVGJzdC9wUTNHQi8zMW9UUHlRalhDTnROCklLMFhDc3FNZEhtTEQ3aHpQSjZIdk9YMkxwRFJuTWY1QUwwZE9ueTg4dVk9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K',
    },
  ],
};
