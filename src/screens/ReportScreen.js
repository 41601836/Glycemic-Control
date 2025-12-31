import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import BloodSugarService from '../services/BloodSugarService';

const screenWidth = Dimensions.get('window').width;

const ReportScreen = () => {
  // 状态管理
  const [timeRange, setTimeRange] = useState('7days'); // 'today', '7days', '30days'
  const [bloodSugarData, setBloodSugarData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    normalCount: 0,
    highCount: 0,
    lowCount: 0,
  });

  // 加载血糖数据
  const loadBloodSugarData = async () => {
    let records = [];
    
    switch (timeRange) {
      case 'today':
        records = await BloodSugarService.getTodayRecords();
        break;
      case '7days':
        records = await BloodSugarService.getLast7DaysRecords();
        break;
      case '30days':
        // 模拟30天数据
        const now = new Date().getTime();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        records = await BloodSugarService.getRecordsByDateRange(thirtyDaysAgo, now);
        break;
      default:
        records = await BloodSugarService.getLast7DaysRecords();
    }
    
    setBloodSugarData(records);
    processChartData(records);
    calculateStats(records);
  };

  // 处理图表数据
  const processChartData = (records) => {
    if (records.length === 0) {
      setChartData(null);
      return;
    }

    // 按时间排序
    const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
    
    // 准备图表数据
    const labels = sortedRecords.map(record => {
      const date = new Date(record.timestamp);
      if (timeRange === 'today') {
        return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      } else {
        return date.getMonth() + 1 + '/' + date.getDate();
      }
    });
    
    const values = sortedRecords.map(record => record.value);
    
    // 过滤重复标签（如果有）
    const uniqueLabels = [...new Set(labels)];
    const uniqueValues = uniqueLabels.map(label => {
      const index = labels.indexOf(label);
      return values[index];
    });
    
    setChartData({
      labels: uniqueLabels,
      datasets: [
        {
          data: uniqueValues,
          color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    });
  };

  // 计算统计数据
  const calculateStats = (records) => {
    if (records.length === 0) {
      setStats({
        average: 0,
        highest: 0,
        lowest: 0,
        normalCount: 0,
        highCount: 0,
        lowCount: 0,
      });
      return;
    }
    
    const values = records.map(record => record.value);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    
    let normalCount = 0;
    let highCount = 0;
    let lowCount = 0;
    
    values.forEach(value => {
      if (value < 3.9) {
        lowCount++;
      } else if (value >= 3.9 && value <= 7.8) {
        normalCount++;
      } else {
        highCount++;
      }
    });
    
    setStats({
      average: parseFloat(average.toFixed(1)),
      highest: parseFloat(highest.toFixed(1)),
      lowest: parseFloat(lowest.toFixed(1)),
      normalCount,
      highCount,
      lowCount,
    });
  };

  useEffect(() => {
    loadBloodSugarData();
  }, [timeRange]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 标题和时间范围选择 */}
        <View style={styles.header}>
          <Text style={styles.title}>血糖报告</Text>
          
          <View style={styles.timeRangeSelector}>
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === 'today' && styles.activeTimeRangeButton]}
              onPress={() => setTimeRange('today')}
            >
              <Text style={[styles.timeRangeText, timeRange === 'today' && styles.activeTimeRangeText]}>
                今日
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === '7days' && styles.activeTimeRangeButton]}
              onPress={() => setTimeRange('7days')}
            >
              <Text style={[styles.timeRangeText, timeRange === '7days' && styles.activeTimeRangeText]}>
                7天
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.timeRangeButton, timeRange === '30days' && styles.activeTimeRangeButton]}
              onPress={() => setTimeRange('30days')}
            >
              <Text style={[styles.timeRangeText, timeRange === '30days' && styles.activeTimeRangeText]}>
                30天
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 统计卡片 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>平均值</Text>
            <Text style={styles.statValue}>{stats.average}</Text>
            <Text style={styles.statUnit}>mmol/L</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>最高值</Text>
            <Text style={styles.statValue}>{stats.highest}</Text>
            <Text style={styles.statUnit}>mmol/L</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>最低值</Text>
            <Text style={styles.statValue}>{stats.lowest}</Text>
            <Text style={styles.statUnit}>mmol/L</Text>
          </View>
        </View>

        {/* 血糖曲线图表 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>血糖趋势</Text>
          {chartData ? (
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              yAxisSuffix=" mmol/L"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#1E88E5',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="analytics-outline" size={48} color="#ccc" />
              <Text style={styles.emptyChartText}>暂无数据</Text>
            </View>
          )}
        </View>

        {/* 血糖状态分布 */}
        <View style={styles.distributionContainer}>
          <Text style={styles.chartTitle}>血糖状态分布</Text>
          
          <View style={styles.distributionCards}>
            <View style={[styles.distributionCard, styles.normalCard]}>
              <Text style={styles.distributionLabel}>正常</Text>
              <Text style={styles.distributionValue}>{stats.normalCount}</Text>
              <Text style={styles.distributionDesc}>次</Text>
            </View>
            
            <View style={[styles.distributionCard, styles.highCard]}>
              <Text style={styles.distributionLabel}>偏高</Text>
              <Text style={styles.distributionValue}>{stats.highCount}</Text>
              <Text style={styles.distributionDesc}>次</Text>
            </View>
            
            <View style={[styles.distributionCard, styles.lowCard]}>
              <Text style={styles.distributionLabel}>偏低</Text>
              <Text style={styles.distributionValue}>{stats.lowCount}</Text>
              <Text style={styles.distributionDesc}>次</Text>
            </View>
          </View>
        </View>

        {/* 控糖建议 */}
        <View style={styles.suggestionContainer}>
          <Text style={styles.chartTitle}>控糖建议</Text>
          
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.suggestionTitle}>保持良好习惯</Text>
            </View>
            <Text style={styles.suggestionText}>
              您的血糖水平整体保持稳定，继续保持健康的饮食和运动习惯。
            </Text>
          </View>
          
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Ionicons name="information-circle" size={20} color="#f57c00" />
              <Text style={styles.suggestionTitle}>注意事项</Text>
            </View>
            <Text style={styles.suggestionText}>
              {stats.highCount > 3 ? '近期有多次血糖偏高，建议减少碳水化合物摄入，增加运动。' : '继续保持当前的饮食和运动习惯，定期监测血糖。'}
            </Text>
          </View>
        </View>

        {/* 营养摄入报告（模拟数据） */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.chartTitle}>今日营养摄入（模拟）</Text>
          
          <View style={styles.nutritionCards}>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionLabel}>热量</Text>
              <Text style={styles.nutritionValue}>1800</Text>
              <Text style={styles.nutritionUnit}>kcal</Text>
            </View>
            
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionLabel}>碳水化合物</Text>
              <Text style={styles.nutritionValue}>200</Text>
              <Text style={styles.nutritionUnit}>g</Text>
            </View>
            
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionLabel}>糖分</Text>
              <Text style={styles.nutritionValue}>30</Text>
              <Text style={styles.nutritionUnit}>g</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTimeRangeButton: {
    backgroundColor: '#1E88E5',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  activeTimeRangeText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  statUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
  },
  distributionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  distributionCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  distributionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  normalCard: {
    backgroundColor: '#e8f5e8',
  },
  highCard: {
    backgroundColor: '#fff3e0',
  },
  lowCard: {
    backgroundColor: '#ffebee',
  },
  distributionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  distributionValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  distributionDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  suggestionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  suggestionCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nutritionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  nutritionCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  nutritionUnit: {
    fontSize: 12,
    color: '#64b5f6',
    marginTop: 4,
  },
});

export default ReportScreen;
