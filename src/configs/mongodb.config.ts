import express from 'express';
import mongoose from 'mongoose';
import { DATABASE_URL, NODE_ENV } from './env.config';
import { logger } from './logger.config';

//CONNECTION TO MONGOOSE DATABASE
mongoose
  .connect(DATABASE_URL, { retryWrites: true, w: 'majority' })
    .then(() => {
      logger.info(`Running on ENV = ${NODE_ENV}`);
      logger.info('Connected to mongoDB.');
    })
    .catch((error) => {
      logger.error('Unable to connect.');
      logger.error(error);
    });