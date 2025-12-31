import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BloodSugar from '../models/BloodSugar';
import BloodSugarService from '../services/BloodSugarService';

const BloodSugarScreen = () => {
  // 状态管理
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    value: '',
    type: 'before_meal',
    notes: '',
  });

  // 加载历史记录
  const loadRecords = async () => {
    const allRecords = await BloodSugarService.getAllRecords();
    setRecords(allRecords);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // 切换记录类型
  const toggleType = () => {
    setNewRecord(prev => ({
      ...prev,
      type: prev.type === 'before_meal' ? 'after_meal' : 'before_meal',
    }));
  };

  // 保存新记录
  const handleSaveRecord = async () => {
    const value = parseFloat(newRecord.value);
    
    if (isNaN(value) || value <= 0) {
      Alert.alert('输入错误', '请输入有效的血糖值');
      return;
    }

    const record = new BloodSugar(
      BloodSugarService.generateId(),
      value,
      newRecord.type,
      Date.now(),
      newRecord.notes
    );

    const success = await BloodSugarService.saveRecord(record);
    
    if (success) {
      Alert.alert('保存成功', '血糖记录已保存');
      setIsModalVisible(false);
      setNewRecord({
        value: '',
        type: 'before_meal',
        notes: '',
      });
      loadRecords();
    } else {
      Alert.alert('保存失败', '请稍后重试');
    }
  };

  // 删除记录
  const handleDeleteRecord = async (id) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const success = await BloodSugarService.deleteRecord(id);
            if (success) {
              loadRecords();
            } else {
              Alert.alert('删除失败', '请稍后重试');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>血糖记录</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 今日记录统计 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>今日记录</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {records.filter(r => {
                  const today = new Date();
                  const recordDate = new Date(r.timestamp);
                  return today.toDateString() === recordDate.toDateString() && r.type === 'before_meal';
                }).length}
              </Text>
              <Text style={styles.summaryStatLabel}>餐前</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {records.filter(r => {
                  const today = new Date();
                  const recordDate = new Date(r.timestamp);
                  return today.toDateString() === recordDate.toDateString() && r.type === 'after_meal';
                }).length}
              </Text>
              <Text style={styles.summaryStatLabel}>餐后</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {records.filter(r => {
                  const today = new Date();
                  const recordDate = new Date(r.timestamp);
                  return today.toDateString() === recordDate.toDateString();
                }).length}
              </Text>
              <Text style={styles.summaryStatLabel}>总计</Text>
            </View>
          </View>
        </View>

        {/* 历史记录列表 */}
        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>历史记录</Text>
          
          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>暂无血糖记录</Text>
              <Text style={styles.emptySubtext}>点击右上角添加按钮开始记录</Text>
            </View>
          ) : (
            records.map((record) => {
              const status = record.getStatus();
              return (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTypeContainer}>
                      <Text style={styles.recordType}>
                        {record.getTypeLabel()}
                      </Text>
                      <Text style={styles.recordTime}>
                        {record.getFormattedTime()}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRecord(record.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.recordValueContainer}>
                    <Text style={styles.recordValue}>{record.value}</Text>
                    <Text style={styles.recordUnit}>mmol/L</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  
                  {record.notes ? (
                    <Text style={styles.recordNotes}>{record.notes}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 添加记录模态框 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 模态框标题 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加血糖记录</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 血糖值输入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>血糖值 (mmol/L)</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入血糖值"
                keyboardType="numeric"
                value={newRecord.value}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, value: text }))}
              />
            </View>

            {/* 记录类型选择 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>记录类型</Text>
              <View style={styles.typeSelector}>
                <Text style={styles.typeText}>
                  {newRecord.type === 'before_meal' ? '餐前' : '餐后'}
                </Text>
                <Switch
                  value={newRecord.type === 'after_meal'}
                  onValueChange={toggleType}
                  trackColor={{ false: '#e0e0e0', true: '#bbdefb' }}
                  thumbColor={newRecord.type === 'after_meal' ? '#1E88E5' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* 备注输入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>备注（可选）</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="添加备注信息"
                multiline
                numberOfLines={3}
                value={newRecord.notes}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, notes: text }))}
              />
            </View>

            {/* 保存按钮 */}
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveRecord}
            >
              <Text style={styles.saveButtonText}>保存记录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  summaryStatLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  recordsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 12,
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  recordValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  recordValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  recordUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#1E88E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BloodSugarScreen;
