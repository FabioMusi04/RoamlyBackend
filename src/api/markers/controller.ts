import { generalLogger } from "../../services/logger/winston.ts";
import { generateControllers } from "../../utils/lib/generator/index.ts";
import { Response } from "express";

import Marker from "./model.ts";

const actions = generateControllers(Marker, "marker");

actions.getClustered = async function ({ query }, res: Response): Promise<void> {
  const { lat, lng, radius = 1000000 } = query as { lat?: string; lng?: string; radius?: string };

  if (!lat || !lng) {
    res.status(400).json({ error: 'Latitude and longitude required.' });
    return;
  }
  try {
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
