# Cuboidal

Cuboidal is a project designed to [briefly describe the purpose of your project]. This project aims to [explain the main goal or functionality of your project].

## Features

- Feature 1: [Describe feature 1]
- Feature 2: [Describe feature 2]
- Feature 3: [Describe feature 3]

## Installation

To install Cuboidal, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/cuboidal.git
    ```
2. Navigate to the project directory:
    ```bash
    cd cuboidal
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Usage

To use Cuboidal, follow these steps:

1. Start the application:
    ```bash
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000`.

## Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Description of your changes"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-branch
    ```
5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact [your name] at [your email].
## Backend Setup

To set up the backend for Cuboidal, ensure you have Docker installed and running. Then, start the Redis server with the following command:

```bash
docker run --name redis-cuboidal-server -d -p 6379:6379 redis
```

## Running the Project

Cuboidal consists of two packages: `cuboidal.ui` and `cuboidal.api`. You can run each package individually or both together using `pnpm`.

### Running Individually

To run the UI package:

```bash
cd cuboidal.ui
pnpm start
```

To run the API package:

```bash
cd cuboidal.api
pnpm start
```

### Running Both Packages Together

To run both packages together:

```bash
pnpm run start:all
```