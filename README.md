# 🖼️ Image Compression Project v5

Una aplicación web moderna y elegante construida con Next.js para comprimir y optimizar imágenes de manera eficiente.

## ✨ Características

- 🚀 **Interfaz moderna**: Diseño minimalista y elegante con Tailwind CSS
- 🎨 **Componentes UI**: Biblioteca completa de componentes con shadcn/ui
- 📱 **Diseño responsivo**: Optimizado para todos los dispositivos
- 🔧 **Compresión avanzada**: Algoritmos de optimización de imágenes de alta calidad
- ⚡ **Rendimiento**: Optimizado para velocidad y eficiencia
- 🌙 **Modo oscuro**: Soporte completo para tema claro y oscuro
- 💫 **Efectos visuales**: Animaciones y partículas interactivas
- 📊 **Comparación visual**: Slider para comparar imágenes antes y después

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Iconos**: Lucide React
- **Gestión de estado**: React Hooks
- **Optimización**: API Routes de Next.js

## 🏗️ Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── ImageCompressor.tsx
│   ├── CompareSlider.tsx
│   └── ...
├── lib/                   # Utilidades y configuración
├── hooks/                 # Custom React Hooks
├── public/               # Archivos estáticos
└── styles/               # Archivos de estilos adicionales
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ 
- npm, yarn o pnpm

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TakaraDasein/compresor_imagenes.git
   cd compresor_imagenes
   ```

2. **Instalar dependencias**
   ```bash
   # Con npm
   npm install
   
   # Con yarn
   yarn install
   
   # Con pnpm
   pnpm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   # Con npm
   npm run dev
   
   # Con yarn
   yarn dev
   
   # Con pnpm
   pnpm dev
   ```

4. **Abrir en el navegador**
   Visita [http://localhost:3000](http://localhost:3000)

### Construcción para Producción

```bash
# Construir la aplicación
npm run build

# Ejecutar en producción
npm start
```

## 📋 Scripts Disponibles

- `dev`: Ejecuta la aplicación en modo desarrollo
- `build`: Construye la aplicación para producción
- `start`: Ejecuta la aplicación construida
- `lint`: Ejecuta el linter para verificar el código

## 🎯 Funcionalidades Principales

### Compresión de Imágenes
- Soporte para múltiples formatos (JPEG, PNG, WebP)
- Ajuste de calidad personalizable
- Compresión con preservación de metadatos opcional

### Interfaz de Usuario
- Drag & Drop para cargar imágenes
- Preview en tiempo real
- Comparador antes/después
- Descarga directa de imágenes optimizadas

### Efectos Visuales
- Fondo de partículas animado
- Transiciones suaves
- Cursor personalizado
- Notificaciones toast elegantes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**TakaraDasein**
- GitHub: [@TakaraDasein](https://github.com/TakaraDasein)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el framework
- [Tailwind CSS](https://tailwindcss.com/) por los estilos
- [shadcn/ui](https://ui.shadcn.com/) por los componentes
- [Lucide](https://lucide.dev/) por los iconos

---

⭐ Si este proyecto te fue útil, ¡dale una estrella!
