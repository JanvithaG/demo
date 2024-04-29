exports.handler= async function(event,context){
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const dynamoDBClient = new DynamoDBClient({ region: 'ap-south-1' });
const s3Client = new S3Client({ region: 'ap-south-1' });
 
const tableName = 'FlightSchedules';
const bucketName = 'flightscheduledb';
const objectKey = 'FlightScheduleSnapshot/';

  try {
    const scanParams = {
      TableName: tableName
    };
 
    const scanResponse = await dynamoDBClient.send(new ScanCommand(scanParams));
    const items = scanResponse.Items;
    
    const header = Object.keys(items[0]).join(',') + '\n'; 
    const csvData = items.map(item => Object.values(item).map(val => val.S || val.N || '').join(',')).join('\n');
 
    const csvString = header + csvData;

    const s3Params = {
      Bucket: bucketName,
      Key: objectKey,
      Body: csvString
    };
 
    const s3Response = await s3Client.send(new PutObjectCommand(s3Params));
    console.log('DynamoDB items exported to S3:', s3Response);
    return {statusCode:200,body:'Items are exported and uploaded to S3 successfully'};
  } catch (error) {
    console.error('Error:', error);
    return {statusCode:500,body:'Error occurred while exporting items and uploading to S3'};
  }
};
 
