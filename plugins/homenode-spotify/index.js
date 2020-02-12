const SpotifyWebApi = require('spotify-web-api-node');

const scopes = [
  'user-read-recently-played',
  'user-top-read',
  'user-library-modify',
  'user-library-read',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-collaborative',
  'user-read-email',
  'user-read-birthdate',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'app-remote-control',
  'streaming',
  'user-follow-read',
  'user-follow-modify',
];

const now = () => Math.floor(Date.now() / 1000);

function updateDeviceAuth(device, data) {
  const expires_in = data.body.expires_in;
  const access_token = data.body.access_token;
  const refresh_token = data.body.refresh_token;
  const expires_at = expires_in + now();

  device.logger.log(`The token expires in ${expires_in}`);
  device.logger.log(`The token expires at ${expires_at}`);
  device.logger.log(`The access token is ${access_token}`);

  if (refresh_token) {
    device.logger.log(`The refresh token is ${refresh_token}`);
    device.setTrait('refresh_token', refresh_token);
    device.api.setRefreshToken(refresh_token);
  }

  // Set the access token on the API object to use it in later calls
  device.api.setAccessToken(access_token);

  device.setTrait('access_token', access_token);
  device.setTrait('expires_at', expires_at);
}

module.exports = function Spotify() {
  /*
  Interface
   */
  this.registerInterface({
    type: 'spotify-api',
    config: {
      client_id: {
        type: 'string',
        required: true,
      },
      client_secret: {
        type: 'string',
        required: true,
      },
    },
  });

  const AuthUrl = this.registerApiRoute('get', 'auth', async (req, res, Homenode) => {
    const code = req.query.code;
    const homenode_device_id = req.query.state;
    const error = req.query.error;

    // Lookup device
    const device = Homenode.getDevice(homenode_device_id);

    if (error) {
      return res.send(`Spotify auth failed: ${error}`);
    }

    if (!code) {
      return res.send('Spotify auth failed: Missing return code');
    }

    // Retrieve an access token and a refresh token
    device.api.authorizationCodeGrant(code).then((data) => {
      updateDeviceAuth(device, data);

      res.send(`Spotify auth complete for device: ${homenode_device_id}`);
    }, (err) => {
      console.log('Something went wrong with spotify auth!', err);
    });
  });

  this.registerDevice({
    type: 'spotify-account',
    interface: 'spotify-api',
    traits: {
      access_token: {
        type: 'string',
      },
      refresh_token: {
        type: 'string',
      },
      expires_at: {
        type: 'number',
      },
    },
    startup() {
      this.api = new SpotifyWebApi({
        clientId: this.interface.getConfig('client_id'),
        clientSecret: this.interface.getConfig('client_secret'),
        redirectUri: AuthUrl,
      });

      // Check if AccessToken and Refresh Token are set
      const accessToken = this.getTraitValue('access_token');
      const refreshToken = this.getTraitValue('refresh_token');

      if (accessToken && refreshToken) {
        this.api.setAccessToken(accessToken);
        this.api.setRefreshToken(refreshToken);
        this.logger.log('Connected to spotify!');
      } else {
        const authorizeURL = this.api.createAuthorizeURL(scopes, this.id); // this.id, helps us map the results back to this device
        this.logger.log(`Please authenticate to spotify here: ${authorizeURL}`);
      }
    },
    commands: {
      /*
      Calling api will ensure the token has been refreshed and will return the api instance for further usage.
       */
      api: {
        async handler() {
          const expiresAt = this.getTraitValue('expires_at');
          const expiresAtWithBuffer = expiresAt - 60;
          const rightNow = now();

          if (expiresAtWithBuffer < rightNow) {
            this.logger.log('Refreshing token...');
            await this.command('refreshToken');
            this.logger.log('Token has been refreshed');
          } else {
            this.logger.log('Token is still good');
          }

          return this.api;
        },
      },
      refreshToken: {
        async handler() {
          this.logger.log('refreshToken() Called');

          return this.api.refreshAccessToken().then((data) => {
            updateDeviceAuth(this, data);

            this.logger.log('refreshToken() Complete');
          }, (err) => {
            this.logger.error('Could not refresh access token', err);
          });
        },
      },
    },
  });
};
