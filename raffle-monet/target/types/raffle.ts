export type Raffle = {
  "version": "0.0.0",
  "name": "raffle",
  "instructions": [
    {
      "name": "initRaffle",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "raffleBump",
          "type": "u8"
        },
        {
          "name": "treasuryBump",
          "type": "u8"
        },
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "fundsUser",
          "type": "publicKey"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "ticketPriceToken",
          "type": "publicKey"
        },
        {
          "name": "starts",
          "type": "i64"
        },
        {
          "name": "ends",
          "type": "i64"
        },
        {
          "name": "maxTicketsAvailable",
          "type": "u32"
        },
        {
          "name": "isWhitelistRaffle",
          "type": "bool"
        },
        {
          "name": "wlSpots",
          "type": "u8"
        },
        {
          "name": "nftMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "buyTicketWithToken",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userRaffleBump",
          "type": "u8"
        },
        {
          "name": "ticketCount",
          "type": "u32"
        },
        {
          "name": "splTicketPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyTicketWithSol",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userRaffleBump",
          "type": "u8"
        },
        {
          "name": "ticketCount",
          "type": "u32"
        },
        {
          "name": "lamportPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "draw",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "receiverTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pricesTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "priceWalletSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winners",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "isWhitelistRaffle",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimAndPayRoyalties",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "claimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "claimerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pricesTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "priceWalletSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketPriceInSol",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendTokens",
      "accounts": [
        {
          "name": "backendUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payoutTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "payoutAmount",
          "type": "u64"
        },
        {
          "name": "feeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendSol",
      "accounts": [
        {
          "name": "backendUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payoutUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "payoutAmount",
          "type": "u64"
        },
        {
          "name": "feeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pricesVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raffle",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raffle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "treasuryBump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "ticketCount",
            "type": "u32"
          },
          {
            "name": "fundsUser",
            "type": "publicKey"
          },
          {
            "name": "fundsTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "raffleTreasury",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "starts",
            "type": "i64"
          },
          {
            "name": "ends",
            "type": "i64"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "ticketPriceToken",
            "type": "publicKey"
          },
          {
            "name": "maxTicketsAvailable",
            "type": "u32"
          },
          {
            "name": "winners",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "isWhitelistRaffle",
            "type": "bool"
          },
          {
            "name": "wlSpots",
            "type": "u8"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "nftPrizeSent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "raffleUser",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "raffle",
            "type": "publicKey"
          },
          {
            "name": "counter",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Price",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u32"
          },
          {
            "name": "priceSent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "RaffleErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidPayTokenAccount"
          },
          {
            "name": "RaffleMaxTicketsPerUserExceeded"
          },
          {
            "name": "RafflePayWindowOver"
          },
          {
            "name": "WrongMint"
          },
          {
            "name": "PriceAlreadyClaimed"
          },
          {
            "name": "WrongTicket"
          },
          {
            "name": "MaximumTicketCount"
          },
          {
            "name": "NotWinner"
          },
          {
            "name": "CantClaimWhitelistRaffle"
          },
          {
            "name": "RaffleSoldOut"
          },
          {
            "name": "NotEnoughBalance"
          },
          {
            "name": "InvalidMetadataCreatorRoyalty"
          },
          {
            "name": "InvalidTokenStandard"
          },
          {
            "name": "NumericOverflow"
          },
          {
            "name": "InvalidCreatorAddress"
          }
        ]
      }
    }
  ]
};

export const IDL: Raffle = {
  "version": "0.0.0",
  "name": "raffle",
  "instructions": [
    {
      "name": "initRaffle",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "raffleBump",
          "type": "u8"
        },
        {
          "name": "treasuryBump",
          "type": "u8"
        },
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "fundsUser",
          "type": "publicKey"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "ticketPriceToken",
          "type": "publicKey"
        },
        {
          "name": "starts",
          "type": "i64"
        },
        {
          "name": "ends",
          "type": "i64"
        },
        {
          "name": "maxTicketsAvailable",
          "type": "u32"
        },
        {
          "name": "isWhitelistRaffle",
          "type": "bool"
        },
        {
          "name": "wlSpots",
          "type": "u8"
        },
        {
          "name": "nftMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "buyTicketWithToken",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userRaffleBump",
          "type": "u8"
        },
        {
          "name": "ticketCount",
          "type": "u32"
        },
        {
          "name": "splTicketPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyTicketWithSol",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userRaffleBump",
          "type": "u8"
        },
        {
          "name": "ticketCount",
          "type": "u32"
        },
        {
          "name": "lamportPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "draw",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "receiverTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pricesTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "priceWalletSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winners",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "isWhitelistRaffle",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimAndPayRoyalties",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "claimer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "claimerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pricesTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "priceWalletSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketPriceInSol",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendTokens",
      "accounts": [
        {
          "name": "backendUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payoutTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "payoutAmount",
          "type": "u64"
        },
        {
          "name": "feeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendSol",
      "accounts": [
        {
          "name": "backendUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "adminUser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "raffleTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payoutUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "payoutAmount",
          "type": "u64"
        },
        {
          "name": "feeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pricesVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raffle",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raffle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "treasuryBump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "ticketCount",
            "type": "u32"
          },
          {
            "name": "fundsUser",
            "type": "publicKey"
          },
          {
            "name": "fundsTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "raffleTreasury",
            "type": "publicKey"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "starts",
            "type": "i64"
          },
          {
            "name": "ends",
            "type": "i64"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "ticketPriceToken",
            "type": "publicKey"
          },
          {
            "name": "maxTicketsAvailable",
            "type": "u32"
          },
          {
            "name": "winners",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "isWhitelistRaffle",
            "type": "bool"
          },
          {
            "name": "wlSpots",
            "type": "u8"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "nftPrizeSent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "raffleUser",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "raffle",
            "type": "publicKey"
          },
          {
            "name": "counter",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Price",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u32"
          },
          {
            "name": "priceSent",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "RaffleErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidPayTokenAccount"
          },
          {
            "name": "RaffleMaxTicketsPerUserExceeded"
          },
          {
            "name": "RafflePayWindowOver"
          },
          {
            "name": "WrongMint"
          },
          {
            "name": "PriceAlreadyClaimed"
          },
          {
            "name": "WrongTicket"
          },
          {
            "name": "MaximumTicketCount"
          },
          {
            "name": "NotWinner"
          },
          {
            "name": "CantClaimWhitelistRaffle"
          },
          {
            "name": "RaffleSoldOut"
          },
          {
            "name": "NotEnoughBalance"
          },
          {
            "name": "InvalidMetadataCreatorRoyalty"
          },
          {
            "name": "InvalidTokenStandard"
          },
          {
            "name": "NumericOverflow"
          },
          {
            "name": "InvalidCreatorAddress"
          }
        ]
      }
    }
  ]
};
