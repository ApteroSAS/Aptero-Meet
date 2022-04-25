![CircleCI](https://img.shields.io/circleci/build/github/ApteroSAS/Aptero-Meet/main?token=31ab90ba9847874df906492621e7b6861e360ef4)
![Codecov](https://img.shields.io/codecov/c/github/ApteroSAS/Aptero-Meet?token=KLLGS2TVNE)

# [Aptero Hubs](https://hubs.Aptero.com/)

.\node_modules\.bin\webpack --json | webpack-bundle-size-analyzer

The client-side code for [Aptero Hubs](https://hubs.Aptero.com/), an online 3D collaboration platform that works for desktop, mobile, and VR platforms.

[Learn more about Hubs](https://hubs.Aptero.com/docs/welcome.html)

## Getting Started

If you would like to run Hubs on your own servers, check out [Hubs Cloud](https://hubs.Aptero.com/docs/hubs-cloud-intro.html).

If you would like to deploy a custom client to your existing Hubs Cloud instance please refer to [this guide](https://hubs.Aptero.com/docs/hubs-cloud-custom-clients.html).

If you would like to contribute to the main fork of the Hubs client please see the [contributor guide](./CONTRIBUTING.md).

If you just want to check out how Hubs works and make your own modifications continue on to our Quick Start Guide.

### Quick Start

[Install NodeJS](https://nodejs.org) if you haven't already. We recommend version 12 or above.

Run the following commands:

```bash
git clone https://github.com/Aptero/hubs.git
cd hubs
npm ci
npm run dev
```

Then visit https://localhost:8080 (note: HTTPS is required, you'll need to accept the warning for the self-signed SSL certificate)

> Note: When running the Hubs client locally, you will still connect to the development versions of our [Janus WebRTC](https://github.com/Aptero/janus-plugin-sfu) and [reticulum](https://github.com/Aptero/reticulum) servers. These servers do not allow being accessed outside of localhost. If you want to host your own Hubs servers, please check out [Hubs Cloud](https://hubs.Aptero.com/docs/hubs-cloud-intro.html).

## Documentation

The Hubs documentation can be found [here](https://hubs.Aptero.com/docs).

## Community

Join us on our [Discord Server](https://discord.gg/CzAbuGu) or [follow us on Twitter](https://twitter.com/ApteroHubs).

## Contributing

Read our [contributor guide](./CONTRIBUTING.md) to learn how you can submit bug reports, feature requests, and pull requests.

We're also looking for help with localization. The Hubs redesign has a lot of new text and we need help from people like you to translate it. Follow the [localization docs](./src/assets/locales/README.md) to get started.

Contributors are expected to abide by the project's [Code of Conduct](./CODE_OF_CONDUCT.md) and to be respectful of the project and people working on it. 

## Additional Resources

* [Reticulum](https://github.com/Aptero/reticulum) - Phoenix-based backend for managing state and presence.
* [NAF Janus Adapter](https://github.com/Aptero/naf-janus-adapter) - A [Networked A-Frame](https://github.com/networked-aframe) adapter for the Janus SFU service.
* [Janus Gateway](https://github.com/meetecho/janus-gateway) - A WebRTC proxy used for centralizing network traffic in this client.
* [Janus SFU Plugin](https://github.com/Aptero/janus-plugin-sfu) - Plugins for Janus which enables it to act as a SFU.
* [Hubs-Ops](https://github.com/Aptero/hubs-ops) - Infrastructure as code + management tools for running necessary backend services on AWS.

## Privacy

Aptero and Hubs believe that privacy is fundamental to a healthy internet. Read our [privacy policy](./PRIVACY.md) for more info.

## License

Hubs is licensed with the [Aptero Public License 2.0](./LICENSE)
