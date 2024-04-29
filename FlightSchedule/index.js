const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const {getFlights} = require('./get.js');
const {getFlightDetails} = require('./getItem.js');
const {createFlight} = require('./post.js');
const {deleteFlight} = require('./delete.js');
const {handleBadRequest, handleNotFound, handleInternalServerError} = require('./errorHandler.js');
 
const client = new DynamoDBClient({ region: 'ap-south-1' });
 
exports.handler = async (event) => {
    const {
        httpMethod,
        path,
        pathParameters,
        body
    } = event;
    console.log(event);
    try {
        if (event.httpMethod === 'GET') {
            if(pathParameters && pathParameters.flightNumber && pathParameters.depDate){
                return await getFlightDetails(pathParameters.flightNumber,pathParameters.depDate)
            }else{
            return await getFlights();
            }
        } else if (event.httpMethod === 'POST') {
            let flightArray = JSON.parse(body);
            if (!Array.isArray(flightArray)) {
                flightArray = [flightArray];
            }
            if (Array.isArray(flightArray) && flightArray.length === 1) {
                const flightData = flightArray[0];
                if (isValidFlightNumberFormat(flightData.flightNumber)) {
                    const res = await createFlight(flightData);
                    console.log(res);
                    return res;
                } else {
                    return handleBadRequest();
                }
            } else {
                const putRequests = flightArray.map(schedule => ({
                    PutRequest: {
                        Item: schedule
                    }
                }));
                const chunks = [];
                while (putRequests.length > 0) {
                    chunks.push(putRequests.splice(0, 25));
                }
                const promises = chunks.map(async (chunk) => {
                    const batchParams = {
                        RequestItems: {
                            'FlightSchedules': chunk
                        }
                    };
                    const command = new BatchWriteCommand(batchParams);
                    try {
                        return await client.send(command);
                    } catch (error) {
                        console.error('Error writing batch:', error);
                        throw error;
                    }
                });
 
                await Promise.all(promises);
                return {
                    statusCode: 201,
                    body: JSON.stringify({ message: 'Flight schedules created successfully.' })
                };
            }
        } else if (event.httpMethod === 'DELETE') {
            const {
                flightNumber,
                depDate
            } = JSON.parse(body);
            if (isValidFlightNumberFormat(flightNumber)) {
                return await deleteFlight(flightNumber, depDate);
            } else {
                return handleBadRequest();
            }
        } else {
            return handleNotFound();
        }
    } catch (error) {
        console.log(error);
        return handleInternalServerError();
    }
};

function isValidFlightNumberFormat(flightNumber) {
    const regex = /^[A-Za-z]{2}\d{5}$/;
    return regex.test(flightNumber);
}