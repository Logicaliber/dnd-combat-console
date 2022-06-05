# dnd-combat-console
A creature database and initiative tracker for DnD 5e

# Global install requirements:
 - Node 14
 - npm >= 6
 - Docker Desktop
 - sequelize-cli >= 6.4
 - Postgresql (just for the psql command line interface)

# To build and start the container(s) for development and testing:
```
docker-compose -f docker-compose_dev.yml build
docker-compose -f docker-compose_dev.yml up -d
```

Click on the "postgres-container" in Docker to keep an eye on its status.

Once it has completed all of its start up tasks (the last log should read "database system is ready to accept connections"), run:

```
npm run db:migrate
npm run db:seed
```

If your feature branch needs to make changes to the database, use:
```
npm run db:hardReset
```
This will completely rebuild the database and run the migrations and seeders.

# Using Postgresql to inspect the database:
```
psql -h localhost -d dnd -p 5432 -U dndapp
dndapppass                     // database password, set in .env
\d                             // lists all tables
SELECT * FROM "CreatureTypes"; // Use normal SQL queries to inspect the database
\q                             // exits the CLI
```
