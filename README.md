# setup-axiom [![CI](https://github.com/axiomhq/setup-axiom/actions/workflows/ci.yml/badge.svg)](https://github.com/axiomhq/setup-axiom/actions/workflows/ci.yml)

This action sets up Axiom for use in actions by starting a `docker compose` 
stack and configuring a personal token.

## Usage
```yaml
steps:
  - uses: actions/checkout@v2
  - uses: axiomhq/setup-axiom@v1
    id: setup-action
    with:
      axiom-version: 1.14.0
  - run: echo "${{ steps.setup-action.personal-token }}"
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)