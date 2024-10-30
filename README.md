# NOMAD server

Server side code for [NOMAD system](https://www.nomad-nmr.uk/) made out of two main building blocks. These are two individual NPM projects that are in individual folders with corresponding names.

---

### nomad-front-end

React front-end bootstrapped with **[Vite JS](https://vitejs.dev/)**.

### nomad-rest-api

REST API built using **[Express JS Library](https://expressjs.com/)**.

---

The third main component of the system **[nomad-spect-client](https://github.com/nomad-nmr/nomad-spect-client)** is a JS app that runs on NMR spectrometer PC in Node.js runtime environment and enables communication of NOMAD server with Bruker IconNMR software. The code for the spectrometer client is stored in its own repository.

---

## Set up for development

The repository contains all necessary configuration files to get you started in **[Docker](https://www.docker.com/)** environment.
You will need to install both docker engine and docker compose. The easiest way to achieve that is to install Docker Desktop available for all operating systems.

Clone both **nomad-server** and **nomad-spect-client** repositories

```bash
git clone https://github.com/nomad-nmr/nomad-server.git
git clone https://github.com/nomad-nmr/nomad-spect-client.git
```

You can skip the latter if you want to leave the client out and work only with the server code. In that case, you need to comment out the client block in nomad-server/docker-compose.yaml file.

Before you start, the environmental variables needs to be set up in env folder. You can create the folder and copy content of env-example folder in it.

```bash
cd nomad-server
mkdir env
cp env-example/* env/
```

The system shall start without editing environmental variables. To achieve full functionality, following entries in backend.env file need to be edited.

```env
#Password for automatically generated admin user
ADMIN_PASSWORD=''

#Secret word for generating JWT
JWT_SECRET=''

EMAIL_SUFFIX=''

#SMTP configuration
SMTP_HOST=''
SMTP_USER=''
SMTP_PASS=''
SMTP_SENDER=''
```

To connect the spectrometer client, you need to login using admin username and the backdoor password that was set up in environmental variables and add an instrument into database. More information can be found on [documentation website](https://www.nomad-nmr.uk/docs/getting-started/NOMAD-config). Then you need to enter instrument ID in client.env file and restart the Docker containers.

To start NOMAD you need to navigate to nomad-server folder and run

```bash
docker-compose up -d
```

To start after updating dependencies in any package.json file you have to build new Docker images by using command 

```bash
docker-compose up -d --build
```

To stop use command

```console
docker-compose down
```

### Database dumps

**To dump database**

```bash
docker exec -i nomad-server-mongodb-1 sh -c 'mongodump --archive' > mongodb.dump
```

**To restore from dump**

```bash
docker exec -i nomad-server-mongodb-1 sh -c 'mongorestore --archive --drop' < mongodb.dump
```

---

More useful info about developing in a Docker Container can be found [here](https://code.visualstudio.com/docs/remote/containers).
