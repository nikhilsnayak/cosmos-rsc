const { readFile } = require('fs/promises');

module.exports = {
  readJsonFile: async (filePath) => {
    try {
      const content = await readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  },

  readFile: (filePath, encoding = 'utf8') => {
    try {
      return readFile(filePath, encoding);
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  },
};
