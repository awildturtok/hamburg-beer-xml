# hamburg-beer-xml

## Installation

This project relies on [yarn](https://yarnpkg.com/lang/en/docs/install/) to manage its dependencies, therefore you should install it before trying to run anything.

To view the webpage you have to execute some simple steps inside the project folder. First, run ```npm install``` and ```yarn build``` to compile the webpage and all its dependencies. Then, run the ```run_docker_container``` script to build the docker image and start the container. Then, you have to copy everything from ```dist``` into the ```server_content``` directory. To do so you can run ```cp -r ./dist* server_content/```. Finally you have to run ```yarn dev```.

You can then visit the webpage at [http://localhost:8080/static](http://localhost:8080/).

This project uses Vue as templating engine, which is really lightweight, you should check out their [docs](https://vuejs.org/v2/guide).