# setup-axiom [![CI](https://github.com/axiomhq/setup-axiom/actions/workflows/ci.yml/badge.svg)](https://github.com/axiomhq/setup-axiom/actions/workflows/ci.yml)

This action sets up Axiom for use in actions by starting a `docker compose` 
stack and configuring a personal token.

## Usage

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: axiomhq/setup-axiom@v1
    id: axiom
    with:
      axiom-version: 1.18.0 # Optional, will default to latest
      axiom-port: 8080 # Optional, will default to 8080
      axiom-license: <YOU_LICENSE_TOKEN> # Optional, will default to a free license
  - run: |
      echo "Axiom address: ${{ steps.axiom.outputs.url }}"
      echo "Axiom token: ${{ steps.axiom.outputs.token }}"
```

This will run your deployment on <http://localhost:8080>. 

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
