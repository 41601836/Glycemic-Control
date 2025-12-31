import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FoodRecognitionService from '../services/FoodRecognitionService';
import NutritionService from '../services/NutritionService';

const FoodResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { photoUri } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [foodResult, setFoodResult] = useState(null);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    // 调用食物识别API
    const recognizeFood = async () => {
      try {
        setIsLoading(true);
        const result = await FoodRecognitionService.recognizeFood(photoUri);
        
        if (result.success) {
          // 生成控糖建议
          const generatedSuggestion = NutritionService.generateSuggestion(result.data);
          setSuggestion(generatedSuggestion);
          setFoodResult(result.data);
        } else {
          // 处理API返回失败的情况
          setSuggestion('食物识别失败，请重新拍摄或选择其他照片。');
        }
      } catch (error) {
        console.error('食物识别失败:', error);
        setSuggestion('网络错误或服务器繁忙，请稍后重试。');
      } finally {
        setIsLoading(false);
      }
    };

    if (photoUri) {
      recognizeFood();
    }
  }, [photoUri]);

  if (!photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>未收到照片，请重新拍摄</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E88E5" />
          <Text style={styles.backButtonText}>返回相机</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 顶部照片预览 */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
        </View>

        {/* 识别结果 */}
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>识别结果</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>正在识别食物...</Text>
            </View>
          ) : (
            <>
              {/* 食物列表 */}
              {foodResult.foods.map((food, index) => (
                <View key={index} style={styles.foodCard}>
                  <View style={styles.foodHeader}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodPortion}>{food.portion}</Text>
                  </View>
                  
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>热量</Text>
                      <Text style={styles.nutritionValue}>{food.nutrition.calories} kcal</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>碳水</Text>
                      <Text style={styles.nutritionValue}>{food.nutrition.carbs} g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>糖分</Text>
                      <Text style={styles.nutritionValue}>{food.nutrition.sugar} g</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* 总营养 */}
              <View style={styles.totalNutritionCard}>
                <Text style={styles.totalNutritionTitle}>总营养</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>热量</Text>
                    <Text style={styles.nutritionValue}>{foodResult.totalNutrition.calories} kcal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>碳水</Text>
                    <Text style={styles.nutritionValue}>{foodResult.totalNutrition.carbs} g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>总糖</Text>
                    <Text style={styles.nutritionValue}>{foodResult.totalNutrition.sugar} g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>添加糖</Text>
                    <Text style={styles.nutritionValue}>{foodResult.totalNutrition.addedSugar} g</Text>
                  </View>
                </View>
              </View>

              {/* 控糖建议 */}
              <View style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Ionicons name="information-circle" size={20} color="#1E88E5" />
                  <Text style={styles.suggestionTitle}>控糖建议</Text>
                </View>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.goBack()}>
          <Ionicons name="camera" size={20} color="#1E88E5" />
          <Text style={styles.bottomButtonText}>重新拍摄</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomButton, styles.homeButton]} 
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={[styles.bottomButtonText, styles.homeButtonText]}>返回首页</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  photoContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  foodPortion: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalNutritionCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalNutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 12,
  },
  suggestionCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E88E5',
  },
  homeButton: {
    backgroundColor: '#1E88E5',
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginLeft: 8,
  },
  homeButtonText: {
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1E88E5',
    marginLeft: 8,
  },
});

export default FoodResultScreen;
