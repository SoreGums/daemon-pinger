![TurtleCoin logo on wall](https://i.imgur.com/wSFQ7CUh.jpg "TurtleCoin daemon pinger")

# daemon-pinger
Simple [Google Cloud Function](https://cloud.google.com/functions/) to ping TurtleCoin daemons for their /info

Once deployed simply POST a JSON blob at the function's URL like so

```
curl -X POST \
  https://asia-east2-projectid.cloudfunctions.net/getInfo \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://blockapi.turtlepay.io:"}'
```

The script will add `/info` to the end so don't specify that.

Two extra helpful items will also be added to the response blob

```JSON
{
    "pingerInfo": {
        "gcpRegion": "asia-east2",
        "time": 76
    }
}
```

`time` is how long the request took in ms.
Provided the ENV variable FUNCTION_REGION is set will give the `gcpRegion` where the function was run from:
  + `node.js 8` runtime sets this automatically
  + `node.js 10` runtime doesn't set this, needs to be done when deploying

The script is set to timeout after 4 seconds, so if daemon is down the longest the script will run is 4 seconds. It can run longer in certain circumstances so best to limit the script runtime via the `--timeout` param when deploying

## Deploying

Using the [Google Cloud SDK](https://cloud.google.com/sdk/install) can issue this one liner to deploy it. Make sure you've done a `gcloud init`, setup prompts to do that.

```
gcloud functions deploy getInfo --runtime nodejs10 --trigger-http --memory=128M --timeout 5 --region=us-east4 --set-env-vars=FUNCTION_REGION=us-east4 --max-instances=5 --entry-point=getInfo
```

Can also deploy via the web [console](https://console.cloud.google.com/functions/list).  

These are the regions currently available

  + europe-west2      - England
  + europe-west1      - Belgium
  + us-east4          - Northern Virginia
  + us-central1       - Iowa
  + us-east1          - South Carolina
  + asia-east2        - Hong Kong
  + asia-northeast1   - Tokyo

### License

Copyright 2019 Nicholas Orr. All Rights Reserved.  
Use of this source code is governed by an MIT-style  
license that can be found in the [LICENSE](LICENSE) file


Photo by Damon Lam on [Unsplash](https://unsplash.com/photos/8V0ijoFgoVM)