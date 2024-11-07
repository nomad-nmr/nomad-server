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

Clone **nomad-server** repository

```bash
git clone https://github.com/nomad-nmr/nomad-server.git
```

To setup SMTP client for sending e-mails, following entries in /envs/dev/backend.env file need to be edited.

```env
EMAIL_SUFFIX=''

#SMTP configuration
SMTP_HOST=''
SMTP_USER=''
SMTP_PASS=''
SMTP_SENDER=''
```

You can possibly change the password for automatically generated admin user by editing the following entry.

```env
ADMIN_PASSWORD='foo'
```

To start NOMAD you need to navigate to nomad-server folder and run

```bash
docker-compose up -d
```

To start after updating dependencies in any package.json file you have to build new Docker images by using command

```bash
docker-compose up -d --build
```

To stop use command

```bash
docker-compose down
```

### Connecting spectrometer client in development environment

Clone **nomad-spect-client** repository in the same folder next to **nomad-server** repository.

```bash
git clone https://github.com/nomad-nmr/nomad-spect-client.git
```

To connect the spectrometer client, you need to login using admin username and the backdoor password that was set up in environmental variables and add an instrument into database. More information can be found on [documentation website](https://www.nomad-nmr.uk/docs/getting-started/NOMAD-config). Then you need rewrite INSTRUMENT_ID entry in /envs/dev/client.env file using actual instrument ID.

To start NOMAD together with the client, you need to navigate to nomad-server folder and run

```bash
docker-compose --profile client up -d
```

after updating dependencies you need to use

```bash
docker-compose --profile client up -d --build
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
