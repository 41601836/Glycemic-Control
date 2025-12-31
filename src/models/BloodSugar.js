// 血糖记录模型
class BloodSugar {
  constructor(id, value, type, timestamp, notes = '') {
    this.id = id; // 唯一标识符
    this.value = value; // 血糖值，单位：mmol/L
    this.type = type; // 记录类型：'before_meal'（餐前）或 'after_meal'（餐后）
    this.timestamp = timestamp; // 记录时间，Unix时间戳
    this.notes = notes; // 备注信息
  }

  // 将对象转换为JSON格式
  toJSON() {
    return {
      id: this.id,
      value: this.value,
      type: this.type,
      timestamp: this.timestamp,
      notes: this.notes,
    };
  }

  // 从JSON创建BloodSugar实例
  static fromJSON(json) {
    return new BloodSugar(
      json.id,
      json.value,
      json.type,
      json.timestamp,
      json.notes
    );
  }

  // 获取记录类型的中文名称
  getTypeLabel() {
    return this.type === 'before_meal' ? '餐前' : '餐后';
  }

  // 获取格式化的时间字符串
  getFormattedTime() {
    const date = new Date(this.timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 获取血糖状态：正常、偏高、偏低
  getStatus() {
    if (this.value < 3.9) {
      return { label: '偏低', color: '#d32f2f' };
    } else if (this.value >= 3.9 && this.value <= 7.8) {
      return { label: '正常', color: '#2e7d32' };
    } else if (this.value > 7.8 && this.value <= 10.0) {
      return { label: '偏高', color: '#f57c00' };
    } else {
      return { label: '很高', color: '#d32f2f' };
    }
  }
}

export default BloodSugar;
