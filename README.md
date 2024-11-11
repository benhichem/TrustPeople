# {{param `github.repo` | replace `-` ` ` | titlecase}}
{{param `description` `` `Project description: `}}

Tags: {{param `tags` `` `Project tags: `}}

*Note: This project has been generated using the following [templating system](./TEMPLATE.md)*

## Table of Contents
- [{{param `github.repo` | replace `-` ` ` | titlecase}}](#param-githubrepo--replace------titlecase)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)
  - [Author](#author)

## Installation
Follow the steps detailed [here](./INSTALL.md).

## Usage
Find the usage patterns [here](./USAGE.md).

## Contributing
To contribute, follow the guidelines detailed [here](./CONTRIBUTE.md).

## License
This project is licensed under the [MIT License](./LICENSE).

## Author
{{param `git.name`}}<<{{param `git.email`}}>>