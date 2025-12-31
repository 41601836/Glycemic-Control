// 营养计算服务
class NutritionService {
  // 糖尿病指南常量（基于中国糖尿病学会推荐）
  static DIABETES_GUIDE = {
    // 每日碳水化合物摄入量建议（g）
    dailyCarbs: {
      male: 250,
      female: 200,
    },
    // 每餐碳水化合物摄入量建议（g）
    perMealCarbs: 50,
    // 每日糖分摄入量建议（g）
    dailySugar: {
      male: 30,
      female: 25,
    },
    // 血糖生成指数（GI）阈值
    gi: {
      low: 55,
      medium: 70,
    },
  };

  // 生成控糖建议
  static generateSuggestion(nutritionData, mealType = 'main') {
    const { totalNutrition } = nutritionData;
    const suggestions = [];

    // 碳水化合物评估
    if (totalNutrition.carbs > this.DIABETES_GUIDE.perMealCarbs * 1.2) {
      suggestions.push(`此餐碳水化合物含量较高（${totalNutrition.carbs}g），建议减少米饭、面条等主食的摄入量。`);
    } else if (totalNutrition.carbs < this.DIABETES_GUIDE.perMealCarbs * 0.8) {
      suggestions.push(`此餐碳水化合物含量较低（${totalNutrition.carbs}g），可适当增加蔬菜或优质蛋白质的摄入。`);
    } else {
      suggestions.push(`此餐碳水化合物含量适中（${totalNutrition.carbs}g），符合糖尿病患者的饮食建议。`);
    }

    // 糖分评估
    if (totalNutrition.sugar > 10) {
      suggestions.push(`此餐糖分含量较高（${totalNutrition.sugar}g），建议减少高糖食物的摄入。`);
    } else if (totalNutrition.sugar > 5) {
      suggestions.push(`此餐糖分含量适中（${totalNutrition.sugar}g），注意控制总摄入量。`);
    } else {
      suggestions.push(`此餐糖分含量较低（${totalNutrition.sugar}g），符合控糖要求。`);
    }

    // 蛋白质评估
    if (totalNutrition.protein < 10) {
      suggestions.push(`此餐蛋白质含量较低，建议搭配鸡蛋、瘦肉或豆制品等优质蛋白质食物。`);
    }

    // 脂肪评估
    if (totalNutrition.fat > 20) {
      suggestions.push(`此餐脂肪含量较高，建议减少油炸、肥肉等高脂肪食物的摄入。`);
    }

    // 纤维评估
    if (totalNutrition.fiber < 3) {
      suggestions.push(`此餐膳食纤维含量较低，建议增加蔬菜、水果或全谷物的摄入，有助于延缓血糖上升。`);
    }

    // 综合建议
    suggestions.push(`建议餐后30分钟进行适量运动，有助于控制血糖上升。`);

    return suggestions.join(' ');
  }

  // 计算食物的GI等级
  static getGiLevel(foodName) {
    // 简化的GI值映射，实际应用中需要更完整的数据库
    const giMap = {
      米饭: 83,
      面条: 81,
      馒头: 88,
      全麦面包: 50,
      苹果: 36,
      香蕉: 52,
      土豆: 62,
      红薯: 76,
      玉米: 55,
      青菜: 15,
      黄瓜: 15,
      西红柿: 15,
    };

    const gi = giMap[foodName] || 50;
    
    if (gi <= this.DIABETES_GUIDE.gi.low) {
      return { level: 'low', label: '低GI', color: '#2e7d32' };
    } else if (gi <= this.DIABETES_GUIDE.gi.medium) {
      return { level: 'medium', label: '中GI', color: '#f57c00' };
    } else {
      return { level: 'high', label: '高GI', color: '#d32f2f' };
    }
  }

  // 计算每日营养摄入百分比
  static calculateDailyPercentage(nutrition, gender = 'male') {
    const guide = this.DIABETES_GUIDE;
    
    return {
      carbs: (nutrition.carbs / guide.dailyCarbs[gender]) * 100,
      sugar: (nutrition.sugar / guide.dailySugar[gender]) * 100,
      calories: (nutrition.calories / 2000) * 100, // 假设每日2000卡路里
    };
  }

  // 获取营养状态标签
  static getNutritionStatus(value, threshold, type = 'upper') {
    if (type === 'upper') {
      if (value > threshold * 1.2) {
        return { label: '偏高', color: '#d32f2f' };
      } else if (value < threshold * 0.8) {
        return { label: '偏低', color: '#f57c00' };
      } else {
        return { label: '正常', color: '#2e7d32' };
      }
    } else {
      // 对于需要较高值的营养成分（如纤维）
      if (value < threshold * 0.8) {
        return { label: '偏低', color: '#f57c00' };
      } else {
        return { label: '正常', color: '#2e7d32' };
      }
    }
  }
}

export default NutritionService;
