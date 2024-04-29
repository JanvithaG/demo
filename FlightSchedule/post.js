const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {handleInternalServerError} = require('./errorHandler.js');
const { PutCommand,DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);
const createFlight = async (flightData) => {
    const params = {
        TableName: 'FlightSchedules',
        Item: flightData,
    };

    const command = new PutCommand(params);
    console.log('command',JSON.stringify(command));
    try {
        console.log('try');
        const result = await docClient.send(command);
        console.log('result',JSON.stringify(result));
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Flight schedule created successfully'
            }),
        };
    } catch (error) {
        return handleInternalServerError();
    }
};
exports.createFlight = createFlight;