export type Lottery = {
  "version": "0.1.0",
  "name": "lottery",
  "instructions": [
    {
      "name": "initLottery",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lottery",
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
          "name": "lotteryBump",
          "type": "u8"
        },
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "host",
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
          "name": "ticketPriceSol",
          "type": "u64"
        },
        {
          "name": "ticketPriceInSol",
          "type": "bool"
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
          "name": "payTokens",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "disableSol",
          "type": "bool"
        },
        {
          "name": "isWhitelistRaffle",
          "type": "bool"
        },
        {
          "name": "wlName",
          "type": "string"
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
      "name": "buyTicket",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lotteryUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundsUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundsTokenAccount",
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
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "userLotteryBump",
          "type": "u8"
        },
        {
          "name": "ticketCount",
          "type": "u32"
        },
        {
          "name": "payWithSol",
          "type": "bool"
        },
        {
          "name": "splPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "raffle",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winners",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "addWinners",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
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
          "name": "reset",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lotteryUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
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
        }
      ],
      "args": []
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
          "name": "lottery",
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
            "name": "lottery",
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
      "name": "lottery",
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
            "name": "host",
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
            "name": "ticketPriceSol",
            "type": "u64"
          },
          {
            "name": "ticketPriceInSol",
            "type": "bool"
          },
          {
            "name": "payTokens",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "disableSol",
            "type": "bool"
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
            "name": "wlName",
            "type": "string"
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
      "name": "lotteryUser",
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
            "name": "lottery",
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPayTokenAccount",
      "msg": "The given pay token account is wrong."
    },
    {
      "code": 6001,
      "name": "LotteryPayWindowOver",
      "msg": "You cant buy any tickets for this lottery anymore."
    },
    {
      "code": 6002,
      "name": "WrongMint",
      "msg": "You passed the wrong mint."
    },
    {
      "code": 6003,
      "name": "PriceAlreadyClaimed",
      "msg": "Price already claimed."
    },
    {
      "code": 6004,
      "name": "WrongTicket",
      "msg": "You don't own this ticket."
    },
    {
      "code": 6005,
      "name": "MaximumTicketCount",
      "msg": "You can buy a maximum of 100 tickets"
    },
    {
      "code": 6006,
      "name": "NotWinner",
      "msg": "You are not the winner"
    },
    {
      "code": 6007,
      "name": "CantClaimWhitelistRaffle",
      "msg": "Whitelist raffles can't be claimed, your address and/or discordId will be submitted automatically to the project. Make sure to claim your whitelist spot there"
    }
  ]
};

export const IDL: Lottery = {
  "version": "0.1.0",
  "name": "lottery",
  "instructions": [
    {
      "name": "initLottery",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lottery",
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
          "name": "lotteryBump",
          "type": "u8"
        },
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "host",
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
          "name": "ticketPriceSol",
          "type": "u64"
        },
        {
          "name": "ticketPriceInSol",
          "type": "bool"
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
          "name": "payTokens",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "disableSol",
          "type": "bool"
        },
        {
          "name": "isWhitelistRaffle",
          "type": "bool"
        },
        {
          "name": "wlName",
          "type": "string"
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
      "name": "buyTicket",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lotteryUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundsUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundsTokenAccount",
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
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "userLotteryBump",
          "type": "u8"
        },
        {
          "name": "ticketCount",
          "type": "u32"
        },
        {
          "name": "payWithSol",
          "type": "bool"
        },
        {
          "name": "splPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "raffle",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winners",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "addWinners",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
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
          "name": "reset",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "backendUser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lotteryUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
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
        }
      ],
      "args": []
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
          "name": "lottery",
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
            "name": "lottery",
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
      "name": "lottery",
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
            "name": "host",
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
            "name": "ticketPriceSol",
            "type": "u64"
          },
          {
            "name": "ticketPriceInSol",
            "type": "bool"
          },
          {
            "name": "payTokens",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "disableSol",
            "type": "bool"
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
            "name": "wlName",
            "type": "string"
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
      "name": "lotteryUser",
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
            "name": "lottery",
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPayTokenAccount",
      "msg": "The given pay token account is wrong."
    },
    {
      "code": 6001,
      "name": "LotteryPayWindowOver",
      "msg": "You cant buy any tickets for this lottery anymore."
    },
    {
      "code": 6002,
      "name": "WrongMint",
      "msg": "You passed the wrong mint."
    },
    {
      "code": 6003,
      "name": "PriceAlreadyClaimed",
      "msg": "Price already claimed."
    },
    {
      "code": 6004,
      "name": "WrongTicket",
      "msg": "You don't own this ticket."
    },
    {
      "code": 6005,
      "name": "MaximumTicketCount",
      "msg": "You can buy a maximum of 100 tickets"
    },
    {
      "code": 6006,
      "name": "NotWinner",
      "msg": "You are not the winner"
    },
    {
      "code": 6007,
      "name": "CantClaimWhitelistRaffle",
      "msg": "Whitelist raffles can't be claimed, your address and/or discordId will be submitted automatically to the project. Make sure to claim your whitelist spot there"
    }
  ]
};
