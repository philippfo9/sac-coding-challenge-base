import AWS from "aws-sdk"

const bucketPath = 'storage.monet.community.s3.us-west-1.amazonaws.com' //process.env.REACT_APP_S3_BUCKET_URL as string
const cdnPath = 'storage.monet.community' //process.env.REACT_APP_S3_CDN_URL as string

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
})

export async function uploadFileToS3Hook(file: File, uploadFn: Function) {
  const { url } = await uploadFn(file)
  const replaced = url.replace(bucketPath, cdnPath)
  return replaced
}

export async function uploadImageToS3(file: Buffer, fileSuffix: String) {
  const bucketPath = process.env.S3_BUCKET_URL as string
  const cdnPath = process.env.S3_CDN_URL as string

  let r = (Math.random() + 1).toString(36).substring(7);

  const url = await s3.upload({
    Bucket: process.env.S3_UPLOAD_BUCKET as string,
    Key: `${r}.${fileSuffix}`,
    Body: file,
  }).promise()


  return url.Location.replace(bucketPath, cdnPath)
}