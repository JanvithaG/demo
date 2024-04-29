const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const {handleInternalServerError} = require('./errorHandler.js');
const client = new DynamoDBClient({ region: 'ap-south-1' });

const deleteFlight = async (flightNumber, depDate) => {
    const params = {
        TableName: 'FlightSchedules',
        Key: {
            flightNumber:{S: flightNumber},
            depDate: {S : depDate},
        },
    };

    const command = new DeleteItemCommand(params);

    try {
        await client.send(command);
        return {
            statusCode: 202,
            body: JSON.stringify({
                message: 'Flight schedule deleted successfully'
            }),
        };
    } catch (error) {
        console.log(error);
        return handleInternalServerError();
    }
};
exports.deleteFlight = deleteFlight;