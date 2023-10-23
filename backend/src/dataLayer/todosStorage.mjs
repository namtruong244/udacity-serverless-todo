import AWS from 'aws-sdk'
// import AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new AWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION


export const getAttachmentUrl = async (attachmentId) => {
    return `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
}

export const getUploadUrl = async (attachmentId) => {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attachmentId,
        Expires: urlExpiration
    })
}
