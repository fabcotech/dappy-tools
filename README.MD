## Dappy

🔒 Dappy is a name system powered by blockchain and secured in real-time by multiple independent companies, each exposing a DoH endpoint (co-resolution). Its design removes industry-wide structural limitations and defects of current naming systems (mainly DNS) and TLS security services (mainly the Certificate Authorities system).

Dappy is being built since 2018 in an open source and iterative fashion. The main goal is to provide any kind of web service : 🎮 web3, 💻 web2, 🪙 finance, 🛻 supply chain, 🤝 B2B, 🌍 non-profits with :
- **Ultra-security** : protected against HTTPS man-in-the-middle, many phishing scenarios, DNS hack through registrar or registry.
- **Thin control over domain names and TLS identities**.
- **Extended capabilities and expressiveness** that are not achievable with legacy naming systems such as DNS.

### Dappy tools

Dappy tools is the parent repository for dappy-related tools, command line interfaces and libraries that are projected to move here.

### License

Check each workspace to know the license. Everything should be mainly MIT licensed.

### Contributors

Any developer or company that is interested to either contribute or use the products can contact the FABCO team (parent company), or join the discord:
- Email : hello [aat] dappy.tech
- Public Discord (chat) : https://discord.gg/8Cu5UFV

Format your commit messages using conventional commit [specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#specification)

Use `npm run cm` to commit your changes. Behind the scenen it uses [commitizen](https://github.com/commitizen/cz-cli) to format git messages.

#### Install dependencies

```sh
npm i & npx lerna bootstrap
```
