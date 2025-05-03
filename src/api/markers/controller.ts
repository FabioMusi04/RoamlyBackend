import Marker from "./model.ts";

import { generalLogger } from "../../services/logger/winston.ts";
import { generateControllers } from "../../utils/lib/generator/index.ts";
import { Response } from "express";
import { IUser } from "../users/model.ts";

const actions = generateControllers(Marker, "marker");

actions.getClustered = async function ({ query, user }, res: Response): Promise<void> {
  const { lat, lng, radius = 1000000, filter } = query as { lat?: string; lng?: string; radius?: string, filter?: string };

  const userId = (user as IUser)._id;

  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and longitude required.' });
    return;
  }

  const markersOfFriends =  await Marker.aggregate([
    {
      $lookup: {
        from: "friendrequests",
        let: { markerUserId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$status", "accepted"] },
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ["$userId", userId] },
                          { $eq: ["$receiverId", "$$markerUserId"] }
                        ]
                      },
                      {
                        $and: [
                          { $eq: ["$receiverId", userId] },
                          { $eq: ["$userId", "$$markerUserId"] }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: "friendRelation"
      }
    },
    {
      $match: {
        $or: [
          { userId }, 
          { friendRelation: { $ne: [] } }
        ]
      }
    }
  ]);

  const ids = markersOfFriends.map((marker) => {
    const { userId } = marker;
    return userId;
  })

  try {
    const matchStage = filter === "yours"
      ? { userId }
      : {
        userId: {
          $in: ids,
        },
      };

    const clusters = await Marker.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
          },
          distanceField: 'dist.calculated',
          spherical: true,
          maxDistance: parseFloat(radius as string),
          query: matchStage,
        },
      },
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
          },
          count: { $sum: 1 },
          markers: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          center: '$_id',
          count: 1,
          markers: 1,
        },
      },
    ]);

    res.json(clusters);
  } catch (err) {
    generalLogger.error(`Failed to fetch clusters: ${err}`);
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
};


export default actions;
