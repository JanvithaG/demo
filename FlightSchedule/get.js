const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const {handleInternalServerError} = require('./errorHandler.js');
const client = new DynamoDBClient({ region: 'ap-south-1' });

const getFlights = async () => {
    const params = {
        TableName: 'FlightSchedules',
    };

    const command = new ScanCommand(params);
    
    try {
        const result = await client.send(command);
        const formattedResult = result.Items.map(item => ({
                depTime:item.depTime.S,
                flightNumber:item.flightNumber.S,
                arrivalTime:item.arrivalTime.S,
                from:item.from.S,
                depDate:item.depDate.S,
                to:item.to.S,
                arrivalDate:item.arrivalDate.S
 
        }));
        return {
            statusCode: 200,
            body: JSON.stringify(formattedResult),
        };
    } catch (error) {
        return handleInternalServerError();
    }
};
exports.getFlights = getFlights;