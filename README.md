## Login App with express, passport, bcrypt, and JasonWebToken

### Generate Random Tokens 

We need tokens for ACCESS_TOKE_SECRET and REFRESH_TOKEN_SECRET.

#### Tip and trick 1
You can generate random tokens for use in dotenv with ease.

From terminal:

```
PS D:\DEVEL\NODEJS\BrainUnscramblers\ExpressPassportBCrypt> node
Welcome to Node.js v14.17.0.      
Type ".help" for more information.
> require('crypto').randomBytes(64).toString('hex')
'd53b14d7b8c062a3809375c534b1499ab5efb3b54f659aea0075ff50e1839e9ef6ec63d5d5ee90a4d36cb4ddefae346e6ceb9212769dd23b44e026e0a48c2933'
> require('crypto').randomBytes(64).toString('hex')
'c5ff699edaf90b164396131fd9e225eb48c610be6f86f6cef0c69a08357fc5414ee1c2b3c38a86263e37e8117776a3966dade6469ad80e85d2129c23ee349b1d'
>
```

Copy the generated strings into your *.env* file and assign them as your ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET.

#### Tip and trick 2
This is more of a preference for programmer like me.  Instead of using Postman, REST Client in VSCode is being used here with file *request.rest*.  Open file *request.rest* and click on `Send request` for each API call.  Responses will be displayed in a split pane.


JWT can authenticate object created on separate servers as long as the servers share the same ACCESS_TOKEN_SECRET.  This is something session servers can not do.  With JWT, the user object is inside the TOKEN.  Providing that the authentication logic is the same on the appServer as well as the authServer, you can expect to access the object running on horizontally scalled servers.

### Two Servers

It turns out we need two servers.  The app server and the Auth server running in tandem.
Reason: The ACCESS_TOKEN must be timed so that it can be invalidated after x mount of time.  In order to grant access thereafter, we need create a REFRESH token.  A word of caution, the REFRESH token can be a security risk factor.  But that is for another topic.

App sever -- *appServer.js* running on <strong>process.env.PORT</strong>

    Normal NodeJS Express REST APIs minus the JWT authentication.

Auth server -- *authServer.js* running on <strong>process.env.AUTHPORT</strong>

    Handles the login and authentication with ACCESS_TOKEN_SECRET having an expiration.

### Should you use JWT?

`Recently, there was a lot of clamour from the developer community saying JWT brings a massive complexity without much benefit.  It is not safe against a blacklist of ACCESS_TOKEN_SECRETS.`_

Following are some use cases that could make this dangerous:

1. Logout doesn’t really log you out. Imagine you logged out from Twitter after sending your tweet. You’d think that you are logged out of the server, but that’s not the case because JWT is self-contained and will continue to work until it expires. This could be 5 minutes or 30 minutes or whatever the duration that’s set as part of the token. So if someone gets access to that token during that time, they can continue to use it to authenticate until it expires.

2. Blocking users doesn’t immediately block them. Imagine you are a moderator of Twitter or some online real-time
game where real users are using the system. And as a moderator, you want to quickly block someone from abusing
the system. You can’t, again for the same reason. Even after you block them, the user will continue to have access to
the server until the token expires.

3. JWTs could contain stale data. Imagine the user is an admin and got demoted to a regular user with fewer permissions. Again, this won’t take effect immediately and the user will continue to be an admin until the token expires.

4. JWT’s are often not encrypted. Because of this, anyone able to perform a man-in-the-middle attack and sniff the JWT
now has your authentication credentials. This is made easier because the MITM attack only needs to be completed on
the connection between the server and the client.
