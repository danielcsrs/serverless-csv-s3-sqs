const AWS = require('aws-sdk');
const SQS = require('../../lib/aws-sqs');
const csv = require('csvtojson');

module.exports = async (event, context, callback) => { 
  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const fileName = event.Records[0].s3.object.key;
    const S3 = new AWS.S3();

    const params = {
      Bucket: bucketName,
      Key: fileName
    };

    console.log(`Filename ${fileName}`);

    let data = async function() {
      const stream = S3.getObject(params).createReadStream();
      const json = await csv().fromStream(stream);
      
      return json;
    };

    let csvData = await data();

    const sqsQueue = new SQS('https://sqs.us-west-1.amazonaws.com/092362225030/queue-orders');

    csvData.map(item => {
      console.log({
        customerId: item.customerId,
        orderId: item.orderId,
        price: item.price,
      });
    })

    csvData.map(async (item) => {
      await sqsQueue.sendMessage({
        customerId: item.customerId,
        orderId: item.orderId,
        price: item.price,
      });
    })

    const response = {
      body: JSON.stringify({
        itens: csvData,
      }),
      statusCode: 200,
    };
  
    callback(null, response);
  } catch (error) {
    console.log('Não foi possível executar o script');
  }
}