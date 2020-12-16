import { Resolver, Mutation, Arg } from 'type-graphql'
import { GraphQLUpload, FileUpload } from 'graphql-upload' 
import path from 'path'
import {v4} from "uuid";
import { Storage } from '@google-cloud/storage'; 

import { Stream } from 'stream';
import { Field, InputType } from 'type-graphql'; 
import { getConnection, Repository } from 'typeorm'; 
 
import { getPublicUrl } from '../../utils/getPuclicUrl'; 
import User from '../../db/entities/user.entity';

const pathFile = path.join(__dirname, '../../../', process.env.GCL_STORAGE_PATH || ''); 


@InputType()
export class FileInput  {
  @Field(type => Stream)
  stream: Stream;

  @Field() filename: string;

  @Field() mimetype: string;

  @Field() encoding: string;
}

@Resolver()
export class MediaResolver {
  constructor(
    private readonly repository: Repository<any>
  ) {}

  @Mutation(returns => String)
  async upload(
    @Arg('file', type => GraphQLUpload) file: FileUpload, 
    @Arg("email") email: string,): Promise<any> {
    const { createReadStream, filename, mimetype , encoding } = await file;
    const stream = createReadStream(); 
    console.log('rrot', path.resolve(__dirname))
    const storage = new Storage({
      projectId: 'rock-fountain-288922',
      keyFilename: pathFile,  
    }); 
    const bucketName = 'proud_of_mom_dev';
    const bucket = storage.bucket(bucketName);
    const gcsFileName = v4() + `${Date.now()}-profile`;
    const fileUpload = bucket.file(gcsFileName);

   

    await new Promise((resolve, reject) => {
      const writeStream = fileUpload.createWriteStream({
        gzip: true, 
        metadata: {
          cacheControl: 'public, max-age=31536000',
          contentEncoding: encoding,
          contentType: mimetype
        },
        public: true 
      });
         // When the upload is fully written, resolve the promise.
      writeStream.on('finish', () => {
        return fileUpload.makePublic()
        .then( () => {
          file.filename = getPublicUrl(bucketName, gcsFileName);
          getConnection().getRepository(User).update(
            { email: email },
            {  
              profile_picture: file.filename
            }); 
          resolve(true);
        });
        
      });

      // If there's an error writing the file, remove the partially written file
      // and reject the promise.
      writeStream.on('error', (error) => {
        reject(error);
      });

      // In Node.js <= v13, errors are not automatically propagated between piped
      // streams. If there is an error receiving the upload, destroy the write
      // stream with the corresponding error.
      stream.on('error', (error) => writeStream.destroy(error));

      // Pipe the upload into the write stream.
      stream.pipe(writeStream);
    });
    return file.filename
  }
}