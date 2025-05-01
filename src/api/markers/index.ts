import actions from './controller.ts';

import { Router } from 'express';
import { authenticate } from '../../services/auth/auth.ts';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Markers
 *   description: API endpoints for managing markers
 */



/**
 * @swagger
 * /markers:
 *   get:
 *     summary: Get all markers
 *     tags: [Markers]
 *     responses:
 *       200:
 *         description: List of markers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Marker'
 */
router.get('/', authenticate(), actions.getAll);

/**
 * @swagger
 * /markers/cluster:
 *   get:
 *     summary: Get clustered markers
 *     tags: [Markers]
 *     parameters:
 *       - in: query
 *         name: bounds
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             northEast:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *             southWest:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         description: The bounding box for clustering
 *     responses:
 *       200:
 *         description: Clustered markers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   clusterId:
 *                     type: string
 *                   count:
 *                     type: number
 *                   center:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 */
router.get('/cluster', authenticate(), actions.getClustered);

/**
 * @swagger
 * /markers/{id}:
 *   get:
 *     summary: Get a marker by ID
 *     tags: [Markers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The marker ID
 *     responses:
 *       200:
 *         description: Marker details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marker'
 */
router.get('/:id', authenticate(), actions.getById);

/**
 * @swagger
 * /markers:
 *   post:
 *     summary: Create a new marker
 *     tags: [Markers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Marker'
 *     responses:
 *       201:
 *         description: Marker created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marker'
 */
router.post('/', authenticate(), actions.create);

/**
 * @swagger
 * /markers/{id}:
 *   put:
 *     summary: Update a marker by ID
 *     tags: [Markers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The marker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Marker'
 *     responses:
 *       200:
 *         description: Marker updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marker'
 */
router.put('/:id', authenticate(), actions.update);

/**
 * @swagger
 * /markers/{id}:
 *   delete:
 *     summary: Permanently delete a marker by ID
 *     tags: [Markers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The marker ID
 *     responses:
 *       204:
 *         description: Marker deleted successfully
 */
router.delete('/:id', authenticate(), actions.deletePermanently);

export default router;