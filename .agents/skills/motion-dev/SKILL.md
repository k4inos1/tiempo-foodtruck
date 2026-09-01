---
name: motion-dev
description: Directivas de diseño avanzado usando Framer Motion y Tailwind (Motion.dev).
---

# Motion Dynamics Skill

## Directivas Core
1. **GPU Acceleration**: Utiliza siempre `transform-gpu`, `will-change-transform`, o propiedades que no disparen reflow (usa `opacity`, `scale`, `translate`).
2. **Orquestación**: Para las listas (como el Menú o el Kanban), usa `staggerChildren` en framer-motion para que los elementos entren en cascada.
3. **Físicas**: Ajusta los `springs`. Usa animaciones responsivas con `stiffness: 400, damping: 25`.
4. **Layout Animations**: Usa el prop `layout` de framer-motion para las tarjetas del Kanban. Al cambiar de estado, la tarjeta debe flotar hacia la otra columna fluidamente.
