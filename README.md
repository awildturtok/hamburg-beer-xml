# hamburg-beer-xml

## Installation

This project relies on [yarn](https://yarnpkg.com/lang/en/docs/install/) to manage its dependencies, therefore you should install it before trying to run anything.  
After setting up Yarn, enter the project directory, and execute the command `yarn install`, this will gather all dependencies and install them in the folder `node_modules`.
To render the webpage you have to execute `yarn dev`, which will spin up a webpack server, which will assemble your projects vue files and compile them into js/html/css files, which will be served through hot code reloading. It should also open your default browser pointing to the locally hosted webpage.

This project uses Vue as templating engine, which is really lightweight, you should check out their [docs](https://vuejs.org/v2/guide).