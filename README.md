# dnd-combat-console
A creature database and initiative tracker for DnD 5e

# global install requirements
Docker Desktop
sequelize-cli

# To build and start the container(s) for development and testing
docker-compose -f docker-compose_dev.yml build
docker-compose -f docker-compose_dev.yml up -d
# Click on the "postgres-container" in Docker to keep an eye on its status.
# Once it has completed all of its start up tasks (the last log should read "database system is ready to accept connections"), run:
npm run db:migrate
npm run db:seed
