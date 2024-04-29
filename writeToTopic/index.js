const { SNSClient,PublishCommand} = require("@aws-sdk/client-sns");
const sns = new SNSClient({ region: 'ap-south-1' });
const topicArn = 'arn:aws:sns:ap-south-1:013406717506:demo';

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
        console.log(flightData);
        const params = {
            Message: JSON.stringify(flightData),
            TopicArn: topicArn
        };
 
        await sns.send(new PublishCommand(params));
 
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Flight information sent to SNS topic successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};