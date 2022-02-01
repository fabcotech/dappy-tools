module.exports.getAllRecordsWsHandler = async (redisClient) => {
  try {
    const keys = await redisClient.keys(`record:*`);
    const records = await Promise.all(
      keys.map((k) => redisClient.hGetAll(k))
    );

    return {
      success: true,
      records
    };

  } catch (err) {
    return {
      success: false,
      error: { message: err },
    };
  }
};
