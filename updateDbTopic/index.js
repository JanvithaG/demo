const { DynamoDBClient, GetItemCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient } = require("@aws-sdk/client-sns");
 
const dynamodb = new DynamoDBClient({ region: 'ap-south-1' });
const sns = new SNSClient({ region: 'ap-south-1' });

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
    console.log('Event:',JSON.stringify(event));
    //const records = event.Records;
    const msg = JSON.parse(event.Records[0].Sns.Message);
    console.log('msg',msg);
    try {
        // if(!Array.isArray(event.Records)){
        //     event.Records = [event.Records];
        // }
        //console.log('sns:',JSON.stringify(sns));
        
            //console.log('body:',record.body);
            // records.forEach(
            //   record =>{
            //       console.log('REcord',record);
            //   } );
            const flightData = msg
            console.log('flightdata:',flightData);
          
            const flightExists = await checkFlightExists(flightData.flightNumber, flightData.depDate);
            if (!flightExists) {
                await updateDynamoDB(flightData);
            } else {
                console.log(`Flight ${flightData.flightNumber} already exists in the system.`);
            }
        
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Processed SNS messages successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message })
        };
    }
};
 
async function checkFlightExists(flightNumber, depDate) {
    const params = {
        TableName: 'FlightSchedules',
        Key: {
            flightNumber:{S: flightNumber},
            depDate: {S:depDate}
        }
    };
    
    try {
        const { Item } = await dynamodb.send(new GetItemCommand(params));
        return !!Item;
    } catch (error) {
        console.error('Error checking flight existence:', error);
        throw error;
    }
}
 
async function updateDynamoDB(flightData) {
    if(!validateFlightData(flightData)){
        throw new Error( 'Invalid flight data');
    }
    const params = {
        TableName: 'FlightSchedules',
        Item: {
            flightNumber:{S: flightData.flightNumber},
            depDate:{S: flightData.depDate},
            depTime:{S: flightData.depTime},
            arrivalTime:{S: flightData.arrivalTime},
            arrivalDate:{S: flightData.arrivalDate},
            from:{S: flightData.from},
            to:{S: flightData.to},
            
        }
    };
    
    try {
        await dynamodb.send(new PutItemCommand(params));
    } catch (error) {
        console.error('Error updating DynamoDB:', error);
        throw error;
    }
}
