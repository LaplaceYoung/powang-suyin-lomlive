import {
  Activity,
  AudioLines,
  BadgeCheck,
  Cable,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Fingerprint,
  Gauge,
  Headphones,
  History,
  Landmark,
  LockKeyhole,
  Mic2,
  Radio,
  Radar,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Waves,
} from "lucide-react";

export const navItems = [
  "工作台",
  "声学",
  "技术",
  "指标",
  "记录",
] as const;

export type NavItem = (typeof navItems)[number];

export const heroMetrics = [
  { label: "实时通话识别", value: "90%+", tone: "green", detail: "作品书核心指标" },
  { label: "响应延时", value: "<2.1s", tone: "blue", detail: "QQ / 微信链路" },
  { label: "内存占用", value: "<400MB", tone: "amber", detail: "完整流程运行" },
  { label: "DB-MLC FAR", value: "0%", tone: "green", detail: "基准测试" },
];

export const noiseProfiles = [
  { name: "Speech-shaped noise", db: "80 dB", mix: 82 },
  { name: "环境噪声", db: "65 dB", mix: 58 },
  { name: "粉红噪声", db: "55 dB", mix: 46 },
  { name: "音乐噪声", db: "45 dB", mix: 34 },
];

export const callRounds = [
  { round: 1, result: "pass", score: 91, state: "可信" },
  { round: 2, result: "pass", score: 94, state: "可信" },
  { round: 3, result: "pass", score: 89, state: "可信" },
  { round: 4, result: "pass", score: 92, state: "可信" },
  { round: 5, result: "pass", score: 93, state: "可信" },
  { round: 6, result: "pass", score: 88, state: "可信" },
  { round: 7, result: "review", score: 73, state: "复核" },
  { round: 8, result: "pass", score: 95, state: "可信" },
  { round: 9, result: "pass", score: 90, state: "可信" },
  { round: 10, result: "pass", score: 93, state: "可信" },
];

export const voiceCases = [
  { speaker: "女性真实说话人", confidence: 90.9, tone: "green" },
  { speaker: "男性真实说话人", confidence: 93.33, tone: "green" },
  { speaker: "女性录音重放", confidence: 6.66, tone: "red" },
  { speaker: "男性录音重放", confidence: 9.09, tone: "red" },
];

export const architecture = [
  {
    title: "通话层",
    subtitle: "QQ / 微信 / Telegram",
    body: "保留既有 VoIP 通话路径，接入透明。",
    icon: Radio,
  },
  {
    title: "接口层",
    subtitle: "Voicemeeter 虚拟声卡",
    body: "虚拟麦克风和扬声器接管音频路由。",
    icon: Cable,
  },
  {
    title: "检测层",
    subtitle: "Lombard-VLD",
    body: "噪声注入、采集、差分增强、分类。",
    icon: Radar,
  },
  {
    title: "用户层",
    subtitle: "预警与记录",
    body: "输出置信度、轮次结果和历史记录。",
    icon: ShieldCheck,
  },
];

export const pipeline = [
  { label: "基线采集", icon: Mic2 },
  { label: "噪声注入", icon: SlidersHorizontal },
  { label: "Lombard 采集", icon: AudioLines },
  { label: "差分增强", icon: Waves },
  { label: "活体判断", icon: BadgeCheck },
];

export const acousticFeatures = [
  { label: "响度", plain: 42, lombard: 77 },
  { label: "音高", plain: 46, lombard: 72 },
  { label: "F1", plain: 39, lombard: 68 },
  { label: "α比", plain: 34, lombard: 63 },
];

export const modelBenchmarks = [
  { method: "WSVA", family: "传感器", metric: "1% FAR", score: 84 },
  { method: "ChestLive", family: "主动", metric: "2% FAR", score: 82 },
  { method: "ArrayID", family: "被动", metric: "0.17% EER", score: 91 },
  { method: "VoicePop+", family: "被动", metric: "7.10% EER", score: 70 },
  { method: "VoShield", family: "被动", metric: "2.00% EER", score: 80 },
  { method: "Lombard-VLD", family: "被动", metric: "0% FAR / 0.24% EER", score: 99 },
];

export const environmentMetrics = [
  { env: "QQ", latency: "<2.1s", memory: "<400MB", accuracy: "92.40% / 99.76%" },
  { env: "微信", latency: "<2.1s", memory: "<400MB", accuracy: "92.40% / 99.70%" },
  { env: "有线网", latency: "<2.1s", memory: "<400MB", accuracy: "92.40% / 99.76%" },
  { env: "WiFi", latency: "<2.1s", memory: "<400MB", accuracy: "92.42% / 99.72%" },
  { env: "4G", latency: "<2.2s", memory: "<400MB", accuracy: "91.02% / 99.74%" },
];

export const applicationScenarios = [
  { title: "金融远程核验", detail: "语音确认交易与身份时增加来源验证。", icon: Landmark },
  { title: "政企通话防护", detail: "会议、指令和敏感沟通保持可信链路。", icon: LockKeyhole },
  { title: "运营商反诈", detail: "终端或交换节点识别可疑语音通话。", icon: Smartphone },
  { title: "智能客服", detail: "声纹认证前增加活体可信判断。", icon: Headphones },
];

export const innovationCards = [
  { title: "实时通话场景", tag: "通信链路", icon: Activity },
  { title: "听觉反馈机制", tag: "Lombard 效应", icon: Waves },
  { title: "双输入差分网络", tag: "Dif-SE-ResBlock", icon: Fingerprint },
  { title: "多因素普通话语料库", tag: "DB-MMLC", icon: ChartNoAxesColumnIncreasing },
];

export const historyRows = [
  { time: "09:12:48", duration: "05:00", noise: "SSN", db: "80 dB", rounds: 10, confidence: "90.90%" },
  { time: "10:04:11", duration: "05:00", noise: "SSN", db: "80 dB", rounds: 10, confidence: "93.33%" },
  { time: "14:27:06", duration: "05:00", noise: "环境噪声", db: "65 dB", rounds: 10, confidence: "6.66%" },
  { time: "16:35:20", duration: "05:00", noise: "粉红噪声", db: "55 dB", rounds: 10, confidence: "9.09%" },
];

export const quickStats = [
  { label: "检测轮次", value: "10", icon: History },
  { label: "累计时长", value: "05:00", icon: Clock3 },
  { label: "真人置信度", value: "90.90%", icon: Gauge },
  { label: "风险状态", value: "低风险", icon: ShieldAlert },
];

export const corpusRows = [
  { label: "语料库", value: "DB-MMLC" },
  { label: "噪声强度", value: "45/55/65/80 dB" },
  { label: "采集变量", value: "性别 / 噪声 / 设备" },
  { label: "测试对象", value: "未见说话人" },
  { label: "复杂环境 EER", value: "0.24%" },
];

export const attackDefenseRows = [
  { method: "coqui-ai", type: "TTS", score: "99.44%" },
  { method: "Unet-TTS", type: "TTS", score: "99.16%" },
  { method: "PaddleSpeech", type: "TTS", score: "99.72%" },
  { method: "coqui-ai-Lombard", type: "增强 TTS", score: "98.28%" },
  { method: "Unet-TTS-Lombard", type: "增强 TTS", score: "97.36%" },
  { method: "PaddleSpeech-Lombard", type: "增强 TTS", score: "98.84%" },
];
