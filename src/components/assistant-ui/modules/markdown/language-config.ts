type LangConfig = { label: string; ext: string };

export const LANG_CONFIG: Record<string, LangConfig> = {
  // Web
  javascript: { label: "JavaScript", ext: "js" },
  typescript: { label: "TypeScript", ext: "ts" },
  js: { label: "JavaScript", ext: "js" },
  ts: { label: "TypeScript", ext: "ts" },
  jsx: { label: "JavaScript", ext: "jsx" },
  tsx: { label: "TypeScript", ext: "tsx" },
  html: { label: "HTML", ext: "html" },
  css: { label: "CSS", ext: "css" },
  scss: { label: "SCSS", ext: "scss" },
  sass: { label: "Sass", ext: "sass" },

  // Systems
  c: { label: "C", ext: "c" },
  cpp: { label: "C++", ext: "cpp" },
  csharp: { label: "C#", ext: "cs" },
  rust: { label: "Rust", ext: "rs" },
  go: { label: "Go", ext: "go" },
  swift: { label: "Swift", ext: "swift" },
  kotlin: { label: "Kotlin", ext: "kt" },
  java: { label: "Java", ext: "java" },

  // Scripting
  python: { label: "Python", ext: "py" },
  ruby: { label: "Ruby", ext: "rb" },
  php: { label: "PHP", ext: "php" },
  sh: { label: "Shell", ext: "sh" },
  bash: { label: "Bash", ext: "sh" },
  shell: { label: "Shell", ext: "sh" },

  // Data & config
  json: { label: "JSON", ext: "json" },
  yaml: { label: "YAML", ext: "yaml" },
  yml: { label: "YAML", ext: "yml" },
  toml: { label: "TOML", ext: "toml" },
  xml: { label: "XML", ext: "xml" },
  sql: { label: "SQL", ext: "sql" },
  graphql: { label: "GraphQL", ext: "graphql" },

  // Markup & other
  markdown: { label: "Markdown", ext: "md" },
  dockerfile: { label: "Dockerfile", ext: "Dockerfile" },
};

export const getLangLabel = (language: string | undefined): string =>
  (language && LANG_CONFIG[language.toLowerCase()]?.label) ?? language ?? "Plain text";

export const getLangExt = (language: string | undefined): string =>
  (language && LANG_CONFIG[language.toLowerCase()]?.ext) ?? language ?? "txt";
