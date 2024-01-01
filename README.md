# React Ghana Template CLI

This CLI allows you to create new React, React Native, and Parse Server projects based on templates.

## Installation

To install the CLI, you can use npm or yarn. Open your terminal and run the following command:
`npm install -g @reactgh/cli`
or
`yarn global add @reactgh/cli`
This will install the CLI globally on your system, allowing you to use it from anywhere.

## Usage

To create a new project, run the following command:
`rgh`
This will prompt you to enter the project name and select a template (React, React Native, or Parse Server). Once you provide the necessary information, the CLI will create a new project in the current working directory.

If you have set up the `.env` file with the GitHub URL and token, the project will be created and pushed to the specified Git repository. If the `.env` file is not provided, the project will be created locally.

## Configuration

Before using the CLI, make sure to set up your environment variables in a `.env` file. Create a file named `.env` in the root directory of your project and add the following content:
GITHUB_URL="https://github.com/username"
GITHUB_TOKEN="your-github-token"
Replace the values with your actual GitHub URL and token.

## Contributing

Contributions are welcome! Please see the [contributing guide](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
I hope this helps! Let me know if you have any further questions.