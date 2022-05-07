# dnd-combat-console
A creature database and initiative tracker for DnD 5e

# global install requirements
Docker Desktop
sequelize-cli
Postgresql (just for the psql command line interface)

# To build and start the container(s) for development and testing
docker-compose -f docker-compose_dev.yml build
docker-compose -f docker-compose_dev.yml up -d
# Click on the "postgres-container" in Docker to keep an eye on its status.
# Once it has completed all of its start up tasks (the last log should read "database system is ready to accept connections"), run:
npm run db:migrate
npm run db:seed

# To connect to the database from the command line and review it's contents:
psql -h localhost -d dnd -p 5432 -U dndapp
# password:
dndapppass
# To list all tables:
\d
# Use normal sql queries.
SELECT * FROM "CreatureTypes";
# To exit:
\q
