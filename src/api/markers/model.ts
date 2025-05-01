import { ConfigurableSchema } from '../../utils/lib/mongoose/index.ts';
import mongoose, { Document, Model } from 'mongoose';
import mongooseToSwagger from 'mongoose-to-swagger';

export interface IMarker extends Document {
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  userId: mongoose.Schema.Types.ObjectId;
}

interface IMarkerMethods {
  toJSON(): Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type MarkerModel = Model<IMarker, {}, IMarkerMethods>;

const markerSchema = new ConfigurableSchema<IMarker, MarkerModel, IMarkerMethods>(
  {
    description: {
      type: String,
      q: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [latitude, longitude]
        required: true,
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    configuration: {
      methods: {
        toJSON() {
          const obj = this.toObject();
          delete obj.__v;
          return obj;
        },
      },
      indexes: [
        {
          fields: {
            location: '2dsphere',
          },
        },
      ],

    },
  }
);

const Marker = mongoose.model<IMarker, MarkerModel>('Marker', markerSchema);

export const swaggerSchema = mongooseToSwagger(Marker);

export default Marker;