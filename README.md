# Wordfall

A meditative jumbled word search game.

:construction: Known issue: The falling animation doesn't always work on iOS (but is fine on Android and desktop). Game play still works.

[Play here](https://skedwards88.github.io/wordfall/)!

<img src="src/images/icon_512.png" alt="Favicon of the wordfall game" width="100"/>

## Development

To build, run `npm run build`.

To run locally with live reloading and no service worker, run `npm run dev`. (If a service worker was previously registered, you can unregister it in chrome developer tools: `Application` > `Service workers` > `Unregister`.)

To run locally and register the service worker, run `npm start`.

To deploy, push to `main` or manually trigger the `.github/workflows/deploy.yml` workflow.

Since this app doesn't have a custom domain, asset links for the Google Play Store are stored at https://github.com/skedwards88/.well-known (https://skedwards88.github.io/.well-known/assetlinks.json).
