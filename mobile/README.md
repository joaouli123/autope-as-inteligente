# 📱 AutoPeças IA - Mobile App (Expo)

Aplicativo mobile para iOS e Android construído com React Native + Expo SDK 54.

## 🎯 Versões

- ✅ **Expo SDK:** 54.0.0
- ✅ **React Native:** 0.81.4
- ✅ **React:** 19.1.0

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Expo Go app instalado no celular ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Instalação

```bash
cd mobile
npm install
```

**⚠️ IMPORTANTE:** Este projeto usa `legacy-peer-deps` devido ao React 19. Já está configurado no `.npmrc`.

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar .env com suas chaves reais
nano .env
```

Preencha com suas credenciais do Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Executar

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou diretamente em um emulador/dispositivo
npm run android  # Android
npm run ios      # iOS (apenas macOS)
```

### 4. Testar no Dispositivo

1. Abra o app **Expo Go** no seu celular
2. Escaneie o QR code que aparece no terminal
3. O app será carregado no seu dispositivo! 🎉

---

## 📂 Estrutura do Projeto

```
mobile/
├── App.tsx                    # Componente raiz com navegação
├── index.js                   # Entry point
├── app.json                   # Configuração do Expo
├── babel.config.js            # Configuração do Babel
├── package.json               # Dependências
├── .npmrc                     # Config npm (legacy-peer-deps)
├── services/
│   └── supabaseClient.ts      # Cliente Supabase
└── src/
    ├── navigation/
    │   └── MainTabs.tsx       # Bottom tabs navigation
    └── screens/
        ├── SplashScreen.tsx   # Tela inicial
        ├── LoginScreen.tsx    # Login
        ├── SignupScreen.tsx   # Cadastro
        ├── HomeScreen.tsx     # Tela principal
        ├── SearchScreen.tsx   # Busca de peças
        ├── CartScreen.tsx     # Carrinho
        └── OrdersScreen.tsx   # Pedidos
```

---

## 📦 Dependências Principais

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "@react-navigation/native": "^7.1.17",
  "@react-navigation/native-stack": "^7.4.8",
  "@react-navigation/bottom-tabs": "^7.4.7",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0",
  "lucide-react-native": "^0.460.0",
  "@supabase/supabase-js": "^2.47.10",
  "react-native-url-polyfill": "^2.0.0"
}
```

---

## 🎨 Telas Implementadas

### ✅ SplashScreen
- Tela inicial com logo
- Botões para Login/Cadastro
- Background azul (#1e3a8a)

### ✅ LoginScreen
- Formulário de login
- Navegação para tela principal

### ✅ SignupScreen
- Formulário de cadastro completo
- Campos: nome, email, telefone, senha

### ✅ HomeScreen (Tela Principal)
- Header com logo e localização
- Barra de busca
- Card do veículo selecionado
- Card de diagnóstico IA
- Grid de categorias (Freios, Óleo, Suspensão, Elétrica)
- Seção de produtos populares

### ✅ Bottom Tabs
- Início (Home)
- Buscar (Search)
- Carrinho (Cart)
- Pedidos (Orders)

---

## 🔧 Scripts Úteis

```bash
# Limpar cache
npm start -- --clear

# Modo tunnel (para redes complexas)
npm start -- --tunnel

# Verificar TypeScript
npx tsc --noEmit

# Exportar bundle (validação)
npx expo export
```

---

## 🐛 Troubleshooting

### ❌ Erro: "peer dependencies"

**Solução:** Já configurado no `.npmrc`, mas se precisar:
```bash
npm install --legacy-peer-deps
```

### ❌ App não carrega no Expo Go

**Verificar:**
1. Mesmo WiFi no PC e celular?
2. Firewall bloqueando porta 8081?
3. Tentar: `npm start -- --tunnel`

### ❌ "Supabase não conectado"

1. Verificar se `.env` existe em `mobile/`
2. Confirmar que as chaves estão corretas
3. Testar URL no navegador: `https://seu-projeto.supabase.co`

---

## 📱 Visual

O app mantém 100% do visual da versão web:
- **Cores principais:** #1e3a8a (azul), #3b82f6 (azul claro)
- **Fontes:** System default (San Francisco iOS / Roboto Android)
- **Ícones:** lucide-react-native
- **Espaçamento:** Consistente com o web (Tailwind equivalente)

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**

- ✅ Use apenas a chave `ANON` no app mobile
- ❌ **NUNCA** coloque a chave `service_role` no código
- 🛡️ Chamadas para Gemini AI devem ser feitas via backend seguro
- 🔒 Nunca commite o arquivo `.env` no Git

---

## 📦 Build para Produção

### Usando EAS Build (recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar projeto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

---

## 📚 Documentação

- [Expo Docs](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase Client](https://supabase.com/docs/reference/javascript/installing)

---

**Desenvolvido com ❤️ usando Expo + React Native**
