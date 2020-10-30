const AWS = require('aws-sdk')

class SQS {
  constructor(queueUrl) {
    AWS.config.update({ region: 'us-west-1' })
    this.sqs = new AWS.SQS({ apiVersion: '2012-11-05' })
    this.queueUrl = queueUrl
  }

  createMessage(body) {
    return {
      MessageBody: this.parseMessageBody(body),
      QueueUrl: this.queueUrl,
    }
  }

  parseMessageBody(body) {
    return typeof body === 'string' ? body : JSON.stringify(body)
  }

  sendMessage(message) {
    const params = this.createMessage(message)

    const executor = (resolve, reject) => {
      this.sqs.sendMessage(params, (error, data) => {
        if (error) {
          return reject(error)
        }
        return resolve(data)
      })
    }

    return new Promise(executor)
  }
}

module.exports = SQS
