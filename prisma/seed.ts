import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建游戏物品
  const items = [
    // 挖矿物品
    { name: '铜矿石', type: 'material', rarity: 'common', value: 10, description: '常见的铜矿石，可用于制作基础装备' },
    { name: '铁矿石', type: 'material', rarity: 'common', value: 25, description: '坚硬的铁矿石，制作装备的重要材料' },
    { name: '银矿石', type: 'material', rarity: 'uncommon', value: 50, description: '珍贵的银矿石，散发着微弱的光芒' },
    { name: '金矿石', type: 'material', rarity: 'rare', value: 100, description: '稀有的金矿石，价值不菲' },
    { name: '秘银矿石', type: 'material', rarity: 'epic', value: 250, description: '传说中的秘银，蕴含神秘力量' },
    { name: '精金矿石', type: 'material', rarity: 'legendary', value: 500, description: '极其稀有的精金，坚不可摧' },
    
    // 采集物品
    { name: '野草', type: 'material', rarity: 'common', value: 5, description: '随处可见的野草，有基础的药用价值' },
    { name: '蓝莓', type: 'consumable', rarity: 'common', value: 8, description: '酸甜的蓝莓，可以直接食用' },
    { name: '草药', type: 'material', rarity: 'uncommon', value: 20, description: '具有治疗效果的草药' },
    { name: '魔法花', type: 'material', rarity: 'rare', value: 75, description: '蕴含魔力的神奇花朵' },
    { name: '生命之叶', type: 'material', rarity: 'epic', value: 200, description: '传说中的生命之叶，拥有强大的治愈力' },
    { name: '世界树果实', type: 'consumable', rarity: 'legendary', value: 400, description: '世界树结出的神圣果实' },
    
    // 钓鱼物品
    { name: '小鱼', type: 'consumable', rarity: 'common', value: 12, description: '常见的小鱼，味道鲜美' },
    { name: '鲤鱼', type: 'consumable', rarity: 'common', value: 18, description: '肥美的鲤鱼，营养丰富' },
    { name: '金鱼', type: 'consumable', rarity: 'uncommon', value: 35, description: '美丽的金鱼，据说能带来好运' },
    { name: '彩虹鱼', type: 'consumable', rarity: 'rare', value: 80, description: '色彩斑斓的彩虹鱼，极其罕见' },
    { name: '龙鱼', type: 'consumable', rarity: 'epic', value: 180, description: '传说中的龙鱼，拥有龙的血脉' },
    { name: '深海巨鱼', type: 'consumable', rarity: 'legendary', value: 350, description: '深海中的巨大鱼类，力量惊人' }
  ]

  for (const item of items) {
    await prisma.item.create({
      data: item
    })
  }

  // 获取创建的物品ID
  const copperOre = await prisma.item.findFirst({ where: { name: '铜矿石' } })
  const ironOre = await prisma.item.findFirst({ where: { name: '铁矿石' } })
  const silverOre = await prisma.item.findFirst({ where: { name: '银矿石' } })
  const goldOre = await prisma.item.findFirst({ where: { name: '金矿石' } })
  const wildGrass = await prisma.item.findFirst({ where: { name: '野草' } })
  const blueberry = await prisma.item.findFirst({ where: { name: '蓝莓' } })
  const herb = await prisma.item.findFirst({ where: { name: '草药' } })
  const magicFlower = await prisma.item.findFirst({ where: { name: '魔法花' } })
  const smallFish = await prisma.item.findFirst({ where: { name: '小鱼' } })
  const carp = await prisma.item.findFirst({ where: { name: '鲤鱼' } })
  const goldfish = await prisma.item.findFirst({ where: { name: '金鱼' } })
  const rainbowFish = await prisma.item.findFirst({ where: { name: '彩虹鱼' } })

  // 创建游戏资源点
  const resources = [
    // 挖矿资源点
    {
      name: '废弃矿洞',
      type: 'mining_node',
      area: 'mining',
      itemId: copperOre!.id,
      levelReq: 1,
      baseTime: 30,
      expReward: 15
    },
    {
      name: '铜矿脉',
      type: 'mining_node',
      area: 'mining',
      itemId: copperOre!.id,
      levelReq: 5,
      baseTime: 45,
      expReward: 25
    },
    {
      name: '铁矿山',
      type: 'mining_node',
      area: 'mining',
      itemId: ironOre!.id,
      levelReq: 15,
      baseTime: 60,
      expReward: 40
    },
    {
      name: '银矿深坑',
      type: 'mining_node',
      area: 'mining',
      itemId: silverOre!.id,
      levelReq: 30,
      baseTime: 90,
      expReward: 65
    },
    {
      name: '黄金矿脉',
      type: 'mining_node',
      area: 'mining',
      itemId: goldOre!.id,
      levelReq: 50,
      baseTime: 120,
      expReward: 100
    },
    
    // 采集资源点
    {
      name: '新手草地',
      type: 'gathering_spot',
      area: 'gathering',
      itemId: wildGrass!.id,
      levelReq: 1,
      baseTime: 25,
      expReward: 12
    },
    {
      name: '蓝莓丛林',
      type: 'gathering_spot',
      area: 'gathering',
      itemId: blueberry!.id,
      levelReq: 8,
      baseTime: 40,
      expReward: 22
    },
    {
      name: '草药花园',
      type: 'gathering_spot',
      area: 'gathering',
      itemId: herb!.id,
      levelReq: 20,
      baseTime: 55,
      expReward: 38
    },
    {
      name: '魔法森林',
      type: 'gathering_spot',
      area: 'gathering',
      itemId: magicFlower!.id,
      levelReq: 40,
      baseTime: 80,
      expReward: 70
    },
    {
      name: '生命圣地',
      type: 'gathering_spot',
      area: 'gathering',
      itemId: herb!.id,
      levelReq: 60,
      baseTime: 110,
      expReward: 120
    },
    
    // 钓鱼资源点
    {
      name: '村庄池塘',
      type: 'fishing_spot',
      area: 'fishing',
      itemId: smallFish!.id,
      levelReq: 1,
      baseTime: 35,
      expReward: 18
    },
    {
      name: '清澈小溪',
      type: 'fishing_spot',
      area: 'fishing',
      itemId: carp!.id,
      levelReq: 10,
      baseTime: 50,
      expReward: 28
    },
    {
      name: '宁静湖泊',
      type: 'fishing_spot',
      area: 'fishing',
      itemId: goldfish!.id,
      levelReq: 25,
      baseTime: 70,
      expReward: 45
    },
    {
      name: '神秘海湾',
      type: 'fishing_spot',
      area: 'fishing',
      itemId: rainbowFish!.id,
      levelReq: 45,
      baseTime: 95,
      expReward: 80
    },
    {
      name: '深海秘境',
      type: 'fishing_spot',
      area: 'fishing',
      itemId: rainbowFish!.id,
      levelReq: 65,
      baseTime: 130,
      expReward: 140
    }
  ]

  for (const resource of resources) {
    await prisma.gameResource.create({
      data: resource
    })
  }

  console.log('数据库初始化完成！')
  console.log(`创建了 ${items.length} 个物品`)
  console.log(`创建了 ${resources.length} 个资源点`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })