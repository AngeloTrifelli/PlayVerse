# PlayVerse

- [Prerequisites](#prerequisites)
- [Application Launch](#application-launch)

## PreRequisites

In order to run the application, you must first install the following pre-requisites:

- **Docker**: fundamental for creating the containers of the services offered by the application. It's suggested to download **docker desktop** from the offical website:
  - **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Application Launch
1. **Clone the repository**: open a terminal inside the folder in which you want to download the repository. Then, execute the following **git clone** commmand in order to download all the files:

   ```bash
   git clone https://github.com/AngeloTrifelli/PlayVerse.git
   ```
   
2. **Create the containers**: before executing this step ensure that the **docker** service is running on your machine. Open a terminal inside the folder containing the cloned repository and run the following command in order to create all the docker containers:

  ```bash
   docker-compose up -d 
   ```

3. **Open the application**: once that the containers have finished their creation you can start using the application by simply opening your browser on the following URL:

  http://localhost:3000

4. **Stop the application**: when you want to stop using the application, you can stop the docker containers with the following command:

   ```bash
    docker-compose down
   ```
