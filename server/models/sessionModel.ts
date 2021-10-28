import { Schema, model } from 'mongoose';

interface Sessions {
    username: string;
    createdAt: Date;
}
const sessionSchema: Schema<Sessions> = new Schema({
    username: { type: String, required: true, unique: true },
    createdAt: { type: Date, expires: '10m', default: new Date() }
  });
  
const Session = model<Sessions>('Session', sessionSchema);

  
  // exports all the models in an object to be used in the controller
 export default Session;
