module.exports = {
  abi: {
    manager: [
      {
        'constant': true,
        'inputs': [],
        'name': 'version',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'result',
        'outputs': [
          {
            'name': '',
            'type': 'string'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'owner',
        'outputs': [
          {
            'name': '',
            'type': 'address'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'store',
        'outputs': [
          {
            'name': '',
            'type': 'address'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'endPoint',
        'outputs': [
          {
            'name': '',
            'type': 'string'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'storeSet',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': 'newOwner',
            'type': 'address'
          }
        ],
        'name': 'transferOwnership',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': false,
            'name': 'addr',
            'type': 'address'
          },
          {
            'indexed': false,
            'name': 'uid',
            'type': 'string'
          }
        ],
        'name': 'ownershipConfirmed',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'name': 'previousOwner',
            'type': 'address'
          },
          {
            'indexed': true,
            'name': 'newOwner',
            'type': 'address'
          }
        ],
        'name': 'OwnershipTransferred',
        'type': 'event'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_endPoint',
            'type': 'string'
          }
        ],
        'name': 'changeEndPoint',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'setStore',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_id',
            'type': 'string'
          },
          {
            'name': '_gasPrice',
            'type': 'uint256'
          },
          {
            'name': '_gasLimit',
            'type': 'uint256'
          }
        ],
        'name': 'verifyTwitterAccountOwnership',
        'outputs': [],
        'payable': true,
        'stateMutability': 'payable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_oraclizeID',
            'type': 'bytes32'
          },
          {
            'name': '_result',
            'type': 'string'
          }
        ],
        'name': '__callback',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': 'myid',
            'type': 'bytes32'
          },
          {
            'name': 'result',
            'type': 'string'
          },
          {
            'name': 'proof',
            'type': 'bytes'
          }
        ],
        'name': '__callback',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [],
        'name': 'withdrawBalance',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      }
    ],
    store: [
      {
        'constant': true,
        'inputs': [],
        'name': 'totalAuthorized',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'getMyLevelOfAuthorization',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'authorizerLevel',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'minimumTimeBeforeUpdate',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [],
        'name': 'deAuthorize',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_maxLevel',
            'type': 'uint256'
          },
          {
            'name': '_authorizerLevel',
            'type': 'uint256'
          }
        ],
        'name': 'setLevels',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'owner',
        'outputs': [
          {
            'name': '',
            'type': 'address'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [],
        'name': 'deAuthorizeAll',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '',
            'type': 'address'
          }
        ],
        'name': 'authorized',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          },
          {
            'name': '_level',
            'type': 'uint256'
          }
        ],
        'name': 'authorize',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'maxLevel',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'identities',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': 'newOwner',
            'type': 'address'
          }
        ],
        'name': 'transferOwnership',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'amIAuthorized',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [],
        'name': 'isDatabase',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'name': '_address',
            'type': 'address'
          },
          {
            'indexed': false,
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'TweedentityAdded',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'name': '_address',
            'type': 'address'
          },
          {
            'indexed': false,
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'TweedentityRemoved',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': false,
            'name': '_authorizer',
            'type': 'address'
          },
          {
            'indexed': false,
            'name': '_authorized',
            'type': 'address'
          },
          {
            'indexed': false,
            'name': '_level',
            'type': 'uint256'
          }
        ],
        'name': 'AuthorizedAdded',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': false,
            'name': '_authorizer',
            'type': 'address'
          },
          {
            'indexed': false,
            'name': '_authorized',
            'type': 'address'
          }
        ],
        'name': 'AuthorizedRemoved',
        'type': 'event'
      },
      {
        'anonymous': false,
        'inputs': [
          {
            'indexed': true,
            'name': 'previousOwner',
            'type': 'address'
          },
          {
            'indexed': true,
            'name': 'newOwner',
            'type': 'address'
          }
        ],
        'name': 'OwnershipTransferred',
        'type': 'event'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'isUidSet',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'isAddressSet',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'isUidUpgradable',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'isAddressUpgradable',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          },
          {
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'isUpgradable',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          },
          {
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'setIdentity',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'removeIdentity',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [],
        'name': 'removeMyIdentity',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': false,
        'inputs': [
          {
            'name': '_newMinimumTime',
            'type': 'uint256'
          }
        ],
        'name': 'changeMinimumTimeBeforeUpdate',
        'outputs': [],
        'payable': false,
        'stateMutability': 'nonpayable',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'getUid',
        'outputs': [
          {
            'name': '',
            'type': 'string'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'getUidAsInteger',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'getAddress',
        'outputs': [
          {
            'name': '',
            'type': 'address'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_address',
            'type': 'address'
          }
        ],
        'name': 'getAddressLastUpdate',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      },
      {
        'constant': true,
        'inputs': [
          {
            'name': '_uid',
            'type': 'string'
          }
        ],
        'name': 'getUidLastUpdate',
        'outputs': [
          {
            'name': '',
            'type': 'uint256'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      }
    ]
  },
  address: {
    main: {
      manager: '0x2B80455F56ca8b84E73460aC9b4db2a5e7c6030C',
      store: '0x7DEb93314090837fb33bB9a30D62C459BDFdc661'
    },
    ropsten: {
      manager: '0x8916d889377c42ce21bf60f7089d37c996b9fd2d',
      store: '0x0da13fdef1cc940f13fc102ed64097859d05238e'
    }
  }
}