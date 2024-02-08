# Spot Seven: Find The Differences
This project was made in the context of a university group project that started in January 2023 as a Web Development Game and is being currently worked on as of February 2024 to be adapted into a mobile version in Flutter. 
The code contains 2 separate projects:

-   client: the website made with the **Angular** framework.
-   server: the dynamic server built with the **NestJs** library

# Client

## Local Development

When the `npm start` command is run in the _/client_ directory, the following script (available in `package.json`) is executed: `ng serve --open`, which performs the following 2 steps:

1. **Bundle Generation**: Translates TypeScript code and Angular syntax into standard JavaScript. At the end of this step, you will see that the following files are generated: `vendor.js`, `polyfills.js`, `main.js`, `runtime.js`, and `styles.css`. These files contain your application code as well as the CSS for various Components.

    **Note**: this is a development build: the file sizes are very large, and the code is not minified. You can access your code through your browser's development tools and debug with breakpoints, for example. A debugger configuration for VSCode is also available. See the _Debugger_ section for more information.

2. **Development Server**: A static web server will be launched on your machine to serve your web application. The server is launched on port 4200 and is accessible through `http://localhost:4200/` or `127.0.0.1:4200`. A webpage with this address will open automatically.

    **Note**: the development server is only accessible from your own machine. You can make it available to everyone by adding `--host 0.0.0.0` to the `npm start` command. The site will then be accessible on your local network from your IP address followed by port 4200. For example: `132.207.5.35:4200`. Note that the development server is not intended for open deployment, and you will receive a warning when launching it.

# Server

## Local Development

When the `npm start` command is run in the _/server_ directory, the following script (available in `package.json`) is executed: `nodemon`, which performs 2 steps similar to the client:

1. **Build**: Transpiles TypeScript code into JavaScript and copies the files to the `/out` directory.

    **Note**: The `nodemon` tool is a utility that watches for changes in your `*.ts` files and automatically restarts the server if you modify any of its files. Modifying another file will require a manual restart of the server (interrupt the process and restart `npm start`).

2. **Deploy**: Launches the server from the `index.js` file. The server is launched on port 3000 and is accessible through `http://localhost:3000/` or `127.0.0.1:3000`. The site is also accessible on your local network from your IP address followed by port 3000. For example: `132.207.5.35:3000`. A debugger is also attached to the Node process. See the _Debugger_ section for more information.


# Development Tools and Quality Assurance

## Unit Tests and Code Coverage

Both projects come with unit tests and code coverage measurement tools.
The tests can be found in the `*.spec.ts` files in the source code of both projects. The client uses the _Jasmine_ library, and the server uses _Mocha_, _Chai_, _Sinon_, and _Supertest_.


-   Run `npm run test` to run unit tests.

-   Run `npm run coverage` to generate a code coverage report.
    -   A report will be generated in the console output.
    -   A detailed report will be generated in the `/coverage` directory as a web page. You can open the `index.html` file in your browser and navigate through the report. You will see the lines of code not covered by the tests.

