import { Schema, model } from 'mongoose';

interface Sessions {
    cookieId: string;
    createdAt: number;
}
const sessionSchema: Schema<Sessions> = new Schema({
    cookieId: { type: String, required: true, unique: true },
    createdAt: { type: Number, expires: '10m', default: Date.now() }
  });
  
const Session = model<Sessions>('Session', sessionSchema);

  
  // exports all the models in an object to be used in the controller
 export default Session;
