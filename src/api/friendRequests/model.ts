import { ConfigurableSchema } from '../../utils/lib/mongoose/index.ts';
import mongoose, { Document, Model } from 'mongoose';
import mongooseToSwagger from 'mongoose-to-swagger';

export interface IFriendRequest extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId; 
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface IFriendRequestMethods {
  toJSON(): Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type FriendRequestModel = Model<IFriendRequest, {}, IFriendRequestMethods>;

export enum FriendRequestStatus {
  "PENDING" = 'pending',
  "ACCEPTED" = 'accepted',
  "REJECTED" = 'rejected',
}

const friendRequestSchema = new ConfigurableSchema<IFriendRequest, FriendRequestModel, IFriendRequestMethods>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING,
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
            userId: 1,
            receiverId: 1,
          },
          options: { unique: true },
        },
      ],
    },
  }
);

const FriendRequest = mongoose.model<IFriendRequest, FriendRequestModel>('FriendRequest', friendRequestSchema);

export const swaggerSchema = mongooseToSwagger(FriendRequest);

export default FriendRequest;