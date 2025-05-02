import actions from './controller.ts';

import { Router } from 'express';
import { authenticate } from '../../services/auth/auth.ts';
import { UsersRoleEnum } from '../../utils/enum.ts';
import { Request, Response } from 'express';
import { IUser } from '../users/model.ts';

const router = Router();

const queryFormat = (req: Request, res: Response, next: () => void) => {
  req.query = {
    ...req.query,
    userId: String((req.user as IUser)?._id),
    receiverId: String((req.user as IUser)?._id),
  }
  
  next();
}

/**
 * @swagger
 * tags:
 *   name: FriendRequests
 *   description: API endpoints for managing friend requests
 */

/**
 * @swagger
 * /friendRequests/me:
 *   get:
 *     summary: Get friend requests for the authenticated user
 *     tags: [FriendRequests]
 *     responses:
 *       200:
 *         description: List of friend requests for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 */
router.get('/me', authenticate(), queryFormat, actions.getMe);

/**
 * @swagger
 * /friendRequests:
 *   get:
 *     summary: Get all friend requests
 *     tags: [FriendRequests]
 *     responses:
 *       200:
 *         description: List of friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 */
router.get('/', authenticate(false, [UsersRoleEnum.ADMIN]), actions.getAll);

/**
 * @swagger
 * /friendRequests/{id}:
 *   get:
 *     summary: Get a friend request by ID
 *     tags: [FriendRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The friend request ID
 *     responses:
 *       200:
 *         description: Friend request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequest'
 */
router.get('/:id', authenticate(false, [UsersRoleEnum.ADMIN]), actions.getById);

/**
 * @swagger
 * /friendRequests:
 *   post:
 *     summary: Create a new friend request
 *     tags: [FriendRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendRequest'
 *     responses:
 *       201:
 *         description: Friend request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequest'
 */
router.post('/', authenticate(), actions.create);

/**
 * @swagger
 * /friendRequests/{id}:
 *   put:
 *     summary: Update a friend request by ID
 *     tags: [FriendRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The friend request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendRequest'
 *     responses:
 *       200:
 *         description: Friend request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequest'
 */
router.put('/:id', authenticate(), actions.update);

/**
 * @swagger
 * /friendRequests/{id}:
 *   delete:
 *     summary: Permanently delete a friend request by ID
 *     tags: [FriendRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The friend request ID
 *     responses:
 *       204:
 *         description: Friend request deleted successfully
 */
router.delete('/:id', authenticate(), actions.deletePermanently);

export default router;