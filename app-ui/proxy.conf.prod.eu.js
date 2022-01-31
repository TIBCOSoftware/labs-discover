const path = require("path");
const os = require("os");
const PROXY_CONFIG = {
  "/idm/v3/login-oauth": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "cookiePathRewrite": {
      "*": "/"
    },
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com",
      "Cookie": ""
    }
  },
  "/idm/v1/oauth2/token": {
    "target": {
      "host": "eu.account.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "cookiePathRewrite": {
      "*": "/"
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com",
    }
  },
  "/idm/v1/oauth2/auth": {
    "target": {
      "host": "eu.account.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "cookiePathRewrite": {
      "*": "/"
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com",
    }
  },
  "/as/token.oauth2": {
    "target": {
      "host": "sso-ext.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "cloud.tibco.com"
    }
  },
  "/idm/v2/login-oauth": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    }
  },
  "/tsc-ws/v1/tsc-domain": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "onProxyReq": addOauthHeader
  },
  "/idm/v1/reauthorize": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    }
  },
  "/tsc-ws": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "onProxyReq": addOauthHeader
  },
  "/griddetails": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "onProxyReq": addOauthHeader
  },
  "/tsc-ws-content": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "cookieDomainRewrite": {
      "*": "localhost"
    },
    "onProxyReq": addOauthHeader
  },
  "/work/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/organisation": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/organisation/v1/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/apps": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/case": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/case/v1/cases": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/case/v1/types": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/case/reports": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/process/v1/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/pageflow/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/pageflow/v1/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/event/v1/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/clientstate/v1/states": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/webresource/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/webresource/v1": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/collaboration/v1/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/tsc-ws/": {
    "target": {
      "host": "eu.liveapps.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.liveapps.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/s/": {
    "target": {
      "host": "eu.metadata.cloud.tibco.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://eu.metadata.cloud.tibco.com"
    },
    "onProxyReq": addOauthHeader
  },
  "/dbxymvgm2aviku3j7yt7hvcrrtir76ow/": {
    "target": {
      "host": "eu-west-1.integration.cloud.tibcoapps.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "preserveAuth": true,
    "headers": {
      "Origin": "https://eu.integration.cloud.tibco.com"
    }
  },

  "/api": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "pathRewrite": {
      "^/api": ""
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/catalog": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/configuration": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/repository": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/assets": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/visualisation": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/login": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/tdv": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  },

  "/documentation": {
    "target": {
      "host": "discover.labs.tibcocloud.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "headers": {
      "Origin": "https://discover.labs.tibcocloud.com"
    },
    "onProxyReq": addOauthHeader
  }

  // Spotfire Wrapper API Endpoint

  , "/nfvthzbohgelvgmrdqfthqfene7mjz5q/": {
    "target": {
      "host": "eu-west-1.integration.cloud.tibcoapps.com",
      "protocol": "https:",
      "port": 443
    },
    "secure": true,
    "changeOrigin": true,
    "logLevel": "info",
    "preserveAuth": true,
    "headers": {
      "Origin": "https://eu.integration.cloud.tibco.com"
    }
  }/*,
  "/nfvthzbohgelvgmrdqfthqfene7mjz5q/": {
    "target": "http://localhost:8000/",
    "pathRewrite": {
      "^/nfvthzbohgelvgmrdqfthqfene7mjz5q/": "/"
    },
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info",
    "preserveAuth": false,
    "headers": {
      "Origin": "https://eu.integration.cloud.tibco.com"
    }
  }*/
}

// A switch to see if we need to update from the cookie (this is switched off if the OAUTH Token is injected from tibco-cloud.properties)
let replaceTCSTKSESSION = true;

// Add the authorization header to request using the value from the TCSTKSESSION cookie
function addOauthHeader(proxyReq, req) {
// check for existing auth header
  if (replaceTCSTKSESSION) {
    let authHeaderExists = false;
    Object.keys(req.headers).forEach(function (key) {
      if (key.toLowerCase() === 'authorization') {
        authHeaderExists = true;
      }
    });
    if (authHeaderExists === false) {
      Object.keys(req.headers).forEach(function (key) {
        if (key === 'cookie') {
          log('DEBUG', req.headers[key]);
          let cookies = req.headers[key].split('; ');
          cookies.forEach((cook => {
            if (cook.startsWith('TCSTKSESSION=')) {
              const authKey = cook.replace('TCSTKSESSION=', '');
              proxyReq.setHeader('Authorization', 'Bearer ' + authKey);
              log('DEBUG', 'Added auth header');
            }
          }))
          log('DEBUG', 'After: ', proxyReq.headers);
        }
      });
    }
  }
}

// Function for logging
const debug = false;

function log(level, ...message) {
  if ((debug && level == 'DEBUG') || level != 'DEBUG') {
    console.log('[PROXY INTERCEPTOR] (' + level + '): ', ...message);
  }
}

const INJECT_OAUTH = false;

try {
  const propReader = require('properties-reader');
  if (propReader && INJECT_OAUTH) {
    const tcProp = propReader('tibco-cloud.properties');
    if (tcProp) {
      const cloudProps = tcProp.path();
      if (cloudProps.CloudLogin && cloudProps.CloudLogin.OAUTH_Token && cloudProps.CloudLogin.OAUTH_Token.trim() != '') {
        let token = cloudProps.CloudLogin.OAUTH_Token;
        // Do not replace the token on the fly.
        replaceTCSTKSESSION = false;
        if (token == 'USE-GLOBAL') {
          const path = require('path')
          const os = require('os')
          const GLOBALTCPropFolder = path.join(os.homedir(), '.tcli')
          const GLOBALPropertyFileName = path.join(GLOBALTCPropFolder, 'global-tibco-cloud.properties')
          const globalProp = propReader(GLOBALPropertyFileName).path();
          if (globalProp.CloudLogin && globalProp.CloudLogin.OAUTH_Token && globalProp.CloudLogin.OAUTH_Token.trim() != '') {
            token = globalProp.CloudLogin.OAUTH_Token;

          } else {
            console.error('Token set to USE-GLOBAL, but no global token found...');
          }
        }
        if (token != 'USE-GLOBAL') {
          for (let endpoint in PROXY_CONFIG) {
            // console.log('ENDPOINT: ' , endpoint);
            // console.log(PROXY_CONFIG[endpoint]['headers']);
            const key = 'Token:';
            if (token.indexOf(key) > 0) {
              token = token.substring(token.indexOf(key) + key.length);
            }
            if (PROXY_CONFIG[endpoint] && PROXY_CONFIG[endpoint]['headers']) {
              PROXY_CONFIG[endpoint]['headers']['Authorization'] = "Bearer " + token;
              console.log('Added OAUTH to: ' + endpoint);
            }
          }
        }
      }
    }
  }
} catch (err) {
  console.warn('Warning on Injecting OAUTH, likely tibco-cloud.properties does not exits, or you need to run: npm install --save-dev properties-reader');
}
module.exports = PROXY_CONFIG;

console.log('Loaded...');
