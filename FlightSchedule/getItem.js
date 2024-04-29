const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const {handleInternalServerError, handleNotFound} = require('./errorHandler.js');
const client = new DynamoDBClient({ region: 'ap-south-1' });
 
const getFlightDetails = async (flightNumber, depDate) => {
    const params = {
        TableName: 'FlightSchedules',
        Key: {
            flightNumber: { S: flightNumber },
            depDate: { S: depDate },
        },
    };
 
    const command = new GetItemCommand(params);
 
    try {
        const result = await client.send(command);
        
 
        if (result.Item) {
            const flightDetails = {
                depTime:result.Item.depTime.S,
                flightNumber:result.Item.flightNumber.S,
                arrivalTime:result.Item.arrivalTime.S,
                from:result.Item.from.S,
                depDate:result.Item.depDate.S,
                to:result.Item.to.S,
                arrivalDate:result.Item.arrivalDate.S
            };
            return {
                statusCode: 200,
                body: JSON.stringify([flightDetails]),
            };
        } else {
            return handleNotFound();
        }
    } catch (error) {
        return handleInternalServerError();
    }
};
 
exports.getFlightDetails = getFlightDetails;