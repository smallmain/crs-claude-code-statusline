fetch("http://11.11.111.11:3000/apiStats/api/get-key-id", {
"headers": {
"accept": "_/_",
"accept-language": "zh-CN,zh;q=0.9",
"content-type": "application/json",
"proxy-connection": "keep-alive",
"Referer": "http://11.11.111.11:3000/admin-next/api-stats"
},
"body": "{\"apiKey\":\"cr_b3d\"}",
"method": "POST"
});

```json
{
  "success": true,
  "data": {
    "id": "0921ab7c9"
  }
}
```

---

fetch("http://11.11.111.11:3000/apiStats/api/user-stats", {
"headers": {
"accept": "_/_",
"accept-language": "zh-CN,zh;q=0.9",
"content-type": "application/json",
"proxy-connection": "keep-alive",
"Referer": "http://11.11.111.11:3000/admin-next/api-stats"
},
"body": "{\"apiId\":\"0921ab7c9\"}",
"method": "POST"
});

```json
{
  "success": true,
  "data": {
    "id": "0921ab7c9",
    "name": "江俊",
    "description": "",
    "isActive": true,
    "createdAt": "2025-12-01T09:43:27.458Z",
    "expiresAt": "",
    "expirationMode": "fixed",
    "isActivated": true,
    "activationDays": 0,
    "activatedAt": "2025-12-01T09:43:27.458Z",
    "permissions": "all",
    "usage": {
      "total": {
        "tokens": 13110045,
        "inputTokens": 203416,
        "outputTokens": 130322,
        "cacheCreateTokens": 551243,
        "cacheReadTokens": 12225064,
        "allTokens": 13110045,
        "requests": 298,
        "cost": 12.12387015,
        "formattedCost": "$12.12"
      }
    },
    "limits": {
      "tokenLimit": 0,
      "concurrencyLimit": 0,
      "rateLimitWindow": 0,
      "rateLimitRequests": 0,
      "rateLimitCost": 0,
      "dailyCostLimit": 30,
      "totalCostLimit": 0,
      "weeklyOpusCostLimit": 0,
      "currentWindowRequests": 0,
      "currentWindowTokens": 0,
      "currentWindowCost": 0,
      "currentDailyCost": 11.2931202,
      "currentTotalCost": 12.12387015,
      "weeklyOpusCost": 11.65995775,
      "windowStartTime": null,
      "windowEndTime": null,
      "windowRemainingSeconds": null
    },
    "accounts": {
      "claudeAccountId": null,
      "geminiAccountId": null,
      "openaiAccountId": null,
      "details": null
    },
    "restrictions": {
      "enableModelRestriction": false,
      "restrictedModels": [],
      "enableClientRestriction": false,
      "allowedClients": []
    }
  }
}
```

---

fetch("http://11.11.111.11:3000/apiStats/api/user-model-stats", {
"headers": {
"accept": "_/_",
"accept-language": "zh-CN,zh;q=0.9",
"content-type": "application/json",
"proxy-connection": "keep-alive",
"Referer": "http://11.11.111.11:3000/admin-next/api-stats"
},
"body": "{\"apiId\":\"0921ab7c9\",\"period\":\"daily\"}",
"method": "POST"
});

```json
{
  "success": true,
  "data": [
    {
      "model": "claude-opus-4-5-20251101",
      "requests": 169,
      "inputTokens": 16619,
      "outputTokens": 103304,
      "cacheCreateTokens": 428802,
      "cacheReadTokens": 11091014,
      "allTokens": 11639739,
      "costs": {
        "input": 0.08309499999999999,
        "output": 2.5826000000000002,
        "cacheWrite": 2.6800125,
        "cacheRead": 5.545507,
        "total": 10.8912145
      },
      "formatted": {
        "input": "$0.0831",
        "output": "$2.58",
        "cacheWrite": "$2.68",
        "cacheRead": "$5.55",
        "total": "$10.89"
      },
      "pricing": {
        "input": 5,
        "output": 25,
        "cacheWrite": 6.25,
        "cacheRead": 0.5
      }
    },
    {
      "model": "claude-haiku-4-5-20251001",
      "requests": 89,
      "inputTokens": 172344,
      "outputTokens": 19559,
      "cacheCreateTokens": 76784,
      "cacheReadTokens": 357867,
      "allTokens": 626554,
      "costs": {
        "input": 0.172344,
        "output": 0.09779499999999999,
        "cacheWrite": 0.09598000000000001,
        "cacheRead": 0.0357867,
        "total": 0.40190570000000003
      },
      "formatted": {
        "input": "$0.1723",
        "output": "$0.0978",
        "cacheWrite": "$0.0960",
        "cacheRead": "$0.0358",
        "total": "$0.4019"
      },
      "pricing": {
        "input": 1,
        "output": 5,
        "cacheWrite": 1.25,
        "cacheRead": 0.09999999999999999
      }
    }
  ],
  "period": "daily"
}
```

---

fetch("http://11.11.111.11:3000/apiStats/api/user-model-stats", {
"headers": {
"accept": "_/_",
"accept-language": "zh-CN,zh;q=0.9",
"content-type": "application/json",
"proxy-connection": "keep-alive",
"Referer": "http://11.11.111.11:3000/admin-next/api-stats"
},
"body": "{\"apiId\":\"0921ab7c9\",\"period\":\"monthly\"}",
"method": "POST"
});

```json
{
  "success": true,
  "data": [
    {
      "model": "claude-opus-4-5-20251101",
      "requests": 191,
      "inputTokens": 21947,
      "outputTokens": 107625,
      "cacheCreateTokens": 469585,
      "cacheReadTokens": 11849383,
      "allTokens": 12448540,
      "costs": {
        "input": 0.109735,
        "output": 2.690625,
        "cacheWrite": 2.93490625,
        "cacheRead": 5.9246915,
        "total": 11.65995775
      },
      "formatted": {
        "input": "$0.1097",
        "output": "$2.69",
        "cacheWrite": "$2.93",
        "cacheRead": "$5.92",
        "total": "$11.66"
      },
      "pricing": {
        "input": 5,
        "output": 25,
        "cacheWrite": 6.25,
        "cacheRead": 0.5
      }
    },
    {
      "model": "claude-haiku-4-5-20251001",
      "requests": 101,
      "inputTokens": 181444,
      "outputTokens": 21345,
      "cacheCreateTokens": 76784,
      "cacheReadTokens": 357867,
      "allTokens": 637440,
      "costs": {
        "input": 0.181444,
        "output": 0.106725,
        "cacheWrite": 0.09598000000000001,
        "cacheRead": 0.0357867,
        "total": 0.4199357
      },
      "formatted": {
        "input": "$0.1814",
        "output": "$0.1067",
        "cacheWrite": "$0.0960",
        "cacheRead": "$0.0358",
        "total": "$0.4199"
      },
      "pricing": {
        "input": 1,
        "output": 5,
        "cacheWrite": 1.25,
        "cacheRead": 0.09999999999999999
      }
    },
    {
      "model": "claude-sonnet-4-5-20250929",
      "requests": 6,
      "inputTokens": 25,
      "outputTokens": 1352,
      "cacheCreateTokens": 4874,
      "cacheReadTokens": 17814,
      "allTokens": 24065,
      "costs": {
        "input": 0.00007500000000000001,
        "output": 0.02028,
        "cacheWrite": 0.0182775,
        "cacheRead": 0.0053441999999999995,
        "total": 0.0439767
      },
      "formatted": {
        "input": "$0.000075",
        "output": "$0.0203",
        "cacheWrite": "$0.0183",
        "cacheRead": "$0.0053",
        "total": "$0.0440"
      },
      "pricing": {
        "input": 3,
        "output": 15,
        "cacheWrite": 3.75,
        "cacheRead": 0.3
      }
    }
  ],
  "period": "monthly"
}
```
