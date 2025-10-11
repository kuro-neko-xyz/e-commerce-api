# Requirements
* node
* postgres

# Installation
On a psql shell run:
```
CREATE ROLE ecom_user WITH LOGIN PASSWORD <your password>;
CREATE DATABASE e_commerce;
ALTER DATABASE e_commerce OWNER TO ecom_user;
```

create a `.env` file whose contents are:
```
DB_PASSWORD=<passowrd for your ecom_user role>
SESSION_SECRET=<a session secret of your choice>
```

On a bash shell run:
```
cd <path to project>
psql -U ecom_user -d e_commerce -a -f db.sql
npm i
npm run dev
```