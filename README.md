# 🚗 AutoPeças Inteligente

Sistema completo de e-commerce de autopeças com IA (Gemini) para Web e Mobile.

---

## 📦 Estrutura do Monorepo

```
autope-as-inteligente/
├── src/              # 🌐 Web App (React + Vite)
├── mobile/           # 📱 Mobile App (React Native + Expo)
├── package.json      # Web dependencies
└── README.md         # Este arquivo
```

---

## 🌐 Web App (Vite + React)

### Instalação

```bash
# Na raiz do projeto
npm install
```

### Configurar Ambiente

```bash
# Criar arquivo de configuração
cp .env.example .env.local

# Editar com suas chaves
nano .env.local
```

### Executar

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📱 Mobile App (Expo)

### Instalação

```bash
cd mobile
npm install
```

### Configurar Ambiente

```bash
cp .env.example .env
nano .env
```

### Executar

```bash
npm start
```

Veja instruções completas em [`mobile/README.md`](./mobile/README.md)

---

## 🔐 Variáveis de Ambiente

### Web (`.env.local`)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_GEMINI_API_KEY=sua-chave-gemini
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

⚠️ **IMPORTANTE:** Chamadas à Gemini AI devem ser feitas via backend seguro!

---

## 🛠️ Stack Tecnológica

### Web
- ⚛️ React 19
- ⚡ Vite
- 🎨 Tailwind CSS
- 🤖 Google Gemini AI
- 🗄️ Supabase

### Mobile
- 📱 React Native
- 🚀 Expo SDK 52
- 🗄️ Supabase Client
- 🎨 React Native Components

---

## 🚀 Próximos Passos

- [ ] Implementar telas mobile
- [ ] Criar backend seguro para Gemini AI
- [ ] Configurar EAS Build
- [ ] Deploy web (Vercel/Netlify)
- [ ] Publicar na App Store / Play Store

---

## 📄 Licença

[Adicione sua licença aqui]

