import AsyncStorage from '@react-native-async-storage/async-storage';
import BloodSugar from '../models/BloodSugar';

// 存储键名
const BLOOD_SUGAR_STORAGE_KEY = '@blood_sugar_records';

class BloodSugarService {
  // 获取所有血糖记录
  static async getAllRecords() {
    try {
      const recordsJson = await AsyncStorage.getItem(BLOOD_SUGAR_STORAGE_KEY);
      if (recordsJson) {
        const records = JSON.parse(recordsJson);
        return records.map(record => BloodSugar.fromJSON(record));
      }
      return [];
    } catch (error) {
      console.error('获取血糖记录失败:', error);
      return [];
    }
  }

  // 根据日期范围获取记录
  static async getRecordsByDateRange(startDate, endDate) {
    try {
      const allRecords = await this.getAllRecords();
      return allRecords.filter(record => {
        return record.timestamp >= startDate && record.timestamp <= endDate;
      });
    } catch (error) {
      console.error('根据日期范围获取血糖记录失败:', error);
      return [];
    }
  }

  // 保存血糖记录
  static async saveRecord(record) {
    try {
      const allRecords = await this.getAllRecords();
      
      // 检查是否已存在相同ID的记录（更新操作）
      const existingIndex = allRecords.findIndex(r => r.id === record.id);
      
      if (existingIndex >= 0) {
        // 更新现有记录
        allRecords[existingIndex] = record;
      } else {
        // 添加新记录
        allRecords.push(record);
      }
      
      // 按时间戳降序排序
      allRecords.sort((a, b) => b.timestamp - a.timestamp);
      
      const recordsJson = JSON.stringify(allRecords.map(r => r.toJSON()));
      await AsyncStorage.setItem(BLOOD_SUGAR_STORAGE_KEY, recordsJson);
      
      return true;
    } catch (error) {
      console.error('保存血糖记录失败:', error);
      return false;
    }
  }

  // 删除血糖记录
  static async deleteRecord(id) {
    try {
      const allRecords = await this.getAllRecords();
      const filteredRecords = allRecords.filter(record => record.id !== id);
      
      const recordsJson = JSON.stringify(filteredRecords.map(r => r.toJSON()));
      await AsyncStorage.setItem(BLOOD_SUGAR_STORAGE_KEY, recordsJson);
      
      return true;
    } catch (error) {
      console.error('删除血糖记录失败:', error);
      return false;
    }
  }

  // 获取今日记录
  static async getTodayRecords() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      
      return await this.getRecordsByDateRange(startOfDay, endOfDay);
    } catch (error) {
      console.error('获取今日血糖记录失败:', error);
      return [];
    }
  }

  // 获取最近7天记录
  static async getLast7DaysRecords() {
    try {
      const now = new Date().getTime();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      return await this.getRecordsByDateRange(sevenDaysAgo, now);
    } catch (error) {
      console.error('获取最近7天血糖记录失败:', error);
      return [];
    }
  }

  // 生成唯一ID
  static generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export default BloodSugarService;
