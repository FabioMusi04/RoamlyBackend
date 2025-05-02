import { generateControllers } from "../../utils/lib/generator/index.ts";
import { IUser } from "../users/model.ts";

import FriendRequest from "./model.ts";
import { Request, Response } from "express";

const actions = generateControllers(FriendRequest, "friendRequest");

actions.getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query: { userId, receiverId, status } } = req;

    if (!userId || !receiverId) {
      res.status(400).json({ error: "Missing userId or receiverId in query parameters" });
      return;
    }

    const friendRequests = await FriendRequest.find({
      $or: [
        { userId: (req.user as IUser)._id },
        { receiverId: (req.user as IUser)._id },
      ],
      ...(status && { status }),
    }).populate("userId", "-password -salt -__v")
    .populate("receiverId", "-password -salt -__v");

    const mappedRequests = friendRequests.map((request) => {
      const { userId, receiverId, ...rest } = request.toObject();
     
      const idSender = ((userId as unknown) as IUser)._id;

      return {
        ...rest,
        receiverId: (idSender as string).toString() !== ((req.user as IUser)._id as string).toString() ? userId : receiverId,
      };
    });

    res.status(200).json(mappedRequests);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching friend requests", details: error.message });
  }
};

actions.getSentByMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query: { userId, status } } = req;

    if (!userId) {
      res.status(400).json({ error: "Missing userId in query parameters" });
      return;
    }

    const friendRequests = await FriendRequest.find({
      userId,
      ...(status && { status }),
    }).populate("userId" , "-password -salt -__v")
    .populate("receiverId", "-password -salt -__v");

    res.status(200).json(friendRequests);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching sent friend requests", details: error.message });
  }
}

actions.getReceivedByMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query: { userId, status } } = req;

    if (!userId) {
      res.status(400).json({ error: "Missing userId in query parameters" });
      return;
    }

    const friendRequests = await FriendRequest.find({
      receiverId: userId,
      ...(status && { status }),
    })
      .populate("userId", "-password -salt -__v")
      .populate("receiverId", "-password -salt -__v");

    res.status(200).json(friendRequests);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching received friend requests", details: error.message });
  }
};

export default actions;