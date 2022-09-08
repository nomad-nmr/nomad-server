# NOMAD server

Server side code for [NOMAD system](https://www.nomad-nmr.uk/) made out of three main building blocks.

---

### nomad-front-end

React front-end bootstrapped with **[Create React App](https://github.com/facebook/create-react-app)**.

### nomad-rest-api

REST API built using **[Express JS Library](https://expressjs.com/)**.

### nomad-nmrium

Wrapper for **[NMRium](https://www.nmrium.org/)** React component that enables communication with NOMAD REST API.
The project was bootstrapped using **[Vite JS](https://vitejs.dev/)**.

---

The fourth main component of the system **[nomad-spect-client](https://github.com/nomad-nmr/nomad-spect-client)** is a JS app that runs on NMR spectrometer PC in Node.js runtime environment and enables communication of NOMAD server with Bruker IconNMR software. The code for the spectrometer client is stored in its own repository.

---

## Set up for development

The repository contains all necessary configuration files to get you started in **[Docker](https://www.docker.com/)** environment.
You will need to install both docker engine and docker compose. The easiest way to achieve that is to install Docker Desktop that is available for all operating systems.

Clone both **nomad-server** and **nomad-spect-client** repositories

```console
https://github.com/nomad-nmr/nomad-server.git
https://github.com/nomad-nmr/nomad-spect-client.git
```

You can skip the latter if you want to leave the client out and work only with the server code. In that case, you need to comment out the client block in nomad-server/docker-compose.yaml file.

Before you start, the environmental variables needs to be set up in env folder. You can create the folder and copy content of env-example folder in it.

```console
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

To connect client, you need to login using admin user and backdoor password that was set up in environmental variables and add an instrument into database. More information can be found on [documentation website](https://www.nomad-nmr.uk/docs/getting-started/NOMAD-config). Then you need to enter instrument ID in client.env file and restart the Docker containers.

To start NOMAD you need to navigate to nomad-server folder and run

```
docker-compose up -d
```

To stop use command

```
docker-compose down
```

### Database dumps

**To dump database**

```console
docker exec -i nomad-server_mongodb_1 sh -c 'mongodump --archive' > mongodb.dump
```

**To restore from dump**

```console
docker exec -i nomad-server_mongodb_1 sh -c 'mongorestore --archive --drop' < mongodb.dump
```

---

More useful info about developing in a Docker Container can be found [here](https://code.visualstudio.com/docs/remote/containers).
