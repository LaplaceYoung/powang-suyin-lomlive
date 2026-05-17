import { type CSSProperties, type FormEvent, useRef, useState } from "react";
import {
  ArrowRight,
  AudioWaveform,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  FileAudio,
  Flag,
  KeyRound,
  LoaderCircle,
  Mail,
  Mic2,
  Pause,
  Play,
  Radio,
  Route as RouteIcon,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  SlidersHorizontal,
  Upload,
  UserPlus,
  Volume2,
} from "lucide-react";
import {
  acousticFeatures,
  applicationScenarios,
  architecture,
  attackDefenseRows,
  corpusRows,
  environmentMetrics,
  heroMetrics,
  historyRows,
  innovationCards,
  modelBenchmarks,
  navItems,
  noiseProfiles,
  pipeline,
  type NavItem,
} from "./data";

type AuthMode = "login" | "register";
type ShellMode = "home" | "system";
type AnalysisStatus = "idle" | "processing" | "complete";

type AnalysisResult = {
  id: number;
  fileName: string;
  source: string;
  risk: string;
  confidence: number;
  latency: string;
  memory: string;
  verdictTone: "green" | "amber" | "red";
  plainDb: number;
  lombardDb: number;
  pitchDelta: number;
  f1Delta: number;
  alphaDelta: number;
  eer: string;
  rounds: number[];
};

const statusRows = [
  ["虚拟麦克风", "VB-Audio Aux", "接入"],
  ["远端扬声器", "Voicemeeter VAIO", "监听"],
  ["采样率", "16 kHz / 16 bit", "稳定"],
  ["包队列", "128 frames", "正常"],
];

const parameterRows = [
  ["Plain 采集", "30 dB", "5 s"],
  ["Lombard 采集", "80 dB", "5 s"],
  ["Mel bins", "80 x T", "双输入"],
  ["分类头", "AAM", "阈值 0.82"],
];

const analysisStages = ["音频接入", "基线采集", "噪声注入", "差分增强", "活体判断"];
const acceptedAudioExtensions = [".wav", ".mp3", ".m4a", ".flac", ".aac", ".ogg"];

const resultProfiles = [
  { source: "真实说话人", risk: "低风险", base: 91.4, tone: "green" as const, eer: "0.24%" },
  { source: "真实说话人", risk: "低风险", base: 93.2, tone: "green" as const, eer: "0%" },
  { source: "TTS 合成语音", risk: "高风险", base: 8.7, tone: "red" as const, eer: "98.84% iEER" },
  { source: "录音重放", risk: "高风险", base: 6.9, tone: "red" as const, eer: "0% FAR" },
  { source: "复杂噪声语音", risk: "需复核", base: 73.6, tone: "amber" as const, eer: "0.24%" },
];

function buildAnalysisResult(fileName: string, id: number): AnalysisResult {
  const profile = resultProfiles[Math.floor(Math.random() * resultProfiles.length)];
  const jitter = Number((Math.random() * 3.8 - 1.9).toFixed(2));
  const confidence = Math.max(4.2, Math.min(96.8, profile.base + jitter));
  const plainDb = 30 + Math.round(Math.random() * 2);
  const lombardDb = 78 + Math.round(Math.random() * 4);
  return {
    id,
    fileName,
    source: profile.source,
    risk: profile.risk,
    confidence,
    latency: `<${confidence > 80 ? "2.1" : "2.2"}s`,
    memory: `${352 + Math.round(Math.random() * 36)}MB`,
    verdictTone: profile.tone,
    plainDb,
    lombardDb,
    pitchDelta: 18 + Math.round(Math.random() * 16),
    f1Delta: 21 + Math.round(Math.random() * 18),
    alphaDelta: 15 + Math.round(Math.random() * 20),
    eer: profile.eer,
    rounds: Array.from({ length: 10 }, () => {
      const spread = profile.tone === "green" ? 8 : profile.tone === "amber" ? 13 : 7;
      return Math.max(3, Math.min(98, Math.round(confidence + Math.random() * spread - spread / 2)));
    }),
  };
}

export function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [shellMode, setShellMode] = useState<ShellMode>("home");
  const [activeNav, setActiveNav] = useState<NavItem>("工作台");
  const [isScanning, setIsScanning] = useState(true);
  const [selectedNoise, setSelectedNoise] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("等待接入音频文件");
  const [analysisCount, setAnalysisCount] = useState(0);

  const currentNoise = noiseProfiles[selectedNoise];
  const liveConfidence =
    analysisStatus === "processing" ? Math.min(88, 16 + stageIndex * 17) : (analysisResult?.confidence ?? 0);

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthenticated(true);
  }

  function handleFile(file?: File) {
    if (!file) {
      return;
    }
    const lowerName = file.name.toLowerCase();
    const validExtension = acceptedAudioExtensions.some((extension) => lowerName.endsWith(extension));
    const validMime = file.type === "" || file.type.startsWith("audio/");
    if (!validExtension || !validMime) {
      setUploadMessage("仅支持 WAV、MP3、M4A、FLAC、AAC、OGG 音频文件");
      setUploadedFileName("");
      setStageIndex(0);
      setAnalysisStatus("idle");
      setAnalysisResult(null);
      return;
    }
    const nextCount = analysisCount + 1;
    const nextResult = buildAnalysisResult(file.name, nextCount);
    setAnalysisCount(nextCount);
    setAnalysisResult(null);
    setUploadedFileName(file.name);
    setUploadMessage("文件已接入，正在分析");
    setStageIndex(0);
    setAnalysisStatus("processing");
    setIsScanning(true);
    analysisStages.slice(1).forEach((_, index) => {
      window.setTimeout(() => setStageIndex(index + 1), 650 * (index + 1));
    });
    window.setTimeout(() => {
      setAnalysisResult(nextResult);
      setAnalysisStatus("complete");
      setUploadMessage("分析完成，结果已生成");
    }, 650 * analysisStages.length + 420);
  }

  if (shellMode === "home") {
    return <MarketingHome setShellMode={setShellMode} setActiveNav={setActiveNav} />;
  }

  if (!authenticated) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onSubmit={submitAuth}
        goHome={() => setShellMode("home")}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-lockup" onClick={() => setShellMode("home")} type="button">
          <span className="brand-mark">
            <ShieldCheck size={19} />
          </span>
          <span>
            <strong>破妄溯音</strong>
            <small>Lomlive</small>
          </span>
        </button>

        <nav className="nav-tabs" aria-label="主导航">
          {navItems.map((item) => (
            <button
              className={activeNav === item ? "active" : ""}
              key={item}
              onClick={() => setActiveNav(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <button className="secondary-action compact-action" onClick={() => setShellMode("home")} type="button">
          作品主页
        </button>
      </header>

      <main className="system-main">
        {activeNav === "工作台" && (
          <Console
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            selectedNoise={selectedNoise}
            setSelectedNoise={setSelectedNoise}
            currentNoise={currentNoise}
            liveConfidence={liveConfidence}
            analysisStatus={analysisStatus}
            stageIndex={stageIndex}
            analysisResult={analysisResult}
            uploadedFileName={uploadedFileName}
            uploadMessage={uploadMessage}
            handleFile={handleFile}
          />
        )}
        {activeNav === "声学" && <Acoustic analysisResult={analysisResult} />}
        {activeNav === "技术" && <Technology />}
        {activeNav === "指标" && <Metrics />}
        {activeNav === "记录" && <Records analysisResult={analysisResult} />}
      </main>
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  onSubmit,
  goHome,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  goHome: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="系统概览">
        <div className="auth-brand">
          <span className="brand-mark">
            <ShieldCheck size={21} />
          </span>
          <div>
            <strong>破妄溯音</strong>
            <small>实时语音通话活体检测系统</small>
          </div>
        </div>
        <div className="auth-board">
          <div className="auth-board-head">
            <span>Live Call</span>
            <strong>90.90%</strong>
          </div>
          <WavePanel active compact />
          <div className="auth-board-grid">
            {statusRows.map(([label, value, state]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{state}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-metrics">
          {heroMetrics.slice(0, 3).map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-card">
        <button className="text-action" onClick={goHome} type="button">
          返回作品主页
        </button>
        <div className="auth-toggle" role="tablist" aria-label="账号入口">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            登录
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            注册
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            <span>邮箱</span>
            <div className="input-shell">
              <Mail size={18} />
              <input autoComplete="email" defaultValue="judge@lomlive.cn" id="auth-email" name="email" type="email" />
            </div>
          </label>
          <label>
            <span>密码</span>
            <div className="input-shell">
              <KeyRound size={18} />
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                defaultValue="Lomlive2026"
                id="auth-password"
                name="password"
                type="password"
              />
            </div>
          </label>
          {mode === "register" && (
            <label>
              <span>邀请码</span>
              <div className="input-shell">
                <UserPlus size={18} />
                <input autoComplete="one-time-code" defaultValue="CRAIC-VOICE" id="auth-invite" name="invite" />
              </div>
            </label>
          )}
          <button className="primary-action" type="submit">
            进入系统
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}

function MarketingHome({
  setShellMode,
  setActiveNav,
}: {
  setShellMode: (mode: ShellMode) => void;
  setActiveNav: (item: NavItem) => void;
}) {
  return (
    <div className="site-page">
      <header className="site-header">
        <button className="brand-lockup" type="button">
          <span className="brand-mark">
            <ShieldCheck size={19} />
          </span>
          <span>
            <strong>破妄溯音</strong>
            <small>Lomlive</small>
          </span>
        </button>
        <div className="site-actions">
          <button
            className="secondary-action"
            onClick={() => {
              setActiveNav("技术");
              setShellMode("system");
            }}
            type="button"
          >
            技术路线
          </button>
          <button
            className="primary-action"
            onClick={() => {
              setActiveNav("工作台");
              setShellMode("system");
            }}
            type="button"
          >
            进入系统
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <main className="site-main">
        <section className="site-hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <AudioWaveform size={16} />
              <span>Voice Liveness Detection</span>
            </div>
            <h1>通话中的语音来源可信判断</h1>
            <p>用 Lombard 效应捕捉真人在强噪声反馈下的声学响应，覆盖 AI 拟声、TTS 合成、录音重放等高风险场景。</p>
            <div className="hero-actions">
              <button
                className="primary-action"
                onClick={() => {
                  setActiveNav("工作台");
                  setShellMode("system");
                }}
                type="button"
              >
                打开工作台
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="homepage-product">
            <CallCard compact />
          </div>
        </section>

        <section className="home-metrics">
          {heroMetrics.map((metric) => (
            <MetricBlock key={metric.label} {...metric} />
          ))}
        </section>

        <section className="home-split">
          <div className="plain-section">
            <SectionTitle title="核心流程" kicker="Audio Route" />
            <div className="pipeline-row dense">
              {pipeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div className="pipeline-step" key={step.label}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon size={19} />
                    <strong>{step.label}</strong>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="plain-section">
            <SectionTitle title="创新抓手" kicker="Innovation" />
            <div className="innovation-strip">
              {innovationCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title}>
                    <Icon size={18} />
                    <strong>{item.title}</strong>
                    <span>{item.tag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Console({
  isScanning,
  setIsScanning,
  selectedNoise,
  setSelectedNoise,
  currentNoise,
  liveConfidence,
  analysisStatus,
  stageIndex,
  analysisResult,
  uploadedFileName,
  uploadMessage,
  handleFile,
}: {
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
  selectedNoise: number;
  setSelectedNoise: (value: number) => void;
  currentNoise: (typeof noiseProfiles)[number];
  liveConfidence: number;
  analysisStatus: AnalysisStatus;
  stageIndex: number;
  analysisResult: AnalysisResult | null;
  uploadedFileName: string;
  uploadMessage: string;
  handleFile: (file?: File) => void;
}) {
  const active = analysisStatus === "processing";
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={`page-grid console-grid ${analysisResult ? "has-result" : active ? "is-processing" : "is-empty"}`}>
      <div className="section-panel span-3 control-hub">
        <SectionTitle title="接入与通话" kicker="Input" />
        <div className="upload-zone">
          <input
            id="audio-upload"
            ref={fileInputRef}
            type="file"
            accept="audio/wav,audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/flac,.wav,.mp3,.m4a,.flac,.aac,.ogg"
            onChange={(event) => handleFile(event.currentTarget.files?.[0])}
          />
          <button
            className="upload-trigger"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            type="button"
          >
            <Upload size={20} />
            <strong>上传通话音频</strong>
            <span>{uploadedFileName || "WAV / MP3 / M4A / FLAC"}</span>
          </button>
          <small>{uploadMessage}</small>
        </div>
        {analysisStatus === "processing" && (
          <div className="stage-list">
            {analysisStages.map((stage, index) => (
              <div
                className={
                  index < stageIndex
                    ? "done"
                    : index === stageIndex
                      ? "running"
                      : ""
                }
                key={stage}
              >
                {index === stageIndex && analysisStatus === "processing" ? (
                  <LoaderCircle size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>{stage}</span>
              </div>
            ))}
          </div>
        )}

        <div className="control-divider">
          <span>Session</span>
          <strong>通话设置</strong>
        </div>
        <div className="control-stack compact">
          <div className="connection-row">
            <span className="status-dot online" />
            <div>
              <strong>VoIP 音频流</strong>
              <small>虚拟声卡路由已接入</small>
            </div>
          </div>
          <div className="noise-list">
            {noiseProfiles.map((profile, index) => (
              <button
                className={selectedNoise === index ? "active" : ""}
                key={profile.name}
                onClick={() => setSelectedNoise(index)}
                type="button"
              >
                <span>{profile.name}</span>
                <strong>{profile.db}</strong>
              </button>
            ))}
          </div>
          <div className="volume-row">
            <span>混合强度</span>
            <strong>{currentNoise.mix}%</strong>
            <div className="solid-track">
              <span style={{ width: `${currentNoise.mix}%` }} />
            </div>
          </div>
          <button className="primary-action wide" onClick={() => setIsScanning(!isScanning)} type="button">
            {isScanning ? <Pause size={18} /> : <Play size={18} />}
            {isScanning ? "暂停检测" : "开始检测"}
          </button>
        </div>
      </div>

      {analysisStatus === "idle" && (
        <div className="section-panel span-6 empty-workspace">
          <SectionTitle title="分析区" kicker="Workspace" />
          <div className="empty-grid empty-console">
            <div className="empty-hero-row">
              <div className="empty-icon">
                <FileAudio size={24} />
              </div>
              <div>
                <strong>等待音频接入</strong>
                <span>接入后生成轮次置信度、声学差分、风险判断和报告归档。</span>
              </div>
            </div>
            <div className="empty-route-map" aria-label="分析流程">
              {analysisStages.map((stage, index) => (
                <div key={stage}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{stage}</span>
                </div>
              ))}
            </div>
            <div className="empty-data-grid">
              <div>
                <AudioWaveform size={17} />
                <span>双路采样</span>
                <strong>Plain / Lombard</strong>
              </div>
              <div>
                <SlidersHorizontal size={17} />
                <span>差分特征</span>
                <strong>响度 / 音高 / F1 / α比</strong>
              </div>
              <div>
                <ShieldCheck size={17} />
                <span>判别输出</span>
                <strong>来源 / 风险 / 阈值</strong>
              </div>
              <div>
                <Database size={17} />
                <span>归档字段</span>
                <strong>轮次 / 链路 / 报告</strong>
              </div>
            </div>
            <div className="empty-format-strip">
              <span>WAV</span>
              <span>MP3</span>
              <span>M4A</span>
              <span>FLAC</span>
              <span>AAC</span>
              <span>OGG</span>
            </div>
          </div>
        </div>
      )}

      {!analysisResult && (
        <div className="section-panel span-3 side-status">
          <SectionTitle title="链路与参数" kicker="Device" />
          <div className="link-health">
            <div>
              <span className="status-dot online" />
              <strong>链路健康</strong>
            </div>
            <small>输入、输出与采样参数已就绪</small>
          </div>
          <div className="status-table">
            {statusRows.map(([label, value, state]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{state}</small>
              </div>
            ))}
          </div>
          <div className="parameter-list">
            {parameterRows.map(([label, value, state]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{state}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {active && (
        <>
          <div className="section-panel span-5 processing-panel">
            <SectionTitle title="分析进度" kicker="Processing" />
            <div className="processing-core">
              <LoaderCircle size={34} />
              <strong>{analysisStages[stageIndex]}</strong>
              <span>{uploadedFileName}</span>
              <div className="progress-rail">
                <span style={{ width: `${((stageIndex + 1) / analysisStages.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="section-panel span-4">
            <SectionTitle title="音频状态" kicker="Waveform" />
            <WavePanel active />
          </div>
        </>
      )}

      {analysisResult && (
        <>
          <div className="section-panel span-4 focus-panel">
            <SectionTitle title="活体置信度" kicker="Liveness Score" />
            <GaugePanel value={liveConfidence} active={isScanning} tone={analysisResult.verdictTone} />
            <div className="quick-stat-grid">
              <div className="quick-stat">
                <FileAudio size={17} />
                <span>来源判断</span>
                <strong>{analysisResult.source}</strong>
              </div>
              <div className="quick-stat">
                <ShieldAlert size={17} />
                <span>风险等级</span>
                <strong>{analysisResult.risk}</strong>
              </div>
              <div className="quick-stat">
                <SlidersHorizontal size={17} />
                <span>响应延时</span>
                <strong>{analysisResult.latency}</strong>
              </div>
              <div className="quick-stat">
                <Database size={17} />
                <span>内存占用</span>
                <strong>{analysisResult.memory}</strong>
              </div>
            </div>
          </div>

          <div className="section-panel span-3">
            <SectionTitle title="轮次结果" kicker="Rounds" />
            <RoundDistribution rounds={analysisResult.rounds} tone={analysisResult.verdictTone} />
          </div>

          <div className="section-panel span-2 report-panel">
            <SectionTitle title="报告摘要" kicker="Report" />
            <div className={`report-result ${analysisResult.verdictTone}`}>
              <strong>{analysisResult.risk}</strong>
              <span>{analysisResult.eer}</span>
              <small>{analysisResult.source}</small>
            </div>
            <div className="action-list compact">
              <button type="button">
                <Download size={16} />
                导出报告
              </button>
              <button type="button">
                <Flag size={16} />
                加入记录
              </button>
            </div>
          </div>

          <div className="section-panel span-5">
            <SectionTitle title="音频状态" kicker="Waveform" />
            <div className="audio-visual">
              <WavePanel active={isScanning} />
              <ResponseCurve result={analysisResult} />
            </div>
          </div>

          <div className="section-panel span-4">
            <SectionTitle title="差分特征" kicker="Feature Delta" />
            <FeatureDeltaChart result={analysisResult} />
          </div>
        </>
      )}
    </section>
  );
}

function Technology() {
  return (
    <section className="page-grid dense-page">
      <div className="section-panel span-12">
        <SectionTitle title="四层架构" kicker="System Architecture" />
        <div className="architecture-grid">
          {architecture.map((layer) => {
            const Icon = layer.icon;
            return (
              <div className="architecture-card" key={layer.title}>
                <Icon size={22} />
                <small>{layer.subtitle}</small>
                <strong>{layer.title}</strong>
                <p>{layer.body}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="section-panel span-8">
        <SectionTitle title="Lombard-VLD 流程" kicker="Model Flow" />
        <div className="model-flow">
          <div className="audio-column">
            <span>普通语音</span>
            <WaveMini variant="plain" />
          </div>
          <div className="model-core">
            <span>80 x T Mel</span>
            <span>SE-Res2Block x3</span>
            <span>Dif-SE-ResBlock</span>
            <span>AAM 分类</span>
          </div>
          <div className="audio-column">
            <span>Lombard 语音</span>
            <WaveMini variant="lombard" />
          </div>
        </div>
      </div>
      <div className="section-panel span-4">
        <SectionTitle title="语料库变量" kicker="DB-MMLC" />
        <div className="corpus-list">
          {corpusRows.map((row) => (
            <div key={row.label}>
              <strong>{row.value}</strong>
              <span>{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Acoustic({ analysisResult }: { analysisResult: AnalysisResult | null }) {
  if (!analysisResult) {
    return <EmptyAnalysisPage title="声学分析" />;
  }

  return (
    <section className="page-grid dense-page">
      <div className="section-panel span-5">
        <SectionTitle title="普通语音" kicker="30 dB Plain" />
        <SpectrumPanel type="plain" />
      </div>
      <div className="section-panel span-5">
        <SectionTitle title="Lombard 语音" kicker="80 dB Lombard" />
        <SpectrumPanel type="lombard" />
      </div>
      <div className="section-panel span-2">
        <SectionTitle title="声压对照" kicker="SPL" />
        <div className="spl-stack">
          <div>
            <span>Plain</span>
            <strong>{analysisResult.plainDb} dB</strong>
          </div>
          <div>
            <span>Lombard</span>
            <strong>{analysisResult.lombardDb} dB</strong>
          </div>
          <small>SSN 触发声学响应</small>
        </div>
      </div>
      <div className="section-panel span-12">
        <SectionTitle title="声学特征差异" kicker="Feature Delta" />
        <div className="feature-bars">
          {acousticFeatures.map((feature) => (
            <div className="feature-row" key={feature.label}>
              <strong>{feature.label}</strong>
              <div className="dual-bar">
                <span className="plain" style={{ width: `${feature.plain}%` }} />
                <span className="lombard" style={{ width: `${feature.lombard}%` }} />
              </div>
              <small>{feature.lombard - feature.plain > 25 ? "显著增强" : "增强"}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="page-grid dense-page">
      <div className="section-panel span-6">
        <SectionTitle title="方法对比" kicker="Benchmark" />
        <div className="benchmark-list">
          {modelBenchmarks.map((item) => (
            <div className={item.method === "Lombard-VLD" ? "benchmark winner" : "benchmark"} key={item.method}>
              <div>
                <strong>{item.method}</strong>
                <span>{item.family}</span>
              </div>
              <div className="solid-track">
                <span style={{ width: `${item.score}%` }} />
              </div>
              <small>{item.metric}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="section-panel span-6">
        <SectionTitle title="对抗攻击" kicker="TTS Defense" />
        <div className="attack-grid">
          {attackDefenseRows.map((row) => (
            <div key={row.method}>
              <strong>{row.score}</strong>
              <span>{row.method}</span>
              <small>{row.type}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="section-panel span-12">
        <SectionTitle title="运行环境" kicker="Runtime" />
        <div className="environment-grid">
          {environmentMetrics.map((metric) => (
            <div className="environment-card" key={metric.env}>
              <strong>{metric.env}</strong>
              <span>{metric.latency}</span>
              <span>{metric.memory}</span>
              <small>{metric.accuracy}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Records({ analysisResult }: { analysisResult: AnalysisResult | null }) {
  if (!analysisResult) {
    return <EmptyAnalysisPage title="检测记录" />;
  }

  return (
    <section className="page-grid dense-page">
      <div className="section-panel span-8">
        <SectionTitle title="检测记录" kicker="History" />
        <table className="history-table spacious">
          <thead>
            <tr>
              <th>开始时间</th>
              <th>来源</th>
              <th>时长</th>
              <th>强度</th>
              <th>次数</th>
              <th>置信度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>当前</td>
              <td>{analysisResult.source}</td>
              <td>05:00</td>
              <td>{analysisResult.lombardDb} dB</td>
              <td>10</td>
              <td>{analysisResult.confidence.toFixed(2)}%</td>
            </tr>
            {historyRows.map((row) => (
              <tr key={`${row.time}-${row.confidence}`}>
                <td>{row.time}</td>
                <td>{row.noise}</td>
                <td>{row.duration}</td>
                <td>{row.db}</td>
                <td>{row.rounds}</td>
                <td>{row.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-panel span-4">
        <SectionTitle title="处置面板" kicker="Actions" />
        <div className="action-list">
          <button type="button">
            <Download size={17} />
            导出检测报告
          </button>
          <button type="button">
            <Flag size={17} />
            标记可疑通话
          </button>
          <button type="button">
            <Send size={17} />
            同步到风控系统
          </button>
          <button type="button">
            <Database size={17} />
            生成技术附件
          </button>
        </div>
      </div>
      <div className="section-panel span-12">
        <SectionTitle title="归档状态" kicker="Archive" />
        <div className="status-table archive">
          <div>
            <Radio size={18} />
            <strong>通话链路</strong>
            <span>QQ / 微信 / Telegram</span>
          </div>
          <div>
            <RouteIcon size={18} />
            <strong>音频路由</strong>
            <span>虚拟麦克风 + 扬声器</span>
          </div>
          <div>
            <Settings2 size={18} />
            <strong>阈值策略</strong>
            <span>0.82 可信阈值</span>
          </div>
          <div>
            <BadgeCheck size={18} />
            <strong>结果格式</strong>
            <span>轮次 + 置信度 + 风险状态</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyAnalysisPage({ title }: { title: string }) {
  return (
    <section className="page-grid dense-page">
      <div className="section-panel span-12 empty-workspace tall">
        <SectionTitle title={title} kicker="Workspace" />
        <div className="empty-grid">
          <FileAudio size={28} />
          <strong>等待音频接入</strong>
          <span>进入工作台上传通话音频后生成本页数据。</span>
        </div>
      </div>
    </section>
  );
}

function FeatureDeltaChart({ result }: { result: AnalysisResult }) {
  const rows = [
    ["响度差", result.lombardDb - result.plainDb, 56],
    ["音高差", result.pitchDelta, 42],
    ["F1 差", result.f1Delta, 48],
    ["α比差", result.alphaDelta, 40],
  ] as const;
  return (
    <div className="delta-chart">
      {rows.map(([label, value, max]) => (
        <div key={label}>
          <span>{label}</span>
          <div className="solid-track">
            <span style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
          </div>
          <strong>+{value}</strong>
        </div>
      ))}
    </div>
  );
}

function RoundDistribution({
  rounds,
  tone,
}: {
  rounds: number[];
  tone: AnalysisResult["verdictTone"];
}) {
  return (
    <div className={`round-chart ${tone}`}>
      <svg viewBox="0 0 300 150" role="img" aria-label="十轮检测分布">
        <line x1="24" y1="24" x2="24" y2="126" />
        <line x1="24" y1="126" x2="286" y2="126" />
        <line className="threshold" x1="24" y1="46" x2="286" y2="46" />
        {rounds.map((score, index) => {
          const x = 38 + index * 26;
          const height = Math.max(6, score);
          const y = 126 - height;
          return (
            <g key={`${score}-${index}`}>
              <rect
                className={score > 82 ? "bar ok" : score > 60 ? "bar warn" : "bar risk"}
                height={height}
                rx="4"
                width="14"
                x={x}
                y={y}
              />
              <text x={x + 7} y="143">
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="round-summary">
        <strong>{Math.round(rounds.reduce((sum, score) => sum + score, 0) / rounds.length)}</strong>
        <span>平均轮次分</span>
        <small>{rounds.filter((score) => score > 82).length}/10 可信</small>
      </div>
    </div>
  );
}

function ResponseCurve({ result }: { result: AnalysisResult }) {
  const plain = [32, 38, 35, 41, 39, 43, 40, 44];
  const lift = Math.max(10, Math.min(34, result.lombardDb - result.plainDb - 22));
  const lombard = plain.map((value, index) => value + lift + (index % 3) * 3);
  const toPath = (values: number[]) =>
    values
      .map((value, index) => {
        const x = 18 + index * 38;
        const y = 96 - value;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return (
    <div className="response-curve">
      <svg viewBox="0 0 300 112" role="img" aria-label="普通语音与Lombard语音响应曲线">
        <line x1="16" y1="96" x2="286" y2="96" />
        <line x1="16" y1="18" x2="16" y2="96" />
        <path className="plain-line" d={toPath(plain)} pathLength="100" />
        <path className="lombard-line" d={toPath(lombard)} pathLength="100" />
        {lombard.map((value, index) => (
          <circle cx={18 + index * 38} cy={96 - value} key={`${value}-${index}`} r="3.5" />
        ))}
      </svg>
      <div>
        <span>Plain</span>
        <strong>{result.plainDb} dB</strong>
        <span>Lombard</span>
        <strong>{result.lombardDb} dB</strong>
      </div>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className={`metric-block ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function SectionTitle({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div className="section-title">
      <span>{kicker}</span>
      <h2>{title}</h2>
    </div>
  );
}

function CallCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "call-card compact" : "call-card"}>
      <div className="call-header">
        <div>
          <span>VoIP Session</span>
          <strong>远端语音通话</strong>
        </div>
        <BellRing size={19} />
      </div>
      <WavePanel active compact />
      <div className="call-footer">
        <span>
          <CheckCircle2 size={16} />
          Lombard response detected
        </span>
        <strong>90.90%</strong>
      </div>
    </div>
  );
}

function GaugePanel({ value, active, tone }: { value: number; active: boolean; tone: AnalysisResult["verdictTone"] }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const angle = (safeValue / 100) * 180;
  const needleX = 110 + Math.cos((180 - angle) * (Math.PI / 180)) * 74;
  const needleY = 112 - Math.sin((180 - angle) * (Math.PI / 180)) * 74;
  return (
    <div className={active ? `gauge-panel active ${tone}` : `gauge-panel ${tone}`}>
      <div className="score-gauge">
        <svg className="gauge-svg" viewBox="0 0 220 138" role="img" aria-label="活体置信度仪表盘">
          <path className="gauge-base" d="M 24 112 A 86 86 0 0 1 196 112" pathLength="100" />
          <path
            className="gauge-progress"
            d="M 24 112 A 86 86 0 0 1 196 112"
            pathLength="100"
            style={{ strokeDasharray: `${safeValue} 100` }}
          />
          <line className="gauge-needle-line" x1="110" x2={needleX} y1="112" y2={needleY} />
          <circle className="gauge-hub" cx="110" cy="112" r="5" />
        </svg>
        <div className="gauge-value">
          <strong>{value.toFixed(2)}%</strong>
          <small>真人置信度</small>
        </div>
      </div>
      <div className="risk-pill">
        <ShieldPlus size={16} />
        <span>{tone === "green" ? "低风险" : tone === "amber" ? "需复核" : "高风险"}</span>
      </div>
    </div>
  );
}

function WavePanel({ active, compact = false }: { active: boolean; compact?: boolean }) {
  const bars = Array.from({ length: compact ? 34 : 68 }, (_, index) => index);
  return (
    <div className={active ? "wave-panel active" : "wave-panel"}>
      {bars.map((bar) => (
        <span
          key={bar}
          style={
            {
              "--i": bar,
              height: `${18 + (bar % 9) * 7}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function WaveMini({ variant }: { variant: "plain" | "lombard" }) {
  return (
    <div className={`wave-mini ${variant}`}>
      {Array.from({ length: 20 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function SpectrumPanel({ type }: { type: "plain" | "lombard" }) {
  return (
    <div className={`spectrum ${type}`}>
      {Array.from({ length: 80 }, (_, index) => (
        <span key={index} style={{ "--i": index } as CSSProperties} />
      ))}
      <div className="spectrum-label">
        <Volume2 size={18} />
        <strong>{type === "plain" ? "普通语音" : "Lombard 语音"}</strong>
      </div>
    </div>
  );
}
