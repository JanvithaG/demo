const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const sqs = new SQSClient({ region: 'ap-south-1' });
const queueUrl = 'https://sqs.ap-south-1.amazonaws.com/013406717506/demoo';

function validateFlightData(flightData) {
    if (!flightData ||
        typeof flightData.flightNumber !== 'string' ||
        !/^[A-Za-z]{2}\d{5}$/.test(flightData.flightNumber) || 
        typeof flightData.depDate !== 'string' ||
        typeof flightData.depTime !== 'string' ||
        typeof flightData.arrivalTime !== 'string' ||
        typeof flightData.arrivalDate !== 'string' ||
        typeof flightData.from !== 'string' ||
        typeof flightData.to !== 'string') {
        return false;
    }
 
    return true;
}
exports.handler = async (event) => {
    try {
        const flightData = JSON.parse(event.body);
        if(!validateFlightData(flightData)){
            return {
                statusCode: 400,
                body: JSON.stringify({message: 'Invalid flight data'}),
            };
        }
        
        const params = {
            MessageBody: JSON.stringify(flightData),
            QueueUrl: queueUrl
        };
 
        await sqs.send(new SendMessageCommand(params));
 
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Flight information sent to queue successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};