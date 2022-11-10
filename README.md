# AYAs TestTask
Test task on NodeJS + PostgreSQL + Express

# HOW to RUN an application locally
- You have to install `Docker` with `Compose` utility, `Node.JS`, and `NPM` if you didn't make it before
- Clone the current repository on your computer and unpack it
- Be sure that ports 5432, 5080, and 7000 are available
  - If some of them aren't available take a look at the paragraph "HOW to adjust ports" in this README.md
- Specify your network connection IP Address in `DB_HOST` variable in `.env` file
- Open a terminal and go to the folder with the unpacked repository clone
- Up docker containers by `docker compose -f docker-compose.yml up -d` command
- Run the application by `node app.js` command

# HOW to adjust PORTs
- If port 7000 isn't available, you need to set another `PORT` value `.env` file and use the same port value in requests
- If port 5432 isn't available, you need to change `DB_PORT` value in `.env` file and set the same port in `docker-compose.yaml` line 11
- If port 5080 isn't available, you can change it in `docker-compose.yaml` line 22

# REQUESTS
- 1st task `GET http://localhost:7000/more10`
- 2nd task `GET http://localhost:7000/minmax`
- 3th task `GET http://localhost:7000/fee10k`
