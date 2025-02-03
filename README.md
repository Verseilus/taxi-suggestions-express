# Taxi Suggestions API

A REST API server to provide suggestions for assigning taxi vehicles to trips, created using Node.js + Express on Docker containers.

## Installation
Docker is necessary to run this application using containers: [Install Docker](https://docs.docker.com/get-docker/)

Build the containers and start the docker compose from the [backend](https://github.com/Verseilus/taxi-suggestions-express/tree/main/backend) directory:
```
cd backend
docker-compose build
docker-compose up
```
This starts two containers by default: one for the API server and one for the MongoDB database.

## Development
For development and testing purposes you *can* install [Node.js](https://nodejs.org/) on the host machine, then install the packages and start the server using npm. You will still need to launch a MongoDB database and connect to it using Mongoose.
```
npm install
npm run dev
```
+ [ESLint](https://eslint.org/) is included in the dev dependencies to help maintain code. It's advised to use its respective plugin in your preferred editor/environment.
+ [Prettier](https://prettier.io/) is used to format JavaScript code.
+ For testing the API, [Postman](https://www.postman.com/downloads/) can be used.

## Architecture
![architecture](https://github.com/user-attachments/assets/ab33a876-205a-4008-ab7d-4b5597d0d520)
*Diagram created using [Excalidraw](https://excalidraw.com/).*

## API Endpoints
By using the default docker-compose, the API is exposed on port 5000.

### Healthcheck
+ **GET @ http://localhost:[port]/healthcheck**
+ responds with 200 OK

### Suggestions
+ **GET @ http://localhost:[port]/suggestions?passengers=[number_of_passengers]&distance=[trip_length]**
  + *passengers*: integer, min=1
  + *distance*: number, min=1
+ responds with an array of vehicle objects with an extra assumed profit property as in the example below:
```json
[
    {
        "_id": "67a0b01c38d6e1c6b56a602d",
        "capacity": 3,
        "range": 701,
        "fuel": "mild hybrid",
        "assumedProfit": 206
    },
    {
        "_id": "67a0b02938d6e1c6b56a602f",
        "capacity": 4,
        "range": 950,
        "fuel": "gasoline",
        "assumedProfit": 156
    },
    {
        "_id": "67a0bd09b91c907efaf9da1c",
        "capacity": 4,
        "range": 506.1,
        "fuel": "pure electric",
        "assumedProfit": 226
    }
]
```
### Add new vehicles
+ **POST @ http://localhost:[port]/vehicles/add**, parameters must be provided in JSON format:
  + *capacity*: integer, min=1
  + *range*: number, min=1
  + *fuel*: string, {"gasoline", "mild hybrid", "pure electric"}
+ for example:
```json
{
    "capacity" : 3,
    "range" : 524.8,
    "fuel" : "mild hybrid"
}
```
+ responds with a message containing the ID of the newly added vehicle
