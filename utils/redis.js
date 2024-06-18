import { promisify } from 'util';
import { createClient } from 'redis';
// importing the Redis from ioredis
import Redis from 'ioredis';

/**
 * Represents a Redis client.
 */
class RedisClient {
  /**
   * Creates a new RedisClient instance.
   */
  constructor() {
    // Using the native Redis client
    this.client = createClient();

    // Using ioredis client for modern features
    this.ioredisClient = new Redis();

    // Promisify native Redis methods once in the constructor
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Connection status flag
    this.isClientConnected = false;

    // Event listeners for connection status
    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isClientConnected = true;
    });

    this.ioredisClient.on('error', (err) => {
      console.error('ioredis client failed to connect:', err.message || err.toString());
    });

    this.ioredisClient.on('connect', () => {
      console.log('ioredis client connected');
    });
  }

  /**
   * Checks if this client's connection to the Redis server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value of a given key using native Redis client.
   * @param {String} key The key of the item to retrieve.
   * @returns {String | Object}
   */
  async get(key) {
    if (!this.isAlive()) throw new Error('Redis client is not connected');
    return await this.getAsync(key);
  }

  /**
   * Stores a key and its value along with an expiration time using native Redis client.
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    if (!this.isAlive()) throw new Error('Redis client is not connected');
    await this.setexAsync(key, duration, value);
  }

  /**
   * Removes the value of a given key using native Redis client.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    if (!this.isAlive()) throw new Error('Redis client is not connected');
    await this.delAsync(key);
  }

  /**
   * Retrieves the value of a given key using ioredis client.
   * @param {String} key The key of the item to retrieve.
   * @returns {String | Object}
   */
  async ioredisGet(key) {
    return await this.ioredisClient.get(key);
  }

  /**
   * Stores a key and its value along with an expiration time using ioredis client.
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async ioredisSet(key, value, duration) {
    await this.ioredisClient.set(key, value, 'EX', duration);
  }

  /**
   * Removes the value of a given key using ioredis client.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async ioredisDel(key) {
    await this.ioredisClient.del(key);
  }
}

// Exporting a single instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
