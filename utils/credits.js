import { supabase } from './supabase';

// 获取用户积分余额
export async function getUserCredits(userId) {
  if (!userId) {
    throw new Error('缺少用户ID');
  }
  
  // 查询用户积分
  const { data, error } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    // 如果是找不到记录的错误，则为用户创建积分记录
    if (error.code === 'PGRST116') {
      return await createUserCredits(userId);
    }
    
    throw new Error(`获取用户积分失败: ${error.message}`);
  }
  
  return data?.credits || 0;
}

// 为新用户创建积分记录
export async function createUserCredits(userId, initialCredits = 100) {
  // 创建用户积分记录
  const { data, error } = await supabase
    .from('user_credits')
    .insert([
      { user_id: userId, credits: initialCredits }
    ])
    .select('credits')
    .single();
  
  if (error) {
    throw new Error(`创建用户积分记录失败: ${error.message}`);
  }
  
  // 记录初始积分交易
  await recordCreditTransaction(userId, initialCredits, '初始积分', 'system');
  
  return data?.credits || 0;
}

// 更新用户积分
export async function updateUserCredits(userId, amount, description, source) {
  // 获取当前积分
  const currentCredits = await getUserCredits(userId);
  
  // 计算新的积分余额
  const newBalance = currentCredits + amount;
  
  // 如果是扣减积分且余额不足，则抛出错误
  if (amount < 0 && newBalance < 0) {
    throw new Error('积分不足');
  }
  
  // 更新用户积分
  const { data, error } = await supabase
    .from('user_credits')
    .update({ credits: newBalance })
    .eq('user_id', userId)
    .select('credits')
    .single();
  
  if (error) {
    throw new Error(`更新用户积分失败: ${error.message}`);
  }
  
  // 如果是负数，表示消费积分，更新已使用积分
  if (amount < 0) {
    try {
      // 先获取当前的used_credits值
      const { data: userData, error: fetchError } = await supabase
        .from('user_credits')
        .select('used_credits')
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        console.error('获取已使用积分失败:', fetchError);
        return data?.credits || 0; // 继续返回更新后的积分
      }
      
      // 计算新的used_credits值
      const newUsedCredits = (userData.used_credits || 0) - amount; // 减负数相当于加
      
      // 更新used_credits
      await supabase
        .from('user_credits')
        .update({ used_credits: newUsedCredits })
        .eq('user_id', userId);
    } catch (err) {
      console.error('更新已使用积分失败:', err);
      // 继续执行，不要因为这个失败而中断整个流程
    }
  }
  
  // 记录交易
  await recordCreditTransaction(userId, amount, description, source);
  
  return data?.credits || 0;
}

// 记录积分交易
export async function recordCreditTransaction(userId, amount, description, serviceType) {
  const { error } = await supabase
    .from('credit_transactions')
    .insert([
      {
        user_id: userId,
        amount,
        description,
        service_type: serviceType
      }
    ]);
  
  if (error) {
    console.error('记录积分交易失败:', error);
  }
}

// 获取用户积分交易历史
export async function getUserCreditTransactions(userId, limit = 10, page = 0) {
  const { data, error, count } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);
  
  if (error) {
    throw new Error(`获取用户积分交易历史失败: ${error.message}`);
  }
  
  return { transactions: data || [], count: count || 0 };
}

// 检查用户是否有足够的积分进行操作
export async function checkUserCredits(userId, requiredCredits) {
  const credits = await getUserCredits(userId);
  return credits >= requiredCredits;
}

// 根据服务类型获取所需积分
export function getRequiredCredits(serviceType) {
  const creditMap = {
    'image_generation': 15,  // 图片生成
    'image_editing': 12,     // 图片修改
    'art_card': 25,          // 艺术卡片
    'cover_generator': 25,   // 公众号和小红书封面
    'chat': 1                // 聊天机器人
  };
  
  return creditMap[serviceType] || 0;
}

// 扣除用户积分
export async function deductCredits(userId, serviceType) {
  console.log(`开始扣除积分，用户:${userId}，服务:${serviceType}`);
  
  const requiredCredits = getRequiredCredits(serviceType);
  console.log(`需要积分:${requiredCredits}`);
  
  if (requiredCredits <= 0) {
    console.log('无需扣除积分');
    return true;
  }
  
  try {
    const hasEnoughCredits = await checkUserCredits(userId, requiredCredits);
    console.log(`积分是否足够:${hasEnoughCredits}`);
    
    if (!hasEnoughCredits) {
      throw new Error('积分不足');
    }
    
    console.log('开始更新积分');
    // 生成描述
    const descriptions = {
      'image_generation': '图片生成',
      'image_editing': '图片修改',
      'art_card': '艺术卡片生成',
      'cover_generator': '封面生成',
      'chat': '智能聊天'
    };
    
    const description = `使用${descriptions[serviceType] || serviceType}服务`;
    const result = await updateUserCredits(userId, -requiredCredits, description, serviceType);
    console.log(`积分更新结果:${result}`);
    
    return true;
  } catch (error) {
    console.error(`扣除积分失败:${error.message}`);
    throw error;
  }
} 