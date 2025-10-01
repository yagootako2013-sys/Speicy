import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Editor from '@monaco-editor/react';

// SVG Icons as React Components
const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" fill="currentColor"/></svg>;
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/></svg>;
const TasksIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2.05V11H21.95C21.45 6.04 17.96 2.55 13 2.05ZM11 2.05C6.04 2.55 2.55 6.04 2.05 11H11V2.05ZM2.05 13C2.55 17.96 6.04 21.45 11 21.95V13H2.05ZM13 21.95C17.96 21.45 21.45 17.96 21.95 13H13V21.95Z" fill="currentColor"/></svg>;
const NewProjectIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7ZM12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/></svg>;
const ShareIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12S8.96 11.53 8.91 11.3L16.04 7.15C16.56 7.62 17.24 7.92 18 7.92C19.66 7.92 21 6.58 21 4.92S19.66 1.92 18 1.92 15 3.26 15 4.92C15 5.16 15.04 5.39 15.09 5.61L7.96 9.75C7.44 9.28 6.76 8.98 6 8.98C4.34 8.98 3 10.32 3 11.98S4.34 14.98 6 14.98C6.76 14.98 7.44 14.68 7.96 14.21L15.09 18.35C15.04 18.57 15 18.8 15 19.04C15 20.7 16.34 22.04 18 22.04S21 20.7 21 19.04 19.66 16.08 18 16.08Z" fill="currentColor"/></svg>;
const SendIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10L17 12L2 14L2.01 21Z" fill="currentColor"/></svg>;
const SparkleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5L13.13 5.38L16 6.5L13.13 7.63L12 10.5L10.88 7.63L8 6.5L10.88 5.38L12 2.5ZM6 8L7.5 11.5L11 13L7.5 14.5L6 18L4.5 14.5L1 13L4.5 11.5L6 8Z" fill="currentColor"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/></svg>;
const ProjectsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/></svg>;
const MicrophoneIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM10.8 4.9C10.8 4.72 10.93 4.59 11.1 4.59H12.9C13.07 4.59 13.2 4.72 13.2 4.9V11.1C13.2 11.28 13.07 11.41 12.9 11.41H11.1C10.93 11.41 10.8 11.28 10.8 11.1V4.9ZM17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.72 17.43 11 17.93V21H13V17.93C16.28 17.43 19 14.53 19 11H17Z" fill="currentColor"/></svg>;
const ChevronLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/></svg>;
const CloseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" fill="currentColor"/></svg>;
const AttachmentIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 6V17.5C16.5 19.71 14.71 21.5 12.5 21.5C10.29 21.5 8.5 19.71 8.5 17.5V5C8.5 3.62 9.62 2.5 11 2.5C12.38 2.5 13.5 3.62 13.5 5V15.5C13.5 16.05 13.05 16.5 12.5 16.5C11.95 16.5 11.5 16.05 11.5 15.5V6H10V15.5C10 16.88 11.12 18 12.5 18C13.88 18 15 16.88 15 15.5V5C15 2.79 13.21 1 11 1C8.79 1 7 2.79 7 5V17.5C7 20.54 9.46 23 12.5 23C15.54 23 18 20.54 18 17.5V6H16.5Z" fill="currentColor"/></svg>;
const UserIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>;
const SpeakerIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"></path></svg>;

const SpeyciLogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="marsGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#FF8A65'}} />
                <stop offset="100%" style={{stopColor: '#D84315'}} />
            </radialGradient>
        </defs>
        <rect width="100" height="100" fill="black" />
        <circle cx="50" cy="50" r="35" fill="url(#marsGradient)" />
        <circle cx="80" cy="20" r="2" fill="white" />
        <circle cx="25" cy="25" r="1.5" fill="white" />
        <circle cx="70" cy="75" r="1" fill="white" />
        <path d="M15 60 A 45 45 0 0 1 85 60" stroke="white" strokeWidth="2" fill="none" />
        <path d="M20 40 A 40 40 0 0 0 80 40" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" />
        <text x="50" y="55" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">SPEYCI</text>
    </svg>
);


type Mode = 'chat' | 'search' | 'tasks' | 'projects';

type StudioCode = {
    filename: string;
    code: string;
};

type Message = {
    role: 'user' | 'ai';
    type: 'text' | 'tasklist' | 'search_result' | 'image' | 'video' | 'error';
    content: any;
    sources?: any[];
};

type Conversation = {
    id: string;
    title: string;
    mode: Mode;
    messages: Message[];
    studioCode: StudioCode | null;
};

type ModeConfig = {
    id: Mode;
    text: string;
    icon: React.ReactElement;
    title: string;
    placeholder: string;
    welcome: {
        title: string;
        description: string;
        suggestions: string[];
    };
    kbd?: string;
    supportsFileUpload?: boolean;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitAudioContext: any;
  }
}

const MODES_CONFIG: Record<Mode, ModeConfig> = {
  search: { id: 'search', text: 'Buscar', kbd: 'Ctrl+K', icon: <SearchIcon />, title: 'Pesquisa com Speyci', placeholder: 'Pesquise na web com Speyci...', welcome: { title: 'Pesquisa Inteligente', description: 'Faça perguntas sobre eventos atuais ou qualquer tópico para obter respostas baseadas na web com fontes.', suggestions: ["Qual a capital do Brasil?", "Quem ganhou a última Copa do Mundo?", "Resuma as notícias de hoje", "Qual a previsão do tempo para amanhã?"] } },
  chat: { id: 'chat', text: 'Bate-papo', icon: <ChatIcon />, title: 'Estúdio Speyci', placeholder: 'Descreva o que você quer criar ou pergunte algo...', welcome: { title: 'Bem-vindo ao Speyci!', description: 'Para começar, me diga como gostaria de ser chamado ou selecione uma sugestão.', suggestions: ["Me ensine a programar", "Me ajude em uma tarefa", "Eu preciso de ajuda em algo", "Crie um jogo da cobrinha em JS"] } },
  tasks: { id: 'tasks', text: 'Tarefas', icon: <TasksIcon />, title: 'Gerador de Tarefas', placeholder: 'Descreva um objetivo para gerar uma lista de tarefas...', welcome: { title: 'Organizador de Tarefas', description: 'Transforme grandes objetivos em listas de tarefas gerenciáveis com a Speyci.', suggestions: ["Planeje minha semana de trabalho", "Crie uma lista de compras para o jantar", "Organize as etapas para lançar um site", "Quais são os passos para aprender a tocar violão?"] } },
  projects: { id: 'projects', text: 'Projetos', icon: <ProjectsIcon />, title: 'Planejador de Projetos', placeholder: 'Descreva a ideia do seu projeto...', welcome: { title: 'Assistente de Projetos Speyci', description: 'Obtenha ajuda para estruturar e planejar seus projetos com a Speyci.', suggestions: ["Estruture um plano de negócios para uma cafeteria", "Crie um roteiro para um vídeo do YouTube", "Planeje um projeto de aplicativo de viagem", "Desenvolva um cronograma para reformar um quarto"] } },
};

type StudioViewProps = {
    content: StudioCode;
    onCodeChange: (newCode: string) => void;
};

const StudioView = ({ content, onCodeChange }: StudioViewProps) => {
    const { filename, code } = content;
    const [showPreview, setShowPreview] = useState(false);
    const [copyText, setCopyText] = useState('Copiar');
    const editorRef = useRef(null);
    const [selectionRange, setSelectionRange] = useState(null);
    const [showAIEdit, setShowAIEdit] = useState(false);
    const [isAIEditInputVisible, setIsAIEditInputVisible] = useState(false);
    const [aiEditPosition, setAIEditPosition] = useState({ top: 0, left: 0 });
    const [aiEditInstruction, setAIEditInstruction] = useState('');
    const [isEditingWithAI, setIsEditingWithAI] = useState(false);
    const aiEditInputRef = useRef(null);
    useEffect(() => {
        if (isAIEditInputVisible && aiEditInputRef.current) {
            aiEditInputRef.current.focus();
        }
    }, [isAIEditInputVisible]);
    const getLanguageFromFilename = (filename) => {
        if (!filename) return 'plaintext';
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'js': case 'jsx': return 'javascript';
            case 'ts': case 'tsx': return 'typescript';
            case 'css': return 'css';
            case 'html': return 'html';
            case 'svg': return 'xml';
            case 'json': return 'json';
            case 'md': return 'markdown';
            default: return 'plaintext';
        }
    };
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeCursorSelection(() => {
            const selection = editor.getSelection();
            if (selection && !selection.isEmpty() && editor.getModel().getValueInRange(selection).trim().length > 0) {
                const startPosition = selection.getStartPosition();
                const editorLayout = editor.getLayoutInfo();
                const top = editor.getTopForPosition(startPosition.lineNumber, 1) - editor.getScrollTop();
                if (top >= 0 && top < editorLayout.height) {
                    setAIEditPosition({ top: top, left: 0 });
                    setSelectionRange(selection);
                    setShowAIEdit(true);
                } else {
                    setShowAIEdit(false);
                }
            } else {
                setShowAIEdit(false);
                setIsAIEditInputVisible(false);
                setAIEditInstruction('');
            }
        });
        editor.onDidScrollChange(() => {
            setShowAIEdit(false);
            setIsAIEditInputVisible(false);
            setAIEditInstruction('');
        });
    };
    const handleAIEditRequest = async () => {
        if (!aiEditInstruction.trim() || !selectionRange) return;
        setIsEditingWithAI(true);
        const editor = editorRef.current;
        const selectedCode = editor.getModel().getValueInRange(selectionRange);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert code editing AI. The user has selected the following code snippet:\n\`\`\`\n${selectedCode}\n\`\`\`\n\nPlease apply the following instruction: "${aiEditInstruction}".\n\nIMPORTANT: Only return the modified code block. Do not include any explanations, comments, or markdown formatting like \`\`\` around the code.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { thinkingConfig: { thinkingBudget: 0 } } });
            const newCode = response.text.trim();
            editor.executeEdits('ai-edit', [{ range: selectionRange, text: newCode, forceMoveMarkers: true }]);
            onCodeChange(editor.getValue());
        } catch (err) {
            console.error("AI Edit failed:", err);
        } finally {
            setIsEditingWithAI(false);
            setShowAIEdit(false);
            setIsAIEditInputVisible(false);
            setAIEditInstruction('');
        }
    };
    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopyText('Copiado!');
            setTimeout(() => setCopyText('Copiar'), 2000);
        });
    };
    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'code.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    return (
        <div className="studio-container">
            <div className="studio-header">
                <div className="studio-tabs-group">
                    <div className="studio-tabs">
                        <button className={`studio-tab ${!showPreview ? 'active' : ''}`} onClick={() => setShowPreview(false)}>&lt;&gt; Código</button>
                        <button className={`studio-tab ${showPreview ? 'active' : ''}`} onClick={() => setShowPreview(true)}>▷ Pré-visualizar</button>
                    </div>
                </div>
                <div className="studio-actions">
                    <button onClick={handleCopy} className="studio-action-button" title="Copiar código para a área de transferência">{copyText}</button>
                    <button onClick={handleDownload} className="studio-action-button" title="Baixar o arquivo de código">Baixar</button>
                </div>
            </div>
            <div className="studio-content">
                {!showPreview ? (
                    <div className="studio-code-container">
                        {showAIEdit && (
                            <div className="ai-edit-popup" style={{ transform: `translateY(${aiEditPosition.top}px)` }}>
                                {!isAIEditInputVisible ? (
                                    <button className="ai-edit-button" onClick={() => setIsAIEditInputVisible(true)}>
                                        <SparkleIcon /> Editar com IA
                                    </button>
                                ) : (
                                    <div className="ai-edit-input-wrapper">
                                        <input
                                            ref={aiEditInputRef}
                                            type="text"
                                            value={aiEditInstruction}
                                            onChange={e => setAIEditInstruction(e.target.value)}
                                            placeholder="Ex: Refatorar para uma função..."
                                            onKeyDown={e => e.key === 'Enter' && handleAIEditRequest()}
                                            disabled={isEditingWithAI}
                                        />
                                        <button onClick={handleAIEditRequest} disabled={isEditingWithAI || !aiEditInstruction.trim()}>
                                            {isEditingWithAI ? '...' : <SendIcon />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <Editor
                            height="100%"
                            language={getLanguageFromFilename(filename)}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => onCodeChange(value || '')}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                ) : (
                    <div className="studio-preview-content">
                        <iframe key={code} srcDoc={code} title="Preview" sandbox="allow-scripts allow-same-origin" />
                    </div>
                )}
            </div>
        </div>
    );
};

const ImageMessage = ({ base64Content }) => {
    const imageUrl = `data:image/png;base64,${base64Content}`;
    return <div className="image-message-container"><img src={imageUrl} alt="Generated by Speyci" /></div>;
};

const VideoMessage = ({ videoUrl }) => (
    <div className="video-message-container">
        <video src={videoUrl} controls autoPlay loop />
    </div>
);

const TaskListMessage = ({ tasks }) => (
    <ul className="task-list">
        {tasks.map((task, index) => (
            <li key={index}>
                <div className="task-name">{task.taskName}</div>
                <div className="task-description">{task.description}</div>
            </li>
        ))}
    </ul>
);

const SearchMessage = ({ content, sources }) => (
    <div>
        <p>{content}</p>
        {sources && sources.length > 0 && (
            <div className="search-sources">
                <strong>Fontes:</strong>
                <ul>
                    {sources.map((source, index) => (
                        source.web && <li key={index}><a href={source.web.uri} target="_blank" rel="noopener noreferrer">{source.web.title || source.web.uri}</a></li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

type SidebarButtonProps = {
    icon: React.ReactElement;
    text: string;
    kbd?: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
};

const SidebarButton = ({ icon, text, kbd, isActive, onClick, className = '' }: SidebarButtonProps) => (
    <button onClick={onClick} className={`nav-item ${isActive ? 'active' : ''} ${className}`} aria-pressed={isActive} title={text}>
        <span className="nav-icon">{icon}</span>
        <span className="nav-text">{text}</span>
        {kbd && <kbd className="nav-kbd">{kbd}</kbd>}
    </button>
);

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const App = () => {
  const MAX_HISTORY_ITEMS = 50;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>('chat');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempRenameValue, setTempRenameValue] = useState('');
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileMimeType, setUploadedFileMimeType] = useState<string | null>(null);
  const chatEndRef = useRef(null);
  const renameInputRef = useRef(null);
  const speechRecognitionRef = useRef<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const [userName, setUserName] = useState<string | null>(null);
  const [isSettingName, setIsSettingName] = useState(false);
  const [chatWidth, setChatWidth] = useState<number>(50);
  const mainContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const savedName = localStorage.getItem('speyciUserName');
    if (savedName) {
        setUserName(savedName);
    } else {
        setIsSettingName(true);
    }

    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > MAX_HISTORY_ITEMS) {
              setHistory(parsedHistory.slice(0, MAX_HISTORY_ITEMS));
          } else if (Array.isArray(parsedHistory)) {
              setHistory(parsedHistory);
          }
      }
    } catch (error) { console.error("Failed to load history from localStorage", error); }

    const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
    };
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
  }, []);

  useEffect(() => {
    try {
        if(history.length > 0) {
            localStorage.setItem('chatHistory', JSON.stringify(history));
        }
    } catch (error) { console.error("Failed to save history to localStorage", error); }
  }, [history]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
        setInputValue(prev => prev + event.results[0][0].transcript);
        setIsListening(false);
    };
    recognition.onerror = (event) => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    speechRecognitionRef.current = recognition;
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleVoiceInput = () => {
    if (isLoading || !speechRecognitionRef.current) return;
    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
        speechRecognitionRef.current.start();
        setIsListening(true);
    }
  };
  
  const currentConversation = history.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages ?? [];
  const studioCode = currentConversation?.studioCode;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) renameInputRef.current.focus();
  }, [renamingId]);
  
  const updateConversation = (conversationId, updates) => {
    setHistory(prevHistory => 
      prevHistory.map(conv => conv.id === conversationId ? { ...conv, ...updates } : conv)
    );
  };
   
  const updateLastMessage = (conversationId, messageUpdate) => {
    setHistory(prevHistory => {
        return prevHistory.map(conv => {
            if (conv.id === conversationId) {
                const newMessages = [...conv.messages];
                if (newMessages.length > 0) {
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex] = { ...newMessages[lastIndex], ...messageUpdate };
                }
                return { ...conv, messages: newMessages };
            }
            return conv;
        });
    });
  };

   const appendToLastMessage = (conversationId, textChunk) => {
        setHistory(prevHistory => {
            return prevHistory.map(conv => {
              if (conv.id === conversationId) {
                const newMessages = [...conv.messages];
                if (newMessages.length > 0) {
                  const lastMessage = { ...newMessages[newMessages.length - 1] };
                  if (lastMessage.role === 'ai') {
                    lastMessage.content = (lastMessage.content || '') + textChunk;
                    newMessages[newMessages.length - 1] = lastMessage;
                  }
                }
                return { ...conv, messages: newMessages };
              }
              return conv;
            });
        });
    };
  
  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setInputValue('');
    clearFileUpload();
  };

  const handleModeChange = (modeId: Mode) => {
      setActiveMode(modeId);
      handleNewConversation();
  };
  
  const handleSelectConversation = (id: string) => {
    const conversation = history.find(c => c.id === id);
    if(conversation) {
        setActiveMode(conversation.mode);
        setCurrentConversationId(id);
    }
  };

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setTempRenameValue(title);
  };
  
  const handleFinishRename = () => {
    if (!renamingId || !tempRenameValue.trim()) { setRenamingId(null); return; };
    setHistory(prev => prev.map(conv => 
      conv.id === renamingId ? { ...conv, title: tempRenameValue.trim() } : conv
    ));
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishRename();
    else if (e.key === 'Escape') setRenamingId(null);
  };
  
  const handleStudioCodeChange = (newCode: string) => {
    if (!currentConversationId) return;
    setHistory(prevHistory => prevHistory.map(conv => {
      if (conv.id === currentConversationId && conv.studioCode) {
        return { ...conv, studioCode: { ...conv.studioCode, code: newCode } };
      }
      return conv;
    }));
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64string = reader.result as string;
              resolve(base64string.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          try {
              const base64 = await blobToBase64(file);
              setUploadedFileBase64(base64);
              setUploadedFileMimeType(file.type);
          } catch (error) {
              console.error("Error converting file to base64", error);
          }
      }
  };

  const clearFileUpload = () => {
      setUploadedFileBase64(null);
      setUploadedFileMimeType(null);
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
  };
  
  const handleNameSubmit = (name: string) => {
      if (!name.trim()) return;
      const newName = name.trim();
      setUserName(newName);
      localStorage.setItem('speyciUserName', newName);
      setIsSettingName(false);
      setInputValue('');
  
      const aiMessage: Message = { role: 'ai', type: 'text', content: `Prazer em te conhecer, ${newName}! O que vamos criar hoje?` };
      
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: `Conversa com ${newName}`,
        mode: 'chat',
        messages: [aiMessage],
        studioCode: null,
      };

      setHistory(prev => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
  };

  const handleSendMessage = useCallback(async (prompt: string) => {
    if ((!prompt.trim() && !uploadedFileBase64) || isLoading) return;

    const userMessage: Message = { role: 'user', type: 'text', content: prompt };
    const currentInput = prompt;
    
    setInputValue('');
    clearFileUpload();
    setIsLoading(true);

    let conversationId = currentConversationId;

    if (!conversationId) {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: currentInput.split(' ').slice(0, 4).join(' ') + '...',
            mode: activeMode,
            messages: [userMessage],
            studioCode: null,
        };
        setHistory(prev => [newConversation, ...prev.slice(0, MAX_HISTORY_ITEMS - 1)]);
        conversationId = newConversation.id;
        setCurrentConversationId(newConversation.id);
    } else {
        updateConversation(conversationId, { messages: [...history.find(c => c.id === conversationId).messages, userMessage] });
    }
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const addMessageToHistory = (msg) => {
          setHistory(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, msg] } : c));
      };
      
      const aiMessagePlaceholder: Message = { role: 'ai', type: 'text', content: '' };
      addMessageToHistory(aiMessagePlaceholder);
      
      switch (activeMode) {
        case 'search':
            const searchResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: currentInput,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            const searchContent = searchResponse.text;
            const searchSources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
            updateLastMessage(conversationId, {
                type: 'search_result',
                content: searchContent,
                sources: searchSources,
            });
            break;
        case 'chat':
            const convForChat = history.find(c => c.id === conversationId);
            const existingCode = convForChat?.studioCode?.code;
            
            const chatPrompt = existingCode 
                ? `Continue a coding session. The user's instruction is: "${currentInput}". Modify the existing code:\n\`\`\`\n${existingCode}\n\`\`\`\nRespond with a JSON object with one key: "code" (the complete, updated code as a raw string).`
                : `You are Speyci, a helpful AI coding assistant. User's request: "${currentInput}".
                   Analyze the request.
                   - If it's a clear request for code (e.g., "create a button", "make a game"), respond ONLY with a JSON object like this: {"filename": "some_name.html", "code": "..."}.
                   - If it's a greeting, question, or casual chat, respond naturally in plain text. DO NOT output JSON.`;

            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: chatPrompt });
            const responseText = response.text.trim();
            
            let isCode = false;
            try {
                const responseData = JSON.parse(responseText);
                if(responseData.code) {
                    isCode = true;
                    updateLastMessage(conversationId, { role: 'ai', type: 'text', content: "Aqui está o código. Avise-me se precisar de alguma alteração." });
                     const newStudioState: StudioCode = { 
                         filename: responseData.filename || convForChat?.studioCode?.filename || 'index.html', 
                         code: responseData.code 
                     };
                     updateConversation(conversationId, { studioCode: newStudioState });
                }
            } catch(e) { /* Not JSON, treat as text */ }

            if (!isCode) {
                 updateLastMessage(conversationId, { content: responseText });
            }
          break;
        
        default:
            const streamResponse = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: currentInput,
            });
             for await (const chunk of streamResponse) {
                appendToLastMessage(conversationId, chunk.text);
            }
            break;
      }
    } catch (err) {
      console.error(err);
      updateLastMessage(conversationId, { type: 'error', content: `Ocorreu um erro: ${err.toString()}`});
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, activeMode, currentConversationId, history, uploadedFileBase64, MAX_HISTORY_ITEMS]);

  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSettingName) {
          handleNameSubmit(inputValue);
          return;
      }
      await handleSendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isSettingName) {
        setInputValue(suggestion);
    } else {
        handleSendMessage(suggestion);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = (mainContentRef.current.querySelector('.chat-container') as HTMLElement).offsetWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
          const dx = moveEvent.clientX - startX;
          const newWidth = startWidth + dx;
          const totalWidth = mainContentRef.current.offsetWidth;
          const minWidth = totalWidth * 0.2;
          const maxWidth = totalWidth * 0.8;
          if (newWidth > minWidth && newWidth < maxWidth) {
               setChatWidth(newWidth / totalWidth * 100);
          }
      };

      const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleSpeak = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const femaleVoice = voices.find(voice => 
              (voice.lang === 'pt-BR' && voice.name.includes('Feminino')) || 
              (voice.lang.startsWith('pt-') && /female|mulher/i.test(voice.name))
          );
          utterance.voice = femaleVoice || voices.find(v => v.lang === 'pt-BR') || null;
          utterance.lang = 'pt-BR';
          window.speechSynthesis.speak(utterance);
      } else {
          alert('Desculpe, seu navegador não suporta a leitura em voz alta.');
      }
  };

  const currentModeConfig = MODES_CONFIG[activeMode];
  const sidebarModes = Object.values(MODES_CONFIG).filter(m => m.id !== 'search');
  const searchMode = MODES_CONFIG.search;

  return (
    <div className="app-container">
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div>
            <div className="sidebar-header">
                <SpeyciLogoIcon />
                <h1 className="sidebar-title">Speyci</h1>
            </div>
            <div className="sidebar-top">
                <SidebarButton icon={searchMode.icon} text={searchMode.text} kbd={searchMode.kbd} isActive={!currentConversationId && activeMode === searchMode.id} onClick={() => handleModeChange(searchMode.id as Mode)} className="search-button-style"/>
               {sidebarModes.map(mode => (
                  <React.Fragment key={mode.id}>
                    <SidebarButton icon={mode.icon} text={mode.text} kbd={mode.kbd} isActive={!currentConversationId && activeMode === mode.id} onClick={() => handleModeChange(mode.id as Mode)}/>
                  </React.Fragment>
               ))}
            </div>
            {history.length > 0 && (
                <div className="history-section">
                    <div className="sidebar-section-title">Histórico</div>
                    {history.map(conv => (
                        renamingId === conv.id ? (
                            <input key={conv.id} ref={renameInputRef} type="text" value={tempRenameValue} onChange={(e) => setTempRenameValue(e.target.value)} onBlur={handleFinishRename} onKeyDown={handleRenameKeyDown} className="rename-input"/>
                        ) : (
                            <button key={conv.id} className={`history-item ${currentConversationId === conv.id ? 'active' : ''}`} onClick={() => handleSelectConversation(conv.id)} title={conv.title}>
                                <span className="history-item-icon">{MODES_CONFIG[conv.mode].icon}</span>
                                <div className="history-item-text-container">
                                    <span className="history-item-title">{conv.title}</span>
                                    <span className="history-item-subtitle">{MODES_CONFIG[conv.mode].text}</span>
                                </div>
                                <span className="edit-icon" onClick={(e) => handleStartRename(conv.id, conv.title, e)}><EditIcon /></span>
                            </button>
                        )
                    ))}
                </div>
            )}
        </div>
        <div className="sidebar-bottom">
            <button className="new-project-button" onClick={handleNewConversation} title="Novo projeto">
                <NewProjectIcon />
                <span>Novo projeto</span>
            </button>
            <button className="sidebar-toggle-button" onClick={toggleSidebar} aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}>
                <ChevronLeftIcon />
                <span className="nav-text">Recolher</span>
            </button>
        </div>
      </aside>
      <main className="main-content" ref={mainContentRef}>
        <div className="chat-container" style={activeMode === 'chat' && studioCode ? { flexBasis: `${chatWidth}%` } : { flexBasis: '100%' }}>
            <header className="main-header">
              <div className="header-left">
                {/* Removed redundant title and language selector */}
              </div>
              <button className="share-button"><ShareIcon /><span>Compartilhar</span></button>
            </header>
            <div className="chat-area">
                {isSettingName ? (
                     <div className="welcome-message">
                        <h1>Bem-vindo ao Speyci!</h1>
                        <p>Para começar, por favor, me diga como gostaria de ser chamado.</p>
                    </div>
                ) : messages.length === 0 && !isLoading && (
                    <div className="welcome-message">
                        <div>
                            <h1>{currentModeConfig.welcome.title}</h1>
                            <p>{currentModeConfig.welcome.description}</p>
                        </div>
                        <div className="suggestions-container">
                            {currentModeConfig.welcome.suggestions.map(suggestion => (
                                <button key={suggestion} className="suggestion-card" onClick={() => handleSuggestionClick(suggestion)}>
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                         <div className={`message-sender ${msg.role}-sender`}>
                            {msg.role === 'ai' ? (
                                <>
                                    <span className="sender-icon"><SpeyciLogoIcon/></span>
                                    <span className="sender-name">Speyci</span>
                                </>
                            ) : (
                                <>
                                    <span className="sender-name">{userName || 'Você'}</span>
                                    <span className="sender-icon"><UserIcon/></span>
                                </>
                            )}
                        </div>
                        <div className={`message-content ${msg.role}-message-content`}>
                                {msg.role === 'ai' && msg.type === 'text' && msg.content && (
                                    <button className="speak-button" onClick={() => handleSpeak(msg.content)} title="Ler em voz alta">
                                        <SpeakerIcon />
                                    </button>
                                )}
                                {msg.type === 'image' ? <ImageMessage base64Content={msg.content} /> :
                                 msg.type === 'video' ? <VideoMessage videoUrl={msg.content} /> :
                                 msg.type === 'tasklist' ? <TaskListMessage tasks={msg.content} /> :
                                 msg.type === 'search_result' ? <SearchMessage content={msg.content} sources={msg.sources} /> :
                                 msg.type === 'error' ? <div className="error-message inline-error">{msg.content}</div> :
                                 (msg.content && msg.content.trim() !== '') ? <p>{msg.content}</p> :
                                 msg.role === 'ai' && isLoading && index === messages.length - 1 ? (
                                    <div className="loading-indicator">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                 ) : null
                                }
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <footer className="input-area">
              <form onSubmit={handleFormSubmit} className="input-form">
                {!isSettingName && (
                    <div className="file-upload-wrapper">
                      <label htmlFor="file-upload-input" className="file-upload-label" title="Anexar arquivo">
                        <AttachmentIcon/>
                      </label>
                      <input id="file-upload-input" type="file" onChange={handleFileChange} accept="image/*" style={{display: 'none'}} />
                    </div>
                )}
                <div className="input-field-wrapper">
                    {uploadedFileBase64 && (
                        <div className="file-preview">
                            <span>Imagem anexada</span>
                            <button onClick={clearFileUpload}><CloseIcon/></button>
                        </div>
                    )}
                    <input type="text" autoFocus={isSettingName} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isSettingName ? "Digite seu nome..." : currentModeConfig.placeholder} className="prompt-input" aria-label="Code Description" disabled={isLoading}/>
                </div>
                {!isSettingName ? (
                    <>
                        <button type="button" className={`mic-button ${isListening ? 'listening' : ''}`} onClick={handleVoiceInput} disabled={isLoading} aria-label="Activate voice input">
                            <MicrophoneIcon />
                        </button>
                        <button type="submit" className="send-button" disabled={isLoading || (!inputValue.trim() && !uploadedFileBase64)}><SendIcon /></button>
                    </>
                ) : (
                     <button type="submit" className="send-button" disabled={!inputValue.trim()}><SendIcon /></button>
                 )}
              </form>
            </footer>
        </div>
        {activeMode === 'chat' && studioCode && (
            <>
              <div className="resizer" onMouseDown={handleResizeMouseDown}></div>
              <div key={currentConversationId} className="studio-wrapper" style={{ flexBasis: `${100 - chatWidth}%` }}>
                  <StudioView
                      content={studioCode}
                      onCodeChange={handleStudioCodeChange}
                  />
              </div>
            </>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);